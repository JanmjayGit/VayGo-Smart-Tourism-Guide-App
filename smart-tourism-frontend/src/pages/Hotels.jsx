import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import HotelCard from '@/components/hotel-details/HotelCard';
import { useDebounce } from '@/hooks/useDebounce';

const HOTEL_TYPES = ['ALL', 'LUXURY', 'BOUTIQUE', 'BUDGET', 'RESORT', 'HOSTEL'];

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

    const debouncedSearch = useDebounce(search, 400);
    const debouncedMinPrice = useDebounce(minPrice, 400);
    const debouncedMaxPrice = useDebounce(maxPrice, 400);
    const debouncedRating = useDebounce(minRating, 400);

    useEffect(() => {
        fetchHotels();
    }, [debouncedSearch, debouncedMinPrice, debouncedMaxPrice, debouncedRating]);

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

            if (debouncedSearch?.trim()) params.city = debouncedSearch.trim();
            if (debouncedMinPrice) params.minPrice = debouncedMinPrice;
            if (debouncedMaxPrice) params.maxPrice = debouncedMaxPrice;
            if (debouncedRating) params.minRating = debouncedRating;

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
        setMinPrice('');
        setMaxPrice('');
        setMinRating('');
        setSelectedType('ALL');
        setSearch('');
        setDraftSearch('');
    };

    const activeFilterCount = [minPrice, maxPrice, minRating].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-gray-50">

            {/* HERO */}
            <div className="py-12 px-4 border-b">
                <div className="max-w-4xl mx-auto text-center">

                    <h1 className="text-5xl font-extrabold text-gray-900">
                        Hotels & Stays
                    </h1>

                    <p className="text-gray-500 mt-3 mb-8">
                        Discover handpicked hotels and unique stays.
                    </p>

                    {/* SEARCH */}
                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2 bg-white rounded-full shadow-lg border px-2 py-2"
                    >
                        <Search className="ml-4 text-gray-400 w-4 h-4" />

                        <input
                            value={draftSearch}
                            onChange={(e) => setDraftSearch(e.target.value)}
                            placeholder="Search city..."
                            className="flex-1 px-4 py-2 outline-none bg-transparent"
                        />

                        <Button className="rounded-full bg-teal-600 hover:bg-teal-700 text-white">
                            Search
                        </Button>

                        {/* FILTER BUTTON */}
                        <button
                            type="button"
                            onClick={() => setShowFilters(prev => !prev)}
                            className={`
                                h-10 w-10 flex items-center justify-center rounded-full transition
                                ${showFilters
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}
                            `}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                        </button>
                    </form>

                    {/*  FILTER PANEL */}
                    {showFilters && (
                        <div className="mt-6">
                            <div className="bg-white border rounded-2xl shadow-lg p-4 flex gap-3 flex-wrap justify-center">

                                <input
                                    type="number"
                                    placeholder="Min ₹"
                                    value={minPrice}
                                    onChange={e => setMinPrice(e.target.value)}
                                    className="px-3 py-2 bg-gray-100 rounded-lg"
                                />

                                <input
                                    type="number"
                                    placeholder="Max ₹"
                                    value={maxPrice}
                                    onChange={e => setMaxPrice(e.target.value)}
                                    className="px-3 py-2 bg-gray-100 rounded-lg"
                                />

                                <select
                                    value={minRating}
                                    onChange={e => setMinRating(e.target.value)}
                                    className="px-3 py-2 bg-gray-100 rounded-lg"
                                >
                                    <option value="">Any rating</option>
                                    <option value="3">★ 3+</option>
                                    <option value="4">★ 4+</option>
                                    <option value="4.5">★ 4.5+</option>
                                </select>

                                {activeFilterCount > 0 && (
                                    <button onClick={clearFilters} className="text-red-500">
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* HOTEL TYPES */}
                    <div className="mt-6 flex gap-2 overflow-x-auto justify-center">
                        {HOTEL_TYPES.map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`
                                    px-4 py-2 rounded-full text-sm font-semibold border
                                    ${selectedType === type
                                        ? 'bg-teal-50 border border-teal-600 text-teal-600'
                                        : 'bg-white text-gray-600 hover:border-gray-400'}
                                `}
                            >
                                {type === 'ALL'
                                    ? 'All Hotels'
                                    : type.toLowerCase()}
                            </button>
                        ))}
                    </div>

                </div>
            </div>

            {/* CONTENT */}
            <main className="max-w-7xl mx-auto px-4 py-8">

                {search && (
                    <div className="flex gap-2 mb-4">
                        <Badge>
                            <MapPin className="w-3 h-3" /> {search}
                        </Badge>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => <HotelSkeleton key={i} />)}
                    </div>
                ) : error ? (
                    <div className="text-center">
                        <p>{error}</p>
                        <Button onClick={fetchHotels}>Retry</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {hotels.map(h => <HotelCard key={h.id} hotel={h} />)}
                    </div>
                )}

            </main>
        </div>
    );
}