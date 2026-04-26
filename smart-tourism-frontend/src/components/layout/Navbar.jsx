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
import { User, LogOut, Settings, ChevronDown, Menu, MapPin, CalendarPlus, Hotel } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import logo from '../../assets/icon.svg'

const NAV_LINKS = [
    { path: '/places', label: 'Places' },
    { path: '/events', label: 'Events' },
    { path: '/hotels', label: 'Hotels' },
    { path: '/favorites', label: 'Favorites' },
    // { path: '/emergency', label: 'Emergency' },
    { path: '/weather', label: 'Weather' },
    { path: '/map', label: 'Map' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';
    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center h-16">

                    {/* Logo — left */}
                    <div className="shrink-0 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg  flex items-center justify-center">
                            {/* <MapPin className="w-4 h-4 text-white" /> */}
                            <img src={logo} alt="logo" className='w-full h-full' />
                        </div>
                        <Link
                            to={user ? '/dashboard' : '/'}
                            className="text-2xl font-black text-teal-600"
                            style={{ fontFamily: "'Inter Tight', sans-serif" }}
                        >
                            VayGo
                        </Link>
                    </div>

                    {/* Nav */}
                    <nav className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
                        {NAV_LINKS.map(({ path, label }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(path)
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: auth controls */}
                    <div className="ml-auto flex items-center gap-2">
                        {user ? (
                            <>
                                {/* Notification Bell */}
                                <div className="hidden sm:block">
                                    <NotificationBell />
                                </div>

                                {/* User dropdown — desktop */}
                                <div className="hidden md:block">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 px-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-teal-100 text-teal-800 text-xs">
                                                        {getInitials(user.username)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="hidden lg:block text-sm font-medium text-gray-700">{user.username}</span>
                                                <ChevronDown className="h-4 w-4 text-gray-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel>
                                                <p className="font-medium">{user.username}</p>
                                                <p className="text-xs text-gray-500 font-normal">{user.email}</p>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => navigate('/dashboard')}>Dashboard</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate('/my-bookings')}>My Bookings</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
                                            {/* <DropdownMenuSeparator /> */}
                                            <DropdownMenuItem onClick={() => navigate('/places/submit')}>Add Place</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate('/events/submit')}>Add Event</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate('/hotels/request')}>Add Hotel</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                                <LogOut className="mr-2 h-4 w-4" /> Logout
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Mobile hamburger */}
                                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" className="md:hidden">
                                            <Menu className="h-5 w-5" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-80">
                                        <div className="flex flex-col h-full">
                                            <div className="flex items-center gap-3 pb-4 border-b">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-teal-100 text-teal-700">
                                                        {getInitials(user.username)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-sm">{user.username}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <nav className="flex-1 py-4 space-y-1">
                                                {NAV_LINKS.map(({ path, label }) => (
                                                    <Link
                                                        key={path}
                                                        to={path}
                                                        onClick={() => setMobileOpen(false)}
                                                        className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(path)
                                                            ? 'bg-teal-50 text-teal-700'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {label}
                                                    </Link>
                                                ))}
                                            </nav>
                                            <div className="border-t pt-4">
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                                                >
                                                    <LogOut className="mr-2 h-4 w-4" /> Logout
                                                </Button>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="default"
                                    onClick={() => navigate('/login')}
                                    className="hidden sm:flex text-sm font-medium text-white bg-gray-800 hover:bg-gray-700"
                                >
                                    Sign In
                                </Button>
                                <Button
                                    onClick={() => navigate('/register')}
                                    className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold px-4 rounded-md shadow"
                                >
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
