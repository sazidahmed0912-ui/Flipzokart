"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { MapLocation } from './LeafletMap';

interface LiveUserMapProps {
    locations: MapLocation[];
}

const LiveUserMap: React.FC<LiveUserMapProps> = ({ locations }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const LRef = useRef<any>(null);
    const myLayerRef = useRef<any>(null);
    const myMarkerRef = useRef<any>(null);
    const watchIdRef = useRef<number | null>(null);

    // State drives the button UI
    const [isTracking, setIsTracking] = useState(false);
    const [locating, setLocating] = useState(false);
    const [locError, setLocError] = useState<string | null>(null);

    // ── Init map once ────────────────────────────────────────────────────────
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

            // Force tile layout once container is painted
            setTimeout(() => map.invalidateSize(), 200);

            const ro = new ResizeObserver(() => map.invalidateSize());
            ro.observe(containerRef.current!);
            (containerRef.current as any)._ro = ro;
        });

        return () => {
            mounted = false;
            clearWatch();
            if (containerRef.current && (containerRef.current as any)._ro) {
                (containerRef.current as any)._ro.disconnect();
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // ── Sync user markers ────────────────────────────────────────────────────
    useEffect(() => {
        const map = mapInstanceRef.current;
        const L = LRef.current;
        if (!map || !L) return;

        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        const icon = L.divIcon({
            className: '',
            html: `<div style="position:relative;width:30px;height:30px;display:flex;align-items:center;justify-content:center;">
               <span style="position:absolute;inset:0;border-radius:50%;background:#22c55e;opacity:0.3;animation:lm-ping 1.5s ease-out infinite;"></span>
               <span style="position:relative;width:13px;height:13px;border-radius:50%;background:#16a34a;border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,.3);"></span>
             </div>`,
            iconSize: [30, 30], iconAnchor: [15, 15],
        });

        const newMarkers: any[] = [];
        locations.forEach((loc) => {
            try {
                newMarkers.push(
                    L.marker([loc.lat, loc.lng], { icon })
                        .addTo(map)
                        .bindPopup(`<div style="min-width:150px;padding:6px 4px;font-family:sans-serif;">
              <strong style="font-size:13px;font-weight:700;color:#111827;display:block;margin-bottom:4px;">${loc.title}</strong>
              ${loc.description ? `<p style="font-size:11px;color:#6b7280;margin:0 0 6px;">${loc.description}</p>` : ''}
              <span style="padding:2px 10px;background:#dcfce7;color:#15803d;font-size:10px;font-weight:700;border-radius:9999px;">● Active Now</span>
            </div>`)
                );
            } catch (_) { }
        });
        markersRef.current = newMarkers;

        if (locations.length > 0) {
            try {
                const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]));
                if (bounds.isValid()) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13, animate: true });
            } catch (_) { }
        }
    }, [locations]);

    // ── Geolocation helpers ──────────────────────────────────────────────────
    const clearWatch = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    };

    const renderMyDot = useCallback((lat: number, lng: number, accuracy: number) => {
        const map = mapInstanceRef.current;
        const L = LRef.current;
        if (!map || !L) return;

        if (myLayerRef.current) { myLayerRef.current.remove(); myLayerRef.current = null; }
        if (myMarkerRef.current) { myMarkerRef.current.remove(); myMarkerRef.current = null; }

        // Accuracy circle
        myLayerRef.current = L.circle([lat, lng], {
            radius: accuracy,
            color: '#2563eb', fillColor: '#3b82f6',
            fillOpacity: 0.12, weight: 1.5, dashArray: '5 5',
        }).addTo(map);

        // Blue GPS dot
        myMarkerRef.current = L.marker([lat, lng], {
            icon: L.divIcon({
                className: '',
                html: `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
                 <span style="position:absolute;inset:0;border-radius:50%;background:#3b82f6;opacity:0.25;animation:lm-ping 1.8s ease-out infinite;"></span>
                 <span style="position:relative;width:12px;height:12px;border-radius:50%;background:#2563eb;border:2.5px solid white;box-shadow:0 0 0 2px #2563eb44;"></span>
               </div>`,
                iconSize: [24, 24], iconAnchor: [12, 12],
            }),
            zIndexOffset: 1000,
        })
            .addTo(map)
            .bindPopup(`<div style="min-width:160px;padding:6px 4px;font-family:sans-serif;">
        <strong style="color:#1d4ed8;display:block;margin-bottom:4px;">📍 Your Location</strong>
        <p style="font-size:11px;color:#6b7280;margin:0;">Lat: ${lat.toFixed(6)}</p>
        <p style="font-size:11px;color:#6b7280;margin:2px 0 6px;">Lng: ${lng.toFixed(6)}</p>
        <span style="padding:2px 10px;background:#dbeafe;color:#1d4ed8;font-size:10px;font-weight:700;border-radius:9999px;">±${Math.round(accuracy)} m accuracy</span>
      </div>`)
            .openPopup();

        map.flyTo([lat, lng], 15, { animate: true, duration: 1.5 });
    }, []);

    const startLocating = () => {
        if (!navigator.geolocation) {
            setLocError('Geolocation not supported by this browser.');
            return;
        }
        setLocating(true);
        setLocError(null);

        clearWatch();

        const id = navigator.geolocation.watchPosition(
            (pos) => {
                setLocating(false);
                setIsTracking(true);
                setLocError(null);
                renderMyDot(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
            },
            (err) => {
                setLocating(false);
                setIsTracking(false);
                const msg =
                    err.code === 1 ? 'Location access denied. Please allow permission.' :
                        err.code === 2 ? 'Position unavailable. Try in a supported browser.' :
                            'Location request timed out.';
                setLocError(msg);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );

        watchIdRef.current = id;
    };

    const stopLocating = () => {
        clearWatch();
        if (myLayerRef.current) { myLayerRef.current.remove(); myLayerRef.current = null; }
        if (myMarkerRef.current) { myMarkerRef.current.remove(); myMarkerRef.current = null; }
        setIsTracking(false);
        setLocating(false);
        setLocError(null);
    };

    return (
        <>
            <style>{`
        @keyframes lm-ping {
          0%   { transform:scale(1);   opacity:0.3; }
          70%  { transform:scale(2.5); opacity:0; }
          100% { opacity:0; }
        }
        .leaflet-container img.leaflet-tile {
          max-width:none !important;
          max-height:none !important;
        }
      `}</style>

            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px' }}>
                <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

                {/* Locate Me / Stop button */}
                <button
                    onClick={isTracking ? stopLocating : startLocating}
                    disabled={locating}
                    style={{
                        position: 'absolute', bottom: 20, right: 12, zIndex: 1000,
                        background: isTracking ? '#eff6ff' : '#ffffff',
                        border: `2px solid ${isTracking ? '#3b82f6' : 'rgba(0,0,0,0.15)'}`,
                        color: isTracking ? '#1d4ed8' : '#374151',
                        borderRadius: 8, padding: '7px 14px',
                        fontSize: 13, fontWeight: 600, cursor: locating ? 'wait' : 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontFamily: 'sans-serif', transition: 'all 0.2s',
                    }}
                >
                    {locating ? '⏳ Locating…' : isTracking ? '🔵 Stop Tracking' : '📍 Locate Me'}
                </button>

                {/* Error message */}
                {locError && (
                    <div style={{
                        position: 'absolute', bottom: 60, right: 12, zIndex: 1001,
                        background: '#fef2f2', border: '1px solid #fca5a5',
                        borderRadius: 6, padding: '6px 12px',
                        fontSize: 12, color: '#dc2626', fontFamily: 'sans-serif',
                        maxWidth: 240,
                    }}>
                        ⚠ {locError}
                    </div>
                )}
            </div>
        </>
    );
};

export default LiveUserMap;
