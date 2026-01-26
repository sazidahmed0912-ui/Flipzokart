import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../services/api';

// Fix for default Leaflet marker icons in React
import iconMarker2x from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconMarker2x,
    iconUrl: iconMarker,
    shadowUrl: iconShadow,
});

interface UserLocation {
    id: string;
    name: string;
    role: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
    joined: string;
    status?: string;
}

const AdminUserMap: React.FC = () => {
    const [users, setUsers] = useState<UserLocation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const { data } = await API.get('/api/user/locations');
                if (data.success) {
                    // Map backend data to UI
                    const mapped = data.users.map((u: any) => ({
                        ...u,
                        status: u.status || 'Active'
                    }));
                    setUsers(mapped);
                }
            } catch (error) {
                console.error("Failed to load map data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    if (loading) {
        return <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">User Distribution</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {users.length} Users Mapped
                </span>
            </div>

            <div className="h-[400px] w-full relative z-0">
                <MapContainer
                    center={[20.5937, 78.9629]} // India Center
                    zoom={5}
                    scrollWheelZoom={false} // Prevent scroll hijacking
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {users.map((user) => (
                        <Marker
                            key={user.id}
                            position={[user.lat, user.lng]}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <strong className="block text-gray-800 text-base mb-1">{user.name}</strong>
                                    <div className="text-gray-600 mb-1">
                                        {user.city}, {user.state}
                                    </div>
                                    <div className="text-xs text-blue-600 font-medium">
                                        Role: {user.role.toUpperCase()} • Status: {user.status || 'Active'}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Joined: {new Date(user.joined).toLocaleDateString()}
                                    </div>
                                </div>
                            </Popup>
                            <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                                {user.name} ({user.city})
                            </Tooltip>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default AdminUserMap;
