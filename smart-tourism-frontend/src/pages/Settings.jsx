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
import { Bell, Lock, Eye, EyeOff, Loader2, Calendar, Cloud, AlertTriangle, Zap } from 'lucide-react';

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

function validatePassword(current, next, confirm) {
    if (!current) return 'Current password is required';
    if (!next || next.length < 8) return 'New password must be at least 8 characters';
    if (next === current) return 'New password must differ from current password';
    if (next !== confirm) return 'Passwords do not match';
    return null;
}

// ── Default prefs matching NotificationPreferenceDto ─────────────────────────
const DEFAULT_PREFS = {
    enableEventAlerts: true,
    enableWeatherAlerts: true,
    enableEmergencyAlerts: true,
    enableRecommendationAlerts: true,
};

const PREF_ITEMS = [
    {
        key: 'enableEventAlerts',
        label: 'Event Alerts',
        desc: 'Festivals, concerts, and local events',
        icon: Calendar,
        color: 'text-[#D4745F]',
    },
    {
        key: 'enableWeatherAlerts',
        label: 'Weather Alerts',
        desc: 'Rain, storms, and weather warnings',
        icon: Cloud,
        color: 'text-blue-500',
    },
    {
        key: 'enableEmergencyAlerts',
        label: 'Emergency Alerts',
        desc: 'Critical safety and emergency updates',
        icon: AlertTriangle,
        color: 'text-red-500',
    },
    {
        key: 'enableRecommendationAlerts',
        label: 'Recommendations',
        desc: 'Personalised place and travel tips',
        icon: Zap,
        color: 'text-purple-500',
    },
];

// ── Notifications section ─────────────────────────────────────────────────────
function NotificationsSection({ token }) {
    const [prefs, setPrefs] = useState(DEFAULT_PREFS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // key being saved

    // Fetch on mount
    useEffect(() => {
        axios
            .get(apiEndpoints.NOTIFICATION_PREFERENCES, { headers: authHeaders(token) })
            .then((res) => {
                const data = res.data || {};
                setPrefs({
                    enableEventAlerts: data.enableEventAlerts ?? true,
                    enableWeatherAlerts: data.enableWeatherAlerts ?? true,
                    enableEmergencyAlerts: data.enableEmergencyAlerts ?? true,
                    enableRecommendationAlerts: data.enableRecommendationAlerts ?? true,
                });
            })
            .catch(() => {/* keep defaults */ })
            .finally(() => setLoading(false));
    }, [token]);

    // Toggle a single preference and save immediately
    const handleToggle = async (key, next) => {
        const updated = { ...prefs, [key]: next };
        setPrefs(updated); // optimistic update
        setSaving(key);
        try {
            await axios.put(
                apiEndpoints.NOTIFICATION_PREFERENCES,
                updated,          // send the full DTO so backend can merge
                { headers: authHeaders(token) }
            );
            toast.success('Preference saved');
        } catch {
            // revert on error
            setPrefs(prefs);
            toast.error('Failed to save preference');
        } finally {
            setSaving(null);
        }
    };

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-teal-500" /> Notifications
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading preferences…
                    </div>
                ) : (
                    PREF_ITEMS.map(({ key, label, desc, icon: Icon, color }) => (
                        <div key={key} className="flex items-center justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800">{label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                                </div>
                            </div>
                            {saving === key ? (
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />
                            ) : (
                                <Switch
                                    checked={!!prefs[key]}
                                    onCheckedChange={(next) => handleToggle(key, next)}
                                    disabled={saving !== null}
                                    className="data-[state=checked]:bg-teal-600 shrink-0"
                                />
                            )}
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

// ── Password section ──────────────────────────────────────────────────────────
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
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
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
                        <Button
                            variant="outline"
                            className="text-sm border-gray-200 bg-gray-900 text-white hover:bg-gray-800 shrink-0"
                        >
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
                                {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                                Update Password
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Settings() {
    const token = localStorage.getItem('token');

    return (
        <div
            className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6"
            style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    Manage your account preferences and security
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <NotificationsSection token={token} />
                <PasswordSection token={token} />
            </div>
        </div>
    );
}