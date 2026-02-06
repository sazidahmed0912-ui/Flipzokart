"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Marker Icons
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface LocationPickerMapProps {
    lat: number;
    lng: number;
    onLocationSelect: (lat: number, lng: number) => void;
}

const DraggableMarker = ({ position, onDragEnd }: { position: [number, number], onDragEnd: (lat: number, lng: number) => void }) => {
    const markerRef = useRef<any>(null);

    // Update map center when position changes externally
    const map = useMapEvents({});
    useEffect(() => {
        if (position[0] !== 0 && position[1] !== 0) {
            map.flyTo(position, map.getZoom());
        }
    }, [position[0], position[1], map]);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng();
                    onDragEnd(lat, lng);
                }
            },
        }),
        [onDragEnd],
    );

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={icon}
        />
    );
}

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ lat, lng, onLocationSelect }) => {
    const defaultCenter: [number, number] = [20.5937, 78.9629]; // India Center
    const position: [number, number] = (lat && lng) ? [lat, lng] : defaultCenter;

    return (
        <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner z-0">
            <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker
                    position={position}
                    onDragEnd={onLocationSelect}
                />
            </MapContainer>
        </div>
    );
};

export default LocationPickerMap;
