import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { AdminSidebar } from '../components/AdminSidebar';
import { SmoothReveal } from '../components/SmoothReveal';
import {
    Search, Bell, LogOut, ChevronDown,
    Globe, MapPin, Users, Activity, Maximize, Share2
} from 'lucide-react';
import { useApp } from '../store/Context';

interface UserLocation {
    id: string;
    name: string;
    role: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
    email?: string;
    status?: string;
    country?: string;
    lastActive?: string;
}

// Map Configuration
const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1.5rem',
};

// Default India Center
const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629
};

// Custom Map Styles (Clean Professional Look)
const mapStyles = [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#444444" }]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [{ "color": "#f2f2f2" }]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [{ "color": "#2874f0" }, { "visibility": "on" }]
    }
];

export const AdminMap: React.FC = () => {
    const { user, logout } = useApp();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeUsers, setActiveUsers] = useState<UserLocation[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserLocation | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    // Load Google Maps Script
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // REPLACE THIS WITH REAL KEY
        language: 'en' // Force English
    });

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Fetch Real User Locations
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const token = localStorage.getItem("token");
                // Using the backend API we created earlier
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
                        email: u.email || 'N/A',
                        lat: u.lat,
                        lng: u.lng,
                        city: u.city,
                        state: u.state,
                        role: u.role,
                        status: 'online',
                        lastActive: u.joined,
                        country: 'India' // Since our system is India-focused for now
                    }));
                    setActiveUsers(mappedUsers);
                }
            } catch (error) {
                console.error("Failed to load map data", error);
            }
        };

        fetchLocations();
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchLocations, 30000);
        return () => clearInterval(interval);
    }, []);

    // Filter Users
    const filteredUsers = activeUsers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.state?.toLowerCase().includes(searchTerm.toLowerCase())
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
                            <p className="text-sm text-gray-500 mt-1">Live geographic visualization of active users (Google Maps)</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-semibold text-gray-600">{activeUsers.length} Online</span>
                            </div>
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
                    <SmoothReveal direction="up" delay={200} className="flex-1 bg-white rounded-3xl border border-gray-200 shadow-2xl relative overflow-hidden min-h-[600px] p-2">
                        {isLoaded ? (
                            <div className="w-full h-full relative rounded-2xl overflow-hidden">
                                <GoogleMap
                                    mapContainerStyle={containerStyle}
                                    center={defaultCenter}
                                    zoom={5}
                                    onLoad={onLoad}
                                    onUnmount={onUnmount}
                                    options={{
                                        styles: mapStyles,
                                        disableDefaultUI: false,
                                        zoomControl: true,
                                        streetViewControl: false,
                                        mapTypeControl: false,
                                        fullscreenControl: true,
                                    }}
                                >
                                    {filteredUsers.map((user) => (
                                        <Marker
                                            key={user.id}
                                            position={{ lat: user.lat, lng: user.lng }}
                                            onClick={() => setSelectedUser(user)}
                                            icon={{
                                                // Use standard Google marker or custom SVG if needed
                                                // For now, default red marker is fine, or we can use a blue one
                                                path: google.maps.SymbolPath.CIRCLE,
                                                scale: 8,
                                                fillColor: "#2874F0",
                                                fillOpacity: 1,
                                                strokeWeight: 2,
                                                strokeColor: "#FFFFFF",
                                            }}
                                        />
                                    ))}

                                    {selectedUser && (
                                        <InfoWindow
                                            position={{ lat: selectedUser.lat, lng: selectedUser.lng }}
                                            onCloseClick={() => setSelectedUser(null)}
                                        >
                                            <div className="p-2 min-w-[200px]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                                                        {selectedUser.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm">{selectedUser.name}</p>
                                                        <p className="text-xs text-gray-500">{selectedUser.email}</p>
                                                    </div>
                                                </div>
                                                <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <MapPin size={12} className="text-blue-600" />
                                                        <span className="text-gray-700">{selectedUser.city}, {selectedUser.state}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Activity size={12} className="text-green-600" />
                                                        <span className="text-gray-700">Role: {selectedUser.role}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </InfoWindow>
                                    )}
                                </GoogleMap>

                                {/* Live Indicator */}
                                <div className="absolute top-4 right-14 bg-white/90 backdrop-blur-md border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 z-[100] shadow-md flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Google Maps Live
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-500 font-medium">Loading Google Maps...</p>
                                    <p className="text-xs text-gray-400 mt-2">Make sure you have added your API Key</p>
                                </div>
                            </div>
                        )}
                    </SmoothReveal>
                </div>
            </div>
        </div>
    );
};
