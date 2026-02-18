import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import EventCard from '@/components/events/EventCard';
import EventFilters from '@/components/events/EventFilters';

export default function Events() {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, [activeTab, selectedCategory]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);

            let endpoint;
            let params = { page: 0, size: 20 };

            // Determine endpoint based on active tab
            switch (activeTab) {
                case 'upcoming':
                    endpoint = apiEndpoints.UPCOMING_EVENTS;
                    break;
                case 'ongoing':
                    endpoint = apiEndpoints.CURRENT_EVENTS;
                    break;
                case 'past':
                    // Use search with past dates
                    endpoint = apiEndpoints.SEARCH_EVENTS;
                    const pastDate = new Date();
                    pastDate.setMonth(pastDate.getMonth() - 3);
                    params.endDate = new Date().toISOString().split('T')[0];
                    params.startDate = pastDate.toISOString().split('T')[0];
                    break;
                default:
                    endpoint = apiEndpoints.UPCOMING_EVENTS;
            }

            // Add category filter if not ALL
            if (selectedCategory !== 'ALL') {
                params.category = selectedCategory;
            }

            const response = await axios.get(endpoint, { params });
            const eventsData = response.data?.content || response.data || [];
            setEvents(eventsData);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch events');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const renderEventGrid = () => {
        if (loading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-16">
                    <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Failed to load events</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={fetchEvents}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        if (events.length === 0) {
            return (
                <div className="text-center py-16">
                    <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No events found</h3>
                    <p className="text-gray-600">
                        {selectedCategory !== 'ALL'
                            ? `No ${selectedCategory.toLowerCase()} events available.`
                            : 'Check back later for upcoming events.'}
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-4xl font-bold mb-2">Events</h1>
                    <p className="text-gray-600">
                        Discover exciting events happening around you
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                        <TabsTrigger value="past">Past</TabsTrigger>
                    </TabsList>

                    {/* Category Filters */}
                    <div className="mt-6 mb-6">
                        <EventFilters
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                        />
                    </div>

                    {/* Tab Content */}
                    <TabsContent value="upcoming" className="mt-0">
                        {renderEventGrid()}
                    </TabsContent>

                    <TabsContent value="ongoing" className="mt-0">
                        {renderEventGrid()}
                    </TabsContent>

                    <TabsContent value="past" className="mt-0">
                        {renderEventGrid()}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
