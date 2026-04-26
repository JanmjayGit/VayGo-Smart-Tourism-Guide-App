import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';
import RoomRequestCard from '@/components/hotel-details/RoomRequestCard';
import Field from '@/components/hotel-details/Field';

const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE', 'FAMILY'];

const AMENITIES = [
    'WiFi', 'Parking', 'Air Conditioning', 'Swimming Pool',
    'Breakfast', 'Room Service', 'Gym', 'Spa',
    'Restaurant', 'Bar', 'Business Center', 'Laundry',
];

function SectionCard({ title, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

export default function UserRequestHotel() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        name: '',
        description: '',
        location: '',
        city: '',
        address: '',
        latitude: '',
        longitude: '',
        pricePerNight: '',
        starRating: '',
        phone: '',
        email: '',
        amenities: [],
    });

    const [rooms, setRooms] = useState(
        ROOM_TYPES.reduce((acc, t) => ({
            ...acc,
            [t]: { enabled: false, price: '', count: '', capacity: '2', description: '', imageUrls: [] }
        }), {})
    );

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRoomChange = (type, field, value) => {
        setRooms((prev) => ({
            ...prev,
            [type]: { ...prev[type], [field]: value }
        }));
    };

    const toggleAmenity = (item) => {
        setForm((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(item)
                ? prev.amenities.filter(a => a !== item)
                : [...prev.amenities, item]
        }));
    };

    const validate = () => {
        const e = {};

        if (!form.name.trim()) e.name = 'Hotel name is required';
        if (!form.city.trim()) e.city = 'City is required';
        if (!form.pricePerNight) e.pricePerNight = 'Price is required';
        if (!form.latitude) e.latitude = 'Latitude is required';
        if (!form.longitude) e.longitude = 'Longitude is required';

        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            const payload = {
                name: form.name,
                description: form.description || null,
                city: form.city,
                address: form.address || null,
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
                pricePerNight: Number(form.pricePerNight),
                rating: form.starRating ? Number(form.starRating) : null,
                imageUrl: imageUrls[0] || null,
                imageUrls,
                amenities: JSON.stringify(form.amenities),
                contactInfo: form.phone || null,
                rooms: ROOM_TYPES
                    .filter((type) => rooms[type].enabled && rooms[type].price)
                    .map((type) => ({
                        roomType: type,
                        pricePerNight: Number(rooms[type].price),
                        totalRooms: rooms[type].count ? Number(rooms[type].count) : 1,
                        capacity: rooms[type].capacity ? Number(rooms[type].capacity) : 2,
                        description: rooms[type].description || '',
                        amenities: JSON.stringify([]),
                        imageUrls: rooms[type].imageUrls || [],
                    })),
            };

            await axios.post(apiEndpoints.REQUEST_HOTEL, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSubmitted(true);
            toast.success('Submitted!');
        } catch (err) {
            console.error('Hotel request failed', err.response?.data || err);
            toast.error(err.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };


    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <CheckCircle2 className="w-16 h-16 text-teal-500 mx-auto" />
                    <h2 className="text-xl font-bold mt-4">Submitted Successfully</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm ml-32">
                <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto">

                {/* ROW 1 */}
                <div className="grid md:grid-cols-2 gap-6">
                    <SectionCard title="Hotel Details">
                        <Field
                            label="Hotel Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            error={errors.name}
                        />

                        <Textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Description"
                        />

                        <Field
                            label="Star Rating"
                            name="starRating"
                            type="number"
                            value={form.starRating}
                            onChange={handleChange}
                            placeholder="1–5"
                        />

                        <Field
                            label="Base Price"
                            name="pricePerNight"
                            type="number"
                            value={form.pricePerNight}
                            onChange={handleChange}
                            required
                            prefix="₹"
                            error={errors.pricePerNight}
                        />
                    </SectionCard>

                    <SectionCard title="Location">
                        <Field
                            label="Location / Area"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            required
                            error={errors.location}
                        />

                        <Field
                            label="City"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            required
                            error={errors.city}
                        />

                        <Field
                            label="Address"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            required
                            error={errors.address}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Field
                                label="Latitude"
                                name="latitude"
                                value={form.latitude}
                                onChange={handleChange}
                                required
                                error={errors.latitude}
                            />

                            <Field
                                label="Longitude"
                                name="longitude"
                                value={form.longitude}
                                onChange={handleChange}
                                required
                                error={errors.longitude}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field
                                label="Phone"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+91 XXXXX XXXXX"
                            />

                            <Field
                                label="Email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="hotel@email.com"
                            />
                        </div>
                    </SectionCard>
                </div>

                {/* ROW 2 */}
                <SectionCard title="Amenities">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {AMENITIES.map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => toggleAmenity(item)}
                                className={`p-2 rounded-lg border ${form.amenities.includes(item)
                                    ? 'bg-teal-100 border-teal-400'
                                    : 'bg-white'
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </SectionCard>

                {/* ROW 3 */}
                <SectionCard title="Room Types">
                    <div className="grid md:grid-cols-2 gap-4">
                        {ROOM_TYPES.map((t) => (
                            <RoomRequestCard key={t} roomType={t} data={rooms[t]} onChange={handleRoomChange} />
                        ))}
                    </div>
                </SectionCard>

                {/* ROW 4 */}
                <SectionCard title="Upload Hotel Images">
                    <CloudinaryUpload value={imageUrls} onChange={setImageUrls} />
                </SectionCard>

                {/* SUBMIT */}
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3"
                >
                    {loading ? 'Submitting...' : 'Submit'}
                </Button>


            </form>
        </div>
    );
}
