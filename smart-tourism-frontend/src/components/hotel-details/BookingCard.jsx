import { Calendar, Users, Star, Loader2, ImageIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const TODAY = new Date().toISOString().split('T')[0];

function loadRazorpay() {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

async function openRazorpay({ booking, hotel, total, onSuccess }) {
    const loaded = await loadRazorpay();
    if (!loaded) {
        toast.error('Payment gateway failed to load. Please try again.');
        return;
    }

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!key) {
        await onSuccess?.();
        return;
    }

    const options = {
        key,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'VayGo Travels',
        description: `Stay at ${hotel.name}`,
        prefill: {},
        theme: { color: '#0d9488' },
        handler: async () => {
            await onSuccess?.();
        },
        modal: {
            ondismiss: () => toast.info('Payment cancelled. Booking remains pending.'),
        },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
}

export default function BookingCard({
    hotel,
    rooms,
    selectedRoom,
    selectedRoomId,
    onSelectRoom,
    onOpenRoomPhotos,
    checkIn,
    checkOut,
    guests,
    onCheckInChange,
    onCheckOutChange,
    onGuestsChange,
    onSubmit,
    booking,
    nights,
    total,
    pricePerNight,
}) {
    return (
        <div className="sticky top-24 bg-white border border-gray-200 rounded-3xl shadow-xl p-6">
            <div className="flex items-baseline gap-1 mb-5">
                <span className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
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
                            onChange={(e) => onCheckInChange(e.target.value)}
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
                            onChange={(e) => onCheckOutChange(e.target.value)}
                            className="w-full text-sm font-semibold text-gray-900 mt-1 focus:outline-none bg-transparent"
                        />
                    </div>
                </div>

                <div className="rounded-2xl border-2 border-gray-200 p-3 focus-within:border-gray-900 transition-colors">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <Users className="w-3 h-3" /> Guests
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={guests}
                        onChange={(e) => onGuestsChange(+e.target.value)}
                        className="w-full text-sm font-semibold text-gray-900 mt-1 focus:outline-none bg-transparent"
                    />
                </div>

                {rooms.length > 0 && (
                    <div className="rounded-2xl border-2 border-gray-200 p-3 space-y-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                            Selected Room
                        </label>

                        {selectedRoom ? (
                            <>
                                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                                    {selectedRoom.imageUrls?.length > 0 ? (
                                        <img
                                            src={selectedRoom.imageUrls[0]}
                                            alt={selectedRoom.roomType}
                                            className="w-full h-40 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-40 flex items-center justify-center text-gray-400">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold text-gray-900">
                                            {selectedRoom.roomType} Room
                                        </p>
                                        <span className="text-sm font-bold text-gray-900">
                                            ₹{Number(selectedRoom.pricePerNight).toLocaleString('en-IN')}/night
                                        </span>
                                    </div>
                                    <p className="text-xs text-teal-600 font-medium">
                                        {selectedRoom.availableRooms} available · up to {selectedRoom.capacity} guests
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 rounded-xl bg-gray-800 text-white"
                                        onClick={() => onOpenRoomPhotos?.(selectedRoom)}
                                    >
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        View Photos
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 rounded-xl bg-teal-600 text-white hover:bg-teal-700"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Selected
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <select
                                value={selectedRoomId || ''}
                                onChange={(e) => onSelectRoom(Number(e.target.value))}
                                className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent"
                            >
                                <option value="">Select a room</option>
                                {rooms.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.roomType} Room — ₹{Number(r.pricePerNight).toLocaleString('en-IN')}/night
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={booking || !hotel.availabilityStatus || !checkIn || !checkOut || nights <= 0 || !selectedRoomId}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl text-base shadow-lg transition-all"
                >
                    {booking ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                    ) : !hotel.availabilityStatus ? (
                        'Not Available'
                    ) : (
                        'Reserve & Pay'
                    )}
                </Button>

                <p className="text-center text-xs text-gray-400">
                    {hotel.availabilityStatus
                        ? nights > 0
                            ? `₹${total.toLocaleString('en-IN')} total · Secure checkout`
                            : 'Select dates to see total'
                        : 'This hotel is not accepting bookings'}
                </p>

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

export { openRazorpay };
