import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import EventCard from '@/components/cards/EventCard'
import apiEndpoints from '@/util/apiEndpoints';

export default function SimilarEvents({ currentEventId, category }) {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!category) { setLoading(false); return; }

        axios.get(apiEndpoints.SIMILAR_EVENTS(category), { params: { page: 0, size: 10 } })
            .then(res => {
                const all = res.data?.content || res.data || [];
                // Exclude the current event
                setEvents(all.filter(e => e.id !== Number(currentEventId)).slice(0, 8));
            })
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, [category, currentEventId]);

    if (!category || (!loading && events.length === 0)) return null;

    return (
        <section className="max-w-[1300px] mx-auto px-6 mt-10 mb-14">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-teal-600 text-xs font-bold tracking-[0.2em] uppercase mb-1">You Might Also Like</p>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Similar Events
                        {category && (
                            <span className="ml-2 text-base font-normal text-gray-400">
                                – {category.charAt(0) + category.slice(1).toLowerCase().replace(/_/g, ' ')}
                            </span>
                        )}
                    </h2>
                </div>
                <button
                    onClick={() => navigate(`/events?category=${category}`)}
                    className="hidden sm:flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors group"
                >
                    View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Horizontal scroll */}
            {loading ? (
                <div className="flex items-center gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-64 shrink-0 rounded-2xl bg-gray-100 animate-pulse h-52" />
                    ))}
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth -mx-6 px-6"
                    style={{ scrollbarWidth: 'none' }}>
                    {events.map(event => (
                        <div key={event.id} className="w-64 shrink-0 snap-start">
                            <EventCard event={event} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
