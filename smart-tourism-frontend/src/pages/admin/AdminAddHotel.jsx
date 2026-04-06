import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';

// Room type
const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE', 'FAMILY'];

// Amenity options
const AMENITIES = [
    'WiFi', 'Parking', 'Air Conditioning', 'Swimming Pool',
    'Breakfast', 'Room Service', 'Gym', 'Spa',
    'Restaurant', 'Bar', 'Business Center', 'Laundry',
    'Pet Friendly', 'Rooftop Terrace', '24hr Front Desk', 'Airport Shuttle',
];

// ─── Field helper — defined OUTSIDE the component so it never remounts ────────
function Field({ label, name, type = 'text', placeholder, required, hint, prefix, value, onChange, error }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                {label} {required && <span className="text-rose-500">*</span>}
            </Label>
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
            <div className="relative">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>
                )}
                <Input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`rounded-lg ${prefix ? 'pl-7' : ''} ${error ? 'border-rose-400 focus-visible:ring-rose-300' : 'border-slate-200'}`}
                />
            </div>
            {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
    );
}

// ─── Room row — also outside the component ───────────────────────────────────
function RoomRow({ roomType, data, onChange }) {
    return (
        <div className="grid grid-cols-3 gap-3 py-3 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id={`room-${roomType}`}
                    checked={data.enabled}
                    onChange={e => onChange(roomType, 'enabled', e.target.checked)}
                    className="w-4 h-4 accent-indigo-600"
                />
                <label htmlFor={`room-${roomType}`} className="text-sm font-medium text-slate-700 capitalize">
                    {roomType.charAt(0) + roomType.slice(1).toLowerCase()}
                </label>
            </div>
            <Input
                type="number"
                placeholder="Price / night"
                disabled={!data.enabled}
                value={data.price}
                onChange={e => onChange(roomType, 'price', e.target.value)}
                className="rounded-lg border-slate-200 h-9 text-sm"
            />
            <Input
                type="number"
                placeholder="# of rooms"
                disabled={!data.enabled}
                value={data.count}
                onChange={e => onChange(roomType, 'count', e.target.value)}
                className="rounded-lg border-slate-200 h-9 text-sm"
            />
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminAddHotel() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        name: '', description: '', location: '',
        city: '', address: '', latitude: '', longitude: '',
        pricePerNight: '', starRating: '', phone: '', email: '', websiteUrl: '',
        amenities: [],
    });

    // Room types state: one entry per type
    const [rooms, setRooms] = useState(
        ROOM_TYPES.reduce((acc, t) => ({ ...acc, [t]: { enabled: false, price: '', count: '' } }), {})
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const toggleAmenity = (item) => {
        setForm(prev => ({
            ...prev,
            amenities: prev.amenities.includes(item)
                ? prev.amenities.filter(a => a !== item)
                : [...prev.amenities, item],
        }));
    };

    const handleRoomChange = (type, field, value) => {
        setRooms(prev => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Hotel name is required';
        if (!form.location.trim()) e.location = 'Location is required';
        if (!form.pricePerNight) e.pricePerNight = 'Price per night is required';
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                name: form.name,
                description: form.description,
                city: form.city,
                address: form.address,
                latitude: form.latitude ? parseFloat(form.latitude) : null,
                longitude: form.longitude ? parseFloat(form.longitude) : null,
                pricePerNight: parseFloat(form.pricePerNight),
                rating: form.starRating ? parseFloat(form.starRating) : null,
                imageUrl: imageUrls[0] || null,
                amenities: JSON.stringify(form.amenities),
                verified: true,
                availabilityStatus: true,
            };
            // 1. Create the hotel
            const { data: createdHotel } = await axios.post(apiEndpoints.ADMIN_CREATE_HOTEL, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const hotelId = createdHotel?.id;

            // 2. Create enabled room types
            if (hotelId) {
                const enabledRooms = ROOM_TYPES.filter(t => rooms[t].enabled && rooms[t].price);
                // for (const t of enabledRooms) {
                //     try {
                //         await axios.post(
                //             apiEndpoints.ADMIN_ADD_ROOM(hotelId),
                //             {
                //                 roomType: t,
                //                 pricePerNight: parseFloat(rooms[t].price),
                //                 totalRooms: rooms[t].count ? parseInt(rooms[t].count) : 1,
                //                 availableRooms: rooms[t].count ? parseInt(rooms[t].count) : 1,
                //                 available: true,
                //             },
                //             { headers: { Authorization: `Bearer ${token}` } }
                //         );
                //     } catch {
                //         toast.error(`${t} room type could not be saved. Hotel was created.`);
                //     }
                // }

                for (const t of enabledRooms) {
                    try {
                        await axios.post(
                            apiEndpoints.ADMIN_ADD_ROOM(hotelId),
                            {
                                roomType: t,
                                totalRooms: rooms[t].count ? parseInt(rooms[t].count, 10) : 1,
                                pricePerNight: parseFloat(rooms[t].price),
                                capacity: 2,
                                description: '',
                                amenities: JSON.stringify([]),
                                imageUrls: [],
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    } catch (err) {
                        console.error(`${t} room save error`, err.response?.data || err);
                        toast.error(
                            err.response?.data?.message ||
                            err.response?.data ||
                            `${t} room type could not be saved. Hotel was created.`
                        );
                    }
                }

            }

            setSubmitted(true);
            toast.success('Hotel created and published!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create hotel');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setSubmitted(false);
        setForm({ name: '', description: '', location: '', city: '', address: '', latitude: '', longitude: '', pricePerNight: '', starRating: '', phone: '', email: '', websiteUrl: '', amenities: [] });
        setRooms(ROOM_TYPES.reduce((acc, t) => ({ ...acc, [t]: { enabled: false, price: '', count: '' } }), {}));
        setImageUrls([]);
    };

    if (submitted) return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center space-y-4 max-w-sm">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <h2 className="text-xl font-bold text-slate-900">Hotel Created!</h2>
                <p className="text-slate-500 text-sm">The hotel is now live on the platform.</p>
                <div className="flex gap-3 justify-center">
                    <Button variant="outline" className="rounded-lg" onClick={() => navigate('/hotels')}>View Hotels</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg" onClick={reset}>Add Another</Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-4xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="mb-8">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-700 text-sm flex items-center gap-1 mb-4">
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <h1 className="text-2xl font-bold text-slate-900">Add New Hotel</h1>
                <p className="text-sm text-slate-400 mt-0.5">Hotels added here are immediately published and verified</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Info */}
                <section className="bg-white border border-slate-100 rounded-xl shadow-xs p-6 space-y-4">
                    <h2 className="text-base font-semibold text-slate-800 border-b pb-2">Basic Information</h2>
                    <Field label="Hotel Name" name="name" placeholder="The Leela Palace Jaipur" required
                        value={form.name} onChange={handleChange} error={errors.name} />
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700">Description</Label>
                        <Textarea name="description" value={form.description} onChange={handleChange}
                            placeholder="Describe the hotel, ambiance, unique features..." rows={3}
                            className="rounded-lg border-slate-200 resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Star Rating" name="starRating" type="number" placeholder="1–5"
                            value={form.starRating} onChange={handleChange} />
                        <Field label="Base Price / Night" name="pricePerNight" type="number" placeholder="5000" required
                            prefix="₹" value={form.pricePerNight} onChange={handleChange} error={errors.pricePerNight} />
                    </div>
                </section>

                {/* Location */}
                <section className="bg-white border border-slate-100 rounded-xl shadow-xs p-6 space-y-4">
                    <h2 className="text-base font-semibold text-slate-800 border-b pb-2">Location</h2>
                    <Field label="Location / Area" name="location" placeholder="Civil Lines, Jaipur" required
                        value={form.location} onChange={handleChange} error={errors.location} />
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="City" name="city" placeholder="Jaipur" value={form.city} onChange={handleChange} />
                        <Field label="Address" name="address" placeholder="Street address" value={form.address} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Latitude" name="latitude" type="number" placeholder="26.9124"
                            hint="Get from Google Maps" value={form.latitude} onChange={handleChange} />
                        <Field label="Longitude" name="longitude" type="number" placeholder="75.7873"
                            value={form.longitude} onChange={handleChange} />
                    </div>
                </section>

                {/* Contact */}
                <section className="bg-white border border-slate-100 rounded-xl shadow-xs p-6 space-y-4">
                    <h2 className="text-base font-semibold text-slate-800 border-b pb-2">Contact</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Phone" name="phone" placeholder="+91 98765 43210"
                            value={form.phone} onChange={handleChange} />
                        <Field label="Email" name="email" type="email" placeholder="info@hotel.com"
                            value={form.email} onChange={handleChange} />
                    </div>
                    <Field label="Website" name="websiteUrl" placeholder="https://..." value={form.websiteUrl} onChange={handleChange} />
                </section>

                {/* Amenities */}
                <section className="bg-white border border-slate-100 rounded-xl shadow-xs p-6 space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="text-base font-semibold text-slate-800">Amenities</h2>
                        {form.amenities.length > 0 && (
                            <span className="text-xs text-indigo-600 font-medium">{form.amenities.length} selected</span>
                        )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {AMENITIES.map(item => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => toggleAmenity(item)}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium text-left transition-colors ${form.amenities.includes(item)
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Room Types */}
                <section className="bg-white border border-slate-100 rounded-xl shadow-xs p-6 space-y-3">
                    <h2 className="text-base font-semibold text-slate-800 border-b pb-2">Room Types</h2>
                    <div className="grid grid-cols-3 gap-3 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                        <span>Type</span>
                        <span>Price / Night (₹)</span>
                        <span>Number of Rooms</span>
                    </div>
                    {ROOM_TYPES.map(t => (
                        <RoomRow key={t} roomType={t} data={rooms[t]} onChange={handleRoomChange} />
                    ))}
                    <p className="text-xs text-slate-400">Enable room types by checking the checkbox, then set price and count.</p>
                </section>

                {/* Photos */}
                <section className="bg-white border border-slate-100 rounded-xl shadow-xs p-6 space-y-4">
                    <h2 className="text-base font-semibold text-slate-800 border-b pb-2">Photos</h2>
                    <CloudinaryUpload value={imageUrls} onChange={setImageUrls} />
                </section>

                {/* Submit */}
                <div className="flex gap-3">
                    <Button type="button" variant="outline" className="rounded-lg flex-1" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 font-semibold">
                        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : 'Create & Publish Hotel'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
