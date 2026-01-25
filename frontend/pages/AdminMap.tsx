import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AdminSidebar } from '../components/AdminSidebar';
import { SmoothReveal } from '../components/SmoothReveal';
import {
    Search, Bell, User, LogOut, ChevronDown,
    Globe, MapPin, Users, Activity, Layers, Maximize, Share2, Map as MapIcon
} from 'lucide-react';
import { useApp } from '../store/Context';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom pulsing marker icon
const createCustomIcon = (isOnline: boolean = true) => {
    const color = isOnline ? '#2874F0' : '#94a3b8';
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="position: relative; width: 40px; height: 40px;">
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 20px;
                    height: 20px;
                    background: ${color};
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 2;
                "></div>
                ${isOnline ? `
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 20px;
                    height: 20px;
                    background: ${color};
                    border-radius: 50%;
                    opacity: 0.6;
                    animation: pulse 2s infinite;
                "></div>
                ` : ''}
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
    });
};

// Add CSS for pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
        }
        50% {
            transform: translate(-50%, -50%) scale(2.5);
            opacity: 0;
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

interface UserLocation {
    id: string;
    name: string;
    role: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
    email?: string; // Optional if not returned
    status?: string;
    country?: string;
    lastActive?: string;
}

// Map layer switcher component
const LayerControl: React.FC<{ onLayerChange: (layer: string) => void; currentLayer: string }> = ({ onLayerChange, currentLayer }) => {
    const layers = [
        { name: 'Street', value: 'street', tile: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
        { name: 'Dark', value: 'dark', tile: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
        { name: 'Satellite', value: 'satellite', tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    ];

    return (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-xl p-2 flex gap-2">
            {layers.map(layer => (
                <button
                    key={layer.value}
                    onClick={() => onLayerChange(layer.value)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${currentLayer === layer.value
                        ? 'bg-[#2874F0] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {layer.name}
                </button>
            ))}
        </div>
    );
};

// Component to handle map centering
const MapCenterController: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

export const AdminMap: React.FC = () => {
    const { user, logout } = useApp();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeUsers, setActiveUsers] = useState<UserLocation[]>([]);
    const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
    const [mapZoom, setMapZoom] = useState(2);
    const [currentLayer, setCurrentLayer] = useState('street');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // API Connection
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                // We reuse the same API endpoint and type logic from AdminUserMap
                // but adapted for this full page view
                const token = localStorage.getItem("token");
                const response = await fetch('http://localhost:5000/api/user/locations', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();

                if (data.success) {
                    const mappedUsers = data.users.map((u: any) => ({
                        id: u.id,
                        name: u.name,
                        email: u.email || 'N/A', // Endpoint might need to return email if not already
                        lat: u.lat,
                        lng: u.lng,
                        city: u.city,
                        state: u.state,
                        role: u.role,
                        status: 'online', // For now assume visible users are "active" in DB context or just show them
                        lastActive: u.joined
                    }));
                    setActiveUsers(mappedUsers);
                }
            } catch (error) {
                console.error("Failed to load map data", error);
            }
        };

        fetchLocations();
        // Optional: Poll every 30s
        const interval = setInterval(fetchLocations, 30000);
        return () => clearInterval(interval);
    }, []);

    // Get tile layer URL based on current layer
    const getTileLayerUrl = () => {
        switch (currentLayer) {
            case 'dark':
                return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
            case 'satellite':
                return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
            default:
                return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        }
    };

    const getTileLayerAttribution = () => {
        switch (currentLayer) {
            case 'dark':
                return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
            case 'satellite':
                return 'Tiles &copy; Esri';
            default:
                return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
        }
    };

    const toggleFullscreen = () => {
        if (!mapContainerRef.current) return;

        if (!isFullscreen) {
            if (mapContainerRef.current.requestFullscreen) {
                mapContainerRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        setIsFullscreen(!isFullscreen);
    };

    const filteredUsers = activeUsers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                {/* Navbar */}
                <SmoothReveal direction="down" duration="500" className="sticky top-0 z-30">
                    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center w-full max-w-xl bg-[#F0F5FF] rounded-lg px-4 py-2.5">
                            <Search size={18} className="text-[#2874F0]" />
                            <input
                                type="text"
                                placeholder="Search locations, users, cities..."
                                className="w-full bg-transparent border-none outline-none text-sm ml-3 text-gray-700 placeholder-gray-400 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <button className="relative p-2 text-gray-500 hover:text-[#2874F0] transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6161] rounded-full ring-2 ring-white"></span>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#2874F0] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                        {user?.name?.charAt(0) || 'A'}
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700">{user?.name?.split(' ')[0] || 'Admin'}</span>
                                    <ChevronDown size={14} className="text-gray-400" />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50">
                                        <button onClick={logout} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2">
                                            <LogOut size={14} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>
                </SmoothReveal>

                <div className="p-8 space-y-8 h-full flex flex-col">
                    {/* Header */}
                    <SmoothReveal direction="down" delay={100} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Globe className="text-blue-600" /> Real-World User Map
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Live geographic visualization of active users worldwide</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-semibold text-gray-600">{activeUsers.length} Online</span>
                            </div>
                            <button
                                onClick={toggleFullscreen}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <Maximize size={16} /> Fullscreen
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert("Map Link Copied!");
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-[#2874F0] text-white border border-[#2874F0] rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm"
                            >
                                <Share2 size={16} /> Share View
                            </button>
                        </div>
                    </SmoothReveal>

                    {/* Map Container */}
                    <SmoothReveal direction="up" delay={200} className="flex-1 bg-white rounded-3xl border border-gray-200 shadow-2xl relative overflow-hidden min-h-[600px]">
                        <div ref={mapContainerRef} className="w-full h-full relative">
                            <MapContainer
                                center={mapCenter}
                                zoom={mapZoom}
                                className="w-full h-full rounded-3xl"
                                zoomControl={true}
                            >
                                <TileLayer
                                    attribution={getTileLayerAttribution()}
                                    url={getTileLayerUrl()}
                                />
                                <MapCenterController center={mapCenter} />

                                {/* User Markers */}
                                {filteredUsers.map((user) => (
                                    <Marker
                                        key={user.id}
                                        position={[user.lat, user.lng]}
                                        icon={createCustomIcon(user.status === 'online')}
                                    >
                                        <Popup className="custom-popup">
                                            <div className="p-2 min-w-[200px]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <MapPin size={12} className="text-blue-600" />
                                                        <span className="text-gray-700">{user.city}, {user.country}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Activity size={12} className="text-green-600" />
                                                        <span className="text-gray-700">Active Now</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>

                            {/* Layer Control */}
                            <LayerControl onLayerChange={setCurrentLayer} currentLayer={currentLayer} />

                            {/* Stats Overlay */}
                            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md border border-gray-200 p-4 rounded-2xl shadow-xl z-[1000]">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-500 rounded-xl text-white">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Active Users</p>
                                        <p className="text-2xl font-bold text-gray-800">{filteredUsers.length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Live Indicator */}
                            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md border border-gray-200 p-3 rounded-xl text-xs font-semibold text-gray-700 z-[1000] shadow-lg flex items-center gap-2">
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Real-Time Tracking
                            </div>
                        </div>
                    </SmoothReveal>
                </div>
            </div>
        </div>
    );
};
