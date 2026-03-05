"use client";
import React, { useEffect, useRef, useState } from 'react';
import type { MapLocation } from './LeafletMap';

interface LiveUserMapProps {
    locations: MapLocation[];
}

const LiveUserMap: React.FC<LiveUserMapProps> = ({ locations }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const LRef = useRef<any>(null);
    const myLocationLayerRef = useRef<any>(null);   // blue dot + accuracy circle
    const myLocationMarkerRef = useRef<any>(null);
    const watchIdRef = useRef<number | null>(null);
    const [locating, setLocating] = useState(false);
    const [locError, setLocError] = useState<string | null>(null);

    // Boot Leaflet map once
    useEffect(() => {
        if (!containerRef.current || mapInstanceRef.current) return;

        let mounted = true;

        import('leaflet').then((mod) => {
            const L = mod.default ?? mod;
            if (!mounted || !containerRef.current || mapInstanceRef.current) return;

            LRef.current = L;

            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            const map = L.map(containerRef.current, {
                center: [20.5937, 78.9629],
                zoom: 5,
                zoomControl: true,
                scrollWheelZoom: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
                subdomains: ['a', 'b', 'c'],
            }).addTo(map);

            mapInstanceRef.current = map;

            setTimeout(() => { map.invalidateSize(); }, 150);

            const ro = new ResizeObserver(() => { map.invalidateSize(); });
            ro.observe(containerRef.current!);
            (containerRef.current as any)._ro = ro;
        });

        return () => {
            mounted = false;
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
            if (containerRef.current && (containerRef.current as any)._ro) {
                (containerRef.current as any)._ro.disconnect();
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Sync user markers when locations prop changes
    useEffect(() => {
        const map = mapInstanceRef.current;
        const L = LRef.current;
        if (!map || !L) return;

        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        const liveIcon = L.divIcon({
            className: '',
            html: `<div style="position:relative;width:30px;height:30px;display:flex;align-items:center;justify-content:center;">
               <span style="position:absolute;inset:0;border-radius:50%;background:#22c55e;opacity:0.3;animation:lm-ping 1.5s ease-out infinite;"></span>
               <span style="position:relative;width:13px;height:13px;border-radius:50%;background:#16a34a;border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.35);"></span>
             </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
        });

        const newMarkers: any[] = [];
        locations.forEach((loc) => {
            try {
                const marker = L.marker([loc.lat, loc.lng], { icon: liveIcon })
                    .addTo(map)
                    .bindPopup(`
            <div style="min-width:150px;padding:6px 4px;font-family:sans-serif;">
              <strong style="font-size:13px;font-weight:700;color:#111827;display:block;margin-bottom:4px;">${loc.title}</strong>
              ${loc.description ? `<p style="font-size:11px;color:#6b7280;margin:0 0 6px;">${loc.description}</p>` : ''}
              <span style="display:inline-block;padding:2px 10px;background:#dcfce7;color:#15803d;font-size:10px;font-weight:700;border-radius:9999px;">● Active Now</span>
            </div>
          `);
                newMarkers.push(marker);
            } catch (_) { }
        });
        markersRef.current = newMarkers;

        if (locations.length > 0) {
            try {
                const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]));
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13, animate: true });
                }
            } catch (_) { }
        }
    }, [locations]);

    // High-accuracy geolocation: start watching
    const startHighAccuracyLocation = () => {
        if (!navigator.geolocation) {
            setLocError('Geolocation not supported by this browser.');
            return;
        }

        setLocating(true);
        setLocError(null);

        // Stop any previous watch
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        const id = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                setLocating(false);
                setLocError(null);
                renderMyLocation(latitude, longitude, accuracy);
            },
            (err) => {
                setLocating(false);
                if (err.code === 1) setLocError('Location access denied.');
                else if (err.code === 2) setLocError('Position unavailable.');
                else setLocError('Location timeout. Try again.');
            },
            {
                enableHighAccuracy: true,   // ← GPS-level precision
                timeout: 15000,
                maximumAge: 0,
            }
        );

        watchIdRef.current = id;
    };

    const renderMyLocation = (lat: number, lng: number, accuracy: number) => {
        const map = mapInstanceRef.current;
        const L = LRef.current;
        if (!map || !L) return;

        // Remove previous blue dot layer
        if (myLocationLayerRef.current) {
            myLocationLayerRef.current.remove();
            myLocationLayerRef.current = null;
        }
        if (myLocationMarkerRef.current) {
            myLocationMarkerRef.current.remove();
            myLocationMarkerRef.current = null;
        }

        // Accuracy circle (pale blue)
        const accuracyCircle = L.circle([lat, lng], {
            radius: accuracy,
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            weight: 1.5,
            dashArray: '4 4',
        }).addTo(map);

        // Blue pulsing dot
        const myIcon = L.divIcon({
            className: '',
            html: `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
               <span style="position:absolute;inset:0;border-radius:50%;background:#3b82f6;opacity:0.25;animation:lm-ping 1.8s ease-out infinite;"></span>
               <span style="position:relative;width:12px;height:12px;border-radius:50%;background:#2563eb;border:2.5px solid white;box-shadow:0 0 0 2px #2563eb44;"></span>
             </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });

        const myMarker = L.marker([lat, lng], { icon: myIcon, zIndexOffset: 1000 })
            .addTo(map)
            .bindPopup(`
        <div style="min-width:160px;padding:6px 4px;font-family:sans-serif;">
          <strong style="font-size:13px;font-weight:700;color:#1d4ed8;display:block;margin-bottom:4px;">📍 Your Location</strong>
          <p style="font-size:11px;color:#6b7280;margin:0 0 4px;">Lat: ${lat.toFixed(6)}</p>
          <p style="font-size:11px;color:#6b7280;margin:0 0 6px;">Lng: ${lng.toFixed(6)}</p>
          <span style="display:inline-block;padding:2px 10px;background:#dbeafe;color:#1d4ed8;font-size:10px;font-weight:700;border-radius:9999px;">Accuracy ±${Math.round(accuracy)}m</span>
        </div>
      `)
            .openPopup();

        myLocationLayerRef.current = accuracyCircle;
        myLocationMarkerRef.current = myMarker;

        // Pan to location with smooth zoom
        map.flyTo([lat, lng], Math.min(map.getZoom() > 14 ? map.getZoom() : 14), {
            animate: true,
            duration: 1.5,
        });
    };

    const stopLocation = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (myLocationLayerRef.current) { myLocationLayerRef.current.remove(); myLocationLayerRef.current = null; }
        if (myLocationMarkerRef.current) { myLocationMarkerRef.current.remove(); myLocationMarkerRef.current = null; }
        setLocating(false);
        setLocError(null);
    };

    return (
        <>
            <style>{`
        @keyframes lm-ping {
          0%   { transform: scale(1);   opacity: 0.3; }
          70%  { transform: scale(2.5); opacity: 0; }
          100% { opacity: 0; }
        }
        .leaflet-container img.leaflet-tile {
          max-width: none !important;
          max-height: none !important;
        }
        .lm-btn {
          position: absolute;
          z-index: 1000;
          bottom: 20px;
          right: 12px;
          background: white;
          border: 2px solid rgba(0,0,0,0.12);
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
          font-family: sans-serif;
        }
        .lm-btn:hover { background: #f0f4ff; }
        .lm-btn.active { background: #eff6ff; border-color: #3b82f6; color: #1d4ed8; }
        .lm-error {
          position: absolute;
          z-index: 1001;
          bottom: 60px;
          right: 12px;
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          color: #dc2626;
          font-family: sans-serif;
        }
      `}</style>

            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px' }}>
                <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

                {/* High-accuracy locate button */}
                {watchIdRef.current === null ? (
                    <button
                        className="lm-btn"
                        onClick={startHighAccuracyLocation}
                        disabled={locating}
                        title="Locate me with high GPS accuracy"
                    >
                        {locating ? (
                            <>
                                <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'lm-spin 0.8s linear infinite' }} />
                                Locating…
                            </>
                        ) : (
                            <>📍 Locate Me</>
                        )}
                    </button>
                ) : (
                    <button className="lm-btn active" onClick={stopLocation} title="Stop tracking">
                        🔵 Stop Tracking
                    </button>
                )}

                {locError && <div className="lm-error">⚠ {locError}</div>}
            </div>

            <style>{`
        @keyframes lm-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </>
    );
};

export default LiveUserMap;
