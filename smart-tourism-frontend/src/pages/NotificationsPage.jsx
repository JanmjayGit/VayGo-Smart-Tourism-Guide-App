import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Bell, Check, CheckCheck, Trash2, Info, AlertTriangle,
    Star, Calendar, MapPin, Filter, Cloud, Zap
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import { toast } from 'sonner';


const TYPE_CONFIG = {
    EVENT_ALERT: {
        icon: Calendar,
        bg: 'bg-[#D4745F]/10',
        text: 'text-[#D4745F]',
        border: 'border-[#D4745F]/30',
        label: 'Event',
    },
    WEATHER_ALERT: {
        icon: Cloud,
        bg: 'bg-[#1A3A52]/10',
        text: 'text-[#1A3A52]',
        border: 'border-[#1A3A52]/30',
        label: 'Weather',
    },
    EMERGENCY_ALERT: {
        icon: AlertTriangle,
        bg: 'bg-[#B85D48]/10',
        text: 'text-[#B85D48]',
        border: 'border-[#B85D48]/30',
        label: 'Emergency',
    },
    RECOMMENDATION: {
        icon: Zap,
        bg: 'bg-[#8B9D83]/10',
        text: 'text-[#8B9D83]',
        border: 'border-[#8B9D83]/30',
        label: 'Recommendation',
    },
};

// Fallback for unknown types
const DEFAULT_CONFIG = {
    icon: Info,
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    border: 'border-gray-200',
    label: 'Info',
};

const FILTER_TABS = ['ALL', 'UNREAD', 'EVENT_ALERT', 'WEATHER_ALERT', 'EMERGENCY_ALERT', 'RECOMMENDATION'];
const FILTER_LABELS = {
    ALL: 'All',
    UNREAD: 'Unread',
    EVENT_ALERT: 'Events',
    WEATHER_ALERT: 'Weather',
    EMERGENCY_ALERT: 'Emergency',
    RECOMMENDATION: 'Tips',
};

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Only showing UPDATED parts — keep your imports same

export default function NotificationsPage() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch } = useNotifications();
    const [filter, setFilter] = useState('ALL');
    const [deleting, setDeleting] = useState(null);

    const filteredNotifications = (() => {
        if (filter === 'ALL') return notifications;
        if (filter === 'UNREAD') return notifications.filter(n => !n.read && !n.isRead);
        return notifications.filter(n => n.type === filter);
    })();

    return (
        <div className="min-h-screen bg-[#F8F6F2]">

            {/* 🔥 PREMIUM HEADER */}
            <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-[#E5DED3]">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">

                    <div>
                        <h1 className="text-xl font-semibold text-[#2C3333]">Notifications</h1>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                            {unreadCount > 0
                                ? `${unreadCount} unread`
                                : 'All caught up'}
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            size="sm"
                            onClick={markAllAsRead}
                            className="bg-[#2C3333] text-white hover:bg-black text-xs"
                        >
                            <CheckCheck className="w-4 h-4 mr-1" />
                            Mark all
                        </Button>
                    )}
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-6">

                {/* 🔥 FILTER BAR */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide">
                    {FILTER_TABS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`
                                px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                                ${filter === f
                                    ? 'bg-[#2C3333] text-white shadow'
                                    : 'bg-white border border-[#E5DED3] text-[#4A5759] hover:border-[#2C3333]'
                                }
                            `}
                        >
                            {FILTER_LABELS[f]}
                        </button>
                    ))}
                </div>

                {/* 🔥 LIST */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-20">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">
                            {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">

                        {filteredNotifications.map((notif) => {
                            const cfg = TYPE_CONFIG[notif.type] ?? DEFAULT_CONFIG;
                            const Icon = cfg.icon;
                            const isRead = notif.read || notif.isRead;
                            const sentAt = notif.sentAt || notif.createdAt;

                            return (
                                <div
                                    key={notif.id}
                                    className={`
                                        group flex items-start gap-4 p-4 rounded-xl transition-all
                                        border
                                        ${isRead
                                            ? 'bg-white border-[#E5DED3]'
                                            : 'bg-[#FFF7F5] border-[#F2CFC6]'
                                        }
                                        hover:shadow-md
                                    `}
                                >

                                    {/* ICON */}
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                        ${cfg.bg}
                                    `}>
                                        <Icon className={`w-5 h-5 ${cfg.text}`} />
                                    </div>

                                    {/* CONTENT */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">

                                            <div>
                                                <p className={`
                                                    text-sm leading-relaxed
                                                    ${isRead ? 'text-[#4A5759]' : 'text-[#2C3333] font-semibold'}
                                                `}>
                                                    {notif.title || notif.message}
                                                </p>

                                                {notif.message !== notif.title && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {notif.message}
                                                    </p>
                                                )}
                                            </div>

                                            {!isRead && (
                                                <div className="w-2 h-2 rounded-full bg-[#D4745F] mt-2" />
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                            <span>{formatDate(sentAt)}</span>
                                            <span>•</span>
                                            <span>{cfg.label}</span>
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">

                                        {!isRead && (
                                            <button
                                                onClick={() => markAsRead(notif.id)}
                                                className="p-2 rounded-lg hover:bg-green-50"
                                            >
                                                <Check className="w-4 h-4 text-green-600" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDelete(notif.id)}
                                            disabled={deleting === notif.id}
                                            className="p-2 rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}