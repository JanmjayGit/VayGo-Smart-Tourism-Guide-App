import { useState, useEffect } from 'react';
import { Heart, MapPin, Star, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

export default function Favorites() {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(apiEndpoints.GET_FAVORITES, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: 0, size: 50 }
            });

            setFavorites(response.data?.content || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load favorites');
            toast.error('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (placeId) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await axios.delete(apiEndpoints.REMOVE_FAVORITE(placeId), {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFavorites(favorites.filter(fav => fav.placeId !== placeId));
            toast.success('Removed from favorites');
        } catch (error) {
            toast.error('Failed to remove favorite');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-gray-50">
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-4xl font-bold">My Favorites</h1>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-48 w-full rounded-xl" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Failed to load favorites</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button onClick={fetchFavorites}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-50 border-none">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-4xl font-bold mb-2">My Favorites</h1>
                    <p className="text-gray-600">
                        {favorites.length} {favorites.length === 1 ? 'place' : 'places'} saved
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                {favorites.length === 0 ? (
                    <div className="text-center py-16">
                        <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
                        <p className="text-gray-600 mb-6">
                            Start exploring and save your favorite places!
                        </p>
                        <Button onClick={() => navigate('/places')}>
                            Explore Places
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {favorites.map((favorite) => (
                            <div key={favorite.id} className="group cursor-pointer">

                                {/* Image */}
                                <div
                                    className="relative w-full aspect-[1/1] overflow-hidden rounded-3xl"
                                    onClick={() => navigate(`/places/${favorite.placeId}`)}
                                >
                                    <img
                                        src={favorite.imageUrl || "/placeholder-place.jpg"}
                                        alt={favorite.placeName}
                                        className="w-full h-full object-cover transition duration-700 group-hover:brightness-95"
                                        loading="lazy"
                                    />

                                    {/* Remove Button (Airbnb style floating) */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFavorite(favorite.placeId);
                                        }}
                                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 transition"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </button>
                                </div>

                                {/* Content Outside Image */}
                                <div className="mt-4 space-y-1">

                                    {/* Title */}
                                    <h3
                                        onClick={() => navigate(`/places/${favorite.placeId}`)}
                                        className="font-semibold text-[16px] text-gray-900 leading-tight line-clamp-2"
                                    >
                                        {favorite.placeName}
                                    </h3>

                                    {/* Rating */}
                                    {favorite.rating && (
                                        <div className="flex items-center gap-1 text-sm text-gray-700">
                                            <Star className="h-4 w-4 fill-black text-black" />
                                            <span>{Number(favorite.rating).toFixed(1)}</span>
                                        </div>
                                    )}

                                    {/* Location */}
                                    {favorite.city && (
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <MapPin className="h-4 w-4" />
                                            <span className="truncate">{favorite.city}</span>
                                        </div>
                                    )}

                                    {/* Saved Date */}
                                    {favorite.savedAt && (
                                        <p className="text-xs text-gray-500">
                                            Saved {new Date(favorite.savedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
