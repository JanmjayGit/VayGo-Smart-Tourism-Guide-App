import { useNavigate } from 'react-router-dom';
import { MapPin, X, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

const STATUS_CONFIG = {
    CONFIRMED: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-600', icon: XCircle },
    COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
};

const PAYMENT_CONFIG = {
    PAID: { label: 'Paid', color: 'text-green-600 bg-green-50' },
    UNPAID: { label: 'Unpaid', color: 'text-red-500 bg-red-50' },
    REFUNDED: { label: 'Refunded', color: 'text-purple-600 bg-purple-50' },
};

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Booking Card 
export default function BookingCard({ booking, onCancel }) {
    const navigate = useNavigate();
    const [cancelling, setCancelling] = useState(false);
    const status = STATUS_CONFIG[booking.bookingStatus] || STATUS_CONFIG.PENDING;
    const payment = PAYMENT_CONFIG[booking.paymentStatus] || PAYMENT_CONFIG.UNPAID;
    const StatusIcon = status.icon;

    const canCancel = booking.bookingStatus === 'CONFIRMED' && new Date(booking.checkIn) > new Date();

    const handleCancel = async () => {
        if (!confirm('Cancel this booking?')) return;
        try {
            setCancelling(true);
            await onCancel(booking.id);
            toast.success('Booking cancelled — refund initiated');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row">
                {/* Hotel image */}
                <div
                    className="sm:w-40 h-40 sm:h-auto bg-gray-100 shrink-0 cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/hotels/${booking.hotelId}`)}
                >
                    {booking.hotelImageUrl ? (
                        <img src={booking.hotelImageUrl} alt={booking.hotelName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-linear-to-br from-teal-50 to-gray-100">🏨</div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                            <h3
                                className="font-black text-gray-900 text-lg leading-tight cursor-pointer hover:text-teal-700 transition-colors"
                                style={{ fontFamily: "'Inter Tight', sans-serif" }}
                                onClick={() => navigate(`/hotels/${booking.hotelId}`)}
                            >
                                {booking.hotelName}
                            </h3>
                            {booking.hotelCity && (
                                <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3" /> {booking.hotelCity}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            {/* Booking status */}
                            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${status.color}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {status.label}
                            </span>
                            {/* Payment status */}
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${payment.color}`}>
                                {payment.label}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Room</p>
                            <p className="font-semibold text-gray-800">
                                {booking.roomType?.charAt(0) + booking.roomType?.slice(1).toLowerCase()}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Check-in</p>
                            <p className="font-semibold text-gray-800">{formatDate(booking.checkIn)}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Check-out</p>
                            <p className="font-semibold text-gray-800">{formatDate(booking.checkOut)}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Total</p>
                            <p className="font-black text-gray-900">₹{Number(booking.totalPrice).toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-gray-400">
                            {booking.totalDays} night{booking.totalDays !== 1 ? 's' : ''} · {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                            · Booked {formatDate(booking.createdAt)}
                        </p>
                        {canCancel && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-500 hover:bg-red-50 rounded-xl text-xs"
                                onClick={handleCancel}
                                disabled={cancelling}
                            >
                                {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
