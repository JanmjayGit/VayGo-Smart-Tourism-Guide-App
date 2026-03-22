import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Bell, Check, CheckCheck, Trash2, Info, AlertTriangle,
    Star, Calendar, MapPin, Filter
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import { toast } from 'sonner';

const typeIcons = {
    REVIEW: Star,
    EVENT: Calendar,
    PLACE: MapPin,
    ALERT: AlertTriangle,
    INFO: Info,
};

const typeColors = {
    REVIEW: { bg: 'bg-[#C9A961]/10', text: 'text-[#C9A961]', border: 'border-[#C9A961]/30' },
    EVENT: { bg: 'bg-[#D4745F]/10', text: 'text-[#D4745F]', border: 'border-[#D4745F]/30' },
    PLACE: { bg: 'bg-[#8B9D83]/10', text: 'text-[#8B9D83]', border: 'border-[#8B9D83]/30' },
    ALERT: { bg: 'bg-[#B85D48]/10', text: 'text-[#B85D48]', border: 'border-[#B85D48]/30' },
    INFO: { bg: 'bg-[#1A3A52]/10', text: 'text-[#1A3A52]', border: 'border-[#1A3A52]/30' },
};

export default function NotificationsPage() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch } = useNotifications();
    const [filter, setFilter] = useState('ALL');
    const [deleting, setDeleting] = useState(null);

    const filteredNotifications = filter === 'ALL'
        ? notifications
        : filter === 'UNREAD'
            ? notifications.filter(n => !n.read)
            : notifications.filter(n => n.type === filter);

    const handleDelete = async (id) => {
        try {
            setDeleting(id);
            const token = localStorage.getItem('token');
            await axios.delete(apiEndpoints.DELETE_NOTIFICATION(id), {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Notification deleted');
            refetch();
        } catch (err) {
            toast.error('Failed to delete notification');
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[#F5F1E8]">
            {/* Hero */}
            <section className="relative py-16 px-6 overflow-hidden">
                <div className="absolute inset-0 gradient-hero opacity-95" />
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <span className="font-accent text-sm tracking-[0.3em] text-white/70 mb-4 block">
                        STAY UPDATED
                    </span>
                    <h1 className="font-display text-5xl md:text-6xl font-black text-white mb-4">
                        Notifications
                    </h1>
                    <p className="font-body text-lg text-white/80">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                            : 'You\'re all caught up!'
                        }
                    </p>
                </div>
            </section>

            <div className="max-w-3xl mx-auto px-6 -mt-6 relative z-10 pb-12">
                {/* Actions Bar */}
                <Card className="border-0 shadow-organic-lg mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                                <Filter className="w-4 h-4 text-[#4A5759] shrink-0" />
                                {['ALL', 'UNREAD', 'EVENT', 'REVIEW', 'ALERT'].map((f) => (
                                    <Badge
                                        key={f}
                                        variant={filter === f ? 'default' : 'outline'}
                                        className={`cursor-pointer whitespace-nowrap font-accent text-[10px] tracking-wider px-3 py-1.5 transition-all ${filter === f
                                                ? 'bg-[#D4745F] text-white border-[#D4745F]'
                                                : 'bg-white text-[#4A5759] border-[#D4C4B0] hover:border-[#D4745F]'
                                            }`}
                                        onClick={() => setFilter(f)}
                                    >
                                        {f}
                                    </Badge>
                                ))}
                            </div>
                            {unreadCount > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="font-accent text-xs tracking-wider border-[#D4745F] text-[#D4745F] hover:bg-[#D4745F] hover:text-white shrink-0"
                                >
                                    <CheckCheck className="w-4 h-4 mr-1" />
                                    MARK ALL READ
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} className="h-20 rounded-xl" />
                        ))}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <Card className="border-0 shadow-organic">
                        <CardContent className="p-12 text-center">
                            <Bell className="w-16 h-16 text-[#D4C4B0] mx-auto mb-4" />
                            <h3 className="font-display text-xl text-[#2C3333] mb-2">No notifications</h3>
                            <p className="font-body text-sm text-[#4A5759]">
                                {filter === 'UNREAD' ? 'All notifications have been read!' : 'No notifications to display.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notif, index) => {
                            const TypeIcon = typeIcons[notif.type] || Info;
                            const colors = typeColors[notif.type] || typeColors.INFO;

                            return (
                                <Card
                                    key={notif.id || index}
                                    className={`border-0 shadow-organic hover:shadow-organic-lg transition-all duration-500 animate-fade-in-up ${!notif.read ? 'ring-1 ring-[#D4745F]/20' : ''
                                        }`}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center shrink-0`}>
                                                <TypeIcon className={`w-5 h-5 ${colors.text}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`font-body text-sm text-[#2C3333] leading-relaxed ${!notif.read ? 'font-semibold' : ''}`}>
                                                        {notif.message || notif.title}
                                                    </p>
                                                    {!notif.read && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#D4745F] mt-1.5 shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="font-body text-xs text-[#4A5759]">
                                                        {formatDate(notif.createdAt || notif.timestamp)}
                                                    </span>
                                                    {notif.type && (
                                                        <Badge variant="outline" className={`text-[9px] font-accent tracking-wider ${colors.border} ${colors.text}`}>
                                                            {notif.type}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {!notif.read && (
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="w-8 h-8 hover:bg-[#8B9D83]/10"
                                                        onClick={() => markAsRead(notif.id)}
                                                    >
                                                        <Check className="w-4 h-4 text-[#8B9D83]" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="w-8 h-8 hover:bg-[#B85D48]/10"
                                                    onClick={() => handleDelete(notif.id)}
                                                    disabled={deleting === notif.id}
                                                >
                                                    <Trash2 className="w-4 h-4 text-[#B85D48]" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
