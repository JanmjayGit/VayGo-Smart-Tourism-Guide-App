import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

// Components
import ImageCarousel from '@/components/place-details/ImageCarousel';
import PlaceHeader from '@/components/place-details/PlaceHeader';
import PlaceInfo from '@/components/place-details/PlaceInfo';
import ReviewsSection from '@/components/place-details/ReviewsSection';
import NearbyPlaces from '@/components/place-details/NearbyPlaces';
import ReviewForm from '@/components/reviews/ReviewForm';

export default function PlaceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [place, setPlace] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewsKey, setReviewsKey] = useState(0);

    useEffect(() => {
        const fetchPlaceDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem('token');

                // Fetch place details
                const placeResponse = await axios.get(apiEndpoints.GET_PLACE_BY_ID(id), {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });

                setPlace(placeResponse.data);

                // Check if favorited (only if logged in)
                if (token) {
                    try {
                        const favoriteResponse = await axios.get(
                            apiEndpoints.CHECK_FAVORITE_STATUS(id),
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setIsFavorite(favoriteResponse.data);
                    } catch (err) {
                        // Ignore favorite check errors
                        console.log('Could not check favorite status');
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load place details');
                toast.error('Failed to load place details');
                console.error('Place details error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPlaceDetails();
        }
    }, [id]);

    const handleReviewSubmitted = () => {
        // Refresh reviews section
        setReviewsKey(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading place details...</p>
                </div>
            </div>
        );
    }

    if (error || !place) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-2">Place Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        {error || 'The place you are looking for does not exist.'}
                    </p>
                    <Button onClick={() => navigate('/places')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Places
                    </Button>
                </div>
            </div>
        );
    }

    // Prepare images array
    const images = place.imageUrl
        ? [place.imageUrl, ...(place.additionalImages || [])]
        : [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Button */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                {/* Image Carousel */}
                <div className="mb-6">
                    <ImageCarousel images={images} />
                </div>

                {/* Place Header */}
                <PlaceHeader place={place} isFavorite={isFavorite} />

                {/* Content Grid - Desktop: 2 columns, Mobile: 1 column */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Main Content - Takes 2 columns on desktop */}
                    <div className="lg:col-span-2 space-y-6">
                        <PlaceInfo place={place} />

                        {/* Review Form */}
                        <ReviewForm
                            placeId={place.id}
                            onReviewSubmitted={handleReviewSubmitted}
                        />

                        {/* Reviews Section */}
                        <ReviewsSection key={reviewsKey} placeId={place.id} />
                    </div>

                    {/* Sidebar - Takes 1 column on desktop, hidden on mobile */}
                    <div className="hidden lg:block">
                        {/* You can add additional widgets here if needed */}
                        {/* For now, PlaceInfo contains all the sidebar content */}
                    </div>
                </div>

                {/* Nearby Places */}
                {place.latitude && place.longitude && (
                    <NearbyPlaces
                        currentPlaceId={place.id}
                        latitude={place.latitude}
                        longitude={place.longitude}
                    />
                )}
            </div>
        </div>
    );
}
