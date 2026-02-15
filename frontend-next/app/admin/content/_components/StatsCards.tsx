import React from 'react';
import { Layers, CheckCircle, XCircle, Smartphone, Monitor } from 'lucide-react';

interface StatsProps {
    stats: {
        banners: { total: number; active: number; disabled: number };
        icons: { total: number; active: number; disabled: number };
        categories: { total: number; withBanner: number };
    } | null;
    loading: boolean;
}

export const StatsCards: React.FC<StatsProps> = ({ stats, loading }) => {
    if (loading || !stats) {
        return <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>)}
        </div>;
    }

    const cards = [
        {
            label: "Total Banners",
            value: stats.banners.total,
            sub: `${stats.banners.active} Active`,
            icon: <Layers className="text-blue-500" />,
            color: "bg-blue-50 border-blue-100"
        },
        {
            label: "Active Content",
            value: stats.banners.active + stats.icons.active,
            sub: `${stats.banners.disabled + stats.icons.disabled} Disabled`,
            icon: <CheckCircle className="text-green-500" />,
            color: "bg-green-50 border-green-100"
        },
        {
            label: "Category Banners",
            value: stats.categories.withBanner,
            sub: `of ${stats.categories.total} Categories`,
            icon: <Monitor className="text-purple-500" />,
            color: "bg-purple-50 border-purple-100"
        },
        {
            label: "Category Icons",
            value: stats.icons.total,
            sub: "Homepage Shortcuts",
            icon: <Smartphone className="text-orange-500" />,
            color: "bg-orange-50 border-orange-100"
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${card.color} flex items-center justify-between shadow-sm`}>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{card.label}</p>
                        <h3 className="text-2xl font-extrabold text-gray-800">{card.value}</h3>
                        <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        {card.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};
