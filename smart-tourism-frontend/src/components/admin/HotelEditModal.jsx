import { Button } from '@/components/ui/button';
import AmenitiesSelector from '@/components/admin/AmenitiesSelector';
import RoomTypesSection from '@/components/admin/RoomTypesSection';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';

export default function HotelEditModal({
    form, setForm,
    roomsForm, roomsLoading,
    onAddRoom, onFieldChange, onToggleAmenity, onRemoveRoom,
    onSave, onClose,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
            <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl max-h-[92vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Edit Hotel</h2>
                        <p className="text-sm text-slate-400 mt-0.5">
                            Update hotel information, amenities, availability, and photos
                        </p>
                    </div>
                    <Button variant="ghost" className="text-slate-500 hover:text-slate-800" onClick={onClose}>
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
                                <input className="w-full border rounded-lg p-2 mt-1" value={form.name || ''}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-600">Description</label>
                                <textarea className="w-full border rounded-lg p-2 mt-1" rows="4"
                                    value={form.description || ''}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">City</label>
                                <input className="w-full border rounded-lg p-2 mt-1" value={form.city || ''}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Contact Info</label>
                                <input className="w-full border rounded-lg p-2 mt-1" value={form.contactInfo || ''}
                                    onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-600">Address</label>
                                <input className="w-full border rounded-lg p-2 mt-1" value={form.address || ''}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })} />
                            </div>
                        </div>
                    </section>

                    {/* Location */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b pb-2">Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-slate-600">Latitude</label>
                                <input type="number" step="any" className="w-full border rounded-lg p-2 mt-1"
                                    value={form.latitude ?? ''}
                                    onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">Longitude</label>
                                <input type="number" step="any" className="w-full border rounded-lg p-2 mt-1"
                                    value={form.longitude ?? ''}
                                    onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
                            </div>
                        </div>
                    </section>

                    {/* Hotel Details */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b pb-2">Hotel Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-slate-600">Price Per Night</label>
                                <input type="number" className="w-full border rounded-lg p-2 mt-1"
                                    value={form.pricePerNight ?? ''}
                                    onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">Rating</label>
                                <input type="number" step="0.1" min="0" max="5" className="w-full border rounded-lg p-2 mt-1"
                                    value={form.rating ?? ''}
                                    onChange={(e) => setForm({ ...form, rating: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">Price Range</label>
                                <select className="w-full border rounded-lg p-2 mt-1 bg-white"
                                    value={form.priceRange ?? ''}
                                    onChange={(e) => setForm({ ...form, priceRange: e.target.value })}>
                                    <option value="">Select price range</option>
                                    {[1, 2, 3, 4].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">Availability Status</label>
                                <select className="w-full border rounded-lg p-2 mt-1 bg-white"
                                    value={form.availabilityStatus ? 'true' : 'false'}
                                    onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value === 'true' })}>
                                    <option value="true">Available</option>
                                    <option value="false">Unavailable</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-slate-600">Opening Hours</label>
                                <input className="w-full border rounded-lg p-2 mt-1" value={form.openingHours || ''}
                                    onChange={(e) => setForm({ ...form, openingHours: e.target.value })} />
                            </div>
                        </div>
                    </section>

                    <RoomTypesSection
                        rooms={roomsForm} loading={roomsLoading}
                        onAdd={onAddRoom} onFieldChange={onFieldChange}
                        onToggleAmenity={onToggleAmenity} onRemove={onRemoveRoom}
                    />

                    <AmenitiesSelector
                        selected={form.amenities || []}
                        onChange={(updated) => setForm({ ...form, amenities: updated })}
                    />

                    {/* Photos */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide border-b pb-2">Hotel Photos</h3>
                        <CloudinaryUpload
                            value={form.imageUrls || []}
                            onChange={(urls) => setForm({ ...form, imageUrls: urls })}
                        />
                    </section>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4">
                    <Button variant="outline" className="bg-teal-50 border-teal-500 text-black hover:bg-teal-500 hover:text-white"
                        onClick={onClose}>Cancel</Button>
                    <Button className="bg-gray-800 hover:bg-gray-700" onClick={onSave}>Update Hotel</Button>
                </div>
            </div>
        </div>
    );
}