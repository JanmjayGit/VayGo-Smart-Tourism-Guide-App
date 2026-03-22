import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import apiEndpoints from '@/util/apiEndpoints';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Bell, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

function validatePassword(current, next, confirm) {
    if (!current) return 'Current password is required';
    if (!next || next.length < 8) return 'New password must be at least 8 characters';
    if (next === current) return 'New password must differ from current password';
    if (next !== confirm) return 'Passwords do not match';
    return null;
}


function NotificationsSection({ token }) {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axios.get(apiEndpoints.NOTIFICATION_PREFERENCES, { headers: authHeaders(token) })
            .then((res) => setEnabled(res.data?.notificationsEnabled ?? res.data?.enabled ?? false))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [token]);

    const handleToggle = async (next) => {
        setSaving(true);
        try {
            await axios.put(
                apiEndpoints.NOTIFICATION_PREFERENCES,
                { notificationsEnabled: next },
                { headers: authHeaders(token) }
            );
            setEnabled(next);
            toast.success(`Notifications ${next ? 'enabled' : 'disabled'}`);
        } catch {
            toast.error('Failed to save notification preference');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="border border-gray-200 shadow-sm h-fit">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-teal-500" /> Notifications
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-800">Push Notifications</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Receive alerts about events, places, and updates
                        </p>
                    </div>
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400 shrink-0" />
                    ) : (
                        <Switch
                            checked={enabled}
                            onCheckedChange={handleToggle}
                            disabled={saving}
                            className="data-[state=checked]:bg-teal-600 shrink-0"
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function PasswordSection({ token }) {
    const [open, setOpen] = useState(false);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [show, setShow] = useState({ current: false, next: false, confirm: false });
    const [fields, setFields] = useState({ current: '', next: '', confirm: '' });

    const toggleShow = (f) => setShow((s) => ({ ...s, [f]: !s[f] }));
    const setField = (f, v) => { setFields((s) => ({ ...s, [f]: v })); setFormError(''); };

    const handleSubmit = async () => {
        const err = validatePassword(fields.current, fields.next, fields.confirm);
        if (err) { setFormError(err); return; }
        setSaving(true);
        try {
            await axios.post(
                apiEndpoints.CHANGE_PASSWORD,
                { currentPassword: fields.current, newPassword: fields.next },
                { headers: authHeaders(token) }
            );
            toast.success('Password changed successfully');
            setOpen(false);
            setFields({ current: '', next: '', confirm: '' });
        } catch (e) {
            setFormError(e.response?.data?.message ?? 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const PasswordInput = ({ field, placeholder }) => (
        <div className="relative">
            <Input
                type={show[field] ? 'text' : 'password'}
                value={fields[field]}
                onChange={(e) => setField(field, e.target.value)}
                placeholder={placeholder}
                className="pr-10 h-10 border-gray-200"
            />
            <button
                type="button"
                onClick={() => toggleShow(field)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
                {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );

    return (
        <Card className="border border-gray-200 shadow-sm h-fit">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-teal-500" /> Password & Security
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-800">Change Password</p>
                    <p className="text-xs text-gray-500 mt-0.5">Update your account password securely</p>
                </div>
                <Dialog open={open} onOpenChange={(o) => { setOpen(o); setFormError(''); }}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="text-sm border-gray-200 bg-gray-900 text-white hover:bg-gray-800 shrink-0">
                            Change
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label className="text-sm">Current Password</Label>
                                <PasswordInput field="current" placeholder="Enter current password" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm">New Password</Label>
                                <PasswordInput field="next" placeholder="Min. 8 characters" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm">Confirm New Password</Label>
                                <PasswordInput field="confirm" placeholder="Repeat new password" />
                            </div>
                            {formError && (
                                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                    {formError}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="bg-teal-600 hover:bg-teal-700 text-white"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                                Update Password
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

export default function Settings() {
    const { user } = useAuth();
    const token = localStorage.getItem('token');

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6" style={{ fontFamily: "'Inter Tight', sans-serif" }}>

            {/* Heading */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences and security</p>
            </div>

            {/* Row 1: Notifications (left) + Password (right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NotificationsSection token={token} />
                <PasswordSection token={token} />
            </div>

        </div>
    );
}