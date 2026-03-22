import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EventsCard() {
    const navigate = useNavigate();
    const { events, loading, error } = useEvents();

    const upcomingEvents = events ? events.slice(0, 5) : [];

    const getCategoryColor = (category) => {
        const colors = {
            FESTIVAL: 'text-orange-600 bg-orange-100',
            MUSIC: 'text-purple-600 bg-purple-100',
            CULTURAL: 'text-blue-600 bg-blue-100',
            SPORTS: 'text-green-600 bg-green-100',
            DEFAULT: 'text-gray-600 bg-gray-100'
        };
        return colors[category] || colors.DEFAULT;
    };

    return (
        <Card className="p-6 rounded-2xl shadow-lg border-white/50 bg-gray-50 shadow-organic flex flex-col h-full min-h-[350px]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-dmsans text-lg font-bold text-[#1a2b38] flex items-center gap-2">
                    Upcoming Events
                </h3>
                <button
                    onClick={() => navigate('/events')}
                    className="text-teal-700 bg-teal-100 px-4 py-1.5 flex items-center gap-1 rounded-full text-xs font-semibold hover:bg-teal-200 transition-colors"
                >
                    See all <span className="ml-1"><ArrowRight className="w-4 h-4" /></span>
                </button>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                    </div>
                ) : error || upcomingEvents.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-10">
                        {error ? 'Failed to load events.' : 'No upcoming events found.'}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {upcomingEvents.map((ev, i) => {
                            const dateObj = new Date(ev.eventDate);
                            const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                            const day = dateObj.getDate().toString().padStart(2, '0');

                            return (
                                <div
                                    key={ev.id}
                                    onClick={() => navigate(`/events/${ev.id}`)}
                                    className={`flex items-center gap-4 p-3 rounded-xl hover:bg-teal-50/50 transition-colors cursor-pointer group ${i < upcomingEvents.length - 1 ? 'border-b border-gray-100' : ''}`}
                                >
                                    {/* Date Box */}
                                    <div className="w-12 h-14 rounded-lg bg-teal-50/80 flex flex-col items-center justify-center border border-teal-100 group-hover:bg-white group-hover:border-teal-200 transition-all shadow-sm">
                                        <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">{month}</span>
                                        <span className="text-lg font-black text-[#1a2b38] leading-tight">{day}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-[#1a2b38] text-sm truncate group-hover:text-gray-900 transition-colors">
                                            {ev.name}
                                        </h4>
                                        <p className="text-xs text-[#6b7f8e] mt-0.5 truncate flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-gray-900 shrink-0" /> {ev.city} {ev.venue ? `- ${ev.venue}` : ''}
                                        </p>
                                    </div>

                                    {/* Category Badge */}
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${getCategoryColor(ev.category)}`}>
                                        {ev.category}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Card>
    );
}
