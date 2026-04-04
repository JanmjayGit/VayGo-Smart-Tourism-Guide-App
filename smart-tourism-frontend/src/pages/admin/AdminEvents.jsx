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
import { Plus, Pencil, Trash2, Loader2, Calendar, Search, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import CloudinaryUpload from '@/components/admin/CloudinaryUpload';


// Must match backend EventCategory enum exactly
const EVENT_CATEGORIES = [
    'FESTIVAL',
    'CULTURAL',
    'EXHIBITION',
    'CONCERT',
    'SPORTS',
    'RELIGIOUS',

    // NEW
    'WORKSHOP',
    'FOOD',
    'ART',
    'WELLNESS',
    'SPIRITUAL',
    'BUSINESS',
    'TECH',
    'TREKKING',

    'OTHER'
];

const CAT_STYLES = {
    FESTIVAL: 'bg-violet-50 text-violet-700 border-violet-200',
    CULTURAL: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    EXHIBITION: 'bg-sky-50 text-sky-700 border-sky-200',
    CONCERT: 'bg-pink-50 text-pink-700 border-pink-200',
    SPORTS: 'bg-green-50 text-green-700 border-green-200',
    RELIGIOUS: 'bg-amber-50 text-amber-700 border-amber-200',

    // NEW CATEGORIES

    WORKSHOP: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    FOOD: 'bg-red-50 text-red-700 border-red-200',
    ART: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',

    WELLNESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    SPIRITUAL: 'bg-yellow-50 text-yellow-700 border-yellow-200',

    BUSINESS: 'bg-slate-100 text-slate-700 border-slate-300',
    TECH: 'bg-cyan-100 text-cyan-800 border-cyan-300',

    TREKKING: 'bg-lime-50 text-lime-700 border-lime-200',

    OTHER: 'bg-slate-50 text-slate-600 border-slate-200',
};

const emptyForm = {
    name: '', description: '', category: '', venue: '', city: '',
    eventDate: '', endDate: '', latitude: '', longitude: '',
    photos: [], websiteUrl: '', organizerName: '',
};

export default function AdminEvents() {
    const [events, setEvents] = useState([]);
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

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(apiEndpoints.SEARCH_EVENTS, { params: { page, size: 20 } });
            const d = res.data;
            setEvents(d?.content || (Array.isArray(d) ? d : []));
            setTotalPages(d?.totalPages || 1);
        } catch { setEvents([]); }
        finally { setLoading(false); }
    }, [page]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const filtered = events.filter((e) => {
        const matchesSearch = !search || (
            e.name?.toLowerCase().includes(search.toLowerCase()) ||
            e.city?.toLowerCase().includes(search.toLowerCase()) ||
            e.venue?.toLowerCase().includes(search.toLowerCase())
        );

        const matchesCategory =
            categoryFilter === 'ALL' || e.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const openCreate = () => { setForm({ ...emptyForm }); setDialogMode('create'); setDialogOpen(true); };
    const openEdit = (ev) => {
        const photos = ev.imageUrls?.length
            ? ev.imageUrls
            : ev.imageUrl
                ? [ev.imageUrl]
                : [];
        setForm({
            id: ev.id,
            name: ev.name || '',
            description: ev.description || '',
            category: ev.category || '',
            venue: ev.venue || '',
            city: ev.city || '',
            eventDate: ev.eventDate?.split('T')[0] || '',
            endDate: ev.endDate?.split('T')[0] || '',
            latitude: ev.latitude || '',
            longitude: ev.longitude || '',
            photos,
            websiteUrl: ev.websiteUrl || '',
            organizerName: ev.organizerName || '',
        });
        setDialogMode('edit'); setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.name) { toast.error('Event name is required'); return; }
        if (!form.category) { toast.error('Event category is required'); return; }
        if (!form.eventDate) { toast.error('Event date is required'); return; }
        if (!form.city) { toast.error('City is required'); return; }
        try {
            setSaving(true);
            const payload = {
                name: form.name,
                description: form.description || null,
                category: form.category,
                eventDate: form.eventDate,
                endDate: form.endDate || null,
                city: form.city,
                venue: form.venue || null,
                latitude: form.latitude ? parseFloat(form.latitude) : null,
                longitude: form.longitude ? parseFloat(form.longitude) : null,
                organizerName: form.organizerName || null,
                websiteUrl: form.websiteUrl || null,
                imageUrl: form.photos[0] || null,
                imageUrls: form.photos
            };
            if (dialogMode === 'create') {
                await axios.post(apiEndpoints.ADMIN_CREATE_EVENT, payload, { headers: getHeaders() });
                toast.success('Event created successfully!');
            } else {
                await axios.put(apiEndpoints.ADMIN_UPDATE_EVENT(form.id), payload, { headers: getHeaders() });
                toast.success('Event updated successfully!');
            }
            setDialogOpen(false); fetchEvents();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save event'); }
        finally { setSaving(false); }
    };


    const handleDelete = async () => {
        try {
            setDeleting(true);
            await axios.delete(apiEndpoints.ADMIN_DELETE_EVENT(deleteTarget.id), { headers: getHeaders() });
            toast.success('Event deleted'); setDeleteDialogOpen(false); fetchEvents();
        } catch { toast.error('Failed to delete'); } finally { setDeleting(false); }
    };


    const fmtDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Manage Events</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Create and manage tourist events and activities</p>
                </div>
                <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                    Add Event
                </Button>
            </div>

            {/* Search */}
            <Card className="mb-5 shadow-sm border-slate-100">
                <CardContent className="p-3 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search events..."
                            className="pl-9 h-9 text-sm"
                        />
                    </div>

                    <div className="min-w-[220px]">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="h-9 w-[180px] text-sm">
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Categories</SelectItem>
                                {EVENT_CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <span className="ml-auto text-xs text-slate-400">
                        {filtered.length} results
                    </span>
                </CardContent>
            </Card>


            {/* Table */}
            <Card className="shadow-sm border-slate-100 overflow-hidden">
                {loading ? (
                    <CardContent className="p-6 space-y-3">
                        {[...Array(5)].map((_, i) => (
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
                            <Calendar className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="font-medium text-slate-500">No events found</p>
                        <p className="text-sm mt-1">Try adjusting your search or add a new event</p>
                        <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
                            <Plus className="w-4 h-4" /> Add first event
                        </Button>
                    </CardContent>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left pl-5 pr-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-14" />
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Event</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Venue / City</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(ev => {
                                    const thumb = ev.imageUrls?.[0] || ev.imageUrl;
                                    const photoCount = (ev.photos || ev.imageUrls || []).length;
                                    return (
                                        <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="pl-5 pr-3 py-3">
                                                <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-100">
                                                    {thumb
                                                        ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center"><Calendar className="w-4 h-4 text-slate-300" /></div>
                                                    }
                                                    {photoCount > 1 && (
                                                        <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[8px] px-1 leading-4 rounded-tl">+{photoCount - 1}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="text-sm font-semibold text-slate-800">{ev.name}</p>
                                                {ev.organizer && <p className="text-xs text-slate-400 mt-0.5">by {ev.organizer}</p>}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full border ${CAT_STYLES[ev.category] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                    {ev.category || '—'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-sm text-slate-500">{ev.venue || ev.city || '—'}</td>
                                            <td className="px-3 py-3">
                                                <p className="text-sm text-slate-600">{fmtDate(ev.startDate)}</p>
                                                {ev.endDate && <p className="text-xs text-slate-400">→ {fmtDate(ev.endDate)}</p>}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700" title="View event details" onClick={() => window.open(`/events/${ev.id}`, '_blank')}>
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700" onClick={() => openEdit(ev)}>
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => { setDeleteTarget(ev); setDeleteDialogOpen(true); }}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
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
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-50">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                            {dialogMode === 'create' ? 'Add New Event' : 'Edit Event'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMode === 'create' ? 'Fill in the details to create a new event.' : `Editing: ${form.name}`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-2 bg-gray-50">
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Event Details</h3>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Event Name <span className="text-red-500">*</span></Label>
                                    <Input placeholder="" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-10" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Description</Label>
                                    <Textarea placeholder="Describe this event..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Category</Label>
                                        <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                                            <SelectTrigger className="h-10"><SelectValue placeholder="Select category" /></SelectTrigger>
                                            <SelectContent>
                                                {EVENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Organizer</Label>
                                        <Input placeholder="" value={form.organizerName} onChange={e => setForm({ ...form, organizerName: e.target.value })} className="h-10" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Venue</Label>
                                        <Input placeholder="" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} className="h-10" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">City</Label>
                                        <Input placeholder="" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="h-10" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Event Date <span className="text-red-500">*</span></Label>
                                        <Input type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} className="h-10" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">End Date <span className="text-slate-400 font-normal">(optional)</span></Label>
                                        <Input type="date" min={form.eventDate || undefined} value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="h-10" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Latitude</Label>
                                        <Input type="number" step="any" placeholder="" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} className="h-10" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Longitude</Label>
                                        <Input type="number" step="any" placeholder="" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} className="h-10" />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <Label className="text-sm font-medium">Website URL</Label>
                                        <Input placeholder="https://..." value={form.websiteUrl} onChange={e => setForm({ ...form, websiteUrl: e.target.value })} className="h-10" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

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
                            {dialogMode === 'create' ? 'Create Event' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}
                title={`Delete "${deleteTarget?.name}"?`}
                description="This event will be permanently deleted."
                loading={deleting} onConfirm={handleDelete}
            />
        </div>
    );
}
