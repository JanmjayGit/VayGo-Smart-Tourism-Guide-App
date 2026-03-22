import { MapPin, Hotel, CalendarDays, Navigation, Siren, CloudSun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
    {
        icon: MapPin,
        title: 'Discover Places',
        desc: 'Explore top attractions, hidden gems, beaches, mountains, and cultural landmarks near you.',
        href: '/places',
        color: 'bg-teal-50 text-teal-600',
        border: 'border-teal-100',
    },
    {
        icon: Hotel,
        title: 'Find Hotels',
        desc: 'Browse verified hotels, resorts, and unique stays with real-time availability and pricing.',
        href: '/hotels',
        color: 'bg-indigo-50 text-indigo-600',
        border: 'border-indigo-100',
    },
    {
        icon: CalendarDays,
        title: 'Explore Events',
        desc: 'Discover festivals, concerts, cultural events, and local activities happening around you.',
        href: '/events',
        color: 'bg-amber-50 text-amber-600',
        border: 'border-amber-100',
    },
    {
        icon: Navigation,
        title: 'Real-time Navigation',
        desc: 'Get turn-by-turn directions and live maps to any destination directly from the app.',
        href: '/map',
        color: 'bg-emerald-50 text-emerald-600',
        border: 'border-emerald-100',
    },
    {
        icon: Siren,
        title: 'Emergency Services',
        desc: 'Instantly locate nearby hospitals, police stations, fire services, and emergency contacts.',
        href: '/emergency',
        color: 'bg-red-50 text-red-600',
        border: 'border-red-100',
    },
    {
        icon: CloudSun,
        title: 'Weather Alerts',
        desc: 'Get real-time weather forecasts, UV index, air quality reports for your travel destinations.',
        href: '/weather',
        color: 'bg-sky-50 text-sky-600',
        border: 'border-sky-100',
    },
];

export default function FeaturesSection() {
    const navigate = useNavigate();

    return (
        <section className="py-20 px-4 bg-white/90">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-14">
                    <p className="text-teal-600 text-xs font-bold tracking-[0.3em] uppercase mb-3">Everything You Need</p>
                    <h2
                        className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight"
                        style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                        Your Complete
                        <br />
                        <span className="text-teal-500">Travel Companion</span>
                    </h2>
                    <p className="text-gray-500 mt-4 max-w-xl mx-auto text-base">
                        From discovering hidden gems to navigating cities — VayGo has everything to make your journey seamless.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURES.map(({ icon: Icon, title, desc, href, color, border }) => (
                        <button
                            key={title}
                            onClick={() => navigate(href)}
                            className={`group text-left p-6 rounded-2xl border ${border} hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white`}
                        >
                            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-base mb-1.5">{title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
