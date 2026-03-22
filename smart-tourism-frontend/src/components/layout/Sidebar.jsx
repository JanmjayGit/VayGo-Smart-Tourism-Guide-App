import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    LayoutDashboard,
    MapPin,
    Calendar,
    Heart,
    Siren,
    Shield,
    Users,
    MessageSquare,
    Bell,
    Settings as SettingsIcon
} from 'lucide-react';

export default function Sidebar() {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const mainNavItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/places', label: 'Places', icon: MapPin },
        { path: '/events', label: 'Events', icon: Calendar },
        { path: '/favorites', label: 'Favorites', icon: Heart },
        { path: '/emergency', label: 'Emergency', icon: Siren },
    ];

    const adminNavItems = [
        { path: '/admin', label: 'Admin Panel', icon: Shield },
        { path: '/admin/places', label: 'Manage Places', icon: MapPin },
        { path: '/admin/events', label: 'Manage Events', icon: Calendar },
        { path: '/admin/reviews', label: 'Moderate Reviews', icon: MessageSquare },
        { path: '/admin/emergency', label: 'Emergency Mgmt', icon: Siren },
        { path: '/admin/notifications', label: 'Notifications', icon: Bell },
        { path: '/admin/users', label: 'Manage Users', icon: Users },
    ];

    const isAdmin = user?.role === 'ROLE_ADMIN' || user?.roles?.includes('ROLE_ADMIN');

    return (
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-white hidden">
            <ScrollArea className="h-full py-6 px-3">
                {/* Main Navigation */}
                <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Navigation
                    </p>
                    {mainNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path)
                                    ? 'bg-teal-50 text-teal-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Admin Section */}
                {isAdmin && (
                    <>
                        <Separator className="my-4" />
                        <div className="space-y-1">
                            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Admin
                            </p>
                            {adminNavItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path)
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Settings */}
                <Separator className="my-4" />
                <div className="space-y-1">
                    <Link
                        to="/settings"
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/settings')
                            ? 'bg-teal-50 text-teal-700'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <SettingsIcon className="h-5 w-5" />
                        Settings
                    </Link>
                </div>
            </ScrollArea>
        </aside>
    );
}
