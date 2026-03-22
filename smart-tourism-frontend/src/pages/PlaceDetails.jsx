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

// Keep all existing sub-components intact
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

    // 3B fix: pass correct lat/lng as navigation state
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

    // 3A fix: use place name in image alt text, not generic "Place image N"
    const images = place.imageUrls?.length ? place.imageUrls : (place.imageUrl ? [place.imageUrl] : []);

    return (
        <div className="max-w-6xl mx-auto bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* image galley view */}
            <div className="max-w-6xl mx-auto px-4 pt-6 pb-1">
                <div className="flex items-center justify-between mb-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" /> Places
                    </button>
                    <button
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
                        onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
                    >
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                </div>
            </div>

            {/* ── Gallery ── */}
            <div className="max-w-6xl mx-auto px-4">
                <ImageGallery images={images} />
            </div>

            {/* ── Main Content ── */}
            <div className="max-w-6xl mx-auto px-4 py-8 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* ── Left: main info ── */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* PlaceHeader: contains name, rating, category badge */}
                        <PlaceHeader place={place} isFavorite={isFavorite} />

                        {/* Main info: opening hours, description, amenities */}
                        <PlaceInfo place={place} />

                        {/* CTA buttons */}
                        <div className="flex flex-wrap gap-3 pt-1">
                            <Button
                                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-100"
                                onClick={handleDirections}
                            >
                                <Navigation className="w-4 h-4 mr-2" /> Get Directions
                            </Button>
                            <Button
                                variant="outline"
                                className="border-gray-300 rounded-xl hover:border-gray-500"
                                onClick={handleNearbyHotels}
                                disabled={nearbyHotelLoading}
                            >
                                <Hotel className="w-4 h-4 mr-2" />
                                {nearbyHotelLoading ? 'Searching...' : 'Nearby Hotels'}
                            </Button>
                        </div>

                        {/* Nearby Hotels panel */}
                        {nearbyHotelChecked && (
                            <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50">
                                <p className="font-bold text-gray-800 mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                    Nearby Hotels (5 km)
                                </p>
                                {nearbyHotelLoading ? (
                                    <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
                                ) : nearbyHotels.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No nearby hotels found.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {nearbyHotels.map(h => (
                                            <div key={h.id} className="flex gap-3 p-3 rounded-xl bg-white hover:bg-teal-50 cursor-pointer transition-colors border border-transparent hover:border-teal-100" onClick={() => navigate(`/hotels/${h.id}`)}>
                                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                                    {(h.imageUrls?.[0] || h.imageUrl)
                                                        ? <img src={h.imageUrls?.[0] || h.imageUrl} alt={h.name} className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center text-xl">🏨</div>}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-900">{h.name}</p>
                                                    <p className="text-xs text-gray-400">{h.city || h.address}</p>
                                                    {h.pricePerNight != null && (
                                                        <p className="text-teal-700 font-bold text-sm">₹{Number(h.pricePerNight).toLocaleString('en-IN')}/night</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Review Form */}
                        <ReviewForm placeId={place.id} onReviewSubmitted={handleReviewSubmitted} />

                        {/* Reviews Section */}
                        <ReviewsSection key={reviewsKey} placeId={place.id} />
                    </div>

                    {/* ── Right: sticky info card ── */}
                    <div>
                        <div className="sticky top-24 space-y-5">
                            {/* Map card */}
                            {place.latitude && place.longitude && (
                                <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
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
                                    {/* Location label below map */}
                                    <div className="bg-white p-3 border-t border-gray-100">
                                        <p className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                            <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                                            {[place.address, place.city].filter(Boolean).join(', ') || 'View on map'}
                                        </p>
                                        <button
                                            className="mt-2 w-full text-center text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors py-1"
                                            onClick={handleDirections}
                                        >
                                            Get directions →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Quick-info card */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
                                {place.rating != null && (
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                        <span className="font-bold text-gray-900">{Number(place.rating).toFixed(1)}</span>
                                        <span className="text-gray-400 text-sm">Rating</span>
                                    </div>
                                )}
                                {place.category && (
                                    <Badge variant="secondary" className="text-xs">{place.category}</Badge>
                                )}
                                {place.pricePerNight != null && (
                                    <p className="text-sm text-gray-600">
                                        From <span className="font-bold text-gray-900">₹{Number(place.pricePerNight).toLocaleString('en-IN')}</span>/night
                                    </p>
                                )}
                                <Button
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                                    onClick={handleDirections}
                                >
                                    <Navigation className="w-4 h-4 mr-2" /> Get Directions
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nearby Places (full width below) */}
                {place.latitude && place.longitude && (
                    <div className="mt-10">
                        <NearbyPlaces
                            currentPlaceId={place.id}
                            latitude={place.latitude}
                            longitude={place.longitude}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
