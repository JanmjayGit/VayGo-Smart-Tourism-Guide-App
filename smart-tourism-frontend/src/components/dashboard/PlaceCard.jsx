import { Heart, Star, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function PlaceCard({ place, onToggleFavorite }) {
    const [isFavorite, setIsFavorite] = useState(place.isFavorite || false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        setIsLoading(true);
        try {
            await onToggleFavorite(place.id, isFavorite);
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            TEMPLE: 'bg-teal-100 text-teal-700',
            NATURE: 'bg-green-100 text-green-700',
            MUSEUM: 'bg-purple-100 text-purple-700',
            PARK: 'bg-emerald-100 text-emerald-700',
            BEACH: 'bg-blue-100 text-blue-700',
            HISTORICAL: 'bg-amber-100 text-amber-700',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={place.imageUrl || '/placeholder-place.jpg'}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Favorite Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full"
                    onClick={handleFavoriteClick}
                    disabled={isLoading}
                >
                    <Heart
                        className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                            }`}
                    />
                </Button>
            </div>

            {/* Content Section */}
            <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {place.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{place.rating || '4.5'}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                        ({place.reviewCount || '0'} reviews)
                    </span>
                </div>

                {/* Location */}
                {place.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{place.location}</span>
                    </div>
                )}

                {/* Category Badge */}
                {place.category && (
                    <Badge className={getCategoryColor(place.category)}>
                        {place.category}
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
}
