import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';

const categoryColors = {
    MUSIC: 'bg-purple-500',
    SPORTS: 'bg-blue-500',
    CULTURAL: 'bg-pink-500',
    FESTIVAL: 'bg-orange-500',
    EXHIBITION: 'bg-black/40',
    CONFERENCE: 'bg-indigo-500',
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
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
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

                {/* Title + Rating */}
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-[15px] leading-tight line-clamp-1">
                        {event.name}
                    </h3>
                </div>

                {/* Location */}
                {(event.city || event.location) && (
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.city || event.location}
                    </p>

                )}

                {/* Date */}
                <p className="text-gray-500 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {fmtDate(event.eventDate)}
                </p>

            </div>
        </article>
    );
}