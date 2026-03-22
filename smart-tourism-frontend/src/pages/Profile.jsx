import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import apiEndpoints from '@/util/apiEndpoints';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Mail, Shield, Calendar, Edit2, Check, X } from 'lucide-react';
import MyContributions from '@/components/profile/MyContributions';

const ROLE_LABELS = {
    ROLE_ADMIN: { label: 'Admin', cls: 'bg-red-100 text-red-700' },
    ROLE_USER: { label: 'User', cls: 'bg-teal-100 text-teal-700' },
    ROLE_TOURIST: { label: 'Tourist', cls: 'bg-blue-100 text-blue-700' },
};

function RoleBadge({ role }) {
    const meta = ROLE_LABELS[role] ?? { label: role, cls: 'bg-gray-100 text-gray-700' };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.cls}`}>
            <Shield className="w-3 h-3 mr-1" />{meta.label}
        </span>
    );
}

export default function Profile() {
    const { user: authUser, updateUser } = useAuth();
    const token = localStorage.getItem('token');

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingName, setEditingName] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(apiEndpoints.GET_PROFILE, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProfile(res.data);
                setNewUsername(res.data.username || '');
            } catch (err) {
                setError(err.response?.data?.message ?? 'Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [token]);

    const handleSaveUsername = async () => {
        if (!newUsername.trim() || newUsername.trim().length < 3) {
            toast.error('Username must be at least 3 characters');
            return;
        }
        setSaving(true);
        try {
            const res = await axios.put(
                apiEndpoints.UPDATE_PROFILE,
                { username: newUsername.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProfile(res.data);
            setNewUsername(res.data.username);
            updateUser({ username: newUsername.trim() });
            setEditingName(false);
            toast.success('Username updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Failed to update username');
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setNewUsername(profile?.username ?? '');
        setEditingName(false);
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6 space-y-4 max-w-5xl mx-auto">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-56 w-full rounded-2xl" />
                    <Skeleton className="h-56 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-center text-red-500">
                    <p className="font-semibold">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-2 text-sm underline text-gray-500">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const preferences = profile?.preferences ?? {};
    const hasPreferences = Object.keys(preferences).length > 0;

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6" style={{ fontFamily: "'Inter Tight', sans-serif" }}>

            {/* Page Heading */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                <p className="text-sm text-gray-500 mt-0.5">View and manage your account information</p>
            </div>

            {/* Row 1: Account Details (left) + Preferences (right, if exists) */}
            <div className={`grid grid-cols-1 ${hasPreferences ? 'md:grid-cols-2' : ''} gap-6`}>

                {/* Account Details */}
                <Card className="border border-gray-200 shadow-sm h-fit">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-3xl font-semibold text-gray-700">Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">

                        {/* Username — editable */}
                        <div>
                            <Label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Username</Label>
                            {editingName ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="h-9 text-sm border-gray-200"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveUsername();
                                            if (e.key === 'Escape') cancelEdit();
                                        }}
                                    />
                                    <Button size="icon" variant="ghost" className="text-teal-600 hover:text-teal-700 h-9 w-9" onClick={handleSaveUsername} disabled={saving}>
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="text-gray-400 hover:text-gray-600 h-9 w-9" onClick={cancelEdit}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-800">{profile.username}</span>
                                    <button onClick={() => setEditingName(true)} className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium">
                                        <Edit2 className="w-3 h-3" /> Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <Label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Email</Label>
                            <div className="flex items-center gap-2 text-sm text-gray-800">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {profile.email}
                                <span className="ml-1 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">read only</span>
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <Label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Role</Label>
                            <RoleBadge role={profile.role ?? profile.roles?.[0]} />
                        </div>

                        {/* Member Since */}
                        {profile.createdAt && (
                            <div>
                                <Label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Member Since</Label>
                                <div className="flex items-center gap-2 text-sm text-gray-800">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Preferences */}
                {hasPreferences && (
                    <Card className="border border-gray-200 shadow-sm h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-3xl font-semibold text-gray-700">Preferences</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(preferences).map(([key, value]) => (
                                    <div key={key} className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span className="text-sm text-gray-700 font-medium mt-0.5">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Row 2: My Contributions — tabbed, fetched from API */}
            <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-3xl font-semibold text-gray-700">My Contributions</CardTitle>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Places, events, and hotels you've submitted for admin review
                    </p>
                </CardHeader>
                <CardContent>
                    <MyContributions />
                </CardContent>
            </Card>

        </div>
    );
}