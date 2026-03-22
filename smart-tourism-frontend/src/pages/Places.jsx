import { useState, useEffect, useMemo } from 'react';
import { usePlaces } from '@/hooks/usePlaces';
import PlacesHero from '@/components/places/PlacesHero';
import CategoryFilter from '@/components/places/CategoryFilter';
import PlacesGrid from '@/components/places/PlacesGrid';
import MapView from '@/components/map/MapView';

export default function Places() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);

    // Fetch from backend — category filter is API-side for performance
    // Pass size=100 so we get enough to search locally
    const { places: allPlaces, loading, error, toggleFavorite } = usePlaces({
        category: activeCategory || undefined,
        size: 100,
    });

    // Hotel categories belong on the Hotels page — always exclude them here
    const HOTEL_CATS = new Set(['HOTEL', 'RESORT', 'HOSTEL']);

    // Client-side search + hotel exclusion
    const places = useMemo(() => {
        const tourist = allPlaces.filter(p => !HOTEL_CATS.has(p.category));
        if (!searchQuery.trim()) return tourist;
        const q = searchQuery.toLowerCase();
        return tourist.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.city?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.state?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
    }, [allPlaces, searchQuery]);

    const resultLabel = () => {
        if (loading) return null;
        const cat = activeCategory ? activeCategory.replace('_', ' ').toLowerCase() : '';
        const q = searchQuery ? ` matching "${searchQuery}"` : '';
        const catLabel = cat ? ` in ${cat}` : '';
        return `${places.length} place${places.length !== 1 ? 's' : ''}${catLabel}${q}`;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Hero Section */}
            <PlacesHero
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Category Filter */}
            <CategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={(cat) => {
                    setActiveCategory(cat);
                    setSearchQuery(''); // clear search when switching category
                }}
            />

            {/* Main Content */}
            <div className="max-w-[1350px] mx-auto px-4 py-8">
                <div className="gap-8">
                    {/* Places Grid */}
                    <div className="lg:col-span-2">
                        {/* Result count */}
                        {!loading && (
                            <p className="text-sm text-gray-500 mb-4 capitalize">{resultLabel()}</p>
                        )}
                        {error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                <p className="text-red-600 font-outfit">{error}</p>
                            </div>
                        ) : (
                            <PlacesGrid
                                places={places}
                                loading={loading}
                                onToggleFavorite={toggleFavorite}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
