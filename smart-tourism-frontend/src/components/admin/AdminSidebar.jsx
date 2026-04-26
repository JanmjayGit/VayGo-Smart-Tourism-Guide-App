import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard, MapPin, Calendar, MessageSquare,
    Siren, Bell, Users, ChevronLeft, Shield, LogOut, ExternalLink, Hotel, PlusCircle
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const NAV_SECTIONS = [
    {
        label: 'Overview',
        items: [
            { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        ]
    },
    {
        label: 'Content',
        items: [
            { path: '/admin/places', label: 'Places', icon: MapPin },
            { path: '/admin/events', label: 'Events', icon: Calendar },
            { path: '/admin/reviews', label: 'Reviews', icon: MessageSquare, badge: 'Mod' },
            { path: '/admin/event-requests', label: 'Event Requests', icon: Calendar, badge: 'New' },
            { path: '/admin/place-requests', label: 'Place Requests', icon: MapPin, badge: 'New' },
            { path: '/admin/hotels', label: 'All Hotels', icon: Hotel },
            // { path: '/admin/hotel-requests', label: 'Hotel Requests', icon: Hotel, badge: 'New' },
            { path: '/admin/add-hotel', label: 'Add Hotel', icon: PlusCircle },
        ]
    },
    {
        label: 'Operations',
        items: [
            { path: '/admin/emergency', label: 'Emergency', icon: Siren },
            { path: '/admin/notifications', label: 'Notifications', icon: Bell },
            { path: '/admin/users', label: 'Users', icon: Users },
        ]
    },
];

export default function AdminSidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (item) =>
        item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

    const initials = user?.username?.slice(0, 2)?.toUpperCase() || 'AD';

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-40 ${collapsed ? 'w-[68px]' : 'w-[240px]'
                }`}
        >
            {/* Branding strip */}
            <div className={`flex items-center h-16 px-4 border-b border-slate-100 shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Shield className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                            <p className="text-[13px] font-bold text-slate-800 leading-none">Admin Panel</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">VayGo</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                    <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-5">
                {NAV_SECTIONS.map((section) => (
                    <div key={section.label}>
                        {!collapsed && (
                            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                {section.label}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        title={collapsed ? item.label : undefined}
                                        className={`flex items-center gap-3 rounded-lg transition-all duration-150 group
                                            ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}
                                            ${active
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                        {!collapsed && (
                                            <span className={`text-[13.5px] font-medium flex-1 ${active ? 'text-indigo-700' : ''}`}>
                                                {item.label}
                                            </span>
                                        )}
                                        {!collapsed && item.badge && (
                                            <Badge className="text-[9px] h-4 px-1.5 bg-amber-100 text-amber-700 hover:bg-amber-100 font-semibold">
                                                {item.badge}
                                            </Badge>
                                        )}
                                        {active && !collapsed && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-100 shrink-0">
                {/* View Site — takes admin back to user-facing dashboard */}
                <Link
                    to="/dashboard"
                    title="Go to user site"
                    className={`flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors border-b border-slate-100 ${collapsed ? 'justify-center' : ''}`}
                >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="text-[13px] font-medium">View Site</span>}
                </Link>

                {/* User info + logout */}
                <div className={`flex items-center gap-2.5 px-3 py-3 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-indigo-700">{initials}</span>
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-800 truncate">{user?.username}</p>
                            <p className="text-[11px] text-slate-400 truncate">Administrator</p>
                        </div>
                    )}
                    {!collapsed && (
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                            title="Logout"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}
