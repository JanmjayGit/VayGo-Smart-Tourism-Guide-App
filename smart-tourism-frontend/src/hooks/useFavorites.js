import { useState, useEffect } from 'react';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await axios.get(apiEndpoints.GET_FAVORITES, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Extract content array from paginated response
            const favoritesData = response.data?.content || response.data || [];
            setFavorites(favoritesData);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch favorites');
            setFavorites([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const removeFavorite = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(apiEndpoints.REMOVE_FAVORITE(id), {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFavorites(favorites.filter(fav => fav.id !== id));
        } catch (err) {
            console.error('Failed to remove favorite:', err);
        }
    };

    return { favorites, loading, error, removeFavorite, refetch: fetchFavorites };
};
