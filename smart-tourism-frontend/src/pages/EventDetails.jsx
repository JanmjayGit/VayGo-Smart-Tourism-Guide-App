import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

const categoryColors = {
    MUSIC: 'bg-purple-100 text-purple-800',
    SPORTS: 'bg-blue-100 text-blue-800',
    CULTURAL: 'bg-pink-100 text-pink-800',
    FESTIVAL: 'bg-orange-100 text-orange-800',
    EXHIBITION: 'bg-green-100 text-green-800',
    CONFERENCE: 'bg-indigo-100 text-indigo-800',
};

export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(apiEndpoints.GET_EVENT_BY_ID(id));
                setEvent(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load event details');
                toast.error('Failed to load event details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEventDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading event details...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        {error || 'The event you are looking for does not exist.'}
                    </p>
                    <Button onClick={() => navigate('/events')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Events
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Button */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
            </div>

            {/* Hero Image */}
            <div className="relative h-96 bg-gray-200">
                <img
                    src={event.imageUrl || '/placeholder-event.jpg'}
                    alt={event.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Event Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="container mx-auto">
                        <Badge className={`mb-4 ${categoryColors[event.category] || 'bg-gray-100 text-gray-800'}`}>
                            {event.category}
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">{event.name}</h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <Card>
                            <CardContent className="pt-6">
                                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {event.description || 'No description available.'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Additional Details */}
                        {event.additionalInfo && (
                            <Card>
                                <CardContent className="pt-6">
                                    <h2 className="text-2xl font-bold mb-4">Additional Information</h2>
                                    <p className="text-gray-700 leading-relaxed">
                                        {event.additionalInfo}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Event Info Card */}
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="font-bold text-lg mb-4">Event Details</h3>

                                {/* Date */}
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-600">Date</p>
                                        <p className="font-medium">
                                            {new Date(event.eventDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Time */}
                                {event.eventTime && (
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Time</p>
                                            <p className="font-medium">{event.eventTime}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Location */}
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-600">Location</p>
                                        <p className="font-medium">{event.city || event.location || 'TBA'}</p>
                                        {event.venue && (
                                            <p className="text-sm text-gray-600">{event.venue}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Capacity */}
                                {event.capacity && (
                                    <div className="flex items-start gap-3">
                                        <Users className="h-5 w-5 text-gray-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Capacity</p>
                                            <p className="font-medium">{event.capacity} attendees</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {event.registrationLink && (
                                <Button className="w-full" size="lg" asChild>
                                    <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                                        Register Now
                                    </a>
                                </Button>
                            )}

                            {event.latitude && event.longitude && (
                                <Button variant="outline" className="w-full" asChild>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Get Directions
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
