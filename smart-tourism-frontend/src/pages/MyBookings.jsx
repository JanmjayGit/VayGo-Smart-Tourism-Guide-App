import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, MapPin, Clock, Loader2, X, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import BookingCardForMyBookings from '@/components/cards/BookingCardForMyBookings';



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
            console.log('Booking sample:', res.data?.[0]);
        } catch (err) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const deriveStatus = (booking) => {
        if (booking.bookingStatus !== 'CONFIRMED') return booking.bookingStatus;

        let checkOut = booking.checkOut;

        if (Array.isArray(checkOut)) {
            const [year, month, day] = checkOut;
            checkOut = new Date(year, month - 1, day);
        } else {
            checkOut = new Date(checkOut);
        }

        return checkOut < new Date() ? 'COMPLETED' : 'CONFIRMED';
    };

    const handleCancel = async (id) => {
        await axios.delete(apiEndpoints.CANCEL_BOOKING(id), { headers: { Authorization: `Bearer ${token}` } });
        setBookings(prev => prev.map(b => b.id === id
            ? { ...b, bookingStatus: 'CANCELLED', paymentStatus: 'REFUNDED' }
            : b
        ));
    };

    const filtered = activeTab === 'ALL'
        ? bookings
        : bookings.filter(b => deriveStatus(b) === activeTab);

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
                        {filtered.map(b => (
                            <BookingCardForMyBookings
                                key={b.id}
                                booking={{ ...b, bookingStatus: deriveStatus(b) }}
                                onCancel={handleCancel}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
