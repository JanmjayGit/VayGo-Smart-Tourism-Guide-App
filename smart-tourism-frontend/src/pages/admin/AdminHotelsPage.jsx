import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Hotel, CheckCircle2, XCircle, Trash2, Loader2,
    RefreshCw, MapPin, Star, DollarSign, User, Clock, Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';

// Tabs
const TABS = [
    { id: 'pending', label: 'Pending Review', badge: true },
    { id: 'verified', label: 'All Verified Hotels' },
];

// Status badge
function StatusBadge({ verified }) {
    return verified
        ? <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">Verified</Badge>
        : <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs">Pending Review</Badge>;
}

// Hotel row
function HotelRow({ hotel, onVerify, onReject, onDelete, verifying, onEdit }) {
    const navigate = useNavigate();
    return (
        <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {hotel.imageUrl
                            ? <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
                            : <Hotel className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                        }
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800">{hotel.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{hotel.city || '—'}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">
                {hotel.city || '—'}
            </td>
            <td className="px-4 py-3 text-sm text-slate-700 font-medium">
                {hotel.pricePerNight ? `₹${Number(hotel.pricePerNight).toLocaleString('en-IN')}` : '—'}
            </td>
            <td className="px-4 py-3">
                <StatusBadge verified={hotel.verified} />
            </td>
            <td className="px-4 py-3 text-xs text-slate-500">
                {/* {hotel.submittedByUserId ? `User #${hotel.submittedByUserId}` : 'Admin'} */}
                {hotel.submittedByUsername || 'Admin'}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    {!hotel.verified && (
                        <Button
                            size="sm"
                            className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            onClick={() => onVerify(hotel.id)}
                            disabled={verifying === hotel.id}
                        >
                            {verifying === hotel.id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <><CheckCircle2 className="w-3 h-3 mr-1" />Approve</>
                            }
                        </Button>
                    )}

                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-gray-700 hover:text-white"
                        onClick={() => onEdit(hotel)}
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-xs border-slate-200 text-white bg-gray-800 hover:bg-gray-700"
                        onClick={() => navigate(`/hotels/${hotel.id}`)}
                    >
                        View
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => !hotel.verified ? onReject(hotel.id) : onDelete(hotel.id)}
                        title={!hotel.verified ? 'Reject submission' : 'Delete hotel'}
                    >
                        {!hotel.verified ? <XCircle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                </div>
            </td>
        </tr>
    );
}


function RoomEditorCard({ room, index, onFieldChange, onToggleAmenity, onRemove }) {
    const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE', 'FAMILY'];

    const AMENITIES = [
        'WiFi', 'Parking', 'Air Conditioning', 'Swimming Pool',
        'Breakfast', 'Room Service', 'Gym', 'Spa',
        'Restaurant', 'Bar', 'Business Center', 'Laundry',
        'Pet Friendly', 'Rooftop Terrace', '24hr Front Desk', 'Airport Shuttle',
    ];

    return (
        <div className="rounded-xl border border-slate-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800">
                    Room {index + 1}
                </h4>
                <Button
                    type="button"
                    variant="ghost"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => onRemove(index)}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-slate-600">Room Type</label>
                    <select
                        className="w-full border rounded-lg p-2 mt-1 bg-white"
                        value={room.roomType}
                        onChange={(e) => onFieldChange(index, 'roomType', e.target.value)}
                    >
                        {ROOM_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-sm text-slate-600">Price Per Night</label>
                    <input
                        type="number"
                        className="w-full border rounded-lg p-2 mt-1"
                        value={room.pricePerNight}
                        onChange={(e) => onFieldChange(index, 'pricePerNight', e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-sm text-slate-600">Total Rooms</label>
                    <input
                        type="number"
                        className="w-full border rounded-lg p-2 mt-1"
                        value={room.totalRooms}
                        onChange={(e) => onFieldChange(index, 'totalRooms', e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-sm text-slate-600">Capacity</label>
                    <input
                        type="number"
                        className="w-full border rounded-lg p-2 mt-1"
                        value={room.capacity}
                        onChange={(e) => onFieldChange(index, 'capacity', e.target.value)}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="text-sm text-slate-600">Description</label>
                    <textarea
                        rows="3"
                        className="w-full border rounded-lg p-2 mt-1"
                        value={room.description}
                        onChange={(e) => onFieldChange(index, 'description', e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Room Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {AMENITIES.map((amenity) => {
                        const selected = room.amenities.includes(amenity);
                        return (
                            <button
                                key={amenity}
                                type="button"
                                onClick={() => onToggleAmenity(index, amenity)}
                                className={`px-3 py-2 rounded-lg border text-sm transition ${selected
                                    ? 'bg-indigo-50 text-black border-indigo-600'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                                    }`}
                            >
                                {amenity}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Room Photos</label>
                <CloudinaryUpload
                    value={room.imageUrls || []}
                    onChange={(urls) => onFieldChange(index, 'imageUrls', urls)}
                />
            </div>
        </div>
    );
}



// Main page 
export default function AdminHotelsPage() {
    const [tab, setTab] = useState('pending');
    const [pending, setPending] = useState([]);
    const [verified, setVerified] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(null);
    const [editingHotel, setEditingHotel] = useState(null);
    const [form, setForm] = useState({})

    const [roomsForm, setRoomsForm] = useState([]);
    const [roomsLoading, setRoomsLoading] = useState(false);


    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE', 'FAMILY'];

    const AMENITIES = [
        'WiFi', 'Parking', 'Air Conditioning', 'Swimming Pool',
        'Breakfast', 'Room Service', 'Gym', 'Spa',
        'Restaurant', 'Bar', 'Business Center', 'Laundry',
        'Pet Friendly', 'Rooftop Terrace', '24hr Front Desk', 'Airport Shuttle',
    ];

    // const handleEdit = (hotel) => {

    //     let amenities = []

    //     try {
    //         amenities = hotel.amenities ? JSON.parse(hotel.amenities) : []
    //     } catch {
    //         amenities = []
    //     }

    //     setEditingHotel(hotel)

    //     setForm({

    //         id: hotel.id,
    //         name: hotel.name || "",
    //         description: hotel.description || "",
    //         city: hotel.city || "",
    //         address: hotel.address || "",
    //         latitude: hotel.latitude || "",
    //         longitude: hotel.longitude || "",
    //         contactInfo: hotel.contactInfo || "",
    //         pricePerNight: hotel.pricePerNight || "",
    //         rating: hotel.rating || "",
    //         openingHours: hotel.openingHours || "",
    //         amenities,
    //         imageUrls: hotel.imageUrls || []

    //     })

    // }

    const normalizeRoom = (room) => {
        let amenities = [];

        if (Array.isArray(room.amenities)) {
            amenities = room.amenities;
        } else if (typeof room.amenities === 'string') {
            try {
                amenities = JSON.parse(room.amenities);
            } catch {
                amenities = [];
            }
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

    const addRoomDraft = () => {
        setRoomsForm((prev) => [
            ...prev,
            {
                id: null,
                roomType: 'STANDARD',
                totalRooms: 1,
                availableRooms: 1,
                pricePerNight: '',
                capacity: 2,
                description: '',
                amenities: [],
                imageUrls: [],
            },
        ]);
    };

    const updateRoomField = (index, field, value) => {
        setRoomsForm((prev) =>
            prev.map((room, i) =>
                i === index ? { ...room, [field]: value } : room
            )
        );
    };

    const toggleRoomAmenity = (index, amenity) => {
        setRoomsForm((prev) =>
            prev.map((room, i) => {
                if (i !== index) return room;
                const nextAmenities = room.amenities.includes(amenity)
                    ? room.amenities.filter((a) => a !== amenity)
                    : [...room.amenities, amenity];

                return { ...room, amenities: nextAmenities };
            })
        );
    };

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

        setRoomsForm((prev) => prev.filter((_, i) => i !== index));
    };


    const handleEdit = async (hotel) => {
        let amenities = [];

        if (Array.isArray(hotel.amenities)) {
            amenities = hotel.amenities;
        } else if (typeof hotel.amenities === 'string') {
            try {
                amenities = JSON.parse(hotel.amenities);
            } catch {
                amenities = [];
            }
        }

        setEditingHotel(hotel);
        setRoomsLoading(true);

        setForm({
            id: hotel.id,
            name: hotel.name || '',
            description: hotel.description || '',
            city: hotel.city || '',
            address: hotel.address || '',
            latitude: hotel.latitude ?? '',
            longitude: hotel.longitude ?? '',
            contactInfo: hotel.contactInfo || '',
            pricePerNight: hotel.pricePerNight ?? '',
            rating: hotel.rating ?? '',
            openingHours: hotel.openingHours || '',
            priceRange: hotel.priceRange || '',
            availabilityStatus: hotel.availabilityStatus ?? true,
            amenities,
            imageUrls: hotel.imageUrls?.length
                ? hotel.imageUrls
                : hotel.imageUrl
                    ? [hotel.imageUrl]
                    : [],
        });

        try {
            const res = await axios.get(apiEndpoints.GET_HOTEL_ROOMS(hotel.id), { headers });
            const fetchedRooms = Array.isArray(res.data) ? res.data : [];
            setRoomsForm(fetchedRooms.map(normalizeRoom));
        } catch (err) {
            console.error('Failed to fetch hotel rooms', err.response?.data || err);
            setRoomsForm([]);
            toast.error('Could not load hotel rooms');
        } finally {
            setRoomsLoading(false);
        }
    };



    // const handleUpdate = async () => {

    //     try {

    //         const payload = {

    //             name: form.name,
    //             description: form.description,
    //             city: form.city,
    //             address: form.address,

    //             latitude: Number(form.latitude),
    //             longitude: Number(form.longitude),

    //             contactInfo: form.contactInfo,
    //             pricePerNight: Number(form.pricePerNight),
    //             rating: Number(form.rating),

    //             openingHours: form.openingHours,

    //             amenities: JSON.stringify(form.amenities || []),

    //             imageUrl: form.imageUrls?.[0] || null,
    //             imageUrls: form.imageUrls || []

    //         }

    //         // console.log(payload);

    //         await axios.put(
    //             apiEndpoints.ADMIN_UPDATE_HOTEL(form.id),
    //             payload,
    //             { headers }
    //         )

    //         toast.success("Hotel updated successfully")

    //         setEditingHotel(null)

    //         fetchData()

    //     } catch {

    //         toast.error("Update failed")

    //     }
    // }

    const handleUpdate = async () => {
        try {
            const payload = {
                name: form.name?.trim() || null,
                description: form.description?.trim() || null,
                city: form.city?.trim() || null,
                address: form.address?.trim() || null,
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

            await axios.put(
                apiEndpoints.ADMIN_UPDATE_HOTEL(form.id),
                payload,
                { headers }
            );

            for (const room of roomsForm) {
                const roomPayload = {
                    roomType: room.roomType,
                    totalRooms: Number(room.totalRooms),
                    pricePerNight: Number(room.pricePerNight),
                    capacity: Number(room.capacity),
                    description: room.description || '',
                    amenities: JSON.stringify(room.amenities || []),
                    imageUrls: room.imageUrls || [],
                };

                if (room.id && apiEndpoints.ADMIN_UPDATE_ROOM) {
                    await axios.put(
                        apiEndpoints.ADMIN_UPDATE_ROOM(room.id),
                        roomPayload,
                        { headers }
                    );
                } else {
                    await axios.post(
                        apiEndpoints.ADMIN_ADD_ROOM(form.id),
                        roomPayload,
                        { headers }
                    );
                }
            }

            toast.success('Hotel updated successfully');
            setEditingHotel(null);
            fetchData();
        } catch (err) {
            console.error('Hotel update error', err.response?.data || err);
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };



    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch pending (unverified) hotels
            const pendingRes = await axios.get(apiEndpoints.ADMIN_UNVERIFIED_HOTELS, { headers });
            setPending(pendingRes.data || []);

            // Fetch verified hotels 
            const verifiedRes = await axios.get(apiEndpoints.SEARCH_HOTELS, {
                params: { page: 0, size: 100 },
            });
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
            toast.success('Hotel approved and published!');
            fetchData();
        } catch {
            toast.error('Failed to approve hotel');
        } finally {
            setVerifying(null);
        }
    };

    const handleReject = async (id) => {
        if (!confirm('Reject this hotel submission? It will be deleted.')) return;
        try {
            await axios.delete(apiEndpoints.ADMIN_REJECT_HOTEL(id), { headers });
            toast.success('Submission rejected');
            fetchData();
        } catch {
            toast.error('Failed to reject');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this hotel permanently?')) return;
        try {
            await axios.delete(apiEndpoints.ADMIN_DELETE_HOTEL(id), { headers });
            toast.success('Hotel deleted');
            fetchData();
        } catch {
            toast.error('Failed to delete');
        }
    };

    const rows = tab === 'pending' ? pending : verified;

    return (
        <div className="p-6 max-w-6xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        Hotel Management
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">Review, approve and manage all hotels on the platform</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5 text-xs bg-teal-600 text-white border-teal-600 hover:bg-teal-700 hover:text-white hover:border-teal-7    00">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id
                            ? 'bg-white shadow-sm text-slate-900'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {t.label}
                        {t.badge && pending.length > 0 && (
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
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
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hotel</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">City</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price/Night</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted By</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map(hotel => (
                                <HotelRow
                                    key={hotel.id}
                                    hotel={hotel}
                                    onVerify={handleVerify}
                                    onReject={handleReject}
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                    verifying={verifying}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {editingHotel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
                    <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl max-h-[92vh] overflow-y-auto">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800">Edit Hotel</h2>
                                <p className="text-sm text-slate-400 mt-0.5">
                                    Update hotel information, amenities, availability, and photos
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                className="text-slate-500 hover:text-slate-800"
                                onClick={() => setEditingHotel(null)}
                            >
                                Close
                            </Button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Basic Info */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b pb-2">
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-slate-600">Hotel Name</label>
                                        <input
                                            className="w-full border rounded-lg p-2 mt-1"
                                            value={form.name || ''}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-slate-600">Description</label>
                                        <textarea
                                            className="w-full border rounded-lg p-2 mt-1"
                                            rows="4"
                                            value={form.description || ''}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600">City</label>
                                        <input
                                            className="w-full border rounded-lg p-2 mt-1"
                                            value={form.city || ''}
                                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Contact Info</label>
                                        <input
                                            className="w-full border rounded-lg p-2 mt-1"
                                            value={form.contactInfo || ''}
                                            onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-slate-600">Address</label>
                                        <input
                                            className="w-full border rounded-lg p-2 mt-1"
                                            value={form.address || ''}
                                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Location */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b pb-2">
                                    Location
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-slate-600">Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            className="w-full border rounded-lg p-2 mt-1"
                                            value={form.latitude ?? ''}
                                            onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-600">Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            className="w-full border rounded-lg p-2 mt-1"
                                            value={form.longitude ?? ''}
                                            onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Hotel Details */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b pb-2">
                                    Hotel Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-slate-600">Price Per Night</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2 mt-1"
                                            value={form.pricePerNight ?? ''}
                                            onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-600">Rating</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="5"
                                            className="w-full border rounded-lg p-2 mt-1"
                                            value={form.rating ?? ''}
                                            onChange={(e) => setForm({ ...form, rating: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-600">Price Range</label>
                                        <select
                                            className="w-full border rounded-lg p-2 mt-1 bg-white"
                                            value={form.priceRange ?? ''}
                                            onChange={(e) => setForm({ ...form, priceRange: e.target.value })}
                                        >
                                            <option value="">Select price range</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-600">Availability Status</label>
                                        <select
                                            className="w-full border rounded-lg p-2 mt-1 bg-white"
                                            value={form.availabilityStatus ? 'true' : 'false'}
                                            onChange={(e) =>
                                                setForm({ ...form, availabilityStatus: e.target.value === 'true' })
                                            }
                                        >
                                            <option value="true">Available</option>
                                            <option value="false">Unavailable</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm text-slate-600">Opening Hours</label>
                                        <input
                                            className="w-full border rounded-lg p-2 mt-1"
                                            value={form.openingHours || ''}
                                            onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </section>
                            <section className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                        Room Types
                                    </h3>
                                    <Button
                                        type="button"
                                        onClick={addRoomDraft}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        Add Room Type
                                    </Button>
                                </div>

                                {roomsLoading ? (
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading rooms...
                                    </div>
                                ) : roomsForm.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
                                        No room types added yet.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {roomsForm.map((room, index) => (
                                            <RoomEditorCard
                                                key={room.id || `draft-${index}`}
                                                room={room}
                                                index={index}
                                                onFieldChange={updateRoomField}
                                                onToggleAmenity={toggleRoomAmenity}
                                                onRemove={removeRoomDraft}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>


                            {/* Amenities */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b pb-2">
                                    Amenities
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {AMENITIES.map((a) => {
                                        const selected = form.amenities?.includes(a);

                                        return (
                                            <button
                                                type="button"
                                                key={a}
                                                onClick={() => {
                                                    let updated = form.amenities || [];
                                                    updated = updated.includes(a)
                                                        ? updated.filter((x) => x !== a)
                                                        : [...updated, a];

                                                    setForm({ ...form, amenities: updated });
                                                }}
                                                className={`px-3 py-2 rounded-lg border text-sm transition ${selected
                                                    ? 'bg-indigo-50 text-black border-indigo-600'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                                                    }`}
                                            >
                                                {a}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Photos */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b pb-2">
                                    Hotel Photos
                                </h3>

                                <CloudinaryUpload
                                    value={form.imageUrls || []}
                                    onChange={(urls) => setForm({ ...form, imageUrls: urls })}
                                />
                            </section>
                        </div>

                        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4">
                            <Button
                                variant="outline"
                                className="bg-teal-50 border-teal-500 text-black hover:bg-teal-500 hover:text-white"
                                onClick={() => setEditingHotel(null)}
                            >
                                Cancel
                            </Button>

                            <Button
                                className="bg-gray-800 hover:bg-gray-700"
                                onClick={handleUpdate}
                            >
                                Update Hotel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
