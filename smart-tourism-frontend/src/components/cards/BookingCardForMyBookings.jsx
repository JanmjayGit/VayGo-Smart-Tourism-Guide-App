import { useNavigate } from 'react-router-dom';
import { MapPin, X, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

const STATUS_CONFIG = {
    CONFIRMED: { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: Clock },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100   text-red-800', icon: XCircle },
    COMPLETED: { label: 'Completed', color: 'bg-blue-100  text-blue-800', icon: CheckCircle2 },
};

const PAYMENT_CONFIG = {
    PAID: { label: 'Paid', color: 'bg-green-50  text-green-700' },
    UNPAID: { label: 'Unpaid', color: 'bg-red-50    text-red-700' },
    REFUNDED: { label: 'Refunded', color: 'bg-purple-50 text-purple-700' },
};

function formatDate(d) {
    if (!d) return '—';

    let date;

    if (Array.isArray(d)) {
        const [year, month, day] = d;
        date = new Date(year, month - 1, day);
    } else {
        date = new Date(d);
    }

    return date.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}


function StatItem({ label, value, valueClass = '' }) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">
                {label}
            </p>
            <p className={`text-sm font-semibold text-gray-800 truncate ${valueClass}`}>
                {value}
            </p>
        </div>
    );
}

export default function BookingCard({ booking, onCancel }) {
    const navigate = useNavigate();
    const [cancelling, setCancelling] = useState(false);

    const status = STATUS_CONFIG[booking.bookingStatus] || STATUS_CONFIG.PENDING;
    const payment = PAYMENT_CONFIG[booking.paymentStatus] || PAYMENT_CONFIG.UNPAID;
    const StatusIcon = status.icon;

    const canCancel =
        booking.bookingStatus === 'CONFIRMED' &&
        new Date(booking.checkIn) > new Date();

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

    const roomLabel = booking.roomType
        ? booking.roomType.charAt(0) + booking.roomType.slice(1).toLowerCase()
        : '—';

    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden
                        hover:border-gray-300 hover:shadow-sm transition-all duration-200">
            <div className="flex flex-col sm:flex-row">

                {/* ── Image — row on sm+, hidden on xs to save space ── */}
                <div
                    className="hidden sm:block sm:w-36 md:w-44 shrink-0 bg-teal-50
                                cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/hotels/${booking.hotelId}`)}
                >
                    {booking.hotelImageUrl ? (
                        <img
                            src={booking.hotelImageUrl}
                            alt={booking.hotelName}
                            className="w-full h-full object-cover hover:scale-105
                                       transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                            🏨
                        </div>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="flex-1 min-w-0 flex flex-col gap-2.5 p-3.5 sm:p-5">

                    {/* Mobile-only image strip */}
                    <div
                        className="sm:hidden w-full h-32 rounded-xl bg-teal-50 overflow-hidden
                                   cursor-pointer mb-0.5"
                        onClick={() => navigate(`/hotels/${booking.hotelId}`)}
                    >
                        {booking.hotelImageUrl ? (
                            <img
                                src={booking.hotelImageUrl}
                                alt={booking.hotelName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                                🏨
                            </div>
                        )}
                    </div>

                    {/* Top row — name + status badge */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <h3
                                className="font-bold text-gray-900 text-[14px] sm:text-[15px]
                                           leading-snug cursor-pointer hover:text-teal-700
                                           transition-colors truncate"
                                onClick={() => navigate(`/hotels/${booking.hotelId}`)}
                            >
                                {booking.hotelName}
                            </h3>
                            {booking.hotelCity && (
                                <p className="text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{booking.hotelCity}</span>
                                </p>
                            )}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`flex items-center gap-1 text-[11px] font-semibold
                                              px-2 py-0.5 rounded-full ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                                              ${payment.color}`}>
                                {payment.label}
                            </span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Stats — 2×2 on mobile, 4-col on lg+ */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2">
                        <StatItem label="Room" value={roomLabel} />
                        <StatItem
                            label="Total"
                            value={`₹${Number(booking.totalPrice).toLocaleString('en-IN')}`}
                            valueClass="font-black text-gray-900"
                        />
                        <StatItem label="Check-in" value={formatDate(booking.checkIn)} />
                        <StatItem label="Check-out" value={formatDate(booking.checkOut)} />
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                            {booking.totalDays} night{booking.totalDays !== 1 ? 's' : ''}
                            {' · '}
                            {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                            {' · '}
                            <span className="hidden xs:inline">Booked </span>
                            {formatDate(booking.createdAt)}
                        </p>

                        {canCancel && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="text-red-500 border border-red-200 hover:bg-red-50
                                           rounded-xl text-[11px] h-7 px-2.5"
                            >
                                {cancelling
                                    ? <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                    : <X className="w-3 h-3 mr-1" />
                                }
                                Cancel
                            </Button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}