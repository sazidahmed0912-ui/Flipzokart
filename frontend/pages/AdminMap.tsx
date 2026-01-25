import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { SmoothReveal } from '../components/SmoothReveal';
import {
    Search, Bell, User, LogOut, ChevronDown,
    Globe, MapPin, Users, Activity, Layers, Maximize
} from 'lucide-react';
import { useApp } from '../store/Context';
import { useSocket } from '../hooks/useSocket';

// Simple World Map SVG Path (Simplified for performance & visuals)
const WorldMapSVG = () => (
    <svg viewBox="0 0 1000 500" className="w-full h-full fill-gray-200 stroke-gray-300 stroke-[0.5]">
        <path d="M836,75c-1-1-5-1-8-2c-2,0-5,1-7,1c-2,1-1,4-1,6c0,2-2,3-3,3c-2,0-3-4-2-6c1-2,1-4,3-6c1-2,0-4-3-4c-1-1-4-1-6,0c-1,1-1,3-1,5c1,3,2,6,2,9c0,2-1,3-2,4c-1,0-2-1-3-2c-1-1-1-3-2-5c0-1,0-2-1-3c-1-2-1-4-2-7c-1-2,1-5,3-6c1-1,2-1,3,0c1,2,3,2,5,1c1-1,0-3-1-4c-2-1-5-1-7,1c-1,1-1,3-1,4c1,1,2,2,3,2c1,0,2-1,2-2c0-1-1-1-1-2c0-1,1-2,2-3c1-1,1-2,0-3c-1-1-3-1-4,0c-1,2-2,4-3,6c-1,2-3,2-4,2c-1,0-1-2,0-3c0-1,2-2,3-2c1,0,2,1,2,3c0,1,1,2,1,3c1,1,2,1,2,0c0-1-1-2-2-3c-1-1-2-2-3-3c-1-1-2-1-3,0c-1,1-1,3-1,4c0,2-2,3-3,3c-1,0-2-2-2-4c0-2,1-4,2-5c1-2,0-3-2-3c-2,0-3,2-4,4c-1,2-1,4-1,6c0,1,1,2,1,3c1,1,2,1,2,0c0-1-1-2-2-3c-1-1-1-2-2-4c-1-1-2-2-2-3c0-1,1-2,2-3c1-1,2-1,3,0c1,1,1,2,1,3c0,1,1,1,2,1c0-1-1-2-1-3c0-1,1-2,2-3c1-1,2-1,3,0c1,1,1,3,1,5c0,2-2,3-4,3c-1,0-3-1-4-2c-1-1-2-3-2-5c0-2,0-4,1-6c1-2,2-3,3-5c1-2,1-4,0-6c-1-1-3-1-5,0c-2,1-3,3-4,5c-1,2-2,4-2,6c-1,2-1,4-1,6c0,1,1,3,2,4c1,1,3,1,4,1c1,0,2-1,2-2c0-1-1-2-2-3c-1-1-2-1-2-2c0-1,1-2,2-3c1-1,3-1,4-1c1,0,1,2,1,4c-1,2-1,4-1,6c0,2,1,3,2,4c1,1,2,1,3,0c1-1,1-2,1-4c0-2-1-3-2-4c-1-1-3-1-4,0c-2,1-3,3-4,5c-1,2-1,4-1,6c0,2,1,4,3,5c1,1,3,1,5,0c1-1,2-2,2-3c0-1-1-2-2-3c-1-1-2-1-3-1c-2,0-3,2-4,4c-1,2-1,5-1,7c0,2,0,5,1,7c0,2,1,4,2,6c1,1,1,3,1,5c-1,1-2,2-4,2c-2,0-3-2-4-4c-1-2-1-5-1-7c0-2,0-4,1-6c0-1,1-2,1-4c1-2,1-3,0-5c-1-1-2-2-3-2c-1,0-2,1-3,2c-1,1-1,3-1,5c0,1,1,3,2,4c0,1,1,2,1,3c-1,1-2,1-3,0c-1-1-2-3-2-5c0-1,0-3,1-4c0-2,1-3,1-5c0-1-1-2-2-3c-1-1-3-1-4,0c-2,1-3,3-4,5c-1,2-1,4-1,6c0,2,0,5,1,7c0,2,1,4,2,5c1,1,1,3,1,4c-1,1-2,1-3,0c-1-1-2-2-3-4c-1-1-2-3-2-5c0-2,0-4,1-5c0-2,1-3,2-5c0-1,1-2,1-3c0-1-1-2-2-3c-1-1-3-1-4,0c-1,1-2,2-3,4s-1,3-1,5c0,1,1,2,2,3c0,0,1,1,1,1c1,0,2-1,2-2c0-1-1-2-1-3c-1-1-1-2-1-3c0-1,1-2,2-2c1,0,2,1,2,2c0,1-1,2-2,3c-1,1-2,1-3,0c-1-1-2-2-2-4c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,0-2-1-3c-1-1-2-1-3,0c-1,1-2,3-2,5c-1,2-1,4-1,6c0,1,0,3,1,4c1,1,2,1,3,0c1-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-2-2c-1-1-1-3-1-5c0-1,1-3,2-4c0-1,1-2,2-2c0,0,1,1,1,2c0,1-1,2-2,3c-1,1-2,2-3,2c-1,0-2-1-3-2c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,0-2-1-3c-1-1-2-1-3,0c-1,1-2,3-2,5c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,1,2,1,3c-1,1-2,1-3,0c-1-1-2-2-2-4c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c1-1,1-2,1-3c-1-1-2-1-3,0c-1,1-2,3-2,5c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c1-1,1-2,1-3c-1-1-2-1-3,0c-1,1-2,3-2,5c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4s-1,4-1,6c0,1,1,3,2,4s2,1,3,0c1-1,1-3,1-5c0-1,0-3-1-4c0-1-1-2-1-3c0-1,1-2,2-2c1,0,2,1,2,2c0,1-1,2-2,3s-2,2-3,2c-1,0-2-1-3-2c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,0-2-1-3c-1-1-2-1-3,0c-1,1-2,3-2,5c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4s-1,4-1,6c0,1,1,3,2,4s2,1,3,0c1-1,1-3,1-5c0-1,0-3-1-4c0-1-1-2-1-3c0-1,1-2,2-2c1,0,2,1,2,2c0,1-1,2-2,3s-2,2-3,2c-1,0-2-1-3-2c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,0-2-1-3c-1-1-2-1-3,0c-1,1-2,3-2,5c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4s-1,4-1,6c0,1,1,3,2,4s2,1,3,0c1-1,1-3,1-5c0-1,0-3-1-4c0-1-1-2-1-3c0-1,1-2,2-2c1,0,2,1,2,2c0,1-1,2-2,3s-2,2-3,2c-1,0-2-1-3-2c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,0-2-1-3c-1-1-2-1-3,0c-1,1-2,3-2,5c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4s-1,4-1,6c0,1,1,3,2,4s2,1,3,0c1-1,1-3,1-5c0-1,0-3-1-4c0-1,0-2-1-3c-1-1-2-1-3,0c-1,1-2,3-2,5c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4s-1,4-1,6c0,1,1,3,2,4s2,1,3,0c1-1,1-3,1-5c0-1,0-3-1-4c0-1,0-2-1-3c-1-1-2-1-3,0c-1,1-2,3-2,5c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4s-1,4-1,6c0,1,1,3,2,4s2,1,3,0c1-1,1-3,1-5c0-1,0-3-1-4c0-1,0-2-1-3c-1-1-2-1-3,0c-1,1-2,3-2,5c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4s-1,4-1,6c0,1,1,3,2,4s2,1,3,0c1-1,1-3,1-5c0-1,0-3-1-4c0-1,0-2-1-3c-1-1-2-1-3,0c-1,1-2,3-2,5c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4s-1,4-1,6c0,1,1,3,2,4s2,1,3,0c1-1,1-3,1-5c0-1,0-3-1-4c0-1,0-2-1-3c-1-1-2-1-3,0c-1,1-2,3-2,5c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4s-1,4-1,6c0,1,1,3,2,4s2,1,3,0c1-1,1-3,1-5c0-1,0-3-1-4c0-1,0-2-1-3c-1-1-2-1-3,0c-1,1-2,3-2,5c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4s-1,4-1,6c0,1,1,3,2,4s2,1,3,0c1-1,1-3,1-5c0-1,0-3-1-4c0-1,0-2-1-3c-1-1-2-1-3,0c-1,1-2,3-2,5c-1,2-1,4-1,6c0,1,1,3,2,4c0,1,0,2-1,3s-2,1-3,0c-1-1-1-3-1-5c0-1,0-3,1-4c0-1,1-2,1-3c0-1,0-2-1-3c-1-1-2-1-3-1c-1,0-2,2-2,4s-1,4-1,6c0,1,1,3,2,4s2,1,3,0c1-1,1-3,1-5c0-1,0-3-1-4c0-1,0-2-1-3c-1-1-2-1-3,0c-1,1-2,3-2,5" />
    </svg>
);

export const AdminMap: React.FC = () => {
    const { user, logout } = useApp();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeUsers, setActiveUsers] = useState<any[]>([]);

    // Socket Connection
    const token = localStorage.getItem("token");
    const socket = useSocket(token);

    useEffect(() => {
        if (!socket) return;
        socket.emit('join_monitor');

        const handleStats = (data: any) => {
            if (data.activeUserList) {
                // Determine mock locations based on name slightly for demo randomness if coordinates missing
                const usersWithLoc = data.activeUserList.map((u: any, i: number) => ({
                    ...u,
                    x: Math.random() * 800 + 100, // Random X on map
                    y: Math.random() * 400 + 50   // Random Y on map
                }));
                setActiveUsers(usersWithLoc);
            }
        };

        socket.on('monitor:stats', handleStats);
        return () => {
            socket.off('monitor:stats', handleStats);
        };
    }, [socket]);


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
                                placeholder="Search regions, users..."
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
                                <Globe className="text-blue-600" /> Live User Map
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Real-time visualization of active users across the globe.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                <Layers size={16} /> Layers
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                <Maximize size={16} /> Fullscreen
                            </button>
                        </div>
                    </SmoothReveal>

                    {/* Map Container */}
                    <SmoothReveal direction="up" delay={200} className="flex-1 bg-[#0f172a] rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden group">

                        {/* Map SVG */}
                        <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity duration-1000">
                            <WorldMapSVG />
                        </div>

                        {/* Active User Markers */}
                        {activeUsers.map((u, i) => (
                            <div
                                key={i}
                                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group/marker"
                                style={{ left: `${u.x}px`, top: `${u.y}px` }}
                            >
                                <span className="absolute inline-flex h-4 w-4 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow-lg items-center justify-center">
                                    <span className="w-1 h-1 bg-white rounded-full"></span>
                                </span>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-32 bg-white rounded-lg shadow-xl p-2 text-center opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none z-10">
                                    <p className="text-xs font-bold text-gray-800">{u.name}</p>
                                    <p className="text-[10px] text-gray-500">{u.email}</p>
                                    <div className="absolute top-100 left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-white"></div>
                                </div>
                            </div>
                        ))}

                        {/* Stats Overlay */}
                        <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-blue-200">Active Users</p>
                                    <p className="text-xl font-bold text-white">{activeUsers.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg text-xs font-mono text-gray-400">
                            Live Sync Active
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></span>
                        </div>

                    </SmoothReveal>
                </div>
            </div>
        </div>
    );
};
