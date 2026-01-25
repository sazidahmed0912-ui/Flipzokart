import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { SmoothReveal } from '../components/SmoothReveal';
import {
    Search, Bell, LogOut, ChevronDown,
    Globe, Users, Share2
} from 'lucide-react';
import { useApp } from '../store/Context';
import LeafletMap, { MapLocation } from '../components/LeafletMap';

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

export const AdminMap: React.FC = () => {
    const { user, logout } = useApp();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeUsers, setActiveUsers] = useState<UserLocation[]>([]);

    // Fetch Real User Locations
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const token = localStorage.getItem("token");
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const response = await fetch(`${API_URL}/api/user/locations`, {
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
                        country: 'India'
                    }));
                    setActiveUsers(mappedUsers);
                }
            } catch (error) {
                console.error("Failed to load map data", error);
            }
        };

        fetchLocations();
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

    // Map to Leaflet Format
    const mapLocations: MapLocation[] = filteredUsers.map(u => ({
        id: u.id,
        lat: u.lat,
        lng: u.lng,
        title: u.name,
        description: `User Location - ${u.city}, ${u.state}` // Exact format requested
    }));

    // Fullscreen Toggle
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.getElementById('admin-map-container')?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

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
                            <p className="text-sm text-gray-500 mt-1">Live active users mapped directly from addresses (OpenStreetMap)</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl">
                                <div className={`w-2 h-2 rounded-full ${activeUsers.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                <span className="text-xs font-semibold text-gray-600">{activeUsers.length} Online</span>
                            </div>

                            {/* Full Screen Button */}
                            <button
                                onClick={toggleFullScreen}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
                                Full Screen
                            </button>
                        </div>
                    </SmoothReveal>

                    {/* Map Container - ID for Fullscreen */}
                    <SmoothReveal direction="up" delay={200} className="flex-1 bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden relative" >
                        <div id="admin-map-container" className="w-full h-full bg-white relative">
                            {activeUsers.length === 0 && (
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200">
                                    <span className="text-sm font-medium text-gray-500">No active users with addresses found.</span>
                                </div>
                            )}
                            <LeafletMap
                                locations={mapLocations}
                                height="100%"
                                className="w-full h-full"
                            />
                        </div>
                    </SmoothReveal>
                </div>
            </div>
        </div>
    );
};
