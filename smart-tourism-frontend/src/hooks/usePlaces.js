import { useState, useEffect } from 'react';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import { toast } from 'sonner';

export const usePlaces = (params = {}) => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('token');
                const response = await axios.get(apiEndpoints.GET_PLACES, {
                    params,
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                // Extract content array from paginated response
                const placesData = response.data?.content || response.data || [];
                setPlaces(placesData);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch places');
                setPlaces([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchPlaces();
    }, [JSON.stringify(params)]);

    const toggleFavorite = async (placeId, isFavorite) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) { toast.error('Please log in to save favorites'); return; }
            if (isFavorite) {
                await axios.delete(apiEndpoints.REMOVE_FAVORITE(placeId), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Removed from favorites');
            } else {
                await axios.post(apiEndpoints.ADD_FAVORITE(placeId), {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Added to favorites!');
            }
            // Update local state optimistically
            setPlaces(places.map(place =>
                place.id === placeId
                    ? { ...place, isFavorite: !isFavorite }
                    : place
            ));
        } catch (err) {
            const status = err.response?.status;
            if (status === 409) {
                // Already favorited on server — sync UI to reflect that
                toast('Already saved to favorites');
                setPlaces(places.map(place =>
                    place.id === placeId ? { ...place, isFavorite: true } : place
                ));
            } else {
                toast.error('Failed to update favorites');
                console.error('Failed to toggle favorite:', err);
            }
        }
    };

    return { places, loading, error, toggleFavorite };
};
