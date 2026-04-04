import { useState, useEffect } from 'react';
import { Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import FeaturedBanner from '@/components/events/FeaturedBanner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import EventCard from '@/components/cards/EventCard';

const CATEGORIES = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'FESTIVAL', label: 'Festival' },
    { value: 'CULTURAL', label: 'Cultural' },
    { value: 'EXHIBITION', label: 'Exhibition' },
    { value: 'CONCERT', label: 'Concert' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'RELIGIOUS', label: 'Religious' },
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'FOOD', label: 'Food' },
    { value: 'ART', label: 'Art' },
    { value: 'WELLNESS', label: 'Wellness' },
    { value: 'SPIRITUAL', label: 'Spiritual' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'TECH', label: 'Tech' },
    { value: 'TREKKING', label: 'Trekking' },
    { value: 'OTHER', label: 'Other' },
];

const TIMEFRAMES = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'past', label: 'Past' },
];

export default function Events() {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, [activeTab]);

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

            const res = await axios.get(endpoint, { params });
            setEvents(res.data?.content || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch events');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter((event) => {
        const matchesCategory =
            selectedCategory === 'ALL' || event.category === selectedCategory;

        const q = searchQuery.toLowerCase();
        const matchesSearch =
            !searchQuery ||
            event.name?.toLowerCase().includes(q) ||
            event.city?.toLowerCase().includes(q) ||
            event.category?.toLowerCase().includes(q);

        return matchesCategory && matchesSearch;
    });

    const featured = filteredEvents[0] ?? null;
    const gridEvents = filteredEvents.slice(1);

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
                {/* <h1 className="text-3xl font-bold text-[#1a2b38]">Explore Events</h1>
                <p className="mt-1 text-gray-500">
                    Experience the culture and festivities across India.
                </p> */}

                {/* Featured Events */}
                <div className="mt-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-[#1a2b38]">Featured Events</h2>
                    </div>

                    {loading ? (
                        <Skeleton className="h-[260px] w-full rounded-2xl" />
                    ) : error ? null : featured ? (
                        <FeaturedBanner event={featured} />
                    ) : (
                        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
                            No featured event available.
                        </div>
                    )}
                </div>

                {/* Time frame + Search + Filter */}
                <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-6">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                                    Search Events
                                </h3>
                            </div>

                            <div className="inline-flex w-fit items-center rounded-full bg-slate-100 p-1">
                                {TIMEFRAMES.map((t) => (
                                    <button
                                        key={t.value}
                                        onClick={() => setActiveTab(t.value)}
                                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeTab === t.value
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search events or cities..."
                                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-14 pr-4 text-[15px] text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white"
                                />
                            </div>

                            <div className="relative">
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 text-[15px] text-slate-700 shadow-none transition-all focus:border-teal-500 focus:bg-white">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>


                {/* All Events */}
                <div className="mt-8">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-[#1a2b38]">All Events</h2>
                        {!loading && !error && (
                            <p className="text-sm text-gray-500">{filteredEvents.length} events</p>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="space-y-3">
                                    <Skeleton className="h-44 w-full rounded-2xl" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center">
                            <Calendar className="mx-auto mb-4 h-14 w-14 text-gray-300" />
                            <h3 className="mb-2 text-lg font-semibold text-gray-600">
                                Failed to load events
                            </h3>
                            <p className="mb-6 text-gray-500">{error}</p>
                            <Button onClick={fetchEvents} className="bg-teal-600 text-white hover:bg-teal-700">
                                Try Again
                            </Button>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="py-20 text-center">
                            <Calendar className="mx-auto mb-4 h-14 w-14 text-gray-300" />
                            <h3 className="text-lg font-semibold text-gray-600">No events found</h3>
                            <p className="mt-1 text-gray-500">
                                Try another search or category.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {filteredEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
