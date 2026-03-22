import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
    'All', 'ATTRACTION', 'HISTORICAL', 'RELIGIOUS', 'PARK', 'BEACH',
    'MOUNTAIN', 'TREK', 'MUSEUM', 'RESTAURANT', 'CAFE',
];

const BG_IMAGES = [
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1800&auto=format&fit=crop',
];

export default function HeroSection() {
    const navigate = useNavigate();
    const [destination, setDestination] = useState('');
    const [category, setCategory] = useState('All');
    const [date, setDate] = useState('');
    const [bgIdx] = useState(() => Math.floor(Math.random() * BG_IMAGES.length));

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (destination) params.set('q', destination);
        if (category && category !== 'All') params.set('category', category);
        navigate(`/places?${params.toString()}`);
    };

    return (
        <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[20s] ease-linear"
                style={{ backgroundImage: `url(${BG_IMAGES[bgIdx]})` }}
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
            <div className="absolute inset-0 bg-linear-to-r from-[#0f2d3d]/50 via-transparent to-transparent" />

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-semibold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-6 animate-fade-in">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    Smart Tourism Guide
                </div>

                {/* Headline */}
                <h1
                    className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] mb-5 tracking-tight"
                    style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
                    Explore the World
                    <span className="block text-teal-400">with VayGo</span>
                </h1>

                <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                    Discover breathtaking places, unforgettable events, and perfect hotels tailored for your journey.
                </p>

                {/* Search Card */}
                <form
                    onSubmit={handleSearch}
                    className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl px-8 py-4 max-w-3xl mx-auto flex flex-col sm:flex-row items-stretch gap-2"
                >
                    {/* Destination */}
                    <div className="flex items-center gap-2 flex-1 bg-gray-200 rounded-xl px-4 py-3 border border-gray-100">
                        <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                        <input
                            tabIndex={0}
                            className="bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 w-full"
                            placeholder="Where to go?"
                            value={destination}
                            onChange={e => setDestination(e.target.value)}
                        />
                    </div>

                    {/* Category */}
                    <div className="flex items-center gap-2 bg-gray-200 rounded-xl px-4 py-3 border border-gray-100 relative">
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                        <select
                            className="bg-transparent outline-none text-sm text-gray-700 w-32 cursor-pointer appearance-none"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>
                                    {c === 'All' ? 'Category' : c.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 bg-gray-200 rounded-xl px-4 py-3 border border-gray-100">
                        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                        <input
                            type="date"
                            className="bg-transparent outline-none text-sm text-gray-700 cursor-pointer w-32"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="bg-teal-600 h-10 hover:bg-teal-700 text-white rounded-xl px-6 mt-0.5 text-sm font-semibold gap-2 shrink-0"
                    >
                        <Search className="w-5 h-5" />
                        Search
                    </Button>
                </form>

                {/* Quick CTAs */}
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                    {[
                        { label: 'Explore Places', href: '/places', color: 'bg-white/15 hover:bg-white/25 border-white/20' },
                        { label: 'Explore Events', href: '/events', color: 'bg-white/15 hover:bg-white/25 border-white/20' },
                        { label: 'Find Hotels', href: '/hotels', color: 'bg-teal-500/80 hover:bg-teal-500 border-teal-400/50' },
                    ].map(({ label, href, color }) => (
                        <button
                            key={href}
                            onClick={() => navigate(href)}
                            className={`${color} backdrop-blur-sm text-white text-sm font-medium px-6 py-2.5 rounded-full border transition-all duration-200 hover:scale-105`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 text-xs animate-bounce">
                <span>Scroll</span>
                <div className="w-px h-8 bg-white/30" />
            </div>
        </section>
    );
}
