"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
    Activity, Users, ShoppingCart, ShieldAlert,
    Globe, Server, Cpu, Clock, Terminal, Map as MapIcon, Maximize2
} from 'lucide-react';
import { useSocket } from '@/app/hooks/useSocket';
import { useApp } from '@/app/store/Context';
import LeafletMap, { MapLocation } from '@/app/components/LeafletMap';

export const AdminMonitor: React.FC = () => {
    const { user } = useApp();
    const [stats, setStats] = useState({
        activeUsers: 0,
        activeUserList: [] as any[],
        serverLoad: 0,
        memoryUsage: 0,
        uptime: 0,
        systemStatus: 'Connecting...'
    });
    const [logs, setLogs] = useState<any[]>([]);
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    // Connect to socket using the hook
    const token = localStorage.getItem("token");
    const socket = useSocket(token);

    // Auto-scroll logs smart handling
    const logsEndRef = useRef<HTMLDivElement>(null);
    const logsContainerRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleScroll = () => {
        if (logsContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
            const atBottom = scrollHeight - scrollTop - clientHeight < 100;
            setIsAtBottom(atBottom);
        }
    };

    useEffect(() => {
        if (!socket) return;

        socket.emit('join_monitor');

        const handleStats = (data: any) => {
            setStats(prev => ({ ...prev, ...data }));
        };

        const handleLog = (log: any) => {
            setLogs(prev => {
                const newLogs = [...prev, log];
                if (newLogs.length > 50) newLogs.shift();
                return newLogs;
            });
        };

        socket.on('monitor:stats', handleStats);
        socket.on('monitor:log', handleLog);

        return () => {
            socket.off('monitor:stats', handleStats);
            socket.off('monitor:log', handleLog);
        };
    }, [socket]);

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    // Transform active users to map locations
    const mapLocations: MapLocation[] = stats.activeUserList
        .filter((u: any) => u.lat && u.lng)
        .map((u: any) => ({
            id: u.id || u.socketId,
            lat: u.lat,
            lng: u.lng,
            title: u.name || 'Visitor',
            // Show address if available, else City/Country
            description: u.addresses && u.addresses.length > 0
                ? `${u.addresses[0].address || ''}, ${u.city || ''}`
                : `${u.city || 'Unknown Location'}, ${u.country || ''}`,
            status: 'Online'
        }));

    return (
        <div className="p-8 bg-[#F5F7FA] min-h-screen">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <Activity className="text-blue-600 animate-pulse" /> Real-time System Monitor
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Live infrastructure and user activity tracking.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Sync
                </div>
            </div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MonitorCard title="Active Users" value={stats.activeUsers.toString()} icon={Users} color="blue" change="Real-time Count" />
                <MonitorCard title="Server Load" value={`${stats.serverLoad}%`} icon={Cpu} color={stats.serverLoad > 80 ? 'red' : 'green'} change="OS Load Average" />
                <MonitorCard title="Memory Usage" value={`${stats.memoryUsage}%`} icon={Server} color={stats.memoryUsage > 90 ? 'red' : 'purple'} change="System RAM" />
                <MonitorCard title="System Uptime" value={formatUptime(stats.uptime)} icon={Clock} color="green" change={stats.systemStatus} />
            </div>

            {/* FULL WIDTH MAP SECTION */}
            <div className={`mb-8 transition-all duration-500 ease-in-out ${isMapExpanded ? 'h-[80vh]' : 'h-[500px]'}`}>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden relative">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Globe size={20} className="text-blue-500" /> Live User Map
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">Real-time geographic distribution of active users</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold">
                                {mapLocations.length} Users Tracked
                            </span>
                            <button onClick={() => setIsMapExpanded(!isMapExpanded)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Toggle Size">
                                <Maximize2 size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <LeafletMap
                            locations={mapLocations}
                            height="100%"
                            className="w-full h-full rounded-none border-none"
                            autoFit={true} // Only fits initially thanks to new logic
                        />
                        {mapLocations.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-[1000] pointer-events-none">
                                <div className="text-center">
                                    <MapIcon size={48} className="text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400 font-medium">Waiting for active users with location data...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Real-time Logs Console */}
                <div className="lg:col-span-2 bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 shadow-sm flex flex-col h-96">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-200 flex items-center gap-2">
                            <Terminal size={18} className="text-green-500" /> System Logs Stream
                        </h2>
                        <span className="text-xs text-gray-500 italic">Auto-scroll Active</span>
                    </div>
                    <div
                        ref={logsContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto font-mono text-sm space-y-1.5 pr-2 custom-scrollbar"
                    >
                        {logs.length === 0 && <div className="text-gray-600 italic text-center mt-10">Waiting for logs...</div>}
                        {logs.map((log) => (
                            <div key={log.id} className="flex gap-3 text-gray-300 border-b border-gray-800/30 pb-1">
                                <span className="text-gray-500 shrink-0 select-none">[{new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}]</span>
                                <span className={`font-bold shrink-0 ${log.type === 'error' ? 'text-red-400' :
                                        log.type === 'warning' ? 'text-yellow-400' :
                                            log.type === 'success' ? 'text-green-400' : 'text-blue-400'
                                    }`}>{log.type.toUpperCase()}</span>
                                <span className="text-gray-400 shrink-0">[{log.source}]</span>
                                <span>{log.message}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                    {!isAtBottom && (
                        <button onClick={scrollToBottom} className="absolute bottom-8 right-8 bg-blue-600 text-white px-3 py-1 text-xs rounded-full shadow-lg animate-bounce">
                            ⬇ New Logs
                        </button>
                    )}
                </div>

                {/* Security Events */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-1 lg:col-span-1">
                    <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ShieldAlert size={18} className="text-orange-500" /> Security Events
                    </h2>
                    <div className="space-y-4">
                        {logs.filter(l => l.type === 'warning' || l.type === 'error').slice(-5).map(log => (
                            <SecurityLog
                                key={log.id}
                                time={new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                message={log.message}
                                type={log.type === 'error' ? 'danger' : 'warning'}
                            />
                        ))}
                        {logs.filter(l => l.type === 'warning' || l.type === 'error').length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No recent security alerts.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MonitorCard = ({ title, value, icon: Icon, color, change }: any) => {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-emerald-50 text-emerald-600 border-emerald-100",
        red: "bg-red-50 text-red-600 border-red-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${colors[color] || colors.blue}`}>
                    <Icon size={24} />
                </div>
            </div>
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                {change}
            </p>
        </div>
    );
};

const SecurityLog = ({ time, message, type }: any) => {
    const types: any = {
        warning: "border-l-4 border-yellow-400 bg-yellow-50",
        danger: "border-l-4 border-red-500 bg-red-50",
        success: "border-l-4 border-green-500 bg-green-50",
        info: "border-l-4 border-blue-400 bg-blue-50",
    };

    return (
        <div className={`p-3 text-sm rounded-r-lg ${types[type]} flex justify-between items-center bg-white border shadow-sm`}>
            <span className="text-gray-700 font-medium truncate pr-2">{message}</span>
            <span className="text-xs text-gray-400 font-mono shrink-0">
                {time ? time : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
        </div>
    );
};
