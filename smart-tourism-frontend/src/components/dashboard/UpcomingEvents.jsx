import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvents } from '@/hooks/useEvents';

const getEventDateBadge = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Today', variant: 'default' };
    if (diffDays === 1) return { text: 'Tomorrow', variant: 'secondary' };
    if (diffDays < 7) return { text: `In ${diffDays} days`, variant: 'outline' };
    return { text: event.toLocaleDateString(), variant: 'outline' };
};

export default function UpcomingEvents() {
    const { events, loading, error } = useEvents();

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (error || !events || events.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">
                        {error || 'No upcoming events'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const upcomingEvents = events.slice(0, 3);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {upcomingEvents.map((event) => {
                    // Use eventDate from backend, fallback to date
                    const eventDate = event.eventDate || event.date;
                    // Use city from backend, fallback to location
                    const location = event.city || event.location || 'Location TBA';

                    const dateBadge = getEventDateBadge(eventDate);
                    return (
                        <div
                            key={event.id}
                            className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <div className="flex-1">
                                <h4 className="font-medium text-sm mb-1">{event.name}</h4>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <MapPin className="h-3 w-3" />
                                    <span>{location}</span>
                                </div>
                            </div>
                            <Badge variant={dateBadge.variant} className="ml-2">
                                {dateBadge.text}
                            </Badge>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
