import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import { Heart, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/hooks/useFavorites';

export default function PopularDestinations() {
    const navigate = useNavigate();
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const { favorites, refetch } = useFavorites();

    // Derive favorite status from the favorites array
    const isFavorite = (placeId) =>
        Array.isArray(favorites) && favorites.some((f) => f.place?.id === placeId || f.placeId === placeId);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                // Fetch first page, typically popular ones if backend sorts by rating
                const response = await axios.get(apiEndpoints.GET_PLACES, { params: { size: 4 } });
                const data = response.data?.content || response.data || [];
                setPlaces(Array.isArray(data) ? data.slice(0, 4) : []);
            } catch (err) {
                toast.error("Failed to load popular places");
                console.error("Failed to load popular places", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPopular();
    }, []);

    const handleToggleFavorite = async (e, placeId) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            if (isFavorite(placeId)) {
                await axios.delete(apiEndpoints.REMOVE_FAVORITE(placeId), { headers });
            } else {
                await axios.post(apiEndpoints.ADD_FAVORITE(placeId), {}, { headers });
            }
            refetch();
        } catch (err) {
            console.error('Failed to toggle favorite', err);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-end justify-between mb-8">
                <h2 className="text-[#1a2b38] font-playfair text-3xl font-bold tracking-tight">
                    Popular Destinations
                </h2>
                <button
                    onClick={() => navigate('/places')}
                    className="text-white font-semibold text-sm bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-2xl flex items-center gap-1 group"
                >
                    View all <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="overflow-hidden border-0 shadow-sm rounded-2xl">
                            <Skeleton className="h-[200px] w-full rounded-none" />
                            <div className="p-5 space-y-3">
                                <Skeleton className="h-6 w-2/3" />
                                <Skeleton className="h-4 w-1/3" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : places.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No popular destinations found.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {places.map((place) => (
                        <div
                            key={place.id}
                            onClick={() => navigate(`/places/${place.id}`)}
                            className="cursor-pointer group"
                        >
                            {/* Image */}
                            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl">
                                <img
                                    src={place.imageUrl || "/placeholder.jpg"}
                                    alt={place.name}
                                    className="w-full h-full object-cover"
                                />

                                {/* Favorite Button */}
                                <button
                                    onClick={(e) => handleToggleFavorite(e, place.id)}
                                    className="absolute top-3 right-3 p-1 transition-all duration-200 hover:scale-110 active:scale-95"
                                >
                                    <Heart
                                        className={`w-7 h-7 drop-shadow-md transition-all duration-200 ${isFavorite(place.id)
                                            ? "fill-[#FF385C] stroke-[#FF385C]"
                                            : "stroke-white fill-black/40"
                                            }`}
                                        strokeWidth={1.5}
                                    />
                                </button>
                            </div>

                            {/* Content Outside Image */}
                            <div className="mt-3 space-y-1">
                                <h3 className="font-semibold text-[15px] text-gray-900 truncate">
                                    {place.name}
                                </h3>

                                <div className="flex items-center text-sm text-gray-600">
                                    <Star className="w-4 h-4 fill-current text-black mr-1" />
                                    <span>4.5</span>
                                    <span className="mx-1">·</span>
                                    <span>0 reviews</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
