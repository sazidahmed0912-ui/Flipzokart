"use client";
import React, { useEffect, useRef } from 'react';
import type { MapLocation } from './LeafletMap';

interface LiveUserMapProps {
    locations: MapLocation[];
}

const LiveUserMap: React.FC<LiveUserMapProps> = ({ locations }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    // Initialise map once
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        let mounted = true;

        import('leaflet').then((L) => {
            if (!mounted || !mapRef.current || mapInstanceRef.current) return;

            // Fix default icons via CDN (avoids webpack asset resolution issues)
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            const map = L.map(mapRef.current, {
                center: [20.5937, 78.9629],
                zoom: 5,
                zoomControl: true,
                scrollWheelZoom: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 18,
            }).addTo(map);

            mapInstanceRef.current = map;
        });

        return () => {
            mounted = false;
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update markers when locations change
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        import('leaflet').then((L) => {
            const map = mapInstanceRef.current;
            if (!map) return;

            // Remove existing markers
            markersRef.current.forEach((m) => m.remove());
            markersRef.current = [];

            // Live ping icon
            const liveIcon = L.divIcon({
                className: '',
                html: `<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
                 <span style="position:absolute;inset:0;border-radius:50%;background:#22c55e;opacity:0.35;animation:lm-ping 1.5s ease-out infinite;"></span>
                 <span style="position:relative;width:14px;height:14px;border-radius:50%;background:#16a34a;border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></span>
               </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });

            const newMarkers: any[] = [];
            locations.forEach((loc) => {
                const marker = L.marker([loc.lat, loc.lng], { icon: liveIcon })
                    .addTo(map)
                    .bindPopup(`
            <div style="min-width:140px;padding:4px 2px;">
              <strong style="font-size:13px;font-weight:700;color:#1f2937;display:block;">${loc.title}</strong>
              ${loc.description ? `<p style="font-size:11px;color:#6b7280;margin:4px 0 0;">${loc.description}</p>` : ''}
              <span style="display:inline-block;margin-top:6px;padding:2px 8px;background:#dcfce7;color:#15803d;font-size:10px;font-weight:700;border-radius:9999px;">Active Now</span>
            </div>
          `);
                newMarkers.push(marker);
            });
            markersRef.current = newMarkers;

            // Auto-fit bounds to markers
            if (locations.length > 0) {
                const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]));
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13, animate: true });
                }
            }
        });
    }, [locations, mapInstanceRef.current]);

    return (
        <>
            <style>{`
        @keyframes lm-ping {
          0%   { transform: scale(1);   opacity: 0.35; }
          70%  { transform: scale(2.2); opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </>
    );
};

export default LiveUserMap;
