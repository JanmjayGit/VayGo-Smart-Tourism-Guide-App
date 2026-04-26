import { useMemo, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';

function buildInitialForm(type, item) {
    return {
        name: item.name || '',
        description: item.description || '',
        category: item.category || '',
        city: item.city || '',
        address: item.address || '',
        latitude: item.latitude ?? '',
        longitude: item.longitude ?? '',
        contactInfo: item.contactInfo || '',
        openingHours: item.openingHours || '',
        imageUrls: item.imageUrls?.length
            ? item.imageUrls
            : item.imageUrl
                ? [item.imageUrl]
                : [],

        eventDate: item.eventDate || '',
        endDate: item.endDate || '',
        eventTime: item.eventTime || '',
        venue: item.venue || '',
        organizerName: item.organizerName || '',
        organizerContact: item.organizerContact || '',
        ticketInfo: item.ticketInfo || '',
        entryFee: item.entryFee ?? '',
        websiteUrl: item.websiteUrl || '',

        pricePerNight: item.pricePerNight ?? '',
        rating: item.rating ?? '',
    };
}

function InputField({ label, value, onChange, type = 'text' }) {
    return (
        <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                {label}
            </label>
            <input
                type={type}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-teal-500"
                value={value}
                onChange={onChange}
            />
        </div>
    );
}

function TextAreaField({ label, value, onChange, rows = 4 }) {
    return (
        <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                {label}
            </label>
            <textarea
                rows={rows}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-teal-500"
                value={value}
                onChange={onChange}
            />
        </div>
    );
}

export default function ContributionEditModal({ item, type, onSave, onClose }) {
    const [form, setForm] = useState(() => buildInitialForm(type, item));
    const [saving, setSaving] = useState(false);

    const title = useMemo(() => {
        if (type === 'places') return 'Edit Place';
        if (type === 'events') return 'Edit Event';
        return 'Edit Hotel';
    }, [type]);

    const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(type, item.id, form);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <div>
                        <h3 className="font-semibold text-gray-800">{title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            You can edit this while it is still pending review.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
                    {type === 'places' && (
                        <>
                            <InputField label="Name" value={form.name} onChange={(e) => update('name', e.target.value)} />
                            <TextAreaField label="Description" value={form.description} onChange={(e) => update('description', e.target.value)} />
                            <InputField label="Category" value={form.category} onChange={(e) => update('category', e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
                                <InputField label="Contact Info" value={form.contactInfo} onChange={(e) => update('contactInfo', e.target.value)} />
                            </div>
                            <InputField label="Address" value={form.address} onChange={(e) => update('address', e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Latitude" type="number" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} />
                                <InputField label="Longitude" type="number" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} />
                            </div>
                            <InputField label="Opening Hours" value={form.openingHours} onChange={(e) => update('openingHours', e.target.value)} />
                        </>
                    )}

                    {type === 'events' && (
                        <>
                            <InputField label="Name" value={form.name} onChange={(e) => update('name', e.target.value)} />
                            <TextAreaField label="Description" value={form.description} onChange={(e) => update('description', e.target.value)} />
                            <InputField label="Category" value={form.category} onChange={(e) => update('category', e.target.value)} />
                            <div className="grid grid-cols-3 gap-4">
                                <InputField label="Event Date" type="date" value={form.eventDate} onChange={(e) => update('eventDate', e.target.value)} />
                                <InputField label="End Date" type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
                                <InputField label="Event Time" type="time" value={form.eventTime} onChange={(e) => update('eventTime', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
                                <InputField label="Venue" value={form.venue} onChange={(e) => update('venue', e.target.value)} />
                            </div>
                            <InputField label="Address" value={form.address} onChange={(e) => update('address', e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Latitude" type="number" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} />
                                <InputField label="Longitude" type="number" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Organizer Name" value={form.organizerName} onChange={(e) => update('organizerName', e.target.value)} />
                                <InputField label="Organizer Contact" value={form.organizerContact} onChange={(e) => update('organizerContact', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Entry Fee" type="number" value={form.entryFee} onChange={(e) => update('entryFee', e.target.value)} />
                                <InputField label="Website URL" value={form.websiteUrl} onChange={(e) => update('websiteUrl', e.target.value)} />
                            </div>
                            <TextAreaField label="Ticket Info" value={form.ticketInfo} onChange={(e) => update('ticketInfo', e.target.value)} />
                        </>
                    )}

                    {type === 'hotels' && (
                        <>
                            <InputField label="Hotel Name" value={form.name} onChange={(e) => update('name', e.target.value)} />
                            <TextAreaField label="Description" value={form.description} onChange={(e) => update('description', e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="City" value={form.city} onChange={(e) => update('city', e.target.value)} />
                                <InputField label="Contact Info" value={form.contactInfo} onChange={(e) => update('contactInfo', e.target.value)} />
                            </div>
                            <InputField label="Address" value={form.address} onChange={(e) => update('address', e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Latitude" type="number" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} />
                                <InputField label="Longitude" type="number" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Price Per Night" type="number" value={form.pricePerNight} onChange={(e) => update('pricePerNight', e.target.value)} />
                                <InputField label="Rating" type="number" value={form.rating} onChange={(e) => update('rating', e.target.value)} />
                            </div>
                            <InputField label="Opening Hours" value={form.openingHours} onChange={(e) => update('openingHours', e.target.value)} />
                        </>
                    )}

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                            Images
                        </label>
                        <CloudinaryUpload
                            value={form.imageUrls || []}
                            onChange={(urls) => update('imageUrls', urls)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 px-5 py-4 border-t bg-gray-50">
                    <Button variant="outline" onClick={onClose} className="rounded-xl">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
