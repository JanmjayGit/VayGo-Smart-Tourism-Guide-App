import PlaceCard from './PlaceCard';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlaces } from '@/hooks/usePlaces';

export default function PlacesGrid({ title = "Popular Destinations", params = {} }) {
    const { places, loading, error, toggleFavorite } = usePlaces(params);

    if (loading) {
        return (
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-80 rounded-xl" />
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
                <div className="text-center py-12 text-gray-500">
                    <p>Failed to load places. Please try again later.</p>
                </div>
            </section>
        );
    }

    if (!places || places.length === 0) {
        return (
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
                <div className="text-center py-12 text-gray-500">
                    <p>No places found.</p>
                </div>
            </section>
        );
    }

    return (
        <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {places.map((place) => (
                    <PlaceCard
                        key={place.id}
                        place={place}
                        onToggleFavorite={toggleFavorite}
                    />
                ))}
            </div>
        </section>
    );
}
