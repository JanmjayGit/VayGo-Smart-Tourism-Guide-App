import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Clock, Building2, Loader2, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

const statusColors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminEventRequests() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [search, setSearch] = useState('');

    const token = localStorage.getItem('token');

    const fetchPending = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(apiEndpoints.ADMIN_PENDING_EVENTS, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: 0, size: 50 }
            });
            setEvents(res.data?.content || res.data || []);
        } catch {
            toast.error('Failed to load pending events');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchPending(); }, [fetchPending]);

    const handleVerify = async (id) => {
        setActionLoading(`verify-${id}`);
        try {
            await axios.patch(apiEndpoints.ADMIN_VERIFY_EVENT(id), {}, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Event approved and published!');
            setEvents(prev => prev.filter(e => e.id !== id));
        } catch { toast.error('Failed to approve event'); }
        finally { setActionLoading(null); }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject and remove this submitted event?')) return;
        setActionLoading(`reject-${id}`);
        try {
            await axios.delete(apiEndpoints.ADMIN_REJECT_EVENT(id), { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Event rejected');
            setEvents(prev => prev.filter(e => e.id !== id));
        } catch { toast.error('Failed to reject event'); }
        finally { setActionLoading(null); }
    };

    const filtered = events.filter(e =>
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.city?.toLowerCase().includes(search.toLowerCase()) ||
        e.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 max-w-6xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                        Event Verification Requests
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">Review and approve user-submitted events</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className="bg-teal-50 text-black border-teal-200 border">
                        <Clock className="w-3.5 h-3.5 mr-1.5" /> {events.length} Pending
                    </Badge>
                    <Button variant="outline" size="sm" onClick={fetchPending} className="rounded-xl gap-2 bg-gray-800 text-white border-gray-800">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, city, or category..."
                    className="pl-10 rounded-xl border-gray-200" />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p className="font-semibold text-gray-600">No pending event requests</p>
                    <p className="text-sm text-gray-400">All caught up!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(event => (
                        <div key={event.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                {/* Image */}
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                    {event.imageUrl
                                        ? <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-2xl">🎪</div>}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight">{event.name}</h3>
                                            <div className="flex flex-wrap gap-2 mt-1.5">
                                                {event.category && <Badge variant="secondary" className="text-xs">{event.category}</Badge>}
                                                {event.city && <span className="text-xs text-gray-400 flex items-center gap-0.5">📍 {event.city}</span>}
                                                {event.eventDate && <span className="text-xs text-gray-400">📅 {event.eventDate}</span>}
                                                {event.isFree && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border text-xs">Free</Badge>}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 shrink-0">
                                            ID #{event.id}
                                        </div>
                                    </div>
                                    {event.description && (
                                        <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{event.description}</p>
                                    )}
                                    {event.organizerName && (
                                        <p className="text-xs text-gray-400 mt-1">Organizer: {event.organizerName} {event.organizerContact && `· ${event.organizerContact}`}</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                                <span className="text-xs text-gray-400">
                                    Submitted by User #{event.submittedByUserId || 'Unknown'}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="rounded-xl text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 gap-1.5"
                                        onClick={() => handleReject(event.id)}
                                        disabled={actionLoading === `reject-${event.id}`}
                                    >
                                        {actionLoading === `reject-${event.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                                        onClick={() => handleVerify(event.id)}
                                        disabled={actionLoading === `verify-${event.id}`}
                                    >
                                        {actionLoading === `verify-${event.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
