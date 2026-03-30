import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Loader2, Navigation, Hotel,
    Star, MapPin, Share2, Heart, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

import ImageCarousel from '@/components/place-details/ImageCarousel';
import PlaceHeader from '@/components/place-details/PlaceHeader';
import PlaceInfo from '@/components/place-details/PlaceInfo';
import ReviewsSection from '@/components/place-details/ReviewsSection';
import NearbyPlaces from '@/components/place-details/NearbyPlaces';
import ReviewForm from '@/components/reviews/ReviewForm';
import MapView from '@/components/map/MapView';
import ImageGallery from '@/components/hotel-details/ImageGallery';

export default function PlaceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [place, setPlace] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewsKey, setReviewsKey] = useState(0);
    const [nearbyHotels, setNearbyHotels] = useState([]);
    const [nearbyHotelLoading, setNearbyHotelLoading] = useState(false);
    const [nearbyHotelChecked, setNearbyHotelChecked] = useState(false);

    useEffect(() => {
        const fetchPlaceDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem('token');

                const placeResponse = await axios.get(apiEndpoints.GET_PLACE_BY_ID(id), {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });

                setPlace(placeResponse.data);

                if (token) {
                    try {
                        const favoriteResponse = await axios.get(
                            apiEndpoints.CHECK_FAVORITE(id),
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setIsFavorite(favoriteResponse.data?.isFavorite ?? favoriteResponse.data);
                    } catch { /* ignore */ }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load place details');
                toast.error('Failed to load place details');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPlaceDetails();
    }, [id]);

    const handleReviewSubmitted = () => setReviewsKey(prev => prev + 1);

    const handleDirections = () => {
        if (!place?.latitude || !place?.longitude) { toast.error('Location not available'); return; }
        navigate('/map', {
            state: { destination: { lat: place.latitude, lng: place.longitude, name: place.name } }
        });
    };

    const handleNearbyHotels = async () => {
        if (!place?.latitude || !place?.longitude) { toast.error('Location not available'); return; }
        try {
            setNearbyHotelLoading(true);
            setNearbyHotelChecked(true);
            const res = await axios.get(apiEndpoints.NEARBY_HOTELS, {
                params: { lat: place.latitude, lon: place.longitude, radius: 5 }
            });
            setNearbyHotels(res.data?.content || res.data || []);
        } catch { toast.error('Failed to load nearby hotels'); }
        finally { setNearbyHotelLoading(false); }
    };

    // ── Loading ──
    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
                <Skeleton className="h-8 w-32 rounded-xl" />
                <Skeleton className="h-[440px] w-full rounded-2xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error || !place) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md space-y-4">
                    <p className="text-5xl">📍</p>
                    <h2 className="text-2xl font-bold text-gray-800">Place Not Found</h2>
                    <p className="text-gray-500">{error || 'The place you are looking for does not exist.'}</p>
                    <Button onClick={() => navigate('/places')} className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Places
                    </Button>
                </div>
            </div>
        );
    }

    const images = place.imageUrls?.length ? place.imageUrls : (place.imageUrl ? [place.imageUrl] : []);

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* Top actions */}
            <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Places
                    </button>

                    <button
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
                        onClick={async () => {
                            try {
                                await navigator.clipboard.writeText(window.location.href);
                                toast.success('Link copied!');
                            } catch {
                                toast.error('Failed to copy link');
                            }
                        }}
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                </div>
            </div>

            {/* Image Gallery */}
            <div className="max-w-7xl mx-auto px-4">
                <ImageGallery images={images} />
            </div>

            {/* Main Layout */}
            <div className="max-w-7xl mx-auto px-4 py-8 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">

                    {/* Left */}
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <PlaceHeader place={place} isFavorite={isFavorite} />
                        </section>

                        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <PlaceInfo place={place} />
                        </section>

                        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <ReviewForm placeId={place.id} onReviewSubmitted={handleReviewSubmitted} />
                        </section>

                        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <ReviewsSection key={reviewsKey} placeId={place.id} />
                        </section>
                    </div>

                    {/* Right */}
                    <div className="space-y-6 lg:sticky lg:top-24">

                        {/* Map */}
                        {place.latitude && place.longitude && (
                            <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                                <MapView
                                    markers={[{
                                        id: place.id,
                                        name: place.name,
                                        latitude: place.latitude,
                                        longitude: place.longitude,
                                        category: place.category,
                                    }]}
                                    center={{ lat: place.latitude, lng: place.longitude }}
                                    zoom={15}
                                    height="280px"
                                />
                                <div className="border-t border-gray-100 p-4 space-y-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-gray-400 font-semibold">
                                            Location
                                        </p>
                                        <p className="mt-1 flex items-start gap-2 text-sm text-gray-700">
                                            <MapPin className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                                            <span>
                                                {[place.address, place.city].filter(Boolean).join(', ') || 'View on map'}
                                            </span>
                                        </p>
                                    </div>
                                    <Button
                                        className="w-full rounded-xl bg-teal-500 text-white hover:bg-teal-600"
                                        onClick={handleDirections}
                                    >
                                        <Navigation className="w-4 h-4 mr-2" />
                                        Get Directions
                                    </Button>
                                </div>
                            </section>
                        )}

                        {/* Nearby Hotels */}
                        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                            <h3 className="mt-2 text-lg font-semibold text-gray-900">Check Nearby Hotels</h3>
                            <p className="mt-1 text-sm text-gray-500">Find hotels around this place within 5 km.</p>
                            <Button
                                variant="outline"
                                className="mt-4 w-full rounded-xl bg-teal-500 text-white hover:bg-teal-600"
                                onClick={handleNearbyHotels}
                                disabled={nearbyHotelLoading}
                            >
                                <Hotel className="w-4 h-4 mr-2" />
                                {nearbyHotelLoading ? 'Searching...' : 'Check Nearby Hotels'}
                            </Button>
                        </section>

                        {/* Nearby Hotels Results */}
                        {nearbyHotelChecked && (
                            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Results</p>
                                        <h3 className="mt-1 text-lg font-semibold text-gray-900">Nearby Hotels</h3>
                                    </div>
                                </div>

                                {nearbyHotelLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                                        ))}
                                    </div>
                                ) : nearbyHotels.length === 0 ? (
                                    <p className="text-sm text-gray-500">No nearby hotels found.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {nearbyHotels.map(h => (
                                            <div
                                                key={h.id}
                                                role="button"
                                                tabIndex={0}
                                                className="flex cursor-pointer gap-3 rounded-2xl border border-gray-100 p-3 transition hover:border-teal-200 hover:bg-teal-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                onClick={() => navigate(`/hotels/${h.id}`)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        navigate(`/hotels/${h.id}`);
                                                    }
                                                }}
                                            >
                                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                                                    {h.imageUrls?.[0] || h.imageUrl ? (
                                                        <img
                                                            src={h.imageUrls?.[0] || h.imageUrl}
                                                            alt={h.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-xl">🏨</div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="line-clamp-1 text-sm font-semibold text-gray-900">{h.name}</p>
                                                    <p className="line-clamp-1 text-xs text-gray-500">{h.city || h.address}</p>
                                                    {h.pricePerNight != null && (
                                                        <p className="mt-1 text-sm font-bold text-teal-700">
                                                            ₹{Number(h.pricePerNight).toLocaleString('en-IN')}/night
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
