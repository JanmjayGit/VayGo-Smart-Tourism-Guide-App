import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight } from 'lucide-react';
import EventCard from '@/components/cards/EventCard';
import apiEndpoints from '@/util/apiEndpoints';

function Skeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-52 rounded-2xl bg-gray-200 mb-3" />
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
    );
}

export default function UpcomingEventsLanding() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(apiEndpoints.UPCOMING_EVENTS, { params: { page: 0, size: 4 } })
            .then(res => setEvents((res.data?.content || res.data || []).slice(0, 4)))
            .catch(async () => {
                try {
                    const res = await axios.get(apiEndpoints.SEARCH_EVENTS, { params: { page: 0, size: 4 } });
                    setEvents((res.data?.content || res.data || []).slice(0, 4));
                } catch { setEvents([]); }
            })
            .finally(() => setLoading(false));
    }, []);

    if (!loading && events.length === 0) return null;

    return (
        <section className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-teal-600 text-xs font-bold tracking-[0.3em] uppercase mb-2">What's Happening</p>
                        <h2
                            className="text-4xl sm:text-5xl font-black text-gray-900"
                            style={{ fontFamily: "'Inter Tight', sans-serif" }}
                        >
                            Upcoming Events
                        </h2>
                    </div>
                    <button
                        onClick={() => navigate('/events')}
                        className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors group"
                    >
                        View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Horizontal scroll */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
                        : events.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))
                    }
                </div>

                <div className="flex justify-center mt-6 sm:hidden">
                    <button
                        onClick={() => navigate('/events')}
                        className="text-sm font-semibold text-white bg-teal-500 px-6 py-2.5 rounded-full hover:bg-teal-600 transition-colors"
                    >
                        View All Events
                    </button>
                </div>
            </div>
        </section>
    );
}
