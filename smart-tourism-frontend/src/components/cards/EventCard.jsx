import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';

const categoryColors = {
    MUSIC: 'bg-black/40',
    SPORTS: 'bg-black/40',
    CULTURAL: 'bg-black/40',
    FESTIVAL: 'bg-black/40',
    EXHIBITION: 'bg-black/40',
    CONFERENCE: 'bg-black/40',
};

export default function EventCard({ event }) {
    const navigate = useNavigate();
    const fmtDate = (date) => new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
    const categoryColor = categoryColors[event.category] || 'bg-black/40';
    return (
        <article
            className="group cursor-pointer"
            onClick={() => navigate(`/events/${event.id}`)}
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 transistion-all duration-200 ease-out hover:-translate-y-3 hover:shadow-2xl">
                <img
                    src={event.imageUrl || "/placeholder-event.jpg"}
                    alt={event.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                />

                {/* Category badge */}
                {event.category && (
                    <span className={`absolute top-3 left-3 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${categoryColor}`}>
                        {event.category.replace(/_/g, ' ')}
                    </span>
                )}
                {/* Free badge */}
                {event.isFree && (
                    <span className="absolute top-3 right-3 bg-black/40 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        FREE
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="mt-3 space-y-1">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 line-clamp-1 text-[15px] font-semibold leading-tight text-gray-900">
                        {event.name}
                    </h3>

                    {(event.city || event.location) && (
                        <div className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span className="max-w-[120px] truncate">{event.city || event.location}</span>
                        </div>
                    )}
                </div>

                <p className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {fmtDate(event.eventDate)}
                </p>
            </div>

        </article>
    );
}