import { useState, useEffect } from 'react';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

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
            if (isFavorite) {
                await axios.delete(apiEndpoints.REMOVE_FAVORITE(placeId), {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(apiEndpoints.ADD_FAVORITE(placeId), {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            // Update local state optimistically
            setPlaces(places.map(place =>
                place.id === placeId
                    ? { ...place, isFavorite: !isFavorite }
                    : place
            ));
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
        }
    };

    return { places, loading, error, toggleFavorite };
};
