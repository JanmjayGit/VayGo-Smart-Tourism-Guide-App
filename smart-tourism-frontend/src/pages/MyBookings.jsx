import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, MapPin, Clock, Loader2, X, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

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

// // Booking Card 
// function BookingCard({ booking, onCancel }) {
//     const navigate = useNavigate();
//     const [cancelling, setCancelling] = useState(false);
//     const status = STATUS_CONFIG[booking.bookingStatus] || STATUS_CONFIG.PENDING;
//     const payment = PAYMENT_CONFIG[booking.paymentStatus] || PAYMENT_CONFIG.UNPAID;
//     const StatusIcon = status.icon;

//     const canCancel = booking.bookingStatus === 'CONFIRMED' && new Date(booking.checkIn) > new Date();

//     const handleCancel = async () => {
//         if (!confirm('Cancel this booking?')) return;
//         try {
//             setCancelling(true);
//             await onCancel(booking.id);
//             toast.success('Booking cancelled — refund initiated');
//         } catch (err) {
//             toast.error(err.response?.data?.message || 'Failed to cancel booking');
//         } finally {
//             setCancelling(false);
//         }
//     };

//     return (
//         <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
//             <div className="flex flex-col sm:flex-row">
//                 {/* Hotel image */}
//                 <div
//                     className="sm:w-40 h-40 sm:h-auto bg-gray-100 shrink-0 cursor-pointer overflow-hidden"
//                     onClick={() => navigate(`/hotels/${booking.hotelId}`)}
//                 >
//                     {booking.hotelImageUrl ? (
//                         <img src={booking.hotelImageUrl} alt={booking.hotelName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
//                     ) : (
//                         <div className="w-full h-full flex items-center justify-center text-4xl bg-linear-to-br from-teal-50 to-gray-100">🏨</div>
//                     )}
//                 </div>

//                 {/* Info */}
//                 <div className="flex-1 p-5">
//                     <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
//                         <div>
//                             <h3
//                                 className="font-black text-gray-900 text-lg leading-tight cursor-pointer hover:text-teal-700 transition-colors"
//                                 style={{ fontFamily: "'Inter Tight', sans-serif" }}
//                                 onClick={() => navigate(`/hotels/${booking.hotelId}`)}
//                             >
//                                 {booking.hotelName}
//                             </h3>
//                             {booking.hotelCity && (
//                                 <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
//                                     <MapPin className="w-3 h-3" /> {booking.hotelCity}
//                                 </p>
//                             )}
//                         </div>

//                         <div className="flex flex-col items-end gap-1">
//                             {/* Booking status */}
//                             <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${status.color}`}>
//                                 <StatusIcon className="w-3.5 h-3.5" />
//                                 {status.label}
//                             </span>
//                             {/* Payment status */}
//                             <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${payment.color}`}>
//                                 {payment.label}
//                             </span>
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
//                         <div>
//                             <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Room</p>
//                             <p className="font-semibold text-gray-800">
//                                 {booking.roomType?.charAt(0) + booking.roomType?.slice(1).toLowerCase()}
//                             </p>
//                         </div>
//                         <div>
//                             <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Check-in</p>
//                             <p className="font-semibold text-gray-800">{formatDate(booking.checkIn)}</p>
//                         </div>
//                         <div>
//                             <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Check-out</p>
//                             <p className="font-semibold text-gray-800">{formatDate(booking.checkOut)}</p>
//                         </div>
//                         <div>
//                             <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold mb-0.5">Total</p>
//                             <p className="font-black text-gray-900">₹{Number(booking.totalPrice).toLocaleString('en-IN')}</p>
//                         </div>
//                     </div>

//                     <div className="flex flex-wrap items-center justify-between gap-2">
//                         <p className="text-xs text-gray-400">
//                             {booking.totalDays} night{booking.totalDays !== 1 ? 's' : ''} · {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
//                             · Booked {formatDate(booking.createdAt)}
//                         </p>
//                         {canCancel && (
//                             <Button
//                                 size="sm"
//                                 variant="outline"
//                                 className="border-red-300 text-red-500 hover:bg-red-50 rounded-xl text-xs"
//                                 onClick={handleCancel}
//                                 disabled={cancelling}
//                             >
//                                 {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
//                                 Cancel
//                             </Button>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// Main Page 
export default function MyBookings() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');

    const TABS = ['ALL', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        fetchBookings();
    }, [token]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await axios.get(apiEndpoints.GET_MY_BOOKINGS, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data || []);
        } catch (err) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        await axios.delete(apiEndpoints.CANCEL_BOOKING(id), { headers: { Authorization: `Bearer ${token}` } });
        setBookings(prev => prev.map(b => b.id === id
            ? { ...b, bookingStatus: 'CANCELLED', paymentStatus: 'REFUNDED' }
            : b
        ));
    };

    const filtered = activeTab === 'ALL' ? bookings : bookings.filter(b => b.bookingStatus === activeTab);

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-1" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                        My Bookings
                    </h1>
                    <p className="text-gray-500 text-sm">All your hotel reservations in one place.</p>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-5 overflow-x-auto pb-1">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all border ${activeTab === tab
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                    }`}
                            >
                                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                                {tab === 'ALL' && bookings.length > 0 && (
                                    <span className="ml-2 bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {bookings.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-44 w-full rounded-3xl" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 space-y-4">
                        <p className="text-6xl">🏨</p>
                        <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                            {activeTab === 'ALL' ? 'No bookings yet' : `No ${activeTab.toLowerCase()} bookings`}
                        </h3>
                        <p className="text-gray-500">Start planning your next trip!</p>
                        <Button onClick={() => navigate('/hotels')} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6">
                            Browse Hotels
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancel} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
