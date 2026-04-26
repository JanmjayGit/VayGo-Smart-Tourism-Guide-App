import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Share2, Star, MapPin, Wifi, Car, Waves,
    ChefHat, Dumbbell, CheckCircle2, Navigation, Loader2, Hotel
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import ImageGallery from '@/components/hotel-details/ImageGallery';
import HotelReviews from '@/components/hotel-details/HotelReviews';
import NearbyCard from '@/components/hotel-details/NearbyCard';
import BookingCard, { openRazorpay } from '@/components/hotel-details/BookingCard';
import MapView from '@/components/map/MapView';
import RoomPhotoModal from '@/components/hotel-details/RoomPhotoModal';
import RoomList from '@/components/hotel-details/RoomList';

const TODAY = new Date().toISOString().split('T')[0];
const AMENITY_ICONS = { WiFi: Wifi, Parking: Car, Pool: Waves, Kitchen: ChefHat, Gym: Dumbbell };

export default function HotelDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [hotel, setHotel] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [nearbyHotels, setNearbyHotels] = useState([]);
    const [nearbyLoading, setNearbyLoading] = useState(false);
    const [nearbyChecked, setNearbyChecked] = useState(false);

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [booking, setBooking] = useState(false);

    const [roomGalleryImages, setRoomGalleryImages] = useState([]);
    const [roomGalleryOpen, setRoomGalleryOpen] = useState(false);
    const [roomGalleryIndex, setRoomGalleryIndex] = useState(0);
    const [roomGalleryTitle, setRoomGalleryTitle] = useState('Room Photos');



    useEffect(() => {
        fetchHotel();
    }, [id]);

    useEffect(() => {
        if (!checkIn || !checkOut || !hotel?.id) {
            setAvailableRooms([]);
            setSelectedRoomId(null);
            return;
        }

        if (new Date(checkOut) <= new Date(checkIn)) {
            setAvailableRooms([]);
            setSelectedRoomId(null);
            return;
        }

        fetchAvailableRooms();
    }, [hotel?.id, checkIn, checkOut, guests]);

    const fetchHotel = async () => {
        try {
            setLoading(true);
            setError(null);
            const hotelRes = await axios.get(apiEndpoints.GET_HOTEL_BY_ID(id));
            setHotel(hotelRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load hotel');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableRooms = async () => {
        try {
            setRoomsLoading(true);

            const res = await axios.get(apiEndpoints.GET_AVAILABLE_ROOMS(id), {
                params: { checkIn, checkOut, guests },
            });

            const roomList = Array.isArray(res.data) ? res.data : res.data?.content || [];
            setAvailableRooms(roomList);

            if (!roomList.some((r) => r.id === selectedRoomId)) {
                setSelectedRoomId(roomList[0]?.id || null);
            }
        } catch (err) {
            setAvailableRooms([]);
            setSelectedRoomId(null);
            toast.error(err.response?.data?.message || 'Failed to fetch available rooms');
        } finally {
            setRoomsLoading(false);
        }
    };

    const openRoomPhotos = (room) => {
        const imgs = room?.imageUrls?.length
            ? room.imageUrls
            : hotel?.imageUrls?.length
                ? hotel.imageUrls
                : hotel?.imageUrl
                    ? [hotel.imageUrl]
                    : [];

        if (!imgs.length) {
            toast.info('No room photos available for this room type yet.');
            return;
        }

        setRoomGalleryImages(imgs);
        setRoomGalleryIndex(0);
        setRoomGalleryTitle(`${room.roomType} Room Photos`);
        setRoomGalleryOpen(true);
    };


    const selectRoom = (room) => {
        setSelectedRoomId(room.id);
    };

    const handleNearby = async () => {
        if (!hotel?.latitude || !hotel?.longitude) {
            toast.info('No location data for nearby search');
            return;
        }

        try {
            setNearbyLoading(true);
            setNearbyChecked(true);
            const res = await axios.get(apiEndpoints.NEARBY_HOTELS, {
                params: { lat: hotel.latitude, lon: hotel.longitude, radius: 10 },
            });
            setNearbyHotels((res.data?.content || res.data || []).filter((h) => h.id !== hotel.id).slice(0, 5));
        } catch {
            toast.error('Could not load nearby hotels');
        } finally {
            setNearbyLoading(false);
        }
    };

    const selectedRoom = availableRooms.find((r) => r.id === selectedRoomId) || null;
    const nights = checkIn && checkOut
        ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000))
        : 0;

    const pricePerNight = Number(selectedRoom?.pricePerNight ?? hotel?.pricePerNight ?? 0);
    const total = nights * pricePerNight;
    const canReserve =
        !!checkIn &&
        !!checkOut &&
        nights > 0 &&
        !!selectedRoomId &&
        hotel?.availabilityStatus !== false &&
        !roomsLoading;

    const handleBook = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error('Please login to book');
            navigate('/login');
            return;
        }

        if (!canReserve) {
            toast.error('Please select valid dates and an available room');
            return;
        }

        try {
            setBooking(true);

            const payload = {
                hotelId: Number(id),
                roomId: selectedRoomId,
                checkIn,
                checkOut,
                guests,
            };

            const { data: bookingData } = await axios.post(
                apiEndpoints.CREATE_BOOKING,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await openRazorpay({
                booking: bookingData,
                hotel,
                total,
                onSuccess: async () => {
                    await axios.post(
                        apiEndpoints.PAY_BOOKING(bookingData.id),
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    toast.success('Booking confirmed');
                    navigate('/my-bookings');
                },
            });
        } catch (err) {
            const msg = err.response?.data?.message || 'Booking failed';
            toast.error(msg);
        } finally {
            setBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
                <Skeleton className="h-8 w-32 rounded-xl" />
                <Skeleton className="h-[380px] w-full rounded-3xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                    <Skeleton className="h-[420px] rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error || !hotel) {
        return (
            <div className="text-center py-24 space-y-4">
                <p className="text-gray-500">{error || 'Hotel not found'}</p>
                <Button onClick={() => navigate('/hotels')} variant="outline" className="rounded-xl">
                    Back to Hotels
                </Button>
            </div>
        );
    }

    const images = hotel.imageUrls?.length ? hotel.imageUrls : hotel.imageUrl ? [hotel.imageUrl] : [];
    const isAvailable = hotel.availabilityStatus !== false;

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="max-w-6xl mx-auto px-4 pt-6 pb-1">
                <div className="flex items-center justify-between mb-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" /> Hotels
                    </button>
                    <button
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
                        onClick={() => {
                            navigator.clipboard?.writeText(window.location.href);
                            toast.success('Link copied!');
                        }}
                    >
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4">
                <ImageGallery images={images} />
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-6">
                    <div className="lg:col-span-2 space-y-7">
                        <div className="flex items-start justify-between gap-4 pb-5 border-b border-gray-100">
                            <div className="min-w-0">
                                <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                    {hotel.name}
                                </h1>
                                {(hotel.city || hotel.address) && (
                                    <p className="flex items-center gap-1.5 text-gray-500 text-sm">
                                        <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                                        {[hotel.address, hotel.city].filter(Boolean).join(', ')}
                                    </p>
                                )}
                                {!isAvailable && (
                                    <span className="inline-block mt-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                        Not currently available for booking
                                    </span>
                                )}
                            </div>
                        </div>

                        {hotel.description && (
                            <div className="pb-5 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                    About this property
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm">{hotel.description}</p>
                            </div>
                        )}

                        {hotel.amenities?.length > 0 && (
                            <div className="pb-5 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                    What this place offers
                                </h2>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {hotel.amenities.map((a, i) => {
                                        const Icon = AMENITY_ICONS[a] || CheckCircle2;
                                        return (
                                            <div key={i} className="flex items-center gap-3 text-sm text-gray-700 py-1">
                                                <Icon className="w-5 h-5 text-gray-500 shrink-0" />
                                                <span>{a}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="pb-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                Available Room Types
                            </h2>

                            {!checkIn || !checkOut ? (
                                <p className="text-sm text-gray-500">Select check-in and check-out dates to see available rooms.</p>
                            ) : roomsLoading ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Checking room availability...
                                </div>
                            ) : availableRooms.length === 0 ? (
                                <p className="text-sm text-red-500">No rooms available for the selected dates.</p>
                            ) : (
                                <div className="grid gap-4">
                                    <RoomList
                                        rooms={availableRooms}
                                        hotel={hotel}
                                        selectedRoomId={selectedRoomId}
                                        onSelectRoom={selectRoom}
                                        onViewPhotos={openRoomPhotos}
                                    />
                                </div>

                            )}
                        </div>

                        <div className="flex flex-wrap gap-3 pb-5 border-b border-gray-100">
                            <div className='w-full h-[500px]'>
                                <MapView
                                    markers={[{ lat: hotel.latitude, lng: hotel.longitude, location: hotel.address }]}
                                    center={{ lat: hotel.latitude, lng: hotel.longitude }}
                                    zoom={12}
                                />
                            </div>
                            <Button
                                variant="outline"
                                className="rounded-xl items-center justify-center w-full text-sm bg-teal-600 text-white"
                                onClick={() => navigate('/map', {
                                    state: { destination: { lat: hotel.latitude, lng: hotel.longitude, name: hotel.name } }
                                })}
                            >
                                <Navigation className="w-4 h-4 mr-2" /> Get Directions
                            </Button>


                        </div>

                        {nearbyChecked && !nearbyLoading && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-3">Nearby Hotels</h2>
                                {nearbyHotels.length === 0
                                    ? <p className="text-gray-400 text-sm">No other hotels found within 10 km.</p>
                                    : <div className="grid gap-1">{nearbyHotels.map((h) => <NearbyCard key={h.id} hotel={h} />)}</div>}
                            </div>
                        )}

                        <HotelReviews hotelId={id} />
                    </div>

                    <div>
                        <BookingCard
                            hotel={hotel}
                            rooms={availableRooms}
                            selectedRoom={selectedRoom}
                            selectedRoomId={selectedRoomId}
                            onSelectRoom={setSelectedRoomId}
                            onOpenRoomPhotos={openRoomPhotos}
                            checkIn={checkIn}
                            checkOut={checkOut}
                            guests={guests}
                            onCheckInChange={(value) => {
                                setCheckIn(value);
                                if (checkOut && value >= checkOut) setCheckOut('');
                            }}
                            onCheckOutChange={setCheckOut}
                            onGuestsChange={(value) => setGuests(Math.max(1, value || 1))}
                            onSubmit={handleBook}
                            booking={booking || roomsLoading}
                            nights={nights}
                            total={total}
                            pricePerNight={pricePerNight}
                        />

                    </div>
                </div>
            </div>
            <RoomPhotoModal
                open={roomGalleryOpen}
                images={roomGalleryImages}
                index={roomGalleryIndex}
                title={roomGalleryTitle}
                onClose={() => setRoomGalleryOpen(false)}
                onPrev={() =>
                    setRoomGalleryIndex((prev) =>
                        prev === 0 ? roomGalleryImages.length - 1 : prev - 1
                    )
                }
                onNext={() =>
                    setRoomGalleryIndex((prev) =>
                        prev === roomGalleryImages.length - 1 ? 0 : prev + 1
                    )
                }
                onSelect={setRoomGalleryIndex}
            />

        </div>
    );
}
