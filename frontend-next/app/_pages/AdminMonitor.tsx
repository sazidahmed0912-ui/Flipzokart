"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
    Activity, Users, ShieldAlert, AlertTriangle, XCircle, Info,
    Globe, Server, Cpu, Clock, Terminal, MapPin, Maximize2, Trash2
} from 'lucide-react';
import { useSocket } from '@/app/hooks/useSocket';
import { useApp } from '@/app/store/Context';
import type { MapLocation } from '@/app/components/LeafletMap';
import dynamic from 'next/dynamic';

const LiveUserMap = dynamic(() => import('@/app/components/LiveUserMap'), { ssr: false });

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
    const [securityEvents, setSecurityEvents] = useState<any[]>([]);
    const [newSecEventId, setNewSecEventId] = useState<string | null>(null);

    // Connect to socket using the hook
    const token = localStorage.getItem("token");
    const socket = useSocket(token);

    // Auto-scroll logs smart handling
    const logsEndRef = useRef<HTMLDivElement>(null);
    const logsContainerRef = useRef<HTMLDivElement>(null);
    const secEventsEndRef = useRef<HTMLDivElement>(null);
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
            // Push warnings/errors to dedicated security events list
            if (log.type === 'warning' || log.type === 'error') {
                setSecurityEvents(prev => {
                    const updated = [{ ...log, _ts: Date.now() }, ...prev];
                    return updated.slice(0, 50);
                });
                setNewSecEventId(log.id);
                setTimeout(() => setNewSecEventId(null), 3000);
            }
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

                {/* Security Events — Live scrollable panel */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm col-span-1 lg:col-span-1 flex flex-col" style={{ height: '384px' }}>
                    {/* Header */}
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <ShieldAlert size={18} className="text-orange-500" /> Security Events
                            {securityEvents.length > 0 && (
                                <span className="ml-1 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                    {securityEvents.length}
                                </span>
                            )}
                        </h2>
                        {securityEvents.length > 0 && (
                            <button
                                onClick={() => setSecurityEvents([])}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
                                title="Clear all events"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>

                    {/* Scrollable events list */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {securityEvents.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center py-6">
                                <ShieldAlert size={36} className="text-gray-200 mb-2" />
                                <p className="text-sm text-gray-400 font-medium">All clear — no security alerts</p>
                                <p className="text-xs text-gray-300 mt-1">Events appear here in real-time</p>
                            </div>
                        )}

                        {securityEvents.map(log => (
                            <SecurityLog
                                key={log.id || log._ts}
                                time={new Date(log.timestamp || log._ts || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                message={log.message}
                                source={log.source}
                                type={log.type === 'error' ? 'danger' : 'warning'}
                                isNew={newSecEventId === log.id}
                            />
                        ))}
                        <div ref={secEventsEndRef} />
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

const SecurityLog = ({ time, message, source, type, isNew }: any) => {
    const cfg: any = {
        warning: { bar: 'border-yellow-400', bg: 'bg-yellow-50', icon: <AlertTriangle size={14} className="text-yellow-500 shrink-0" />, label: 'WARN', labelCls: 'bg-yellow-100 text-yellow-700' },
        danger: { bar: 'border-red-500', bg: 'bg-red-50', icon: <XCircle size={14} className="text-red-500 shrink-0" />, label: 'ERROR', labelCls: 'bg-red-100 text-red-700' },
        success: { bar: 'border-green-500', bg: 'bg-green-50', icon: <Info size={14} className="text-green-500 shrink-0" />, label: 'OK', labelCls: 'bg-green-100 text-green-700' },
        info: { bar: 'border-blue-400', bg: 'bg-blue-50', icon: <Info size={14} className="text-blue-500 shrink-0" />, label: 'INFO', labelCls: 'bg-blue-100 text-blue-700' },
    };
    const c = cfg[type] || cfg.info;

    return (
        <div className={`border-l-4 ${c.bar} ${c.bg} rounded-r-lg px-3 py-2.5 transition-all ${isNew ? 'ring-2 ring-orange-300 scale-[1.01]' : ''
            }`}>
            <div className="flex items-start gap-2">
                {c.icon}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.labelCls}`}>{c.label}</span>
                        {source && <span className="text-[10px] text-gray-400 font-mono">[{source}]</span>}
                        {isNew && <span className="text-[10px] font-bold text-orange-500 animate-pulse">NEW</span>}
                        <span className="text-[10px] text-gray-400 font-mono ml-auto">{time}</span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium leading-snug break-words">{message}</p>
                </div>
            </div>
        </div>
    );
};
