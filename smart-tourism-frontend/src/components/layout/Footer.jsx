import { Link } from 'react-router-dom';
import { MapPin, Globe, Mail, Phone, Twitter, Instagram, Facebook } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
    return (
        <footer className="bg-[#0f2d3d] text-white">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div>
                        <h2 className="text-2xl font-bold mb-3" >
                            Vay<span className="text-teal-400">Go</span>
                        </h2>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Discover amazing destinations, plan unforgettable trips, and explore the world with confidence.
                        </p>
                        <div className="flex items-center gap-3 mt-5">
                            <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-teal-500 flex items-center justify-center transition-colors">
                                <FontAwesomeIcon icon={faXTwitter} className='w-4 h-4' />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-teal-500 flex items-center justify-center transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-teal-500 flex items-center justify-center transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-widest text-teal-400 mb-4">Explore</h3>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'Places', path: '/places' },
                                { label: 'Events', path: '/events' },
                                { label: 'Hotels', path: '/hotels' },
                                { label: 'Favorites', path: '/favorites' },
                                { label: 'Map', path: '/map' },
                                { label: 'Weather', path: '/weather' },
                            ].map(link => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-white/60 hover:text-white text-sm transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Safety */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-widest text-teal-400 mb-4">Safety</h3>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'Emergency Services', path: '/emergency' },
                                { label: 'Travel Alerts', path: '/weather' },
                                { label: 'Safe Travel Tips', path: '#' },
                                { label: 'Contact Authorities', path: '#' },
                            ].map(link => (
                                <li key={link.label}>
                                    <Link to={link.path} className="text-white/60 hover:text-white text-sm transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-widest text-teal-400 mb-4">Contact</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-white/60 text-sm">
                                <MapPin className="w-4 h-4 text-teal-400 shrink-0" /> Punjab, India
                            </li>
                            <li className="flex items-center gap-3 text-white/60 text-sm">
                                <Mail className="w-4 h-4 text-teal-400 shrink-0" /> support@vaygo.in
                            </li>
                            <li className="flex items-center gap-3 text-white/60 text-sm">
                                <Phone className="w-4 h-4 text-teal-400 shrink-0" /> +91 98765 43210
                            </li>
                            <li className="flex items-center gap-3 text-white/60 text-sm">
                                <Globe className="w-4 h-4 text-teal-400 shrink-0" /> www.vaygo.in
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-white/40 text-md">© {new Date().getFullYear()} VayGo. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-white/40 hover:text-white/70 text-md transition-colors">Privacy Policy</a>
                        <a href="#" className="text-white/40 hover:text-white/70 text-md transition-colors">Terms of Use</a>
                        <a href="#" className="text-white/40 hover:text-white/70 text-md transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
