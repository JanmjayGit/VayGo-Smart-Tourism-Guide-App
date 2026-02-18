import { useState, useEffect } from 'react';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

export const useEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(apiEndpoints.UPCOMING_EVENTS);
                // Extract content array from paginated response
                const eventsData = response.data?.content || response.data || [];
                setEvents(eventsData);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch events');
                setEvents([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return { events, loading, error };
};
