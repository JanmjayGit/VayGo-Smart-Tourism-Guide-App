import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Pencil, Trash2, RotateCcw, Loader2, Star, MapPin, Search, SlidersHorizontal, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';

// Categories must match backend PlaceCategory enum exactly
const CATEGORIES = [
    'ATTRACTION', 'MUSEUM', 'HISTORICAL_SITE', 'TEMPLE', 'PARK',
    'BEACH', 'HOTEL', 'RESORT', 'HOSTEL', 'MOUNTAIN', 'TREK',
    'RESTAURANT', 'CAFE', 'STREET_FOOD', 'EVENT', 'ADVENTURE_ACTIVITY',
    'SHOPPING_MALL', 'AIRPORT', 'HOSPITAL', 'OTHER'
];

const CAT_STYLES = {
    ATTRACTION: 'bg-pink-50 text-pink-700 border-pink-200',
    MUSEUM: 'bg-violet-50 text-violet-700 border-violet-200',
    HISTORICAL_SITE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    TEMPLES: 'bg-amber-50 text-amber-700 border-amber-200',
    PARK: 'bg-green-50 text-green-700 border-green-200',
    BEACH: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    HOTEL: 'bg-blue-50 text-blue-700 border-blue-200',
    RESORT: 'bg-sky-50 text-sky-700 border-sky-200',
    HOSTEL: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    MOUNTAIN: 'bg-stone-50 text-stone-700 border-stone-200',
    TREK: 'bg-lime-50 text-lime-700 border-lime-200',
    RESTAURANT: 'bg-orange-50 text-orange-700 border-orange-200',
    CAFE: 'bg-rose-50 text-rose-700 border-rose-200',
    STREET_FOOD: 'bg-red-50 text-red-700 border-red-200',
    EVENT: 'bg-purple-50 text-purple-700 border-purple-200',
    ADVENTURE_ACTIVITY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    SHOPPING_MALL: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    AIRPORT: 'bg-slate-50 text-slate-700 border-slate-200',
    HOSPITAL: 'bg-teal-50 text-teal-700 border-teal-200',
};

const emptyForm = {
    name: '', description: '', category: '', city: '', state: '', address: '',
    latitude: '', longitude: '', photos: [], openingHours: '', entryFee: '',
};

export default function AdminPlaces() {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

    const fetchPlaces = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page, size: 20 };
            if (categoryFilter !== 'ALL') params.category = categoryFilter;
            try {
                const res = await axios.get(apiEndpoints.ADMIN_GET_ALL_PLACES, { headers: getHeaders(), params });
                const d = res.data;
                setPlaces(d?.content || (Array.isArray(d) ? d : []));
                setTotalPages(d?.totalPages || 1);
            } catch {
                const fallbackParams = { page, size: 20 };
                if (categoryFilter !== 'ALL') fallbackParams.category = categoryFilter;
                const res = await axios.get(apiEndpoints.GET_PLACES, { params: fallbackParams });
                setPlaces(res.data?.content || []);
                setTotalPages(res.data?.totalPages || 1);
            }
        } catch { setPlaces([]); }
        finally { setLoading(false); }
    }, [page, categoryFilter]);

    useEffect(() => { fetchPlaces(); }, [fetchPlaces]);

    const filtered = places.filter((p) => {
        const matchesSearch =
            !search ||
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.city?.toLowerCase().includes(search.toLowerCase()) ||
            p.state?.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

        return matchesSearch && matchesCategory;
    })
    const openCreate = () => { setForm({ ...emptyForm }); setDialogMode('create'); setDialogOpen(true); };

    const openEdit = async (p) => {
        setDialogMode('edit');
        setDialogOpen(true);
        const placeholderPhotos = p.imageUrls || (p.imageUrl ? [p.imageUrl] : []);
        setForm({
            id: p.id, name: p.name || '', description: p.description || '',
            category: p.category || '', city: p.city || '', state: p.state || '',
            address: p.address || '', latitude: p.latitude || '', longitude: p.longitude || '',
            photos: placeholderPhotos, openingHours: p.openingHours || '', entryFee: p.entryFee || '',
        });

        try {
            const res = await axios.get(apiEndpoints.GET_PLACE_BY_ID(p.id));
            const full = res.data;
            const photos = full.imageUrls?.length ? full.imageUrls
                : full.photos?.length ? full.photos
                    : (full.imageUrl ? [full.imageUrl] : []);
            setForm(prev => ({ ...prev, photos }));
        } catch {

        }
    };

    const handleSave = async () => {
        if (!form.name || !form.category) { toast.error('Name and category are required'); return; }
        try {
            setSaving(true);
            const payload = { ...form, latitude: form.latitude ? parseFloat(form.latitude) : null, longitude: form.longitude ? parseFloat(form.longitude) : null, entryFee: form.entryFee ? parseFloat(form.entryFee) : null, imageUrl: form.photos[0] || null, imageUrls: form.photos };
            delete payload.id;
            if (dialogMode === 'create') {
                await axios.post(apiEndpoints.ADMIN_CREATE_PLACE, payload, { headers: getHeaders() });
                toast.success('Place created successfully!');
            } else {
                await axios.put(apiEndpoints.ADMIN_UPDATE_PLACE(form.id), payload, { headers: getHeaders() });
                toast.success('Place updated successfully!');
            }
            setDialogOpen(false); fetchPlaces();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save place'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await axios.delete(apiEndpoints.ADMIN_DELETE_PLACE(deleteTarget.id), { headers: getHeaders() });
            toast.success('Place deleted'); setDeleteDialogOpen(false); fetchPlaces();
        } catch { toast.error('Failed to delete'); } finally { setDeleting(false); }
    };

    const handleRestore = async (id) => {
        try {
            await axios.put(apiEndpoints.ADMIN_RESTORE_PLACE(id), {}, { headers: getHeaders() });
            toast.success('Place restored'); fetchPlaces();
        } catch { toast.error('Failed to restore'); }
    };

    return (
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Manage Places</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Add, edit, and remove tourist destinations</p>
                </div>
                <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                    Add Place
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-5 shadow-sm border-slate-100">
                <CardContent className="p-3 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search places..." className="pl-9 h-9 text-sm" />
                    </div>
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                        <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(0); }}>
                            <SelectTrigger className="h-9 w-40 text-sm">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Categories</SelectItem>
                                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <span className="text-xs text-slate-400 ml-auto">{filtered.length} results</span>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="shadow-sm border-slate-100 overflow-hidden">
                {loading ? (
                    <CardContent className="p-6 space-y-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 animate-pulse">
                                <div className="w-11 h-11 rounded-lg bg-slate-100" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3.5 w-1/3 bg-slate-100 rounded" />
                                    <div className="h-3 w-1/4 bg-slate-100 rounded" />
                                </div>
                                <div className="h-5 w-20 bg-slate-100 rounded-full" />
                                <div className="h-8 w-20 bg-slate-100 rounded" />
                            </div>
                        ))}
                    </CardContent>
                ) : filtered.length === 0 ? (
                    <CardContent className="py-20 flex flex-col items-center text-slate-400">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                            <MapPin className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="font-medium text-slate-500 text-lg">No places found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                        <Button onClick={openCreate} variant="outline" className="mt-4 gap-2 text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                            Add your first place
                        </Button>
                    </CardContent>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left pl-5 pr-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-14" />
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Rating</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Status</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(p => {
                                    const thumb = p.imageUrl || p.photos?.[0] || p.imageUrls?.[0];
                                    const photoCount = (p.photos || p.imageUrls || []).length;
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="pl-5 pr-3 py-3">
                                                <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
                                                    {thumb
                                                        ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center"><MapPin className="w-4 h-4 text-slate-300" /></div>
                                                    }
                                                    {photoCount > 1 && (
                                                        <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[8px] px-1 leading-4 rounded-tl">+{photoCount - 1}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                                                {p.entryFee != null && <p className="text-xs text-slate-400 mt-0.5">₹{p.entryFee}</p>}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full border ${CAT_STYLES[p.category] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-sm text-slate-500">{[p.city, p.state].filter(Boolean).join(', ') || '—'}</td>
                                            <td className="px-3 py-3">
                                                {p.averageRating ? (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                        <span className="text-sm font-medium text-slate-700">{Number(p.averageRating).toFixed(1)}</span>
                                                    </div>
                                                ) : <span className="text-slate-300">—</span>}
                                            </td>
                                            <td className="px-3 py-3">
                                                {p.deleted
                                                    ? <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border border-red-100 text-xs">Deleted</Badge>
                                                    : <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50 border border-indigo-100 text-xs">Active</Badge>
                                                }
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant='ghost' size='icon' className='h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100' onClick={() => window.open(`/places/${p.id}`, '_blank')}>
                                                        <ExternalLink className='w-3.5 h-3.5' />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100" onClick={() => openEdit(p)}>
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                    {p.deleted ? (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-gray-500 hover:bg-slate-100" onClick={() => handleRestore(p.id)}>
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-slate-100" onClick={() => { setDeleteTarget(p); setDeleteDialogOpen(true); }}>
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                    <p className="text-sm text-slate-500">Page {page + 1} of {totalPages}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
                    </div>
                </div>
            )}

            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                            {dialogMode === 'create' ? 'Add New Place' : 'Edit Place'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create'
                                ? 'Fill in the details to create a new tourist place.'
                                : `Editing: ${form.name}`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-2">
                        {/* Basic */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Basic Information</h3>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></Label>
                                    <Input id="name" placeholder="e.g. Taj Mahal" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-10" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Description</Label>
                                    <Textarea placeholder="Describe this place..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Category <span className="text-red-500">*</span></Label>
                                        <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                                            <SelectTrigger className="h-10"><SelectValue placeholder="Select category" /></SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Opening Hours</Label>
                                        <Input placeholder="9 AM – 6 PM" value={form.openingHours} onChange={e => setForm({ ...form, openingHours: e.target.value })} className="h-10" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Location */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { key: 'city', label: 'City', ph: 'e.g. Agra' },
                                    { key: 'state', label: 'State', ph: 'e.g. Uttar Pradesh' },
                                ].map(f => (
                                    <div key={f.key} className="space-y-1.5">
                                        <Label className="text-sm font-medium">{f.label}</Label>
                                        <Input placeholder={f.ph} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="h-10" />
                                    </div>
                                ))}
                                <div className="col-span-2 space-y-1.5">
                                    <Label className="text-sm font-medium">Address</Label>
                                    <Input placeholder="Full street address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="h-10" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Latitude</Label>
                                    <Input type="number" step="any" placeholder="27.1751" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} className="h-10" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Longitude</Label>
                                    <Input type="number" step="any" placeholder="78.0421" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} className="h-10" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Entry Fee (₹)</Label>
                                    <Input type="number" placeholder="0" value={form.entryFee} onChange={e => setForm({ ...form, entryFee: e.target.value })} className="h-10" />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Photos — Cloudinary file upload */}
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Photos</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Upload JPG/JPEG/PNG files. The first photo will be the primary image.</p>
                            </div>
                            <CloudinaryUpload
                                value={form.photos}
                                onChange={urls => setForm({ ...form, photos: urls })}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {dialogMode === 'create' ? 'Create Place' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}
                title={`Delete "${deleteTarget?.name}"?`}
                description="This place will be soft-deleted. You can restore it later from the table."
                loading={deleting} onConfirm={handleDelete}
            />
        </div>
    );
}
