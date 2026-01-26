import React, { useState, useEffect, useRef } from 'react';
import {
    Activity, Users, ShoppingCart, ShieldAlert,
    Globe, Server, Cpu, Clock, Terminal
} from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useApp } from '../store/Context';

export const AdminMonitor: React.FC = () => {
    const { user } = useApp();
    const [stats, setStats] = useState({
        activeUsers: 0,
        activeUserList: [] as any[], // New State
        serverLoad: 0,
        memoryUsage: 0,
        uptime: 0,
        systemStatus: 'Connecting...'
    });
    const [logs, setLogs] = useState<any[]>([]);

    // Connect to socket using the hook
    const token = localStorage.getItem("token");
    const socket = useSocket(token);

    // Auto-scroll logs smart handling
    const logsEndRef = useRef<HTMLDivElement>(null);
    const logsContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(false);

    const scrollToBottom = () => {
        // Only scroll if the user was already at the bottom or just loaded the page
        if (shouldAutoScroll) {
            logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleScroll = () => {
        if (logsContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
            // Tolerance of 100px to consider "at bottom" (Smoother)
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

            // Update state: If user scrolls up, stop auto-scrolling
            if (shouldAutoScroll && !isAtBottom) {
                setShouldAutoScroll(false);
            }
            // If user manually scrolls back to bottom, resume auto-scrolling
            else if (!shouldAutoScroll && isAtBottom) {
                setShouldAutoScroll(true);
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]); // Dependency on logs updating

    useEffect(() => {
        if (!socket) return;

        // Join the monitor room to receive updates
        socket.emit('join_monitor');

        const handleStats = (data: any) => {
            setStats(prev => ({ ...prev, ...data }));
        };

        const handleLog = (log: any) => {
            setLogs(prev => {
                const newLogs = [...prev, log];
                if (newLogs.length > 50) newLogs.shift(); // Keep last 50
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

    // Format Uptime
    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MonitorCard
                    title="Active Users (Sockets)"
                    value={stats.activeUsers.toString()}
                    icon={Users}
                    color="blue"
                    change="Real-time Count"
                />
                <MonitorCard
                    title="Server Load (CPU)"
                    value={`${stats.serverLoad}%`}
                    icon={Cpu}
                    color={stats.serverLoad > 80 ? 'red' : 'green'}
                    change="OS Load Average"
                />
                <MonitorCard
                    title="Memory Usage"
                    value={`${stats.memoryUsage}%`}
                    icon={Server}
                    color={stats.memoryUsage > 90 ? 'red' : 'purple'}
                    change={`System RAM`}
                />
                <MonitorCard
                    title="System Uptime"
                    value={formatUptime(stats.uptime)}
                    icon={Clock}
                    color="green"
                    change={stats.systemStatus}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Users List */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-96">
                    <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Users size={18} className="text-blue-500" /> Active Users
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                        {stats.activeUserList?.length === 0 && (
                            <div className="text-gray-500 italic text-sm text-center mt-10">No active users connected.</div>
                        )}
                        {stats.activeUserList?.map((u: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                    {u.name?.charAt(0) || 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{u.name || 'Unknown User'}</p>
                                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                </div>
                                <span className="ml-auto w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Real-time Logs Console */}
                <div className="lg:col-span-2 bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 shadow-sm flex flex-col h-96">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-200 flex items-center gap-2">
                            <Terminal size={18} className="text-green-500" /> System Logs Stream
                        </h2>
                        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={shouldAutoScroll}
                                onChange={(e) => setShouldAutoScroll(e.target.checked)}
                                className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-offset-gray-900"
                            />
                            Auto-scroll
                        </label>
                    </div>
                    <div
                        ref={logsContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto font-mono text-sm space-y-1.5 pr-2 custom-scrollbar"
                    >
                        {logs.length === 0 && (
                            <div className="text-gray-600 italic text-center mt-10">Waiting for logs...</div>
                        )}
                        {logs.map((log) => (
                            <div key={log.id} className="flex gap-3 text-gray-300 border-b border-gray-800/30 pb-1">
                                <span className="text-gray-500 shrink-0 select-none">
                                    [{new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}]
                                </span>
                                <span className={`font-bold shrink-0 ${log.type === 'error' ? 'text-red-400' :
                                    log.type === 'warning' ? 'text-yellow-400' :
                                        log.type === 'success' ? 'text-green-400' : 'text-blue-400'
                                    }`}>
                                    {log.type.toUpperCase()}
                                </span>
                                <span className="text-gray-400 shrink-0">[{log.source}]</span>
                                <span>{log.message}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                    {!shouldAutoScroll && (
                        <button
                            onClick={() => { setShouldAutoScroll(true); logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                            className="absolute bottom-8 right-8 bg-blue-600 text-white px-3 py-1 text-xs rounded-full shadow-lg animate-bounce"
                        >
                            ⬇ New Logs
                        </button>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <ShieldAlert size={18} className="text-orange-500" /> Security Events
                    </h2>
                    <div className="space-y-4">
                        {/* Filter logs for security related items or show recent logs */}
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
