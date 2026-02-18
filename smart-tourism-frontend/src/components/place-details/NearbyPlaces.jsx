import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

export default function NearbyPlaces({ currentPlaceId, latitude, longitude }) {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNearbyPlaces = async () => {
            try {
                setLoading(true);
                const response = await axios.get(apiEndpoints.NEARBY_PLACES, {
                    params: {
                        lat: latitude,
                        lon: longitude,
                        radius: 5000, // 5km radius
                        page: 0,
                        size: 6
                    }
                });

                // Filter out current place
                const nearbyPlaces = (response.data?.content || [])
                    .filter(place => place.id !== currentPlaceId);
                setPlaces(nearbyPlaces);
            } catch (error) {
                console.error('Failed to fetch nearby places:', error);
            } finally {
                setLoading(false);
            }
        };

        if (latitude && longitude) {
            fetchNearbyPlaces();
        }
    }, [currentPlaceId, latitude, longitude]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Nearby Places</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-48 w-64 flex-shrink-0 rounded-xl" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (places.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nearby Places</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                    {places.map((place) => (
                        <div
                            key={place.id}
                            onClick={() => navigate(`/places/${place.id}`)}
                            className="flex-shrink-0 w-64 cursor-pointer group snap-start"
                        >
                            <div className="relative h-40 rounded-t-xl overflow-hidden">
                                <img
                                    src={place.imageUrl || '/placeholder-place.jpg'}
                                    alt={place.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    loading="lazy"
                                />
                                {place.distance && (
                                    <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                                        {place.distance.toFixed(1)} km
                                    </div>
                                )}
                            </div>
                            <div className="p-3 border border-t-0 rounded-b-xl group-hover:border-blue-500 transition-colors">
                                <h4 className="font-semibold text-sm mb-1 truncate">
                                    {place.name}
                                </h4>
                                <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{place.address}</span>
                                </div>
                                {place.rating && (
                                    <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-medium">{place.rating}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
