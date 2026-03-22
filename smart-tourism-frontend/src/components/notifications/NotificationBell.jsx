import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, X, Info, AlertTriangle, Star, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';

const typeIcons = {
    REVIEW: Star,
    EVENT: Calendar,
    PLACE: MapPin,
    ALERT: AlertTriangle,
    INFO: Info,
};

const typeColors = {
    REVIEW: 'text-[#C9A961]',
    EVENT: 'text-[#D4745F]',
    PLACE: 'text-[#8B9D83]',
    ALERT: 'text-[#B85D48]',
    INFO: 'text-[#1A3A52]',
};

export default function NotificationBell() {
    const { isAuthenticated } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    // Recompute dropdown position from bell button's bounding rect
    const updatePos = useCallback(() => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        setDropPos({
            top: rect.bottom + 8,
            right: window.innerWidth - rect.right,
        });
    }, []);

    // Close on outside click; recompute on scroll/resize
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('resize', updatePos);
        window.addEventListener('scroll', updatePos, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', updatePos);
            window.removeEventListener('scroll', updatePos, true);
        };
    }, [updatePos]);

    if (!isAuthenticated) return null;

    const recentNotifications = (notifications || []).slice(0, 8);

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <Button
                ref={buttonRef}
                variant="ghost"
                size="icon"
                className="relative hover:bg-[#E8DFD0] transition-colors"
                onClick={() => { updatePos(); setIsOpen(o => !o); }}
            >
                <Bell className="w-5 h-5 text-[#4A5759]" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#D4745F] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            {/* Dropdown Panel — fixed so it never overlaps sibling content */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="fixed w-80 md:w-96 bg-white rounded-xl shadow-2xl overflow-hidden z-9999"
                    style={{ top: dropPos.top, right: dropPos.right }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white">
                        <h3 className="font-display text-sm font-bold text-gray-900">
                            Notifications
                        </h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="font-accent text-[10px] tracking-wider text-[#D4745F] hover:text-[#B85D48] transition-colors cursor-pointer"
                                >
                                    MARK ALL READ
                                </button>
                            )}
                            <Button
                                variant="ghost" size="icon"
                                className="w-6 h-6"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-4 h-4 text-[#4A5759]" />
                            </Button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto bg-white">
                        {recentNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-10 h-10 text-[#D4C4B0] mx-auto mb-3" />
                                <p className="font-body text-sm text-[#4A5759]">No notifications yet</p>
                            </div>
                        ) : (
                            recentNotifications.map((notif) => {
                                const TypeIcon = typeIcons[notif.type] || Info;
                                const colorClass = typeColors[notif.type] || 'text-[#4A5759]';

                                return (
                                    <div
                                        key={notif.id}
                                        className={`px-4 py-3 border-b border-[#F5F1E8] last:border-0 hover:bg-[#F5F1E8]/50 transition-colors cursor-pointer ${!notif.read ? 'bg-[#F5F1E8]/30' : ''
                                            }`}
                                        onClick={() => !notif.read && markAsRead(notif.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`w-8 h-8 rounded-full bg-[#F5F1E8] flex items-center justify-center shrink-0 ${colorClass}`}>
                                                <TypeIcon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-body text-sm text-[#2C3333] leading-snug ${!notif.read ? 'font-semibold' : ''}`}>
                                                    {notif.message || notif.title}
                                                </p>
                                                <p className="font-body text-xs text-[#4A5759] mt-1">
                                                    {formatTime(notif.createdAt || notif.timestamp)}
                                                </p>
                                            </div>
                                            {!notif.read && (
                                                <div className="w-2 h-2 rounded-full bg-[#D4745F] mt-2 shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {recentNotifications.length > 0 && (
                        <div className="px-4 py-3 bg-[#F5F1E8] border-t border-[#E8DFD0] text-center">
                            <a
                                href="/notifications"
                                className="font-accent text-xs tracking-wider text-[#D4745F] hover:text-[#B85D48] transition-colors"
                            >
                                VIEW ALL NOTIFICATIONS
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
