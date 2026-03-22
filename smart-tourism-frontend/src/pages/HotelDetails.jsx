import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Share2, Star, MapPin, Wifi, Car, Waves,
    ChefHat, Dumbbell, CheckCircle2, Calendar, Users,
    Navigation, Loader2, Hotel
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

// ─── Utils ───────────────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0];
const AMENITY_ICONS = { WiFi: Wifi, Parking: Car, Pool: Waves, Kitchen: ChefHat, Gym: Dumbbell };

function loadRazorpay() {
    return new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function HotelDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Hotel data
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Nearby
    const [nearbyHotels, setNearbyHotels] = useState([]);
    const [nearbyLoading, setNearbyLoading] = useState(false);
    const [nearbyChecked, setNearbyChecked] = useState(false);

    // Booking form
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [booking, setBooking] = useState(false);

    // Derived
    const selectedRoom = rooms.find(r => r.id === selectedRoomId) || null;
    const nights = checkIn && checkOut
        ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000))
        : 0;
    const pricePerNight = selectedRoom?.pricePerNight ?? hotel?.pricePerNight ?? 0;
    const total = nights * Number(pricePerNight);
    const availableRooms = rooms.filter(r => r.available !== false && (r.availableRooms === undefined || r.availableRooms > 0));
    const hasNoRooms = !loading && rooms.length === 0;
    const canReserve = checkIn && checkOut && nights > 0 && !!selectedRoomId && !hasNoRooms && hotel?.availabilityStatus !== false;

    // ── Fetch hotel (rooms included in hotel response) ───────────────────────
    useEffect(() => { fetchHotel(); }, [id]);

    const fetchHotel = async () => {
        try {
            setLoading(true);
            setError(null);

            // hotel response already includes rooms[] via withRooms() in HotelServiceImpl
            const hotelRes = await axios.get(apiEndpoints.GET_HOTEL_BY_ID(id));
            const h = hotelRes.data;
            setHotel(h);

            // Use hotel.rooms if present, otherwise try the dedicated endpoint
            let roomList = Array.isArray(h.rooms) ? h.rooms : [];
            if (roomList.length === 0) {
                try {
                    const roomsRes = await axios.get(apiEndpoints.GET_HOTEL_ROOMS(id));
                    roomList = Array.isArray(roomsRes.data)
                        ? roomsRes.data
                        : roomsRes.data?.content || [];
                } catch { /* no rooms endpoint — will show no-rooms state */ }
            }

            setRooms(roomList);

            // Auto-select first available room
            const firstAvail = roomList.find(r => r.available !== false && (r.availableRooms === undefined || r.availableRooms > 0));
            if (firstAvail) setSelectedRoomId(firstAvail.id);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load hotel');
        } finally {
            setLoading(false);
        }
    };

    const handleNearby = async () => {
        if (!hotel?.latitude || !hotel?.longitude) { toast.info('No location data for nearby search'); return; }
        try {
            setNearbyLoading(true);
            setNearbyChecked(true);
            const res = await axios.get(apiEndpoints.NEARBY_HOTELS, {
                params: { lat: hotel.latitude, lon: hotel.longitude, radius: 10 }
            });
            setNearbyHotels((res.data?.content || res.data || []).filter(h => h.id !== hotel.id).slice(0, 5));
        } catch {
            toast.error('Could not load nearby hotels');
        } finally {
            setNearbyLoading(false);
        }
    };

    // ── Book + Razorpay ────────────────────────────────────────────────────────
    const handleBook = async (e) => {
        e.preventDefault();
        if (!token) { toast.error('Please login to book'); navigate('/login'); return; }
        if (!checkIn || !checkOut) { toast.error('Select check-in and check-out dates'); return; }
        if (nights <= 0) { toast.error('Check-out must be after check-in'); return; }
        if (!selectedRoomId) { toast.error('Please select a room type'); return; }

        try {
            setBooking(true);

            const payload = {
                hotelId: Number(id),
                roomId: selectedRoomId,      // always present — required by backend
                checkIn,
                checkOut,
                guests,
            };

            // Step 1: Create booking
            const { data: bookingData } = await axios.post(
                apiEndpoints.CREATE_BOOKING,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Booking created! Redirecting to payment…');

            // Step 2: Razorpay or navigate
            const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
            if (!key) {
                toast.success('🎉 Booking confirmed!');
                navigate('/my-bookings');
                return;
            }

            const rzpLoaded = await loadRazorpay();
            if (!rzpLoaded) {
                toast.error('Payment gateway failed to load. Your booking is saved.');
                navigate('/my-bookings');
                return;
            }

            const options = {
                key,
                amount: Math.round(total * 100),
                currency: 'INR',
                name: 'VayGo Travels',
                description: `${nights} night(s) at ${hotel.name}`,
                order_id: bookingData?.razorpayOrderId || undefined,
                prefill: {},
                theme: { color: '#0d9488' },
                handler: async () => {
                    try {
                        const BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';
                        await axios.patch(
                            `${BASE}/api/bookings/${bookingData.id}/payment`,
                            { paymentStatus: 'PAID', bookingStatus: 'CONFIRMED' },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        toast.success('🎉 Payment successful! Booking confirmed.');
                    } catch {
                        toast.info('Payment received. Check My Bookings for status.');
                    } finally {
                        navigate('/my-bookings');
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast.info('Payment cancelled. Booking is saved as pending.');
                        setBooking(false);
                        navigate('/my-bookings');
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Booking failed';
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
            setBooking(false);
        }
    };

    // ── Loading / Error states ─────────────────────────────────────────────────
    if (loading) return (
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

    if (error || !hotel) return (
        <div className="text-center py-24 space-y-4">
            <p className="text-5xl">🏨</p>
            <p className="text-gray-500">{error || 'Hotel not found'}</p>
            <Button onClick={() => navigate('/hotels')} variant="outline" className="rounded-xl">
                Back to Hotels
            </Button>
        </div>
    );

    const images = hotel.imageUrls?.length ? hotel.imageUrls : hotel.imageUrl ? [hotel.imageUrl] : [];
    const isAvailable = hotel.availabilityStatus !== false;

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* Top bar */}
            <div className="max-w-6xl mx-auto px-4 pt-6 pb-1">
                <div className="flex items-center justify-between mb-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" /> Hotels
                    </button>
                    <button
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium cursor-pointer"
                        onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
                    >
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                </div>
            </div>

            {/* Gallery */}
            <div className="max-w-6xl mx-auto px-4">
                <ImageGallery images={images} />
            </div>

            {/* Main layout */}
            <div className="max-w-6xl mx-auto px-4 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-6">

                    {/* ── LEFT: Hotel info ── */}
                    <div className="lg:col-span-2 space-y-7">

                        {/* Title */}
                        <div className="flex items-start justify-between gap-4 pb-5 border-b border-gray-100">
                            <div className="min-w-0">
                                <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight"
                                    style={{ fontFamily: "'Inter Tight', sans-serif" }}>
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
                            {hotel.rating != null && (
                                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-2xl shrink-0">
                                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    <span className="font-bold text-gray-800">{Number(hotel.rating).toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {hotel.description && (
                            <div className="pb-5 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-2"
                                    style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                    About this property
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-sm">{hotel.description}</p>
                            </div>
                        )}

                        {/* Amenities */}
                        {hotel.amenities?.length > 0 && (
                            <div className="pb-5 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-3"
                                    style={{ fontFamily: "'Inter Tight', sans-serif" }}>
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

                        {/* Room types */}
                        {rooms.length > 0 && (
                            <div className="pb-5 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-3"
                                    style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                    Available Room Types
                                </h2>
                                <div className="grid gap-3">
                                    {rooms.map(room => (
                                        <button
                                            key={room.id}
                                            type="button"
                                            onClick={() => room.available !== false && setSelectedRoomId(room.id)}
                                            disabled={room.available === false}
                                            className={`text-left p-4 rounded-2xl border-2 transition-all ${selectedRoomId === room.id
                                                ? 'border-teal-500 bg-teal-50'
                                                : room.available === false
                                                    ? 'border-gray-100 opacity-50 cursor-not-allowed'
                                                    : 'border-gray-200 hover:border-gray-400 cursor-pointer'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">
                                                        {room.roomType
                                                            ? room.roomType.charAt(0) + room.roomType.slice(1).toLowerCase() + ' Room'
                                                            : 'Standard Room'}
                                                    </p>
                                                    {room.description && <p className="text-gray-500 text-xs mt-0.5">{room.description}</p>}
                                                    <p className={`text-xs mt-1 font-medium ${room.available === false ? 'text-red-500' : 'text-teal-600'}`}>
                                                        {room.available === false
                                                            ? 'Fully booked'
                                                            : room.availableRooms != null
                                                                ? `${room.availableRooms} available`
                                                                : 'Available'
                                                        }
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-bold text-gray-900">
                                                        ₹{Number(room.pricePerNight || hotel.pricePerNight || 0).toLocaleString('en-IN')}
                                                    </p>
                                                    <p className="text-xs text-gray-400">/ night</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 pb-5 border-b border-gray-100">
                            <Button
                                variant="outline"
                                className="border-gray-300 rounded-xl text-sm bg-gray-900 text-white"
                                onClick={() => navigate('/map', {
                                    state: { destination: { lat: hotel.latitude, lng: hotel.longitude, name: hotel.name } }
                                })}
                            >
                                <Navigation className="w-4 h-4 mr-2" /> Get Directions
                            </Button>
                            <Button
                                variant="outline"
                                className="border-gray-300 rounded-xl text-sm"
                                onClick={handleNearby}
                                disabled={nearbyLoading}
                            >
                                {nearbyLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Hotel className="w-4 h-4 mr-2" />}
                                Nearby Hotels
                            </Button>
                        </div>

                        {/* Nearby hotels */}
                        {nearbyChecked && !nearbyLoading && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-3">Nearby Hotels</h2>
                                {nearbyHotels.length === 0
                                    ? <p className="text-gray-400 text-sm">No other hotels found within 10 km.</p>
                                    : <div className="grid gap-1">{nearbyHotels.map(h => <NearbyCard key={h.id} hotel={h} />)}</div>
                                }
                            </div>
                        )}

                        {/* Reviews */}
                        <HotelReviews hotelId={id} />
                    </div>

                    {/* ── RIGHT: Booking card ── */}
                    <div>
                        <form
                            onSubmit={handleBook}
                            className="sticky top-24 bg-white border border-gray-200 rounded-3xl shadow-xl p-6 space-y-3"
                        >
                            {/* Price */}
                            <div className="flex items-baseline gap-1 mb-5">
                                <span className="text-2xl font-black text-gray-900"
                                    style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                    ₹{Number(pricePerNight).toLocaleString('en-IN')}
                                </span>
                                <span className="text-gray-500 text-sm">/ night</span>
                                {hotel.rating != null && (
                                    <span className="ml-auto flex items-center gap-0.5 text-xs text-gray-600">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        {Number(hotel.rating).toFixed(1)}
                                    </span>
                                )}
                            </div>

                            {/* Dates grid */}
                            <div className="grid grid-cols-2 rounded-2xl border-2 border-gray-200 overflow-hidden divide-x divide-gray-200 focus-within:border-gray-900 transition-colors">
                                <div className="p-3">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Check-in
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={checkIn}
                                        min={TODAY}
                                        onChange={e => {
                                            setCheckIn(e.target.value);
                                            // Reset checkout if it's before new check-in
                                            if (checkOut && e.target.value >= checkOut) setCheckOut('');
                                        }}
                                        className="w-full text-sm font-semibold text-gray-900 mt-1 focus:outline-none bg-transparent"
                                    />
                                </div>
                                <div className="p-3">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Check-out
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={checkOut}
                                        min={checkIn || TODAY}
                                        onChange={e => setCheckOut(e.target.value)}
                                        className="w-full text-sm font-semibold text-gray-900 mt-1 focus:outline-none bg-transparent"
                                    />
                                </div>
                            </div>

                            {/* Guests */}
                            <div className="rounded-2xl border-2 border-gray-200 p-3 focus-within:border-gray-900 transition-colors">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    <Users className="w-3 h-3" /> Guests
                                </label>
                                <input
                                    type="number" min={1} max={10} value={guests}
                                    onChange={e => setGuests(Math.max(1, +e.target.value))}
                                    className="w-full text-sm font-semibold text-gray-900 mt-1 focus:outline-none bg-transparent"
                                />
                            </div>

                            {/* Room selector */}
                            {availableRooms.length > 0 && (
                                <div className="rounded-2xl border-2 border-gray-200 p-3 focus-within:border-gray-900 transition-colors">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                                        Room Type
                                    </label>
                                    <select
                                        value={selectedRoomId || ''}
                                        onChange={e => setSelectedRoomId(Number(e.target.value))}
                                        className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent"
                                    >
                                        <option value="">Select a room</option>
                                        {availableRooms.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.roomType
                                                    ? r.roomType.charAt(0) + r.roomType.slice(1).toLowerCase() + ' Room'
                                                    : 'Standard'
                                                } — ₹{Number(r.pricePerNight || hotel.pricePerNight || 0).toLocaleString('en-IN')}/night
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* No-rooms warning */}
                            {hasNoRooms && (
                                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                                    <span className="text-amber-500 mt-0.5 shrink-0">⚠️</span>
                                    <p>
                                        <span className="font-semibold">No rooms configured.</span>{' '}
                                        This hotel hasn't added any bookable rooms yet. Please check back later or contact the hotel directly.
                                    </p>
                                </div>
                            )}

                            {/* Reserve button */}
                            <Button
                                type="submit"
                                disabled={booking || !canReserve}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl text-base shadow-lg transition-all disabled:opacity-50"
                            >
                                {booking
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…</>
                                    : !isAvailable
                                        ? 'Not Available'
                                        : 'Reserve & Pay'
                                }
                            </Button>

                            <p className="text-center text-xs text-gray-400">
                                {!isAvailable
                                    ? 'This hotel is not accepting bookings'
                                    : nights > 0
                                        ? `₹${total.toLocaleString('en-IN')} total · Secure checkout`
                                        : 'Select dates to see the total'
                                }
                            </p>

                            {/* Price breakdown */}
                            {nights > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-gray-600">
                                            <span>₹{Number(pricePerNight).toLocaleString('en-IN')} × {nights} night{nights !== 1 ? 's' : ''}</span>
                                            <span>₹{total.toLocaleString('en-IN')}</span>
                                        </div>
                                        <Separator className="my-1" />
                                        <div className="flex justify-between font-bold text-gray-900 text-base">
                                            <span>Total</span>
                                            <span>₹{total.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}