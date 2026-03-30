import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, SlidersHorizontal, X, Wifi, Car, Waves, ChefHat, Dumbbell, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import HotelCard from '@/components/hotel-details/HotelCard';

//Amenity icon map
// const AMENITY_ICONS = { WiFi: Wifi, Parking: Car, Pool: Waves, Kitchen: ChefHat, Gym: Dumbbell };
const HOTEL_TYPES = ['ALL', 'LUXURY', 'BOUTIQUE', 'BUDGET', 'RESORT', 'HOSTEL'];


// Skeleton Card 
function HotelSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="aspect-4/3 w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4 rounded-full" />
            <Skeleton className="h-3 w-1/2 rounded-full" />
            <Skeleton className="h-4 w-1/3 rounded-full" />
        </div>
    );
}

// Main Page 
export default function Hotels() {
    const [rawHotels, setRawHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [draftSearch, setDraftSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');

    // Re-fetch only when API params change (not selectedType — that's client-side)
    useEffect(() => { fetchHotels(); }, [search, minPrice, maxPrice, minRating]);

    // Client-side type filter applied on top of API results
    const hotels = useMemo(() => {
        if (selectedType === 'ALL') return rawHotels;
        return rawHotels.filter(h => {
            const p = Number(h.pricePerNight ?? 0);
            switch (selectedType) {
                case 'LUXURY': return p >= 8000;
                case 'BOUTIQUE': return p >= 4000 && p < 8000;
                case 'BUDGET': return p >= 1500 && p < 4000;
                case 'HOSTEL': return p < 1500;
                case 'RESORT': return p >= 10000 || h.amenities?.includes('Pool');
                default: return true;
            }
        });
    }, [rawHotels, selectedType]);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = { page: 0, size: 48 };
            if (search.trim()) params.city = search.trim();
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (minRating) params.minRating = minRating;

            const res = await axios.get(apiEndpoints.SEARCH_HOTELS, { params });
            setRawHotels(res.data?.content || res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load hotels');
            setRawHotels([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(draftSearch);
    };

    const clearFilters = () => {
        setMinPrice(''); setMaxPrice(''); setMinRating('');
        setSelectedType('ALL'); setSearch(''); setDraftSearch('');
    };

    const activeFilterCount = [minPrice, maxPrice, minRating].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Hero / Search Banner ── */}
            <div className="bg-gray-50 py-8 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-teal-600 text-md font-semibold tracking-[0.35em] uppercase mb-3">
                        FIND YOUR STAY
                    </p>

                    <h1
                        className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 leading-tight"
                        style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                        Hotels & Stays
                    </h1>

                    <p className="text-gray-500 text-sm mb-8">
                        Explore carefully selected hotels and unique stays in the world’s most popular destinations.
                    </p>

                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2 max-w-xl mx-auto bg-white rounded-full shadow-xl p-2 border border-gray-200"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                            <input
                                type="text"
                                placeholder="Search city, destination..."
                                value={draftSearch}
                                onChange={(e) => setDraftSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-full text-gray-900 text-sm focus:outline-none"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="rounded-full px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                        >
                            Search
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full bg-gray-200 border-gray-200"
                            onClick={() => setShowFilters((f) => !f)}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                        </Button>
                    </form>

                    {/* Filters panel */}
                    {showFilters && (
                        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex flex-wrap gap-3 justify-center border-b-2 border-t-2 border-gray-300">
                            <input
                                type="number"
                                placeholder="Min ₹/night"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                className="w-32 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 text-sm border-b border-t focus:outline-none"
                            />
                            <input
                                type="number"
                                placeholder="Max ₹/night"
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                                className="w-32 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 text-sm border-b border-t focus:outline-none"
                            />
                            <select
                                value={minRating}
                                onChange={e => setMinRating(e.target.value)}
                                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-900 text-sm border-b border-t focus:outline-none"
                            >
                                <option value="">Any rating</option>
                                {[3, 3.5, 4, 4.5].map(r => (
                                    <option key={r} value={r}>★ {r}+</option>
                                ))}
                            </select>
                            {activeFilterCount > 0 && (
                                <Button size="sm" variant="ghost" className="text-white/70 hover:text-white" onClick={clearFilters}>
                                    <X className="w-3.5 h-3.5 mr-1" /> Clear
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Type Tabs ── */}
            <div className="border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
                    {HOTEL_TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all border ${selectedType === type
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                }`}
                        >
                            {type === 'ALL' ? 'All Hotels' : type.charAt(0) + type.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Main Content ── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Active search context */}
                {search && (
                    <div className="flex items-center gap-2 mb-5">
                        <Badge variant="secondary" className="text-sm py-1 px-3 gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> {search}
                            <button onClick={() => { setSearch(''); setDraftSearch(''); }} className="ml-1 hover:text-red-500">
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                        <span className="text-sm text-gray-400">{hotels.length} properties found</span>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => <HotelSkeleton key={i} />)}
                    </div>
                ) : error ? (
                    <div className="text-center py-24 space-y-4">
                        <p className="text-5xl"></p>
                        <p className="text-gray-500">{error}</p>
                        <Button onClick={fetchHotels} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl">Try Again</Button>
                    </div>
                ) : hotels.length === 0 ? (
                    <div className="text-center py-24 space-y-4">
                        <p className="text-6xl"></p>
                        <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Inter Tight', sans-serif" }}>No stays found</h3>
                        <p className="text-gray-500">Try adjusting your search or clearing filters.</p>
                        {(search || activeFilterCount > 0) && (
                            <Button onClick={clearFilters} variant="outline" className="rounded-xl border-gray-300">Clear all filters</Button>
                        )}
                    </div>
                ) : (
                    <>
                        {!search && (
                            <p className="text-sm text-gray-500 mb-6">
                                {hotels.length.toLocaleString()} hotel{hotels.length !== 1 ? 's' : ''} available
                            </p>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-9">
                            {hotels.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
