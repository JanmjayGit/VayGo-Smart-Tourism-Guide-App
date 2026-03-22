import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, Megaphone, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import DataTable from '@/components/admin/DataTable';
import PageHeader from '@/components/admin/PageHeader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

const CATEGORIES = ['HOSPITAL', 'POLICE_STATION', 'FIRE_STATION', 'PHARMACY'];

const emptyForm = {
    name: '', category: '', phone: '', address: '', city: '', state: '',
    latitude: '', longitude: '', is24x7: false, description: '',
};

export default function AdminEmergency() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Alert form
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertForm, setAlertForm] = useState({ city: '', title: '', message: '', priority: 'CRITICAL' });
    const [sendingAlert, setSendingAlert] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true);
            let res;
            if (categoryFilter !== 'ALL') {
                res = await axios.get(apiEndpoints.EMERGENCY_BY_CATEGORY(categoryFilter));
            } else {
                res = await axios.get(apiEndpoints.EMERGENCY_BY_CITY('Delhi'));
            }
            setServices(Array.isArray(res.data) ? res.data : res.data?.content || []);
        } catch {
            setServices([]);
        } finally {
            setLoading(false);
        }
    }, [categoryFilter]);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    const filteredServices = search
        ? services.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.city?.toLowerCase().includes(search.toLowerCase()))
        : services;

    const openCreate = () => { setForm({ ...emptyForm }); setDialogMode('create'); setDialogOpen(true); };

    const openEdit = (svc) => {
        setForm({
            id: svc.id, name: svc.name || '', category: svc.category || '', phone: svc.phone || svc.contactNumber || '',
            address: svc.address || '', city: svc.city || '', state: svc.state || '',
            latitude: svc.latitude || '', longitude: svc.longitude || '',
            is24x7: svc.is24x7 || svc.open24Hours || false, description: svc.description || '',
        });
        setDialogMode('edit');
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.category) { toast.error('Name and category are required'); return; }
        try {
            setSaving(true);
            const payload = {
                ...form,
                latitude: form.latitude ? parseFloat(form.latitude) : null,
                longitude: form.longitude ? parseFloat(form.longitude) : null,
                contactNumber: form.phone,
                open24Hours: form.is24x7,
            };
            const id = payload.id;
            delete payload.id;

            if (dialogMode === 'create') {
                await axios.post(apiEndpoints.EMERGENCY_CREATE, payload, { headers });
                toast.success('Service created');
            } else {
                await axios.put(apiEndpoints.EMERGENCY_UPDATE(id), payload, { headers });
                toast.success('Service updated');
            }
            setDialogOpen(false);
            fetchServices();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await axios.delete(apiEndpoints.EMERGENCY_DELETE(deleteTarget.id), { headers });
            toast.success('Service deleted');
            setDeleteDialogOpen(false);
            fetchServices();
        } catch { toast.error('Failed to delete'); }
        finally { setDeleting(false); }
    };

    const handleSendAlert = async () => {
        if (!alertForm.message) { toast.error('Message is required'); return; }
        try {
            setSendingAlert(true);
            await axios.post(apiEndpoints.EMERGENCY_ALERT, alertForm, { headers });
            toast.success('Emergency alert sent!');
            setAlertOpen(false);
            setAlertForm({ city: '', title: '', message: '', priority: 'CRITICAL' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send alert');
        } finally { setSendingAlert(false); }
    };

    const categoryLabel = (cat) => {
        const map = { HOSPITAL: '🏥 Hospital', POLICE_STATION: '🚔 Police', FIRE_STATION: '🚒 Fire', PHARMACY: '💊 Pharmacy' };
        return map[cat] || cat;
    };

    const columns = [
        { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
        { key: 'category', label: 'Category', render: (r) => <Badge variant="outline" className="text-xs">{categoryLabel(r.category)}</Badge> },
        { key: 'city', label: 'City', render: (r) => <span className="text-sm">{r.city || '—'}</span> },
        { key: 'phone', label: 'Phone', render: (r) => <span className="text-sm font-mono">{r.phone || r.contactNumber || '—'}</span> },
        {
            key: '24x7', label: '24/7', className: 'w-16',
            render: (r) => (r.is24x7 || r.open24Hours)
                ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Yes</Badge>
                : <Badge variant="outline" className="text-slate-400">No</Badge>,
        },
        {
            key: 'actions', label: '', className: 'w-24 text-right',
            render: (r) => (
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { setDeleteTarget(r); setDeleteDialogOpen(true); }}><Trash2 className="w-4 h-4" /></Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <PageHeader title="Emergency Services" subtitle={`${services.length} services loaded`}>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setAlertOpen(true)}>
                    <Megaphone className="w-4 h-4 mr-2" /> Broadcast Alert
                </Button>
                <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Service
                </Button>
            </PageHeader>

            <DataTable columns={columns} data={filteredServices} loading={loading} searchPlaceholder="Search services..." onSearch={setSearch} page={0} totalPages={1}
                filters={
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{categoryLabel(c)}</SelectItem>)}
                        </SelectContent>
                    </Select>
                }
            />

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{dialogMode === 'create' ? 'Add Emergency Service' : 'Edit Service'}</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                        <div className="sm:col-span-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                        <div>
                            <Label>Category *</Label>
                            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{categoryLabel(c)}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                        <div><Label>City</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                        <div><Label>State</Label><Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
                        <div className="sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                        <div><Label>Latitude</Label><Input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} /></div>
                        <div><Label>Longitude</Label><Input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} /></div>
                        <div className="sm:col-span-2 flex items-center gap-3">
                            <Switch checked={form.is24x7} onCheckedChange={v => setForm({ ...form, is24x7: v })} />
                            <Label>Available 24/7</Label>
                        </div>
                        <div className="sm:col-span-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700">
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {dialogMode === 'create' ? 'Create' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Alert Dialog */}
            <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" /> Broadcast Emergency Alert
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div><Label>City (leave empty for broadcast to all)</Label><Input value={alertForm.city} onChange={e => setAlertForm({ ...alertForm, city: e.target.value })} placeholder="e.g. Delhi" /></div>
                        <div><Label>Title</Label><Input value={alertForm.title} onChange={e => setAlertForm({ ...alertForm, title: e.target.value })} placeholder="Emergency Alert" /></div>
                        <div><Label>Message *</Label><Textarea rows={3} value={alertForm.message} onChange={e => setAlertForm({ ...alertForm, message: e.target.value })} /></div>
                        <div>
                            <Label>Priority</Label>
                            <Select value={alertForm.priority} onValueChange={v => setAlertForm({ ...alertForm, priority: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="CRITICAL">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAlertOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendAlert} disabled={sendingAlert} className="bg-red-600 hover:bg-red-700">
                            {sendingAlert && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Send Alert
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title={`Delete "${deleteTarget?.name}"?`} description="This service will be permanently removed." loading={deleting} onConfirm={handleDelete} />
        </div>
    );
}
