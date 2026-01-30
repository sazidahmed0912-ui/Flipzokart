"use client";
import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import {
    Search, Bell, LogOut, ChevronDown,
    Globe, Users, Share2
} from 'lucide-react';
import { useSocket } from '@/app/hooks/useSocket';
import { useApp } from '@/app/store/Context';
import LeafletMap, { MapLocation } from '@/app/components/LeafletMap';

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
    address?: string;
    locality?: string;
    pincode?: string;
}

export const AdminMap: React.FC = () => {
    const { user, logout } = useApp();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeUsers, setActiveUsers] = useState<UserLocation[]>([]);

    // Connect to socket using the hook
    const token = localStorage.getItem("token");
    const socket = useSocket(token);

    // Fetch Real User Locations (Initial Load)
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
                        status: u.status || 'Active',
                        lastActive: u.joined,
                        country: u.country || 'India',
                        address: u.address,
                        locality: u.locality,
                        pincode: u.pincode
                    }));
                    setActiveUsers(mappedUsers);
                }
            } catch (error) {
                console.error("Failed to load map data", error);
            }
        };

        fetchLocations();
    }, []);

    // Listen for Real-Time Monitor Updates
    useEffect(() => {
        if (!socket) return;

        socket.emit('join_monitor');

        const handleStats = (data: any) => {
            if (data.activeUserList && Array.isArray(data.activeUserList)) {
                // Update map with real-time active users who have location data
                // We merge with existing to keep historical data if needed, or replace to show ONLY live.
                // Request was "sync to monitor section", implying SHOW LIVE USERS.

                const liveUsers = data.activeUserList.map((u: any) => {
                    // Try to use live socket data first
                    if (u.lat && u.lng) {
                        return {
                            id: u.id,
                            name: u.name,
                            email: u.email,
                            lat: u.lat,
                            lng: u.lng,
                            city: u.city || 'Unknown',
                            state: u.country || 'Unknown',
                            role: u.role || 'User',
                            status: 'Online', // Explicitly mark as Online
                            country: u.country || 'India'
                        };
                    }
                    // Fallback to address if available in payload
                    else if (u.addresses && u.addresses.length > 0) {
                        const addr = u.addresses.find((a: any) => a.type === 'Home') || u.addresses[0];
                        // Coordinates would need to be in address or geocoded. 
                        // For now, if no lat/lng, we might skip or show basic. in this context, server sends lat/lng from user object.
                        return null;
                    }
                    return null;
                }).filter((u: any) => u !== null);

                // If we have live users, we can overlay them or replace.
                // To keep the map populated, we'll overlay 'Online' status on existing users 
                // AND add new ones if they weren't in the DB fetch.

                setActiveUsers(prev => {
                    const newMap = [...prev];
                    liveUsers.forEach((liveUser: any) => {
                        const idx = newMap.findIndex(existing => existing.id === liveUser.id);
                        if (idx !== -1) {
                            // Update status AND location
                            newMap[idx] = {
                                ...newMap[idx],
                                status: 'Online',
                                lat: liveUser.lat,
                                lng: liveUser.lng
                            };
                        } else {
                            newMap.push(liveUser); // Add new live user
                        }
                    });
                    return newMap;
                });
            }
        };

        socket.on('monitor:stats', handleStats);

        return () => {
            socket.off('monitor:stats', handleStats);
        };
    }, [socket]);

    // Filter Users
    const [liveOnly, setLiveOnly] = useState(true); // Default to True per user request

    const filteredUsers = activeUsers.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.state?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLive = liveOnly ? u.status === 'Online' : true;

        return matchesSearch && matchesLive;
    });

    // Map to Leaflet Format without random jitter
    const mapLocations: MapLocation[] = filteredUsers.map(u => {
        // Construct full address string if available
        let addressText = `${u.city}, ${u.state}`;
        if (u.address) {
            addressText = `${u.address}, ${u.locality ? u.locality + ', ' : ''}${u.city}, ${u.state} - ${u.pincode || ''}`;
        }

        return {
            id: u.id,
            lat: u.lat,
            lng: u.lng,
            title: u.name,
            description: `[${u.status}] • ${addressText}`,
            status: u.status
        };
    });

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
                                <Globe className="text-blue-600" /> User Location Map
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Map of all registered users with saved addresses</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl">
                                <div className={`w-2 h-2 rounded-full ${activeUsers.length > 0 ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                                <span className="text-xs font-semibold text-gray-600">{activeUsers.length} Mapped Users</span>
                            </div>

                            <button
                                onClick={() => setLiveOnly(!liveOnly)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${liveOnly ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                {liveOnly ? 'Showing Live' : 'Show All'}
                            </button>

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
                    <div className="flex-1 bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden relative" >
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
                    </div>
                </div>
            </div>
        </div>
    );
};
