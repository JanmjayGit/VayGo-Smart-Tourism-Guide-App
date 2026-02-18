import { useState, useEffect } from 'react';
import { usePlaces } from '@/hooks/usePlaces';
import PlacesHero from '@/components/places/PlacesHero';
import CategoryFilter from '@/components/places/CategoryFilter';
import PlacesGrid from '@/components/places/PlacesGrid';
import MapPlaceholder from '@/components/places/MapPlaceholder';

export default function Places() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);

    const { places, loading, error, toggleFavorite } = usePlaces({
        category: activeCategory,
        search: debouncedSearch,
    });

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <PlacesHero
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
            />

            {/* Category Filter */}
            <CategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
            />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Places Grid - Takes 2 columns on large screens */}
                    <div className="lg:col-span-2">
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

                    {/* Map Placeholder - Takes 1 column on large screens, hidden on mobile */}
                    <div className="hidden lg:block">
                        <MapPlaceholder />
                    </div>
                </div>
            </div>
        </div>
    );
}
