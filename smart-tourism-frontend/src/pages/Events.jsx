import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
    OTHER: 'bg-gray-100   text-gray-700   border-gray-200',
};

const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

//Featured Event Banner
function FeaturedBanner({ event }) {
    const navigate = useNavigate();
    if (!event) return null;

    return (
        <div
            className="relative rounded-2xl overflow-hidden h-[260px] md:h-[300px] cursor-pointer group shadow-lg mb-8"
            onClick={() => navigate(`/events/${event.id}`)}
        >
            <img
                src={event.imageUrl || '/placeholder-event.jpg'}
                alt={event.name}
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
                <span className="bg-white/80 backdrop-blur-sm text-black text-xs font-semibold px-3 py-1 rounded-full">
                    Next Event
                </span>
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-white text-2xl font-bold leading-tight mb-2 drop-shadow">
                        {event.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm font-medium">
                        <span className="flex items-center gap-1 ">
                            <Calendar className="w-4 h-4" /> {fmtDate(event.eventDate)}
                        </span>
                        {(event.city || event.location) && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" /> {event.city || event.location}
                            </span>
                        )}
                    </div>
                </div>
                <Button
                    className="bg-white/80 backdrop-blur-sm text-black text-xs font-semibold px-3 py-1 rounded-full"
                    onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}`); }}
                >
                    View Event
                </Button>
            </div>
        </div>
    );
}


// function EventCard({ event }) {
//     const navigate = useNavigate();

//     return (
//         <article
//             className="group cursor-pointer"
//             onClick={() => navigate(`/events/${event.id}`)}
//         >
//             {/* Image */}
//             <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
//                 <img
//                     src={event.imageUrl || "/placeholder-event.jpg"}
//                     alt={event.name}
//                     loading="lazy"
//                     className="w-full h-full object-cover"
//                 />
//             </div>

//             {/* Content */}
//             <div className="mt-3 space-y-1">

//                 {/* Title + Rating */}
//                 <div className="flex items-start justify-between gap-2">
//                     <h3 className="font-semibold text-gray-900 text-[15px] leading-tight line-clamp-1">
//                         {event.name}
//                     </h3>
//                 </div>

//                 {/* Location */}
//                 {(event.city || event.location) && (
//                     <p className="text-gray-500 text-xs flex items-center gap-1">
//                         <MapPin className="w-3 h-3" />
//                         {event.city || event.location}
//                     </p>
//                 )}

//                 {/* Date */}
//                 <p className="text-gray-500 text-xs flex items-center gap-1">
//                     <Calendar className="w-3 h-3" />
//                     {fmtDate(event.eventDate)}
//                 </p>

//             </div>
//         </article>
//     );
// }


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
                            <Button onClick={fetchEvents} className="bg-pink-600 hover:bg-pink-700 text-white">
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



