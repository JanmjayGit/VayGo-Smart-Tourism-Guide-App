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

    // use place name in image alt text
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
                        onClick={() => {
                            navigator.clipboard?.writeText(window.location.href);
                            toast.success('Link copied!');
                        }}
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                </div>
            </div>

            {/* ImageGallery */}
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

                        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                            <h3 className="mt-2 text-lg font-semibold text-gray-900">
                                Check Nearby Hotels
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Find hotels around this place within 5 km.
                            </p>

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

                        {nearbyHotelChecked && (
                            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.18em] text-gray-400 font-semibold">
                                            Results
                                        </p>
                                        <h3 className="mt-1 text-lg font-semibold text-gray-900">
                                            Nearby Hotels
                                        </h3>
                                    </div>
                                </div>

                                {nearbyHotelLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                                        ))}
                                    </div>
                                ) : nearbyHotels.length === 0 ? (
                                    <p className="text-sm text-gray-500">No nearby hotels found.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {nearbyHotels.map((h) => (
                                            <div
                                                key={h.id}
                                                className="flex gap-3 rounded-2xl border border-gray-100 p-3 cursor-pointer transition hover:border-teal-200 hover:bg-teal-50/50"
                                                onClick={() => navigate(`/hotels/${h.id}`)}
                                            >
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                                                    {(h.imageUrls?.[0] || h.imageUrl) ? (
                                                        <img
                                                            src={h.imageUrls?.[0] || h.imageUrl}
                                                            alt={h.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xl">
                                                            🏨
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                                                        {h.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 line-clamp-1">
                                                        {h.city || h.address}
                                                    </p>
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

                {/* {place.latitude && place.longitude && (
                    <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                        <NearbyPlaces
                            currentPlaceId={place.id}
                            latitude={place.latitude}
                            longitude={place.longitude}
                        />
                    </div>
                )} */}
            </div>
        </div>
    );

}



// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//     ArrowLeft, Loader2, Navigation, Hotel,
//     Star, MapPin, Share2, Heart, ChevronLeft
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Badge } from '@/components/ui/badge';
// import { toast } from 'sonner';
// import axios from 'axios';
// import apiEndpoints from '@/util/apiEndpoints';

// import ImageCarousel from '@/components/place-details/ImageCarousel';
// import PlaceHeader from '@/components/place-details/PlaceHeader';
// import PlaceInfo from '@/components/place-details/PlaceInfo';
// import ReviewsSection from '@/components/place-details/ReviewsSection';
// import NearbyPlaces from '@/components/place-details/NearbyPlaces';
// import ReviewForm from '@/components/reviews/ReviewForm';
// import MapView from '@/components/map/MapView';
// import ImageGallery from '@/components/hotel-details/ImageGallery';

// export default function PlaceDetails() {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const [place, setPlace] = useState(null);
//     const [isFavorite, setIsFavorite] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [reviewsKey, setReviewsKey] = useState(0);
//     const [nearbyHotels, setNearbyHotels] = useState([]);
//     const [nearbyHotelLoading, setNearbyHotelLoading] = useState(false);
//     const [nearbyHotelChecked, setNearbyHotelChecked] = useState(false);

//     useEffect(() => {
//         const fetchPlaceDetails = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const token = localStorage.getItem('token');

//                 const placeResponse = await axios.get(apiEndpoints.GET_PLACE_BY_ID(id), {
//                     headers: token ? { Authorization: `Bearer ${token}` } : {}
//                 });

//                 setPlace(placeResponse.data);

//                 if (token) {
//                     try {
//                         const favoriteResponse = await axios.get(
//                             apiEndpoints.CHECK_FAVORITE(id),
//                             { headers: { Authorization: `Bearer ${token}` } }
//                         );
//                         setIsFavorite(favoriteResponse.data?.isFavorite ?? favoriteResponse.data);
//                     } catch { }
//                 }
//             } catch (err) {
//                 setError(err.response?.data?.message || 'Failed to load place details');
//                 toast.error('Failed to load place details');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (id) fetchPlaceDetails();
//     }, [id]);

//     const handleReviewSubmitted = () => setReviewsKey(prev => prev + 1);

//     const handleDirections = () => {
//         if (!place?.latitude || !place?.longitude) { toast.error('Location not available'); return; }
//         navigate('/map', {
//             state: { destination: { lat: place.latitude, lng: place.longitude, name: place.name } }
//         });
//     };

//     const handleNearbyHotels = async () => {
//         if (!place?.latitude || !place?.longitude) { toast.error('Location not available'); return; }
//         try {
//             setNearbyHotelLoading(true);
//             setNearbyHotelChecked(true);
//             const res = await axios.get(apiEndpoints.NEARBY_HOTELS, {
//                 params: { lat: place.latitude, lon: place.longitude, radius: 5 }
//             });
//             setNearbyHotels(res.data?.content || res.data || []);
//         } catch { toast.error('Failed to load nearby hotels'); }
//         finally { setNearbyHotelLoading(false); }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#f8fafc_100%)]">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
//                     <Skeleton className="h-8 w-32 rounded-xl" />
//                     <Skeleton className="h-[440px] w-full rounded-[28px]" />
//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                         <div className="lg:col-span-2 space-y-4">
//                             <Skeleton className="h-8 w-3/4" />
//                             <Skeleton className="h-4 w-1/2" />
//                             <Skeleton className="h-32 w-full rounded-2xl" />
//                         </div>
//                         <Skeleton className="h-64 rounded-[28px]" />
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (error || !place) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-4">
//                 <div className="text-center max-w-md space-y-4 rounded-[28px] bg-white/90 backdrop-blur-xl border border-gray-100 shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-8">
//                     <p className="text-5xl">📍</p>
//                     <h2 className="text-2xl font-bold text-gray-800">Place Not Found</h2>
//                     <p className="text-gray-500">{error || 'The place you are looking for does not exist.'}</p>
//                     <Button onClick={() => navigate('/places')} className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white">
//                         <ArrowLeft className="h-4 w-4 mr-2" />
//                         Back to Places
//                     </Button>
//                 </div>
//             </div>
//         );
//     }

//     const images = place.imageUrls?.length ? place.imageUrls : (place.imageUrl ? [place.imageUrl] : []);

//     return (
//         <div
//             className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.10),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ffffff_28%,#f8fafc_100%)]"
//             style={{ fontFamily: "'Inter', sans-serif" }}
//         >
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
//                 {/* top actions */}
//                 <div className="mb-4 flex items-center justify-between">
//                     <button
//                         onClick={() => navigate(-1)}
//                         className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm backdrop-blur-md transition-all hover:text-gray-900 hover:shadow-md"
//                     >
//                         <ChevronLeft className="w-4 h-4" />
//                         Places
//                     </button>

//                     <button
//                         className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm backdrop-blur-md transition-all hover:text-gray-900 hover:shadow-md"
//                         onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
//                     >
//                         <Share2 className="w-4 h-4" />
//                         Share
//                     </button>
//                 </div>

//                 {/* gallery */}
//                 <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/70 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl">
//                     <ImageGallery images={images} />
//                 </div>

//                 {/* main */}
//                 <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
//                     <div className="lg:col-span-2 space-y-8">
//                         <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 sm:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
//                             <PlaceHeader place={place} isFavorite={isFavorite} />
//                         </section>

//                         <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 sm:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
//                             <PlaceInfo place={place} />
//                         </section>

//                         <div className="flex flex-wrap gap-3">
//                             <Button
//                                 className="rounded-2xl bg-teal-600 px-5 py-6 text-white shadow-[0_14px_30px_rgba(13,148,136,0.24)] transition-all hover:bg-teal-700 hover:shadow-[0_18px_35px_rgba(13,148,136,0.30)]"
//                                 onClick={handleDirections}
//                             >
//                                 <Navigation className="w-4 h-4 mr-2" />
//                                 Get Directions
//                             </Button>

//                             <Button
//                                 variant="outline"
//                                 className="rounded-2xl border-gray-200 bg-white px-5 py-6 text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
//                                 onClick={handleNearbyHotels}
//                                 disabled={nearbyHotelLoading}
//                             >
//                                 <Hotel className="w-4 h-4 mr-2" />
//                                 {nearbyHotelLoading ? 'Searching...' : 'Nearby Hotels'}
//                             </Button>
//                         </div>

//                         {nearbyHotelChecked && (
//                             <section className="rounded-[28px] border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-6 shadow-[0_18px_50px_rgba(20,184,166,0.08)]">
//                                 <p
//                                     className="mb-4 text-lg font-bold text-gray-900"
//                                     style={{ fontFamily: "'Inter Tight', sans-serif" }}
//                                 >
//                                     Nearby Hotels (5 km)
//                                 </p>

//                                 {nearbyHotelLoading ? (
//                                     <div className="space-y-3">
//                                         {[1, 2, 3].map(i => (
//                                             <Skeleton key={i} className="h-16 w-full rounded-2xl" />
//                                         ))}
//                                     </div>
//                                 ) : nearbyHotels.length === 0 ? (
//                                     <p className="text-sm text-gray-500">No nearby hotels found.</p>
//                                 ) : (
//                                     <div className="space-y-3">
//                                         {nearbyHotels.map(h => (
//                                             <div
//                                                 key={h.id}
//                                                 className="flex gap-3 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md cursor-pointer"
//                                                 onClick={() => navigate(`/hotels/${h.id}`)}
//                                             >
//                                                 <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
//                                                     {(h.imageUrls?.[0] || h.imageUrl)
//                                                         ? <img src={h.imageUrls?.[0] || h.imageUrl} alt={h.name} className="w-full h-full object-cover" />
//                                                         : <div className="w-full h-full flex items-center justify-center text-xl">🏨</div>}
//                                                 </div>
//                                                 <div className="min-w-0">
//                                                     <p className="font-semibold text-sm text-gray-900 line-clamp-1">{h.name}</p>
//                                                     <p className="text-xs text-gray-500 line-clamp-1">{h.city || h.address}</p>
//                                                     {h.pricePerNight != null && (
//                                                         <p className="text-sm font-bold text-teal-700">
//                                                             ₹{Number(h.pricePerNight).toLocaleString('en-IN')}/night
//                                                         </p>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </section>
//                         )}

//                         <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 sm:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
//                             <ReviewForm placeId={place.id} onReviewSubmitted={handleReviewSubmitted} />
//                         </section>

//                         <section className="rounded-[28px] border border-white/70 bg-white/85 p-6 sm:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
//                             <ReviewsSection key={reviewsKey} placeId={place.id} />
//                         </section>
//                     </div>

//                     <div>
//                         <div className="sticky top-24 space-y-5">
//                             {place.latitude && place.longitude && (
//                                 <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
//                                     <MapView
//                                         markers={[{
//                                             id: place.id,
//                                             name: place.name,
//                                             latitude: place.latitude,
//                                             longitude: place.longitude,
//                                             category: place.category,
//                                         }]}
//                                         center={{ lat: place.latitude, lng: place.longitude }}
//                                         zoom={15}
//                                         height="280px"
//                                     />
//                                     <div className="border-t border-gray-100 bg-white/95 p-4">
//                                         <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                                             <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50">
//                                                 <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
//                                             </span>
//                                             <span className="line-clamp-2">
//                                                 {[place.address, place.city].filter(Boolean).join(', ') || 'View on map'}
//                                             </span>
//                                         </p>
//                                         <button
//                                             className="mt-3 w-full rounded-xl bg-teal-50 py-2 text-center text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100 hover:text-teal-800"
//                                             onClick={handleDirections}
//                                         >
//                                             Get directions
//                                         </button>
//                                     </div>
//                                 </div>
//                             )}

//                             <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
//                                 <div className="space-y-4">
//                                     {place.rating != null && (
//                                         <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
//                                             <div className="flex items-center gap-2">
//                                                 <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
//                                                 <span className="font-bold text-gray-900">{Number(place.rating).toFixed(1)}</span>
//                                             </div>
//                                             <span className="text-sm text-gray-500">Guest rating</span>
//                                         </div>
//                                     )}

//                                     {place.category && (
//                                         <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs bg-gray-100 text-gray-700 border-0">
//                                             {place.category}
//                                         </Badge>
//                                     )}

//                                     {place.pricePerNight != null && (
//                                         <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
//                                             From{' '}
//                                             <span className="font-bold text-gray-900">
//                                                 ₹{Number(place.pricePerNight).toLocaleString('en-IN')}
//                                             </span>
//                                             /night
//                                         </div>
//                                     )}

//                                     <Button
//                                         className="w-full rounded-2xl bg-teal-600 py-6 text-white shadow-[0_14px_30px_rgba(13,148,136,0.24)] hover:bg-teal-700"
//                                         onClick={handleDirections}
//                                     >
//                                         <Navigation className="w-4 h-4 mr-2" />
//                                         Get Directions
//                                     </Button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {place.latitude && place.longitude && (
//                     <div className="mt-12 rounded-[28px] border border-white/70 bg-white/85 p-6 sm:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
//                         <NearbyPlaces
//                             currentPlaceId={place.id}
//                             latitude={place.latitude}
//                             longitude={place.longitude}
//                         />
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }
