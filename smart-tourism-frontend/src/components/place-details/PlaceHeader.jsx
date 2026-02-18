import { MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import FavoriteButton from './FavoriteButton';

export default function PlaceHeader({ place, isFavorite }) {
    return (
        <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {place.name}
                    </h1>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-600">{place.address}</span>
                        </div>
                        {place.rating && (
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{place.rating}</span>
                                <span className="text-gray-600">({place.reviewCount || 0} reviews)</span>
                            </div>
                        )}
                    </div>
                </div>
                <FavoriteButton placeId={place.id} initialIsFavorite={isFavorite} />
            </div>

            <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">{place.category}</Badge>
                {place.priceRange && (
                    <Badge variant="outline">{place.priceRange}</Badge>
                )}
                {place.openNow !== undefined && (
                    <Badge variant={place.openNow ? 'default' : 'destructive'}>
                        {place.openNow ? 'Open Now' : 'Closed'}
                    </Badge>
                )}
            </div>
        </div>
    );
}
