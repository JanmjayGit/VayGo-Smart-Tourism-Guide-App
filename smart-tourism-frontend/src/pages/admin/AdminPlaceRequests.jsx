import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Clock, Loader2, RefreshCw, Search, MapPin, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

export default function AdminPlaceRequests() {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [search, setSearch] = useState('');
    const [previewPlace, setPreviewPlace] = useState(null);

    const token = localStorage.getItem('token');

    const fetchPending = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(apiEndpoints.ADMIN_PENDING_PLACES, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: 0, size: 50 }
            });
            setPlaces(res.data?.content || res.data || []);
        } catch {
            toast.error('Failed to load pending places');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchPending(); }, [fetchPending]);

    const handleVerify = async (id) => {
        setActionLoading(`verify-${id}`);
        try {
            await axios.patch(apiEndpoints.ADMIN_VERIFY_PLACE(id), {}, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Place approved and published!');
            setPlaces(prev => prev.filter(p => p.id !== id));
            if (previewPlace?.id === id) setPreviewPlace(null);
        } catch { toast.error('Failed to approve place'); }
        finally { setActionLoading(null); }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject and remove this submitted place?')) return;
        setActionLoading(`reject-${id}`);
        try {
            await axios.delete(apiEndpoints.ADMIN_REJECT_PLACE(id), { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Place rejected');
            setPlaces(prev => prev.filter(p => p.id !== id));
            if (previewPlace?.id === id) setPreviewPlace(null);
        } catch { toast.error('Failed to reject place'); }
        finally { setActionLoading(null); }
    };

    const filtered = places.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.city?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 max-w-6xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                        Place Verification Requests
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">Review and approve user-submitted places</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className="bg-indigo-50 text-black border-indigo-500 border">
                        <Clock className="w-3.5 h-3.5 mr-1.5" /> {places.length} Pending
                    </Badge>
                    <Button variant="outline" size="sm" onClick={fetchPending} className="rounded-xl gap-2 bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-500">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, city, or category..."
                    className="pl-10 rounded-xl border-gray-200" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main List */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <CheckCircle2 className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                            <p className="font-semibold text-gray-600">No pending place requests</p>
                            <p className="text-sm text-gray-400">All caught up!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(place => (
                                <div
                                    key={place.id}
                                    className={`bg-white border rounded-2xl p-4 shadow-sm cursor-pointer transition-all ${previewPlace?.id === place.id ? 'border-teal-300 ring-1 ring-teal-200' : 'border-gray-100 hover:shadow-md'}`}
                                    onClick={() => setPreviewPlace(previewPlace?.id === place.id ? null : place)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                            {(place.imageUrl || place.imageUrls?.[0])
                                                ? <img src={place.imageUrl || place.imageUrls[0]} alt={place.name} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-xl">📍</div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{place.name}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {place.category && <Badge variant="secondary" className="text-xs">{place.category}</Badge>}
                                                {place.city && <span className="text-xs text-gray-400"><MapPin className="w-3 h-3 inline mr-0.5" />{place.city}</span>}
                                            </div>
                                        </div>
                                        <Eye className={`w-4 h-4 shrink-0 ${previewPlace?.id === place.id ? 'text-teal-500' : 'text-gray-300'}`} />
                                    </div>

                                    <div className="flex gap-2 mt-3">
                                        <Button size="sm" variant="outline" className="rounded-xl text-red-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex-1 gap-1.5"
                                            onClick={e => { e.stopPropagation(); handleReject(place.id); }}
                                            disabled={actionLoading === `reject-${place.id}`}>
                                            {actionLoading === `reject-${place.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                            Reject
                                        </Button>
                                        <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex-1 gap-1.5"
                                            onClick={e => { e.stopPropagation(); handleVerify(place.id); }}
                                            disabled={actionLoading === `verify-${place.id}`}>
                                            {actionLoading === `verify-${place.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-1">
                    {previewPlace ? (
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm sticky top-6">
                            {/* Image */}
                            <div className="relative h-48 bg-gray-100">
                                {(previewPlace.imageUrls?.length > 0 || previewPlace.imageUrl) ? (
                                    <img
                                        src={previewPlace.imageUrls?.[0] || previewPlace.imageUrl}
                                        alt={previewPlace.name}
                                        className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">📍</div>
                                )}
                                {previewPlace.imageUrls?.length > 1 && (
                                    <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                                        +{previewPlace.imageUrls.length - 1} more
                                    </span>
                                )}
                            </div>
                            <div className="p-4 space-y-3">
                                <h3 className="font-bold text-gray-900" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{previewPlace.name}</h3>
                                {previewPlace.category && <Badge variant="secondary">{previewPlace.category}</Badge>}
                                {previewPlace.description && <p className="text-sm text-gray-500 line-clamp-3">{previewPlace.description}</p>}
                                <div className="space-y-1 text-sm text-gray-600">
                                    {previewPlace.city && <p><span className="font-medium">City:</span> {previewPlace.city}</p>}
                                    {previewPlace.address && <p><span className="font-medium">Address:</span> {previewPlace.address}</p>}
                                    {previewPlace.latitude && <p><span className="font-medium">Coords:</span> {previewPlace.latitude}, {previewPlace.longitude}</p>}
                                    {previewPlace.contactInfo && <p><span className="font-medium">Contact:</span> {previewPlace.contactInfo}</p>}
                                    {previewPlace.submittedByUserId && <p><span className="font-medium">Submitted by:</span> User #{previewPlace.submittedByUserId}</p>}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button size="sm" variant="outline" className="flex-1 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:text-red-600 hover:border-red-300 hover:bg-red-100"
                                        onClick={() => handleReject(previewPlace.id)} disabled={actionLoading?.startsWith('reject')}>
                                        Reject
                                    </Button>
                                    <Button size="sm" className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                                        onClick={() => handleVerify(previewPlace.id)} disabled={actionLoading?.startsWith('verify')}>
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 sticky top-6">
                            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Click a place to preview</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
