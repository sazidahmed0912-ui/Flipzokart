"use client";
import React, { useEffect, useRef } from 'react';
import { MapLocation } from './LeafletMap';
import { Globe } from 'lucide-react';

interface LiveUserMapProps {
    locations: MapLocation[];
}

const LiveUserMap: React.FC<LiveUserMapProps> = ({ locations }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    // Init map
    useEffect(() => {
        if (typeof window === 'undefined' || leafletMapRef.current) return;

        const L = require('leaflet');
        require('leaflet/dist/leaflet.css');

        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        const map = L.map(mapRef.current!, {
            center: [20.5937, 78.9629],
            zoom: 5,
            zoomControl: true,
            scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        leafletMapRef.current = map;

        return () => {
            map.remove();
            leafletMapRef.current = null;
        };
    }, []);

    // Update markers when locations change
    useEffect(() => {
        const map = leafletMapRef.current;
        if (!map || typeof window === 'undefined') return;

        const L = require('leaflet');

        // Remove old markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Create live ping icon
        const liveIcon = L.divIcon({
            className: 'bg-transparent',
            html: `<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
               <span style="position:absolute;width:100%;height:100%;border-radius:50%;background:#22c55e;opacity:0.3;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
               <span style="position:relative;width:14px;height:14px;border-radius:50%;background:#16a34a;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></span>
             </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });

        const newMarkers: any[] = [];

        locations.forEach(loc => {
            const marker = L.marker([loc.lat, loc.lng], { icon: liveIcon })
                .addTo(map)
                .bindPopup(`
          <div style="min-width:140px;padding:4px;">
            <strong style="display:block;font-size:13px;font-weight:700;color:#1f2937;">${loc.title}</strong>
            ${loc.description ? `<p style="font-size:11px;color:#6b7280;margin:4px 0 0 0;">${loc.description}</p>` : ''}
            <span style="display:inline-block;margin-top:6px;padding:2px 8px;background:#dcfce7;color:#15803d;font-size:10px;font-weight:700;border-radius:9999px;">Active Now</span>
          </div>
        `);
            newMarkers.push(marker);
        });

        markersRef.current = newMarkers;

        // Auto-fit bounds
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
            }
        }
    }, [locations]);

    return (
        <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 0 }} />
    );
};

export default LiveUserMap;
