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
    const hasFittedRef = useRef(false);

    // Refs for the Leaflet control button element (so we can update its label without re-render)
    const locateBtnElRef = useRef<HTMLButtonElement | null>(null);

    const [locError, setLocError] = useState<string | null>(null);

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

            // ── Custom Leaflet Control: "Locate Me" button ──────────────────
            // This is the ONLY reliable way — Leaflet's own control pane handles clicks correctly
            const LocateControl = L.Control.extend({
                options: { position: 'bottomright' },

                onAdd() {
                    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                    container.style.cssText = 'border:none;background:transparent;';

                    const btn = L.DomUtil.create('button', '', container) as HTMLButtonElement;
                    btn.textContent = '📍 Locate Me';
                    btn.title = 'Find your exact GPS location';
                    btn.style.cssText = `
            display:flex;align-items:center;gap:6px;
            padding:8px 14px;border-radius:8px;
            background:#fff;color:#374151;
            border:2px solid rgba(0,0,0,0.15);
            font-size:13px;font-weight:600;
            font-family:system-ui,sans-serif;
            cursor:pointer;white-space:nowrap;
            box-shadow:0 2px 8px rgba(0,0,0,.15);
            transition:all .2s;
          `;

                    locateBtnElRef.current = btn;

                    // CRITICAL: stop map from intercepting the click
                    L.DomEvent.disableClickPropagation(container);
                    L.DomEvent.disableScrollPropagation(container);

                    let tracking = false;

                    L.DomEvent.on(btn, 'click', () => {
                        if (tracking) {
                            // Stop
                            map.stopLocate();
                            tracking = false;
                            btn.textContent = '📍 Locate Me';
                            btn.style.background = '#fff';
                            btn.style.color = '#374151';
                            btn.style.borderColor = 'rgba(0,0,0,0.15)';
                            if ((map as any)._myDot) { (map as any)._myDot.remove(); (map as any)._myDot = null; }
                            if ((map as any)._myCircle) { (map as any)._myCircle.remove(); (map as any)._myCircle = null; }
                            setLocError(null);
                        } else {
                            // Start
                            btn.textContent = '⏳ Locating…';
                            btn.style.background = '#eff6ff';
                            btn.style.borderColor = '#93c5fd';
                            btn.disabled = true;

                            map.locate({
                                watch: true,
                                enableHighAccuracy: true,
                                timeout: 15000,
                                maximumAge: 0,
                            });
                        }
                    });

                    map.on('locationfound', (e: any) => {
                        if (!mounted) return;
                        tracking = true;
                        btn.textContent = '🔵 Stop Tracking';
                        btn.style.background = '#eff6ff';
                        btn.style.color = '#1d4ed8';
                        btn.style.borderColor = '#3b82f6';
                        btn.disabled = false;
                        setLocError(null);

                        if ((map as any)._myDot) { (map as any)._myDot.remove(); }
                        if ((map as any)._myCircle) { (map as any)._myCircle.remove(); }

                        (map as any)._myCircle = L.circle(e.latlng, {
                            radius: e.accuracy,
                            color: '#3b82f6', fillColor: '#3b82f6',
                            fillOpacity: 0.1, weight: 1.5, dashArray: '5 5',
                        }).addTo(map);

                        const blueDot = L.divIcon({
                            className: '',
                            html: `<div style="width:24px;height:24px;position:relative;display:flex;align-items:center;justify-content:center;">
                       <span style="position:absolute;inset:0;border-radius:50%;background:#3b82f6;opacity:.25;animation:lmpg 2s ease-out infinite;"></span>
                       <span style="width:12px;height:12px;border-radius:50%;background:#2563eb;border:2.5px solid #fff;box-shadow:0 0 0 2px rgba(37,99,235,.3);position:relative;"></span>
                     </div>`,
                            iconSize: [24, 24], iconAnchor: [12, 12],
                        });

                        (map as any)._myDot = L.marker(e.latlng, { icon: blueDot, zIndexOffset: 1000 })
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

                        map.flyTo(e.latlng, 16, { animate: true, duration: 1.5 });
                    });

                    map.on('locationerror', (e: any) => {
                        if (!mounted) return;
                        tracking = false;
                        btn.textContent = '📍 Locate Me';
                        btn.style.background = '#fff';
                        btn.style.color = '#374151';
                        btn.style.borderColor = 'rgba(0,0,0,0.15)';
                        btn.disabled = false;
                        setLocError(
                            e.code === 1 ? 'Location access denied. Allow in browser settings.' :
                                e.code === 2 ? 'Position unavailable.' : 'Location request timed out.'
                        );
                    });

                    return container;
                },

                onRemove() { },
            });

            new LocateControl().addTo(map);
            // ── End control ─────────────────────────────────────────────────────

            mapRef.current = map;

            setTimeout(() => map.invalidateSize(), 200);
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

    // ─── Sync user markers ───────────────────────────────────────────────────
    useEffect(() => {
        const map = mapRef.current;
        const L = LRef.current;
        if (!map || !L) return;

        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        const liveIcon = L.divIcon({
            className: '',
            html: `<div style="width:30px;height:30px;position:relative;display:flex;align-items:center;justify-content:center;">
               <span style="position:absolute;inset:0;border-radius:50%;background:#22c55e;opacity:.3;animation:lmpg 1.5s ease-out infinite;"></span>
               <span style="width:13px;height:13px;border-radius:50%;background:#16a34a;border:2.5px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.3);position:relative;"></span>
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

        if (!hasFittedRef.current && locations.length > 0) {
            try {
                const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]));
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13, animate: true });
                    hasFittedRef.current = true;
                }
            } catch (_) { }
        }
    }, [locations]);

    return (
        <>
            <style>{`
        @keyframes lmpg {
          0%   { transform:scale(1);   opacity:.3; }
          70%  { transform:scale(2.4); opacity:0; }
          100% { opacity:0; }
        }
        .leaflet-container img.leaflet-tile {
          max-width:none!important;
          max-height:none!important;
        }
      `}</style>

            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px' }}>
                <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

                {locError && (
                    <div style={{
                        position: 'absolute', bottom: 64, right: 12, zIndex: 99999,
                        background: '#fef2f2', border: '1px solid #fca5a5',
                        borderRadius: 6, padding: '6px 12px',
                        fontSize: 12, color: '#dc2626',
                        fontFamily: 'system-ui,sans-serif', maxWidth: 260,
                        pointerEvents: 'none',
                    }}>
                        ⚠ {locError}
                    </div>
                )}
            </div>
        </>
    );
};

export default LiveUserMap;
