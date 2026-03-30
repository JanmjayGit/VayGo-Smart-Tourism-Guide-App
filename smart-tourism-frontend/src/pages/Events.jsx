import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import FeaturedBanner from '@/components/events/FeaturedBanner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import { motion } from "framer-motion";
import EventCard from '@/components/cards/EventCard';

const CATEGORIES = [
    { value: 'ALL', label: 'All Events' },
    { value: 'FESTIVAL', label: 'Festival' },
    { value: 'CULTURAL', label: 'Cultural' },
    { value: 'EXHIBITION', label: 'Exhibition' },
    { value: 'CONCERT', label: 'Concert' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'RELIGIOUS', label: 'Religious' },
    { value: 'OTHER', label: 'Other' },
];

const TIMEFRAMES = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'past', label: 'Past' },
];

const CAT_COLORS = {
    FESTIVAL: 'bg-orange-100 text-orange-700 border-orange-200',
    CULTURAL: 'bg-pink-100   text-pink-700   border-pink-200',
    EXHIBITION: 'bg-green-100  text-green-700  border-green-200',
    CONCERT: 'bg-purple-100 text-purple-700 border-purple-200',
    SPORTS: 'bg-blue-100   text-blue-700   border-blue-200',
    RELIGIOUS: 'bg-amber-100  text-amber-700  border-amber-200',
    WORKSHOP: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    FOOD: 'bg-red-100 text-red-700 border-red-200',

    ART: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',

    WELLNESS: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    SPIRITUAL: 'bg-yellow-100 text-yellow-700 border-yellow-200',

    BUSINESS: 'bg-slate-100 text-slate-700 border-slate-200',
    TECH: 'bg-cyan-100 text-cyan-700 border-cyan-200',

    TREKKING: 'bg-lime-100 text-lime-700 border-lime-200',

    OTHER: 'bg-gray-100   text-gray-700   border-gray-200',

};


// Main Page 
export default function Events() {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { fetchEvents(); }, [activeTab, selectedCategory]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);

            let endpoint = apiEndpoints.UPCOMING_EVENTS;
            const params = { page: 0, size: 30 };

            if (activeTab === 'ongoing') endpoint = apiEndpoints.CURRENT_EVENTS;
            if (activeTab === 'past') {
                endpoint = apiEndpoints.SEARCH_EVENTS;
                const past = new Date();
                past.setMonth(past.getMonth() - 3);
                params.endDate = new Date().toISOString().split('T')[0];
                params.startDate = past.toISOString().split('T')[0];
            }

            if (selectedCategory !== 'ALL') {
                params.category = selectedCategory;
            }

            const res = await axios.get(endpoint, { params });
            setEvents(res.data?.content || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch events');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const featured = events[0] ?? null;
    const gridEvents = events.slice(1);

    const activeCategoryLabel = CATEGORIES.find(c => c.value === selectedCategory)?.label || 'All Events';

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            {/* Page Header */}
            <div className="bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
                    <h1 className="text-3xl font-bold text-[#1a2b38]">
                        Explore Events
                    </h1>
                    <p className="text-gray-500 mt-1">Experience the culture and festivities across India.</p>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Timeframe */}
                    <div className="flex items-center gap-2 mb-6">
                        {TIMEFRAMES.map(t => (
                            <button
                                key={t.value}
                                onClick={() => setActiveTab(t.value)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all
                                ${activeTab === t.value
                                        ? "bg-teal-600 text-white shadow-sm"
                                        : "bg-white border border-gray-200 text-gray-600 hover:border-teal-400"}
                                `}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    {/* Featured Event */}
                    {!loading && !error && featured && <FeaturedBanner event={featured} />}
                    {loading && <Skeleton className="h-[260px] w-full rounded-2xl mb-8" />}

                    {/* Category pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border transition-all ${selectedCategory === cat.value
                                    ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-700'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Section heading */}
                    {!loading && !error && gridEvents.length > 0 && (
                        <h2 className="text-xl font-bold text-[#1a2b38] mb-5">
                            {activeCategoryLabel}
                        </h2>
                    )}

                    {/* Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="space-y-3">
                                    <Skeleton className="h-44 w-full rounded-2xl" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <Calendar className="h-14 w-14 mx-auto text-gray-300 mb-4" />
                            <h3 className="font-semibold text-lg text-gray-600 mb-2">Failed to load events</h3>
                            <p className="text-gray-500 mb-6">{error}</p>
                            <Button onClick={fetchEvents} className="bg-teal-600 hover:bg-teal-700 text-white">
                                Try Again
                            </Button>
                        </div>
                    ) : gridEvents.length === 0 && !featured ? (
                        <div className="text-center py-20">
                            <Calendar className="h-14 w-14 mx-auto text-gray-300 mb-4" />
                            <h3 className="font-semibold text-lg text-gray-600">No events found</h3>
                            <p className="text-gray-500 mt-1">
                                {selectedCategory !== 'ALL'
                                    ? `No ${activeCategoryLabel.toLowerCase()} events available.`
                                    : 'Check back later for upcoming events.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {gridEvents.map(event => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



