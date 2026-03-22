import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    MapPin, CalendarDays, Hotel, Heart, Star,
    LogIn, UserPlus, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const GUEST_ACTIONS = [
    { href: '/login', label: 'Sign In', icon: LogIn, variant: 'outline', className: 'border-gray-300 text-gray-800 hover:bg-gray-50' },
    { href: '/register', label: 'Create Account', icon: UserPlus, variant: 'default', className: 'bg-teal-600 hover:bg-teal-700 text-white' },
];

const USER_ACTIONS = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/places/submit', label: 'Add Place', icon: MapPin },
    { href: '/events/submit', label: 'Add Event', icon: CalendarDays },
    { href: '/hotels/request', label: 'Add Hotel', icon: Hotel },
    { href: '/favorites', label: 'Favorites', icon: Heart },
];

export default function CTASection() {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (user) {
        return (
            <section className="py-20 px-4 bg-gray-50">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-teal-600 text-xs font-bold tracking-[0.3em] uppercase mb-3">Welcome Back</p>
                    <h2
                        className="text-4xl sm:text-5xl font-black text-gray-900 mb-3"
                        style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                        Hello, {user.username} 👋
                    </h2>
                    <p className="text-gray-500 mb-10 text-base">Jump back to exploring or contribute to the community.</p>

                    {/* Quick Actions Grid */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {USER_ACTIONS.map(({ href, label, icon: Icon }) => (
                            <button
                                key={href}
                                onClick={() => navigate(href)}
                                className="flex items-center gap-2 bg-white border border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-700 hover:text-teal-700 text-sm font-medium px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 px-4 bg-white relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-teal-50 opacity-60 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-indigo-50 opacity-60 blur-3xl" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto text-center">
                {/* Floating icons */}
                <div className="flex justify-center gap-4 mb-8">
                    {[MapPin, CalendarDays, Hotel, Heart, Star].map((Icon, i) => (
                        <div
                            key={i}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md border border-gray-100 bg-white"
                            style={{ transform: `translateY(${i % 2 === 0 ? '-6px' : '6px'})` }}
                        >
                            <Icon className="w-5 h-5 text-teal-500" />
                        </div>
                    ))}
                </div>

                <h2
                    className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight"
                    style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                    Start Your Journey
                    <br />
                    <span className="text-teal-500">with VayGo</span>
                </h2>
                <p className="text-gray-500 mb-10 text-base max-w-lg mx-auto">
                    Join thousands of travellers discovering places, attending events, and booking hotels with VayGo.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/login')}
                        className="border-gray-300 bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 rounded-xl text-sm font-semibold h-auto"
                    >
                        <LogIn className="w-4 h-4 mr-2" /> Sign In
                    </Button>
                    <Button
                        onClick={() => navigate('/register')}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl text-sm font-semibold h-auto shadow-lg shadow-teal-100"
                    >
                        <UserPlus className="w-4 h-4 mr-2" /> Create Free Account
                    </Button>
                </div>

                <p className="text-gray-400 text-xs mt-5">No credit card required · Free forever for basic use</p>
            </div>
        </section>
    );
}
