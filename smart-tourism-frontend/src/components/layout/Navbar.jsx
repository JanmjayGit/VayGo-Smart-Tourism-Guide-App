import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
    MapPin,
    Calendar,
    Siren,
    Bell,
    User,
    LogOut,
    Settings,
    ChevronDown,
    Menu,
    X,
    Heart,
    CloudRain
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { unreadCount } = useNotifications();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/places', label: 'Places', icon: MapPin },
        { path: '/events', label: 'Events', icon: Calendar },
        { path: '/favorites', label: 'Favorites', icon: Heart },
        { path: '/emergency', label: 'Emergency', icon: Siren },
        { path: '/weather-alerts', label: 'Weather Alerts', icon: CloudRain },
    ];

    return (
        <header className="sticky top-0 z-50 bg-gray-50 border-b shadow-sm">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="flex items-center space-x-2">
                            <h1 className="text-2xl font-bold text-teal-600">
                                TravelBuddy
                            </h1>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.path)
                                            ? 'bg-teal-50 text-teal-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {/* Notification Bell */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative hidden sm:flex"
                                    onClick={() => navigate('/notifications')}
                                >
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <Badge
                                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                            variant="destructive"
                                        >
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </Button>

                                {/* User Dropdown Menu - Desktop */}
                                <div className="hidden md:block">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="flex items-center space-x-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-teal-100 text-teal-700">
                                                        {getInitials(user.username)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="hidden lg:block text-left">
                                                    <p className="text-sm font-medium">{user.username}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                                <ChevronDown className="h-4 w-4 text-gray-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel>
                                                <div>
                                                    <p className="font-medium">{user.username}</p>
                                                    <p className="text-xs text-gray-500 font-normal">{user.email}</p>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                                                <User className="mr-2 h-4 w-4" />
                                                Dashboard
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate('/profile')}>
                                                <User className="mr-2 h-4 w-4" />
                                                Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate('/settings')}>
                                                <Settings className="mr-2 h-4 w-4" />
                                                Settings
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Logout
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Mobile Menu Button */}
                                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" className="md:hidden">
                                            <Menu className="h-6 w-6" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-80">
                                        <div className="flex flex-col h-full">
                                            {/* User Info */}
                                            <div className="flex items-center space-x-3 pb-4 border-b">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarFallback className="bg-teal-100 text-teal-700">
                                                        {getInitials(user.username)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.username}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>

                                            {/* Mobile Navigation Links */}
                                            <nav className="flex-1 py-4 space-y-1">
                                                {navLinks.map((link) => {
                                                    const Icon = link.icon;
                                                    return (
                                                        <Link
                                                            key={link.path}
                                                            to={link.path}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${isActive(link.path)
                                                                ? 'bg-teal-50 text-teal-700'
                                                                : 'text-gray-700 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            <Icon className="h-5 w-5" />
                                                            {link.label}
                                                        </Link>
                                                    );
                                                })}
                                            </nav>

                                            {/* Mobile Menu Actions */}
                                            <div className="border-t pt-4 space-y-2">
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start"
                                                    onClick={() => {
                                                        navigate('/dashboard');
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                >
                                                    <User className="mr-2 h-4 w-4" />
                                                    Dashboard
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start"
                                                    onClick={() => {
                                                        navigate('/profile');
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                >
                                                    <User className="mr-2 h-4 w-4" />
                                                    Profile
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start"
                                                    onClick={() => {
                                                        navigate('/settings');
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                >
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    Settings
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => {
                                                        handleLogout();
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                >
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    Logout
                                                </Button>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:flex">
                                    Login
                                </Button>
                                <Button onClick={() => navigate('/register')}>
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
