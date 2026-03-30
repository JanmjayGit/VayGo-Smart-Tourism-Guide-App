import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

export default function FeaturedBanner({ event }) {
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