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

            setFavorites(favorites.filter(fav => fav.place?.id !== placeId));
            toast.success('Removed from favorites');
        } catch (error) {
            toast.error('Failed to remove favorite');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b">
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
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-8">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((favorite) => {
                            const place = favorite.place;
                            if (!place) return null;

                            return (
                                <Card
                                    key={favorite.id}
                                    className="group overflow-hidden hover:shadow-xl transition-all duration-300"
                                >
                                    {/* Image */}
                                    <div
                                        className="relative overflow-hidden aspect-video bg-gray-200 cursor-pointer"
                                        onClick={() => navigate(`/places/${place.id}`)}
                                    >
                                        <img
                                            src={place.imageUrl || '/placeholder-place.jpg'}
                                            alt={place.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            loading="lazy"
                                        />

                                        {/* Remove Button */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-3 right-3 bg-white/95 hover:bg-white shadow-lg"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFavorite(place.id);
                                            }}
                                        >
                                            <Trash2 className="h-5 w-5 text-red-500" />
                                        </Button>
                                    </div>

                                    {/* Content */}
                                    <CardContent className="p-4 space-y-3">
                                        <h3
                                            className="font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2"
                                            onClick={() => navigate(`/places/${place.id}`)}
                                        >
                                            {place.name}
                                        </h3>

                                        {/* Rating */}
                                        {place.rating && (
                                            <div className="flex items-center gap-2">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-medium">{place.rating}</span>
                                            </div>
                                        )}

                                        {/* Location */}
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span className="truncate">{place.address || place.city}</span>
                                        </div>

                                        {/* Added Date */}
                                        <p className="text-xs text-gray-500">
                                            Added {new Date(favorite.createdAt).toLocaleDateString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
