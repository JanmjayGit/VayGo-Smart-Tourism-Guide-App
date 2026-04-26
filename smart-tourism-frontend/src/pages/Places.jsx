import { useState, useEffect, useMemo } from 'react';
import { usePlaces } from '@/hooks/usePlaces';
import PlacesHero from '@/components/places/PlacesHero';
import CategoryFilter from '@/components/places/CategoryFilter';
import PlacesGrid from '@/components/places/PlacesGrid';
import MapView from '@/components/map/MapView';

const HOTEL_CATS = new Set(['HOTEL', 'RESORT', 'HOSTEL']);

export default function Places() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

    const { places: allPlaces, loading, error, toggleFavorite } = usePlaces({
        size: 100,
    });


    // debounce search
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);

        return () => clearTimeout(t);
    }, [searchQuery]);


    const places = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();

        return allPlaces
            .filter(p => {
                // normalize category safely
                const category = p.category?.toUpperCase();

                if (activeCategory && category !== activeCategory) {
                    return false;
                }

                // remove hotels
                if (HOTEL_CATS.has(category)) return false;

                // no search then return all
                if (!q) return true;

                return (
                    p.name?.toLowerCase().includes(q) ||
                    p.city?.toLowerCase().includes(q) ||
                    category?.toLowerCase().includes(q) ||
                    p.state?.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q)
                );
            });
    }, [allPlaces, debouncedQuery, activeCategory]);

    const resultLabel = () => {
        if (loading) return null;
        const cat = activeCategory
            ? activeCategory.replace(/_/g, ' ').toLowerCase()
            : '';
        const q = searchQuery ? ` matching "${searchQuery}"` : '';
        const catLabel = cat ? ` in ${cat}` : '';
        return `${places.length} place${places.length !== 1 ? 's' : ''}${catLabel}${q}`;
    };

    const handleCategoryChange = (cat) => {
        setActiveCategory(cat);
        setSearchQuery(''); // clear search when switching category
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Hero Section */}
            <PlacesHero
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
            />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
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
