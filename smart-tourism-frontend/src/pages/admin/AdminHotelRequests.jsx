import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Building2, MapPin, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

function RequestCard({ hotel, onApprove, onReject }) {
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);

    const img = hotel.imageUrls?.[0] || hotel.imageUrl;

    const handleApprove = async () => {
        try {
            setApproving(true);
            await onApprove(hotel.id);
            toast.success(`${hotel.name} approved and published`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve');
        } finally { setApproving(false); }
    };

    const handleReject = async () => {
        if (!confirm(`Reject and delete ${hotel.name}? This cannot be undone.`)) return;
        try {
            setRejecting(true);
            await onReject(hotel.id);
            toast.success(`${hotel.name} rejected`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject');
        } finally { setRejecting(false); }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row">
            {/* Image */}
            <div className="sm:w-40 h-36 sm:h-auto bg-gray-100 shrink-0">
                {img ? (
                    <img src={img} alt={hotel.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-linear-to-br from-teal-50 to-gray-100">🏨</div>
                )}
            </div>

            <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight">{hotel.name}</h3>
                        {(hotel.city || hotel.address) && (
                            <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {[hotel.address, hotel.city].filter(Boolean).join(', ')}
                            </p>
                        )}
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 shrink-0">Pending</Badge>
                </div>

                {hotel.description && (
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{hotel.description}</p>
                )}

                {hotel.submittedByUserId && (
                    <p className="text-gray-400 text-xs flex items-center gap-1 mb-4">
                        <User className="w-3 h-3" /> Submitted by user #{hotel.submittedByUserId}
                    </p>
                )}

                <div className="flex gap-2">
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-1.5"
                        onClick={handleApprove}
                        disabled={approving || rejecting}
                    >
                        {approving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-500 hover:bg-red-50 rounded-xl gap-1.5"
                        onClick={handleReject}
                        disabled={approving || rejecting}
                    >
                        {rejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                        Reject
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function AdminHotelRequests() {
    const token = localStorage.getItem('token');
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchUnverified(); }, []);

    const fetchUnverified = async () => {
        try {
            setLoading(true);
            const res = await axios.get(apiEndpoints.ADMIN_UNVERIFIED_HOTELS, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHotels(res.data || []);
        } catch (err) {
            toast.error('Failed to load hotel requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        await axios.patch(apiEndpoints.ADMIN_VERIFY_HOTEL(id), {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setHotels(prev => prev.filter(h => h.id !== id));
    };

    const handleReject = async (id) => {
        await axios.delete(apiEndpoints.ADMIN_REJECT_HOTEL(id), {
            headers: { Authorization: `Bearer ${token}` }
        });
        setHotels(prev => prev.filter(h => h.id !== id));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                        Hotel Requests
                    </h1>
                    <p className="text-gray-500 text-sm">User-submitted hotels awaiting review.</p>
                </div>
                {hotels.length > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1">
                        <Building2 className="w-3.5 h-3.5 mr-1.5" />
                        {hotels.length} pending
                    </Badge>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
                </div>
            ) : hotels.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                    <CheckCircle2 className="mx-auto w-12 h-12 text-green-400" />
                    <h3 className="text-xl font-bold text-gray-700">All caught up!</h3>
                    <p className="text-gray-400 text-sm">No pending hotel submission requests.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {hotels.map(h => (
                        <RequestCard
                            key={h.id}
                            hotel={h}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
