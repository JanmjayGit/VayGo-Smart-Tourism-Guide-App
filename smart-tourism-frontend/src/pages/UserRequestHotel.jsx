import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Loader2, Hotel, MapPin, Sparkles, BedDouble, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';

const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE', 'FAMILY'];
const AMENITIES = [
    'WiFi', 'Parking', 'Air Conditioning', 'Swimming Pool',
    'Breakfast', 'Room Service', 'Gym', 'Spa',
    'Restaurant', 'Bar', 'Business Center', 'Laundry',
];

function Field({ label, name, type = 'text', placeholder, required, hint, prefix, value, onChange, error }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1 ">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {hint && <p className="text-xs text-gray-400">{hint}</p>}
            <div className="relative">
                {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{prefix}</span>}
                <Input
                    type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
                    className={`${prefix ? 'pl-7' : ''} ${error ? 'border-red-400 focus-visible:ring-red-400' : 'border-gray-200'}`}
                />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function SectionCard({ title, children }) {
    return (
        <Card className="h-full border-gray-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-5xl flex items-center gap-2 font-bold text-gray-800">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                {children}
            </CardContent>
        </Card>
    );
}

export default function UserRequestHotel() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        name: '', description: '', location: '',
        city: '', address: '', latitude: '', longitude: '',
        pricePerNight: '', starRating: '', phone: '', email: '',
        amenities: [],
    });

    const [rooms, setRooms] = useState(
        ROOM_TYPES.reduce((acc, t) => ({ ...acc, [t]: { enabled: false, price: '' } }), {})
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

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Hotel name is required';
        if (!form.location.trim()) e.location = 'Location is required';
        if (!form.pricePerNight) e.pricePerNight = 'Base price is required';
        if (!form.latitude) e.latitude = 'Latitude is required (get from Google Maps)';
        if (!form.longitude) e.longitude = 'Longitude is required';
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // await axios.post(apiEndpoints.REQUEST_HOTEL, {
            //     name: form.name,
            //     description: form.description,
            //     location: form.location,
            //     city: form.city,
            //     address: form.address,
            //     latitude: parseFloat(form.latitude),
            //     longitude: parseFloat(form.longitude),
            //     pricePerNight: parseFloat(form.pricePerNight),
            //     starRating: form.starRating ? parseInt(form.starRating) : null,
            //     phone: form.phone,
            //     email: form.email,
            //     imageUrl: imageUrls[0] || null,
            //     imageUrls,
            //     amenities: JSON.stringify(form.amenities),
            //     verified: false,
            //     rooms: ROOM_TYPES.filter(t => rooms[t].enabled && rooms[t].price).map(t => ({
            //         roomType: t,
            //         pricePerNight: parseFloat(rooms[t].price),
            //         available: true,
            //     })),
            // }, { headers: { Authorization: `Bearer ${token}` } });
            await axios.post(
                apiEndpoints.REQUEST_HOTEL,
                {
                    name: form.name,
                    description: form.description,
                    city: form.city,
                    address: form.address,
                    latitude: parseFloat(form.latitude),
                    longitude: parseFloat(form.longitude),
                    pricePerNight: parseFloat(form.pricePerNight),
                    imageUrl: imageUrls[0] || null,
                    imageUrls,
                    amenities: JSON.stringify(form.amenities),
                    contactInfo: form.phone || null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSubmitted(true);
            toast.success('Hotel submitted! Pending admin verification.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="text-center max-w-md space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-teal-500 mx-auto" />
                    <h2 className="text-2xl font-bold text-gray-900">Hotel Submitted!</h2>
                    <p className="text-gray-500">Your hotel request is under admin review. It will go live once approved.</p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => navigate('/hotels')}>Browse Hotels</Button>
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => {
                                setSubmitted(false);
                                setForm({ name: '', description: '', location: '', city: '', address: '', latitude: '', longitude: '', pricePerNight: '', starRating: '', phone: '', email: '', amenities: [] });
                                setImageUrls([]);
                            }}>
                            Submit Another
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-[#0f2d3d] py-8 sm:py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <p className="text-teal-400 text-xs font-bold tracking-[0.25em] uppercase mb-2">Community</p>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Submit a Hotel</h1>
                    <p className="text-white/50 text-sm">Know a great hotel? Submit it for review. Admin approval required before going live.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Row 1: Hotel Details (left) + Location (right) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Hotel Details */}
                        <SectionCard title="Hotel Details">
                            <Field
                                label="Hotel Name" name="name"
                                required
                                value={form.name} onChange={handleChange} error={errors.name}
                            />
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium text-gray-700">Description</Label>
                                <Textarea
                                    name="description" value={form.description} onChange={handleChange}
                                    placeholder="Describe the hotel, ambiance, unique features..."
                                    className="min-h-[90px] border-gray-200"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field
                                    label="Star Rating" name="starRating" type="number" placeholder="1–5"
                                    value={form.starRating} onChange={handleChange}
                                />
                                <Field
                                    label="Base Price / Night" name="pricePerNight" type="number"
                                    placeholder="5000" required prefix="₹"
                                    value={form.pricePerNight} onChange={handleChange} error={errors.pricePerNight}
                                />
                            </div>
                        </SectionCard>

                        {/* Location */}
                        <SectionCard title="Location">
                            <Field
                                label="Location / Neighbourhood" name="location"
                                placeholder="Eg. Civil Lines, Jaipur" required
                                value={form.location} onChange={handleChange} error={errors.location}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="City" name="city" placeholder="Eg. Jaipur"
                                    value={form.city} onChange={handleChange} />
                                <Field label="Address" name="address"
                                    value={form.address} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field
                                    label="Latitude" name="latitude" type="number" placeholder="26.9124" required
                                    // hint="Right-click on Google Maps → 'Copy coordinates'"
                                    value={form.latitude} onChange={handleChange} error={errors.latitude}
                                />
                                <Field
                                    label="Longitude" name="longitude" type="number" placeholder="75.7873" required
                                    value={form.longitude} onChange={handleChange} error={errors.longitude}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Phone" name="phone" placeholder="+91 98765 43210"
                                    value={form.phone} onChange={handleChange} />
                                <Field label="Email" name="email" type="email" placeholder="info@hotel.com"
                                    value={form.email} onChange={handleChange} />
                            </div>
                        </SectionCard>
                    </div>

                    {/* Row 2: Amenities + Room Types  */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Amenities */}
                        <SectionCard title="Amenities">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {AMENITIES.map(item => (
                                    <button
                                        key={item} type="button" onClick={() => toggleAmenity(item)}
                                        className={`px-3 py-2 text-center rounded-lg border text-sm font-medium mb-2 transition-colors ${form.amenities.includes(item)
                                            ? 'bg-teal-50 border-teal-300 text-teal-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                                            }`}>
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </SectionCard>

                        {/* Room Types */}
                        <SectionCard title="Room Types">
                            <p className="text-sm text-gray-500">Enable any room types you know about with their prices.</p>
                            <div className="space-y-3">
                                {ROOM_TYPES.map(t => (
                                    <div key={t} className="flex items-center gap-3">
                                        <input
                                            type="checkbox" id={`r-${t}`} checked={rooms[t].enabled}
                                            onChange={e => setRooms(p => ({ ...p, [t]: { ...p[t], enabled: e.target.checked } }))}
                                            className="w-4 h-4 accent-blue-500 shrink-0"
                                        />
                                        <label htmlFor={`r-${t}`} className="text-sm font-medium text-gray-700 w-20 capitalize shrink-0">
                                            {t.charAt(0) + t.slice(1).toLowerCase()}
                                        </label>
                                        <Input
                                            type="number" placeholder="Price / night"
                                            disabled={!rooms[t].enabled}
                                            value={rooms[t].price}
                                            onChange={e => setRooms(p => ({ ...p, [t]: { ...p[t], price: e.target.value } }))}
                                            className="h-9 text-sm flex-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>

                    {/* Row 3: Photos (full width) */}
                    <Card className={"border-gray-200"}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-5xl flex items-center gap-2 font-bold text-gray-800">
                                Upload Images
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CloudinaryUpload value={imageUrls} onChange={setImageUrls} />
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <Button
                        type="submit" disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-base font-semibold"
                    >
                        {loading
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                            : 'Submit Hotel for Review'
                        }
                    </Button>

                </form>
            </div>
        </div>
    );
}