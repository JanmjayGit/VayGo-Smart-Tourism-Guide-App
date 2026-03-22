import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, User, Loader2, CheckCircle2, ChevronLeft, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';

const EVENT_CATEGORIES = [
    'MUSIC', 'CULTURAL', 'SPORTS', 'FOOD', 'ART', 'TECHNOLOGY',
    'BUSINESS', 'EDUCATION', 'HEALTH', 'TRAVEL', 'NATURE', 'OTHER'
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
                className={`rounded-xl ${error ? 'border-red-400 focus-visible:ring-red-400' : 'border-gray-200'}`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function SectionCard({ title, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-5 h-full">
            <h2 className="font-bold text-5xl text-gray-800 flex items-center gap-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                {title}
            </h2>
            {children}
        </div>
    );
}

export default function SubmitEvent() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);

    const [form, setForm] = useState({
        name: '', description: '', category: '',
        eventDate: '', endDate: '', eventTime: '',
        city: '', venue: '', address: '', latitude: '', longitude: '',
        organizerName: '', organizerContact: '',
        ticketInfo: '', entryFee: '', isFree: false,
        websiteUrl: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Event name is required';
        if (!form.category) e.category = 'Category is required';
        if (!form.eventDate) e.eventDate = 'Event date is required';
        if (!form.city.trim()) e.city = 'City is required';
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(apiEndpoints.SUBMIT_EVENT, {
                ...form,
                entryFee: form.entryFee ? parseFloat(form.entryFee) : null,
                latitude: form.latitude ? parseFloat(form.latitude) : null,
                longitude: form.longitude ? parseFloat(form.longitude) : null,
                imageUrl: imageUrls[0] || null,
                imageUrls,
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSubmitted(true);
            toast.success('Event submitted! It will appear once approved by an admin.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit event. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div className="text-center max-w-md space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-teal-500 mx-auto" />
                    <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Event Submitted!</h2>
                    <p className="text-gray-500">Your event is pending admin review and will be visible once approved.</p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" className="rounded-xl" onClick={() => navigate('/events')}>Browse Events</Button>
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                            onClick={() => {
                                setSubmitted(false);
                                setForm({ name: '', description: '', category: '', eventDate: '', endDate: '', eventTime: '', city: '', venue: '', address: '', latitude: '', longitude: '', organizerName: '', organizerContact: '', ticketInfo: '', entryFee: '', isFree: false, websiteUrl: '' });
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
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* Header */}
            <div className="bg-[#0f2d3d] py-8 sm:py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <p className="text-teal-400 text-xs font-bold tracking-[0.25em] uppercase mb-2">Community</p>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                        Submit an Event
                    </h1>
                    <p className="text-white/50 text-sm">Share an event. Our team reviews and publishes within 24–48 hours.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Top Row: Event Details + Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Event Details */}
                        <SectionCard icon={CalendarDays} title="Event Details">
                            <Field
                                label="Event Name" name="name"
                                placeholder="Eg. Jaipur Literature Festival 2025" required
                                value={form.name} onChange={handleChange} error={errors.name}
                            />
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-gray-700">Description</Label>
                                <Textarea
                                    name="description" value={form.description} onChange={handleChange}
                                    placeholder="Describe what this event is about..."
                                    className="rounded-xl min-h-[100px] border-gray-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    Category <span className="text-red-500">*</span>
                                </Label>
                                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                                    <SelectTrigger className="rounded-xl border-gray-200">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EVENT_CATEGORIES.map(c => (
                                            <SelectItem key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                            </div>
                            {/* Date/Time: 1 col on xs, 3 cols on sm+ */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Field label="Event Date" name="eventDate" type="date" required
                                    value={form.eventDate} onChange={handleChange} error={errors.eventDate} />
                                <Field label="End Date" name="endDate" type="date"
                                    value={form.endDate} onChange={handleChange} />
                                <Field label="Event Time" name="eventTime" type="time"
                                    value={form.eventTime} onChange={handleChange} />
                            </div>
                        </SectionCard>

                        {/* Location  card*/}
                        <SectionCard icon={MapPin} title="Location">
                            {/* City/Venue */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                <Field label="City" name="city" placeholder="Eg. Jaipur" required
                                    value={form.city} onChange={handleChange} error={errors.city} />
                                <Field label="Venue" name="venue" required
                                    value={form.venue} onChange={handleChange} />
                            </div>
                            <Field label="Full Address" name="address" placeholder="Street address..."
                                value={form.address} onChange={handleChange} />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
                                <Field label="Latitude" name="latitude" type="number" placeholder="Eg. 26.9124" hint="Optional, enables map view"
                                    value={form.latitude} onChange={handleChange} />
                                <Field label="Longitude" name="longitude" type="number" placeholder="Eg. 75.7873" hint="Optional"
                                    value={form.longitude} onChange={handleChange} />
                            </div>
                        </SectionCard>
                    </div>

                    {/* Bottom Row: Organizer & Tickets + Photos upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Organizer & Tickets */}
                        <SectionCard icon={User} title="Organizer & Tickets">
                            {/* Organizer/Contact */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Organizer Name" name="organizerName" placeholder="Eg. Rajasthan Tourism"
                                    value={form.organizerName} onChange={handleChange} />
                                <Field label="Contact" name="organizerContact" placeholder="Phone or email"
                                    value={form.organizerContact} onChange={handleChange} />
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox" id="isFree" name="isFree"
                                    checked={form.isFree} onChange={handleChange}
                                    className="w-4 h-4 accent-teal-600"
                                />
                                <label htmlFor="isFree" className="text-sm font-medium text-gray-700">This is a free event</label>
                            </div>
                            {!form.isFree && (
                                <Field label="Entry Fee (₹)" name="entryFee" type="number" placeholder="Eg. 500"
                                    value={form.entryFee} onChange={handleChange} />
                            )}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-gray-700">Ticket Info</Label>
                                <Textarea
                                    name="ticketInfo" value={form.ticketInfo} onChange={handleChange}
                                    placeholder="Where to buy tickets, booking link, etc."
                                    className="rounded-xl border-gray-200"
                                />
                            </div>
                        </SectionCard>

                        {/* Event Photos + Website */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-5 h-full">
                            <h2 className="font-bold text-5xl text-gray-800 flex items-center gap-2" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                Event Photos
                            </h2>
                            <CloudinaryUpload value={imageUrls} onChange={setImageUrls} />
                            <div className="mt-10">
                                <Field
                                    label="Website URL"
                                    name="websiteUrl"
                                    placeholder="https://..."
                                    hint="Official event website (optional)"
                                    value={form.websiteUrl} onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-3 text-base font-semibold shadow-md shadow-teal-100"
                    >
                        {loading
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                            : 'Submit Event for Review'
                        }
                    </Button>

                </form>
            </div>
        </div>
    );
}