"use client";
import React, { useEffect, useRef, useState } from 'react';
import type { MapLocation } from './LeafletMap';

interface LiveUserMapProps {
    locations: MapLocation[];
}

const LiveUserMap: React.FC<LiveUserMapProps> = ({ locations }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const LRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const hasFittedRef = useRef(false);   // ← prevent auto-unzoom on every update
    const isLocatingRef = useRef(false);

    const [btnState, setBtnState] = useState<'idle' | 'loading' | 'tracking'>('idle');
    const [locError, setLocError] = useState<string | null>(null);

    // ─── Init map once ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        let mounted = true;

        import('leaflet').then((mod) => {
            const L = (mod as any).default ?? mod;
            if (!mounted || !containerRef.current || mapRef.current) return;

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

            // ── Leaflet built-in location events ──────────────────────────────
            map.on('locationfound', (e: any) => {
                setBtnState('tracking');
                setLocError(null);
                isLocatingRef.current = true;

                // Remove previous blue dot / circle
                if ((map as any)._myDot) { (map as any)._myDot.remove(); }
                if ((map as any)._myCircle) { (map as any)._myCircle.remove(); }

                const blueDotIcon = L.divIcon({
                    className: '',
                    html: `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
                   <span style="position:absolute;inset:0;border-radius:50%;background:#3b82f6;opacity:0.25;animation:lmpg 1.8s ease-out infinite;"></span>
                   <span style="position:relative;width:12px;height:12px;border-radius:50%;background:#2563eb;border:2.5px solid white;box-shadow:0 0 0 2px rgba(37,99,235,.3);"></span>
                 </div>`,
                    iconSize: [24, 24], iconAnchor: [12, 12],
                });

                (map as any)._myCircle = L.circle(e.latlng, {
                    radius: e.accuracy,
                    color: '#3b82f6', fillColor: '#3b82f6',
                    fillOpacity: 0.1, weight: 1.5, dashArray: '5 5',
                }).addTo(map);

                (map as any)._myDot = L.marker(e.latlng, { icon: blueDotIcon, zIndexOffset: 1000 })
                    .addTo(map)
                    .bindPopup(`
            <div style="font-family:sans-serif;min-width:155px;padding:4px;">
              <strong style="color:#1d4ed8;display:block;margin-bottom:4px;">📍 Your Location</strong>
              <p style="font-size:11px;color:#6b7280;margin:0;">Lat: ${e.latlng.lat.toFixed(6)}</p>
              <p style="font-size:11px;color:#6b7280;margin:2px 0 6px;">Lng: ${e.latlng.lng.toFixed(6)}</p>
              <span style="padding:2px 10px;background:#dbeafe;color:#1d4ed8;font-size:10px;font-weight:700;border-radius:9999px;">±${Math.round(e.accuracy)} m</span>
            </div>
          `)
                    .openPopup();

                // Only fly to location once per session start (not on every watchPosition update)
                if (!hasFittedRef.current || !isLocatingRef.current) {
                    map.flyTo(e.latlng, 16, { animate: true, duration: 1.5 });
                }
            });

            map.on('locationerror', (e: any) => {
                setBtnState('idle');
                isLocatingRef.current = false;
                const code = e.code;
                setLocError(
                    code === 1 ? 'Permission denied. Allow location in your browser.' :
                        code === 2 ? 'Position unavailable.' :
                            'Location request timed out.'
                );
            });

            mapRef.current = map;

            // Force tile render after DOM paint
            setTimeout(() => map.invalidateSize(), 200);

            // Fix tiles on any resize (expand/collapse sidebar)
            const ro = new ResizeObserver(() => map.invalidateSize());
            ro.observe(containerRef.current!);
            (containerRef.current as any)._ro = ro;
        });

        return () => {
            mounted = false;
            if (containerRef.current && (containerRef.current as any)._ro) {
                (containerRef.current as any)._ro.disconnect();
            }
            if (mapRef.current) {
                mapRef.current.stopLocate();
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // ─── Sync user markers (only fitBounds once) ──────────────────────────────
    useEffect(() => {
        const map = mapRef.current;
        const L = LRef.current;
        if (!map || !L) return;

        // Remove old markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        const liveIcon = L.divIcon({
            className: '',
            html: `<div style="position:relative;width:30px;height:30px;display:flex;align-items:center;justify-content:center;">
               <span style="position:absolute;inset:0;border-radius:50%;background:#22c55e;opacity:0.3;animation:lmpg 1.5s ease-out infinite;"></span>
               <span style="position:relative;width:13px;height:13px;border-radius:50%;background:#16a34a;border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,.3);"></span>
             </div>`,
            iconSize: [30, 30], iconAnchor: [15, 15],
        });

        const newMarkers: any[] = [];
        locations.forEach((loc) => {
            try {
                newMarkers.push(
                    L.marker([loc.lat, loc.lng], { icon: liveIcon })
                        .addTo(map)
                        .bindPopup(`
              <div style="min-width:150px;padding:6px;font-family:sans-serif;">
                <strong style="font-size:13px;font-weight:700;color:#111827;display:block;margin-bottom:4px;">${loc.title}</strong>
                ${loc.description ? `<p style="font-size:11px;color:#6b7280;margin:0 0 6px;">${loc.description}</p>` : ''}
                <span style="padding:2px 10px;background:#dcfce7;color:#15803d;font-size:10px;font-weight:700;border-radius:9999px;">● Active Now</span>
              </div>`)
                );
            } catch (_) { }
        });
        markersRef.current = newMarkers;

        // FitBounds only ONCE — never re-zoom the user's manual zoom
        if (!hasFittedRef.current && locations.length > 0) {
            try {
                const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]));
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13, animate: true });
                    hasFittedRef.current = true;   // ← lock — no more auto-zoom after this
                }
            } catch (_) { }
        }
    }, [locations]);

    // ─── Button handlers ──────────────────────────────────────────────────────
    const handleLocate = () => {
        const map = mapRef.current;
        if (!map) return;

        setBtnState('loading');
        setLocError(null);

        // Leaflet's built-in locate() — handles permissions, HTTPS, everything
        map.locate({
            watch: true,
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
        });
    };

    const handleStop = () => {
        const map = mapRef.current;
        if (!map) return;

        map.stopLocate();
        isLocatingRef.current = false;

        if ((map as any)._myDot) { (map as any)._myDot.remove(); (map as any)._myDot = null; }
        if ((map as any)._myCircle) { (map as any)._myCircle.remove(); (map as any)._myCircle = null; }

        setBtnState('idle');
        setLocError(null);
    };

    return (
        <>
            <style>{`
        @keyframes lmpg {
          0%   { transform:scale(1);   opacity:0.3; }
          70%  { transform:scale(2.4); opacity:0;   }
          100% { opacity:0; }
        }
        .leaflet-container img.leaflet-tile {
          max-width: none !important;
          max-height: none !important;
        }
      `}</style>

            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px' }}>

                {/* The Leaflet map mounts here */}
                <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

                {/* Locate / Stop button — uses inline style so no Tailwind conflict */}
                <button
                    onClick={btnState === 'tracking' ? handleStop : handleLocate}
                    disabled={btnState === 'loading'}
                    style={{
                        position: 'absolute', bottom: 20, right: 12,
                        zIndex: 1000,
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px',
                        background: btnState === 'tracking' ? '#eff6ff' : '#ffffff',
                        color: btnState === 'tracking' ? '#1d4ed8' : '#374151',
                        border: `2px solid ${btnState === 'tracking' ? '#3b82f6' : 'rgba(0,0,0,.15)'}`,
                        borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: btnState === 'loading' ? 'wait' : 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,.12)',
                        fontFamily: 'system-ui,sans-serif',
                        transition: 'all .2s',
                        pointerEvents: 'all',
                    }}
                >
                    {btnState === 'loading' && '⏳ Locating…'}
                    {btnState === 'tracking' && '🔵 Stop Tracking'}
                    {btnState === 'idle' && '📍 Locate Me'}
                </button>

                {/* Error pill */}
                {locError && (
                    <div style={{
                        position: 'absolute', bottom: 60, right: 12, zIndex: 1001,
                        background: '#fef2f2', border: '1px solid #fca5a5',
                        borderRadius: 6, padding: '6px 12px',
                        fontSize: 12, color: '#dc2626',
                        fontFamily: 'system-ui,sans-serif', maxWidth: 250,
                    }}>
                        ⚠ {locError}
                    </div>
                )}
            </div>
        </>
    );
};

export default LiveUserMap;
