import { Link } from 'react-router-dom';
import { MapPin, Github, Twitter, Instagram } from 'lucide-react';

const NAV_LINKS = [
    { label: 'Places', href: '/places' },
    { label: 'Events', href: '/events' },
    { label: 'Hotels', href: '/hotels' },
    { label: 'Map', href: '/map' },
    { label: 'Favorites', href: '/favorites' },
    { label: 'Emergency', href: '/emergency' },
    { label: 'Weather', href: '/weather' },
];

const SUPPORT_LINKS = [
    { label: 'Submit a Place', href: '/places/submit' },
    { label: 'Add an Event', href: '/events/submit' },
    { label: 'Request Hotel Listing', href: '/hotels/request' },
    { label: 'Settings', href: '/settings' },
];

export default function LandingFooter() {
    return (
        <footer className="bg-[#0a1f2c] text-white">
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-black" style={{ fontFamily: "'Inter Tight', sans-serif" }}>VayGo</span>
                        </div>
                        <p className="text-white/50 text-sm leading-relaxed mb-5">
                            Your smart tourism companion for discovering places, events, and hotels across India.
                        </p>
                        {/* Social links */}
                        <div className="flex items-center gap-3">
                            {[
                                { Icon: Github, href: '#' },
                                { Icon: Twitter, href: '#' },
                                { Icon: Instagram, href: '#' },
                            ].map(({ Icon, href }) => (
                                <a
                                    key={href}
                                    href={href}
                                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <Icon className="w-4 h-4 text-white/70" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Explore</h3>
                        <ul className="space-y-2.5">
                            {NAV_LINKS.map(({ label, href }) => (
                                <li key={href}>
                                    <Link
                                        to={href}
                                        className="text-white/50 hover:text-teal-400 text-sm transition-colors"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Community</h3>
                        <ul className="space-y-2.5">
                            {SUPPORT_LINKS.map(({ label, href }) => (
                                <li key={href}>
                                    <Link
                                        to={href}
                                        className="text-white/50 hover:text-teal-400 text-sm transition-colors"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Account</h3>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'Login', href: '/login' },
                                { label: 'Register', href: '/register' },
                                { label: 'Profile', href: '/profile' },
                                { label: 'Dashboard', href: '/dashboard' },
                                { label: 'My Bookings', href: '/my-bookings' },
                            ].map(({ label, href }) => (
                                <li key={href}>
                                    <Link
                                        to={href}
                                        className="text-white/50 hover:text-teal-400 text-sm transition-colors"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs">
                    <p>© 2026 VayGo · Smart Tourism Guide App · All rights reserved.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
