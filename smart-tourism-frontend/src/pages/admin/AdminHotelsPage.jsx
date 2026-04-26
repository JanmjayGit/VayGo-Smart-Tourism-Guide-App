import { useState, useEffect, useCallback } from 'react';
import { Hotel, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import HotelRow from '@/components/admin/HotelRow';
import HotelEditModal from '@/components/admin/HotelEditModal';

const TABS = [
    { id: 'pending', label: 'Pending Review', badge: true },
    { id: 'verified', label: 'All Verified Hotels' },
];

export default function AdminHotelsPage() {
    const [tab, setTab] = useState('pending');
    const [pending, setPending] = useState([]);
    const [verified, setVerified] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(null);
    const [editingHotel, setEditingHotel] = useState(null);
    const [form, setForm] = useState({});
    const [roomsForm, setRoomsForm] = useState([]);
    const [roomsLoading, setRoomsLoading] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const normalizeRoom = (room) => {
        let amenities = [];
        if (Array.isArray(room.amenities)) amenities = room.amenities;
        else if (typeof room.amenities === 'string') {
            try { amenities = JSON.parse(room.amenities); } catch { amenities = []; }
        }
        return {
            id: room.id || null,
            roomType: room.roomType || 'STANDARD',
            totalRooms: room.totalRooms ?? 1,
            availableRooms: room.availableRooms ?? room.totalRooms ?? 1,
            pricePerNight: room.pricePerNight ?? '',
            capacity: room.capacity ?? 2,
            description: room.description || '',
            amenities,
            imageUrls: room.imageUrls || [],
        };
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pendingRes, verifiedRes] = await Promise.all([
                axios.get(apiEndpoints.ADMIN_UNVERIFIED_HOTELS, { headers }),
                axios.get(apiEndpoints.SEARCH_HOTELS, { params: { page: 0, size: 100 } }),
            ]);
            setPending(pendingRes.data || []);
            setVerified(verifiedRes.data?.content || verifiedRes.data || []);
        } catch {
            toast.error('Failed to load hotels');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleVerify = async (id) => {
        setVerifying(id);
        try {
            await axios.patch(apiEndpoints.ADMIN_VERIFY_HOTEL(id), {}, { headers });
            toast.success('Hotel approved!');
            fetchData();
        } catch { toast.error('Failed to approve hotel'); }
        finally { setVerifying(null); }
    };

    const handleReject = async (id) => {
        if (!confirm('Reject this hotel submission?')) return;
        try {
            await axios.delete(apiEndpoints.ADMIN_REJECT_HOTEL(id), { headers });
            toast.success('Submission rejected');
            fetchData();
        } catch { toast.error('Failed to reject'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this hotel permanently?')) return;
        try {
            await axios.delete(apiEndpoints.ADMIN_DELETE_HOTEL(id), { headers });
            toast.success('Hotel deleted');
            fetchData();
        } catch { toast.error('Failed to delete'); }
    };

    const handleEdit = async (hotel) => {
        let amenities = [];
        if (Array.isArray(hotel.amenities)) amenities = hotel.amenities;
        else if (typeof hotel.amenities === 'string') {
            try { amenities = JSON.parse(hotel.amenities); } catch { amenities = []; }
        }
        setEditingHotel(hotel);
        setRoomsLoading(true);
        setForm({
            id: hotel.id, name: hotel.name || '', description: hotel.description || '',
            city: hotel.city || '', address: hotel.address || '',
            latitude: hotel.latitude ?? '', longitude: hotel.longitude ?? '',
            contactInfo: hotel.contactInfo || '', pricePerNight: hotel.pricePerNight ?? '',
            rating: hotel.rating ?? '', openingHours: hotel.openingHours || '',
            priceRange: hotel.priceRange || '', availabilityStatus: hotel.availabilityStatus ?? true,
            amenities,
            imageUrls: hotel.imageUrls?.length ? hotel.imageUrls : hotel.imageUrl ? [hotel.imageUrl] : [],
        });
        try {
            const res = await axios.get(apiEndpoints.GET_HOTEL_ROOMS(hotel.id), { headers });
            setRoomsForm((Array.isArray(res.data) ? res.data : []).map(normalizeRoom));
        } catch {
            setRoomsForm([]);
            toast.error('Could not load hotel rooms');
        } finally { setRoomsLoading(false); }
    };

    const handleUpdate = async () => {
        try {
            const payload = {
                name: form.name?.trim() || null, description: form.description?.trim() || null,
                city: form.city?.trim() || null, address: form.address?.trim() || null,
                latitude: form.latitude !== '' ? Number(form.latitude) : null,
                longitude: form.longitude !== '' ? Number(form.longitude) : null,
                contactInfo: form.contactInfo?.trim() || null,
                pricePerNight: form.pricePerNight !== '' ? Number(form.pricePerNight) : null,
                rating: form.rating !== '' ? Number(form.rating) : null,
                openingHours: form.openingHours?.trim() || null,
                priceRange: form.priceRange !== '' ? Number(form.priceRange) : null,
                availabilityStatus: !!form.availabilityStatus,
                amenities: JSON.stringify(form.amenities || []),
                imageUrl: form.imageUrls?.[0] || null,
                imageUrls: form.imageUrls || [],
            };
            await axios.put(apiEndpoints.ADMIN_UPDATE_HOTEL(form.id), payload, { headers });
            for (const room of roomsForm) {
                const roomPayload = {
                    roomType: room.roomType, totalRooms: Number(room.totalRooms),
                    pricePerNight: Number(room.pricePerNight), capacity: Number(room.capacity),
                    description: room.description || '',
                    amenities: JSON.stringify(room.amenities || []),
                    imageUrls: room.imageUrls || [],
                };
                if (room.id && apiEndpoints.ADMIN_UPDATE_ROOM) {
                    await axios.put(apiEndpoints.ADMIN_UPDATE_ROOM(room.id), roomPayload, { headers });
                } else {
                    await axios.post(apiEndpoints.ADMIN_ADD_ROOM(form.id), roomPayload, { headers });
                }
            }
            toast.success('Hotel updated successfully');
            setEditingHotel(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    // Room form handlers
    const addRoomDraft = () => setRoomsForm(prev => [...prev, {
        id: null, roomType: 'STANDARD', totalRooms: 1, availableRooms: 1,
        pricePerNight: '', capacity: 2, description: '', amenities: [], imageUrls: [],
    }]);

    const updateRoomField = (index, field, value) =>
        setRoomsForm(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));

    const toggleRoomAmenity = (index, amenity) =>
        setRoomsForm(prev => prev.map((r, i) => {
            if (i !== index) return r;
            const next = r.amenities.includes(amenity)
                ? r.amenities.filter(a => a !== amenity)
                : [...r.amenities, amenity];
            return { ...r, amenities: next };
        }));

    const removeRoomDraft = async (index) => {
        const room = roomsForm[index];
        if (room?.id && apiEndpoints.ADMIN_DELETE_ROOM) {
            try {
                await axios.delete(apiEndpoints.ADMIN_DELETE_ROOM(room.id), { headers });
                toast.success('Room deleted');
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to delete room');
                return;
            }
        }
        setRoomsForm(prev => prev.filter((_, i) => i !== index));
    };

    const rows = tab === 'pending' ? pending : verified;

    return (
        <div className="p-6 max-w-6xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Hotel Management</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Review, approve and manage all hotels on the platform</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchData}
                    className="gap-1.5 text-xs bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:text-white">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                            }`}>
                        {t.label}
                        {t.badge && pending.length > 0 && (
                            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {pending.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin" /> Loading hotels...
                    </div>
                ) : rows.length === 0 ? (
                    <div className="text-center py-16">
                        <Hotel className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">
                            {tab === 'pending' ? 'No pending hotel submissions' : 'No verified hotels yet'}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                {['Hotel', 'City', 'Price/Night', 'Status', 'Submitted By', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(hotel => (
                                <HotelRow key={hotel.id} hotel={hotel}
                                    onVerify={handleVerify} onReject={handleReject}
                                    onDelete={handleDelete} onEdit={handleEdit}
                                    verifying={verifying} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {editingHotel && (
                <HotelEditModal
                    form={form} setForm={setForm}
                    roomsForm={roomsForm} roomsLoading={roomsLoading}
                    onAddRoom={addRoomDraft} onFieldChange={updateRoomField}
                    onToggleAmenity={toggleRoomAmenity} onRemoveRoom={removeRoomDraft}
                    onSave={handleUpdate} onClose={() => setEditingHotel(null)}
                />
            )}
        </div>
    );
}