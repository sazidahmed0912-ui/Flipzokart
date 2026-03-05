"use client";
import React, { useEffect, useRef } from 'react';
import type { MapLocation } from './LeafletMap';

interface LiveUserMapProps {
    locations: MapLocation[];
}

const LiveUserMap: React.FC<LiveUserMapProps> = ({ locations }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const LRef = useRef<any>(null);

    // Boot map once on mount
    useEffect(() => {
        if (!containerRef.current || mapInstanceRef.current) return;

        let mounted = true;

        import('leaflet').then((leafletModule) => {
            const L = leafletModule.default ?? leafletModule;
            if (!mounted || !containerRef.current || mapInstanceRef.current) return;

            LRef.current = L;

            // Use CDN icons to avoid webpack bundle resolution conflicts
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
                preferCanvas: false,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 18,
                // Use subdomains for faster loading
                subdomains: ['a', 'b', 'c'],
            }).addTo(map);

            mapInstanceRef.current = map;

            // CRITICAL: invalidateSize forces map to recalculate dimensions
            // after the container is fully painted into the DOM
            setTimeout(() => {
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.invalidateSize();
                }
            }, 100);

            // Also watch for container size changes (e.g. when the admin panel resizes)
            if (containerRef.current) {
                const ro = new ResizeObserver(() => {
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.invalidateSize();
                    }
                });
                ro.observe(containerRef.current);
                // Store observer for cleanup
                (containerRef.current as any)._ro = ro;
            }
        });

        return () => {
            mounted = false;
            if (containerRef.current && (containerRef.current as any)._ro) {
                (containerRef.current as any)._ro.disconnect();
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Sync markers when locations prop changes
    useEffect(() => {
        const map = mapInstanceRef.current;
        const L = LRef.current;
        if (!map || !L) return;

        // Clear old markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        // Animated live-user pin icon
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

        // Auto-fit bounds to show all markers
        if (locations.length > 0) {
            try {
                const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]));
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13, animate: true });
                }
            } catch (_) { }
        }
    }, [locations]);

    return (
        <>
            <style>{`
        @keyframes lm-ping {
          0%   { transform: scale(1);   opacity: 0.3; }
          70%  { transform: scale(2.5); opacity: 0; }
          100% { opacity: 0; }
        }
        /* Prevent Tailwind reset from breaking Leaflet tile grid */
        .leaflet-container img.leaflet-tile {
          max-width: none !important;
          max-height: none !important;
        }
      `}</style>
            <div
                ref={containerRef}
                style={{ width: '100%', height: '100%', minHeight: '300px' }}
            />
        </>
    );
};

export default LiveUserMap;
