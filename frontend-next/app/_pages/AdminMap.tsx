"use client";
import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { SmoothReveal } from '@/app/components/SmoothReveal';
import {
    Search, Bell, LogOut, ChevronDown,
    Globe, Users, Share2, MapPin, Navigation
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
    const [showSidebar, setShowSidebar] = useState(true);

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
                // Determine Live Users
                const liveUsers = data.activeUserList.map((u: any) => {
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
                            status: 'Online',
                            country: u.country || 'India',
                            address: u.addresses && u.addresses.length > 0 ? u.addresses[0].address : ''
                        };
                    }
                    return null;
                }).filter((u: any) => u !== null);

                // Update Logic: Mark Online status
                setActiveUsers(prev => {
                    const newMap = prev.map(u => ({ ...u, status: 'Offline' })); // Reset to offline first if desired, or keep generic
                    // Actually, let's keep historical data and just update status

                    liveUsers.forEach((liveUser: any) => {
                        const idx = newMap.findIndex(existing => existing.id === liveUser.id);
                        if (idx !== -1) {
                            newMap[idx] = { ...newMap[idx], ...liveUser, status: 'Online' };
                        } else {
                            newMap.push(liveUser);
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
    const [liveOnly, setLiveOnly] = useState(true);

    const filteredUsers = activeUsers.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.city?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLive = liveOnly ? u.status === 'Online' : true;

        return matchesSearch && matchesLive;
    });

    const mapLocations: MapLocation[] = filteredUsers.map(u => {
        let addressText = `${u.city}, ${u.state}`;
        if (u.address) {
            addressText = `${u.address}, ${u.locality ? u.locality + ', ' : ''}${u.city}`;
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

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#F5F7FA]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-0 relative">
                {/* Navbar */}
                <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#F0F5FF] p-2 rounded-lg text-blue-600"><Globe size={20} /></div>
                        <h1 className="font-bold text-gray-800 text-lg">Live Map</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center w-64 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                            <Search size={16} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="bg-transparent border-none outline-none text-sm ml-2 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={() => setLiveOnly(!liveOnly)} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${liveOnly ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-gray-500 border-gray-200'}`}>
                            {liveOnly ? 'Live Only' : 'All History'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex relative overflow-hidden">
                    {/* Sidebar List (New Feature) */}
                    <div className={`w-80 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full absolute z-10 h-full'}`}>
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                                Active Users <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{filteredUsers.length}</span>
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {filteredUsers.map(u => (
                                <div key={u.id} className="p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-gray-800 text-sm">{u.name}</h4>
                                        <span className={`w-2 h-2 rounded-full ${u.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-start gap-1">
                                        <MapPin size={12} className="mt-0.5 shrink-0" />
                                        {u.address || `${u.city}, ${u.country}`}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1 w-full justify-center">
                                            <Navigation size={10} /> Locate
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-10 text-gray-400 text-sm">No users found.</div>
                            )}
                        </div>
                    </div>

                    {/* Button to toggle sidebar */}
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="absolute top-4 left-4 z-[400] bg-white p-2 rounded-lg shadow-lg border border-gray-200 text-gray-600 hover:text-blue-600"
                    >
                        <Users size={20} />
                    </button>

                    {/* Map Area */}
                    <div className="flex-1 relative bg-gray-100">
                        <LeafletMap
                            locations={mapLocations}
                            height="100%"
                            className="w-full h-full rounded-none border-none"
                            autoFit={true} // Auto fit initially
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
