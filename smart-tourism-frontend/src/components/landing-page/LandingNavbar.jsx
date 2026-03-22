import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const NAV_LINKS = [
    { label: 'Places', href: '/places' },
    { label: 'Events', href: '/events' },
    { label: 'Hotels', href: '/hotels' },
    { label: "Weather", href: "/weather" },
    { label: 'Map', href: '/map' },
];

export default function LandingNavbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <span
                            className={`text-xl font-black transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}
                            style={{ fontFamily: "'Inter Tight', sans-serif" }}
                        >
                            VayGo
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ label, href }) => (
                            <Link
                                key={href}
                                to={href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${scrolled
                                    ? 'text-gray-700 hover:bg-gray-100'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className={`hidden md:flex items-center gap-2 text-sm font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/80 hover:text-white'
                                        }`}
                                >
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback className="bg-teal-100 text-teal-800 text-xs">
                                            {getInitials(user.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {user.username}
                                </button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                    className={`hidden md:flex text-xs ${scrolled ? 'text-gray-500 hover:text-gray-700' : 'text-white/60 hover:text-white'}`}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/login')}
                                    className={`hidden sm:flex text-sm font-medium transition-colors ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/80 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => navigate('/register')}
                                    className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold px-4 rounded-full shadow-lg"
                                >
                                    Sign Up
                                </Button>
                            </>
                        )}

                        {/* Mobile toggle */}
                        <button
                            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                                }`}
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white/98 backdrop-blur-md border-b border-gray-100 px-4 py-4 space-y-1">
                    {NAV_LINKS.map(({ label, href }) => (
                        <Link
                            key={href}
                            to={href}
                            onClick={() => setMobileOpen(false)}
                            className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        >
                            {label}
                        </Link>
                    ))}
                    <div className="pt-3 border-t border-gray-100 flex gap-2">
                        {user ? (
                            <>
                                <Button className="flex-1 bg-teal-600 text-white text-sm" onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}>Dashboard</Button>
                                <Button variant="outline" className="flex-1 text-sm" onClick={() => { handleLogout(); setMobileOpen(false); }}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" className="flex-1 text-sm" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Sign In</Button>
                                <Button className="flex-1 bg-teal-600 text-white text-sm" onClick={() => { navigate('/register'); setMobileOpen(false); }}>Sign Up</Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
