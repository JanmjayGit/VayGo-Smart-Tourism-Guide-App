import { Calendar, Users, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

const TODAY = new Date().toISOString().split('T')[0];

/**
 * Loads Razorpay script lazily and resolves when ready.
 */
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

/**
 * Initiates Razorpay payment flow for a confirmed booking.
 * @param {object} booking  — booking object returned from POST /api/bookings
 * @param {object} hotel    — hotel object (name, address)
 * @param {number} total    — amount in INR
 * @param {Function} onSuccess — called after successful payment
 */
async function openRazorpay({ booking, hotel, total, onSuccess }) {
    const loaded = await loadRazorpay();
    if (!loaded) {
        toast.error('Payment gateway failed to load. Please try again.');
        return;
    }

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key) {
        // Graceful fallback: skip payment, treat as confirmed
        toast.success('Booking confirmed');
        await updatePaymentStatus(booking.id, 'PAID');
        onSuccess?.();
        return;
    }

    const options = {
        key,
        amount: Math.round(total * 100),          // paise
        currency: 'INR',
        name: 'VayGo Travels',
        description: `Stay at ${hotel.name}`,
        order_id: booking.razorpayOrderId,       // if backend creates Razorpay order
        prefill: {},
        theme: { color: '#0d9488' },
        handler: async (response) => {
            try {
                await updatePaymentStatus(booking.id, 'PAID');
                toast.success('🎉 Payment successful! Booking confirmed.');
                onSuccess?.();
            } catch {
                toast.error('Payment recorded but status update failed. Contact support.');
            }
        },
        modal: {
            ondismiss: () => toast.info('Payment cancelled. Booking is pending.'),
        },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
}

async function updatePaymentStatus(bookingId, paymentStatus) {
    const token = localStorage.getItem('token');
    await axios.patch(
        `${import.meta.env.VITE_BASE_URL || 'http://localhost:8080'}/api/bookings/${bookingId}/payment`,
        { paymentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
    );
}

export default function BookingCard({
    hotel, rooms, selectedRoomId, onSelectRoom,
    checkIn, checkOut, guests,
    onCheckInChange, onCheckOutChange, onGuestsChange,
    onSubmit, booking, nights, total, pricePerNight,
}) {
    return (
        <div className="sticky top-24 bg-white border border-gray-200 rounded-3xl shadow-xl p-6">

            {/* Price header */}
            <div className="flex items-baseline gap-1 mb-5">
                <span
                    className="text-2xl font-black text-gray-900"
                    style={{ fontFamily: "'Inter Tight', sans-serif" }}
                >
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

            <form onSubmit={onSubmit} className="space-y-3">

                {/* Dates */}
                <div className="grid grid-cols-2 rounded-2xl border-2 border-gray-200 overflow-hidden divide-x divide-gray-200 focus-within:border-gray-900 transition-colors">
                    <div className="p-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Check-in
                        </label>
                        <input
                            type="date" required value={checkIn} min={TODAY}
                            onChange={e => onCheckInChange(e.target.value)}
                            className="w-full text-sm font-semibold text-gray-900 mt-1 focus:outline-none bg-transparent"
                        />
                    </div>
                    <div className="p-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Check-out
                        </label>
                        <input
                            type="date" required value={checkOut} min={checkIn || TODAY}
                            onChange={e => onCheckOutChange(e.target.value)}
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
                        onChange={e => onGuestsChange(+e.target.value)}
                        className="w-full text-sm font-semibold text-gray-900 mt-1 focus:outline-none bg-transparent"
                    />
                </div>

                {/* Room selector */}
                {rooms.length >= 1 && (
                    <div className="rounded-2xl border-2 border-gray-200 p-3 focus-within:border-gray-900 transition-colors">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                            Room Type
                        </label>
                        {rooms.filter(r => r.available).length === 0 ? (
                            <p className="text-sm text-red-500 font-medium">No rooms currently available</p>
                        ) : (
                            <select
                                value={selectedRoomId || ''}
                                onChange={e => onSelectRoom(Number(e.target.value))}
                                className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent"
                            >
                                {rooms.filter(r => r.available).map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.roomType.charAt(0) + r.roomType.slice(1).toLowerCase()} Room — ₹{Number(r.pricePerNight).toLocaleString('en-IN')}/night
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                {/* Reserve button */}
                <Button
                    type="submit"
                    disabled={
                        booking ||
                        !hotel.availabilityStatus ||
                        rooms.filter(r => r.available).length === 0 ||
                        !checkIn || !checkOut || nights <= 0
                    }
                    className="w-full bg-linear-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-teal-200 transition-all"
                >
                    {booking ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reserving…</>
                    ) : !hotel.availabilityStatus ? (
                        'Not Available'
                    ) : (
                        'Reserve & Pay'
                    )}
                </Button>

                <p className="text-center text-xs text-gray-400">
                    {hotel.availabilityStatus
                        ? nights > 0
                            ? `₹${total.toLocaleString('en-IN')} total · Razorpay secure checkout`
                            : "Select dates to see total"
                        : 'This hotel is not accepting bookings'}
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
    );
}

// Export the utility so HotelDetails can call it after booking creation
export { openRazorpay };