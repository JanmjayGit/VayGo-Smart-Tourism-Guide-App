import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Info, Image as ImageIcon, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';

const PLACE_CATEGORIES = [
    'ATTRACTION', 'HISTORICAL_SITE', 'RELIGIOUS_SITE', 'PARK', 'BEACH',
    'MOUNTAIN', 'TREK', 'MUSEUM', 'ADVENTURE_ACTIVITY', 'RESTAURANT', 'CAFE', 'OTHER'
];

function Field({ label, name, type = 'text', placeholder, required, hint, value, onChange, error }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {hint && <p className="text-xs text-gray-400">{hint}</p>}
            <Input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={error ? 'border-red-400 focus-visible:ring-red-400' : 'border-gray-200'}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function SectionCard({ title, children }) {
    return (
        <Card className="h-full border-gray-100">
            <CardHeader className="pb-4">
                <CardTitle className="text-5xl flex items-center gap-2 font-bold text-gray-800">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-xl">
                {children}
            </CardContent>
        </Card>
    );
}

export default function SubmitPlace() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);

    const [form, setForm] = useState({
        name: '', description: '', category: '',
        latitude: '', longitude: '', address: '', city: '',
        contactInfo: '', openingHours: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Place name is required';
        if (!form.category) e.category = 'Category is required';
        if (!form.latitude) e.latitude = 'Latitude is required';
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
            await axios.post(apiEndpoints.SUBMIT_PLACE, {
                ...form,
                latitude: parseFloat(form.latitude),
                longitude: parseFloat(form.longitude),
                imageUrl: imageUrls[0] || null,
                imageUrls,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSubmitted(true);
            toast.success('Place submitted! Pending admin review.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-w-6xl bg-white flex items-center justify-center px-4">
                <div className="text-center max-w-md space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-teal-500 mx-auto" />
                    <h2 className="text-2xl font-bold text-gray-900">Place Submitted!</h2>
                    <p className="text-gray-500">Your place is pending admin review. It'll be live once approved.</p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => navigate('/places')}>Browse Places</Button>
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => {
                                setSubmitted(false);
                                setForm({ name: '', description: '', category: '', latitude: '', longitude: '', address: '', city: '', contactInfo: '', openingHours: '' });
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
        <div className="min-w-6xl bg-gray-50">

            {/* Header */}
            <div className="bg-[#0f2d3d] py-8 sm:py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <p className="text-teal-400 text-xs font-bold tracking-[0.25em] uppercase mb-2">Community</p>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Add a Place</h1>
                    <p className="text-white/50 text-sm">Discovered a hidden gem? Submit it for our community to explore.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Row 1: Place Details  + Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Place Details */}
                        <SectionCard icon={Info} title="Place Details">
                            <Field
                                label="Place Name" name="name"
                                placeholder="Eg. Hawa Mahal" required
                                value={form.name} onChange={handleChange} error={errors.name}
                            />
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-gray-700">Description</Label>
                                <Textarea
                                    name="description" value={form.description} onChange={handleChange}
                                    placeholder="What makes this place special?"
                                    className="min-h-[100px] border-gray-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    Category <span className="text-red-500">*</span>
                                </Label>
                                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                                    <SelectTrigger className="border-gray-200">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className={"border-gray-200"}>
                                        {PLACE_CATEGORIES.map(c => (
                                            <SelectItem key={c} value={c}>
                                                {c.replace(/_/g, ' ').charAt(0) + c.replace(/_/g, ' ').slice(1).toLowerCase()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                            </div>
                        </SectionCard>

                        {/* Location */}
                        <SectionCard icon={MapPin} title="Location">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field
                                    label="Latitude" name="latitude" type="number"
                                    placeholder="Eg. 26.9239" required
                                    value={form.latitude} onChange={handleChange} error={errors.latitude}
                                />
                                <Field
                                    label="Longitude" name="longitude" type="number"
                                    placeholder="Eg. 75.8267" required
                                    value={form.longitude} onChange={handleChange} error={errors.longitude}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field
                                    label="City" name="city" placeholder="Eg. Jaipur"
                                    value={form.city} onChange={handleChange}
                                />
                                <Field
                                    label="Contact Info" name="contactInfo" placeholder="Phone / email"
                                    value={form.contactInfo} onChange={handleChange}
                                />
                            </div>
                            <Field
                                label="Address" name="address" placeholder="Full street address..."
                                value={form.address} onChange={handleChange}
                            />
                            <Field
                                label="Opening Hours" name="openingHours"
                                placeholder="Eg. Mon–Fri: 9am–6pm" hint="Optional"
                                value={form.openingHours} onChange={handleChange}
                            />
                        </SectionCard>
                    </div>

                    {/* Row 2: Photos */}
                    <Card className="border-gray-100">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-5xl flex items-center gap-2 font-bold text-gray-800">
                                Photos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-400">Upload up to 10 photos. First image becomes the cover.</p>
                            <CloudinaryUpload value={imageUrls} onChange={setImageUrls} />
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-base font-semibold"
                    >
                        {loading
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                            : 'Submit Place for Review'
                        }
                    </Button>

                </form>
            </div>
        </div>
    );
}