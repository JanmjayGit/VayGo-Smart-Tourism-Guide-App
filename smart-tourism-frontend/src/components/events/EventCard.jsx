import { Calendar, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const categoryColors = {
    MUSIC: 'bg-purple-100 text-purple-800 border-purple-300',
    SPORTS: 'bg-blue-100 text-blue-800 border-blue-300',
    CULTURAL: 'bg-pink-100 text-pink-800 border-pink-300',
    FESTIVAL: 'bg-orange-100 text-orange-800 border-orange-300',
    EXHIBITION: 'bg-green-100 text-green-800 border-green-300',
    CONFERENCE: 'bg-indigo-100 text-indigo-800 border-indigo-300',
};

const getDateBadge = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Today', variant: 'default' };
    if (diffDays === 1) return { text: 'Tomorrow', variant: 'secondary' };
    if (diffDays < 7 && diffDays > 0) return { text: `In ${diffDays} days`, variant: 'outline' };
    if (diffDays < 0) return { text: 'Past', variant: 'destructive' };
    return { text: event.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), variant: 'outline' };
};

export default function EventCard({ event }) {
    const navigate = useNavigate();
    const dateBadge = getDateBadge(event.eventDate);

    const handleClick = () => {
        navigate(`/events/${event.id}`);
    };

    return (
        <Card
            className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={handleClick}
        >
            {/* Image */}
            <div className="relative overflow-hidden aspect-video bg-gray-200">
                <img
                    src={event.imageUrl || '/placeholder-event.jpg'}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                />

                {/* Category Badge */}
                <Badge
                    className={`absolute top-3 left-3 font-semibold ${categoryColors[event.category] || 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {event.category}
                </Badge>

                {/* Date Badge */}
                <Badge
                    variant={dateBadge.variant}
                    className="absolute top-3 right-3 font-semibold"
                >
                    {dateBadge.text}
                </Badge>
            </div>

            {/* Content */}
            <CardContent className="p-4 space-y-3">
                {/* Event Name */}
                <h3 className="font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                    {event.name}
                </h3>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                        {new Date(event.eventDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{event.city || event.location || 'Location TBA'}</span>
                </div>

                {/* Description */}
                {event.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {event.description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
