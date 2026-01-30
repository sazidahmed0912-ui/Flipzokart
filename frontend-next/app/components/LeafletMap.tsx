"use client";
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import iconMarker2x from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconMarker2x,
    iconUrl: iconMarker,
    shadowUrl: iconShadow,
});

export interface MapLocation {
    id: string;
    lat: number;
    lng: number;
    title: string;
    description?: string;
    status?: string; // New field for status
}

interface LeafletMapProps {
    locations: MapLocation[];
    height?: string;
    className?: string;
}

// Custom Blinking Icon for Live Users
const createLiveIcon = () => L.divIcon({
    className: 'bg-transparent',
    html: `<div class="relative flex items-center justify-center w-8 h-8">
            <span class="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-30 animate-ping"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-green-600 border-2 border-white shadow-lg"></span>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

// Component to auto-fit map bounds to markers
const BoundsController: React.FC<{ locations: MapLocation[] }> = ({ locations }) => {
    const map = useMap();

    useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        } else {
            // Default view (India Center)
            map.setView([20.5937, 78.9629], 5);
        }
    }, [locations, map]);

    return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({ locations, height = "400px", className = "" }) => {
    return (
        <div className={`w-full relative z-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm ${className}`} style={{ height }}>
            <MapContainer
                center={[20.5937, 78.9629]} // Default India Center
                zoom={5}
                scrollWheelZoom={true}
                className="w-full h-full"
                zoomControl={true}
                attributionControl={true}
            >
                {/* English-friendly OSM Tiles (CartoDB Positron is cleaner, but OSM is requested standard) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <BoundsController locations={locations} />

                {locations.map((loc) => (
                    <Marker
                        key={loc.id}
                        position={[loc.lat, loc.lng]}
                        icon={loc.status === 'Online' ? createLiveIcon() : new L.Icon.Default()}
                    >
                        <Popup>
                            <div className="min-w-[150px]">
                                <strong className="block text-gray-800 font-bold mb-1">{loc.title}</strong>
                                {loc.description && (
                                    <p className="text-gray-600 text-sm m-0 leading-tight">
                                        {loc.description}
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default LeafletMap;
