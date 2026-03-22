import PlaceCard from '../cards/PlaceCard';
import PlaceCardSkeleton from './PlaceCardSkeleton';
import { MapPin, Search } from 'lucide-react';

export default function PlacesGrid({ places, loading, onToggleFavorite }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div
                        key={index}
                        className="animate-fadeIn"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <PlaceCardSkeleton />
                    </div>
                ))}
            </div>
        );
    }

    if (places.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="bg-gradient-to-br from-teal-100 to-orange-100 rounded-full p-8 mb-6">
                    <Search className="w-16 h-16 text-teal-600" />
                </div>
                <h3 className="font-playfair text-3xl font-bold text-gray-900 mb-3">
                    No places found
                </h3>
                <p className="font-outfit text-gray-600 text-center max-w-md">
                    Try adjusting your search or filters to discover amazing destinations
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {places.map((place, index) => (
                <div
                    key={place.id}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <PlaceCard place={place} onToggleFavorite={onToggleFavorite} />
                </div>
            ))}
        </div>
    );
}
