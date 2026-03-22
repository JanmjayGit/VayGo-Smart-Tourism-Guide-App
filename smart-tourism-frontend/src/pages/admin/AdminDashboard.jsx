import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    MapPin, Calendar, MessageSquare, Siren, Bell, Users,
    ArrowRight, TrendingUp, Activity, CheckCircle2,
} from 'lucide-react';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

const MODULES = [
    { label: 'Manage Places', path: '/admin/places', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Add, edit & delete tourist places' },
    { label: 'Manage Events', path: '/admin/events', icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50', desc: 'Create and manage events' },
    { label: 'Review Moderation', path: '/admin/reviews', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Moderate user reviews' },
    { label: 'Emergency Services', path: '/admin/emergency', icon: Siren, color: 'text-red-600', bg: 'bg-red-50', desc: 'Manage emergency contacts' },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Broadcast messages to users' },
    { label: 'User Management', path: '/admin/users', icon: Users, color: 'text-slate-600', bg: 'bg-slate-100', desc: 'View and manage users' },
];

const STATUS_ITEMS = [
    { label: 'Backend API', status: 'Operational', ok: true },
    { label: 'Database', status: 'Connected', ok: true },
    { label: 'Google Maps', status: 'Development Mode', ok: false },
    { label: 'WebSocket', status: 'Active', ok: true },
];

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ places: null, events: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            axios.get(apiEndpoints.GET_PLACES, { params: { page: 0, size: 1 } }),
            axios.get(apiEndpoints.SEARCH_EVENTS, { params: { page: 0, size: 1 } }),
        ]).then(([p, e]) => {
            setStats({
                places: p.status === 'fulfilled' ? (p.value.data?.totalElements ?? '—') : '—',
                events: e.status === 'fulfilled' ? (e.value.data?.totalElements ?? '—') : '—',
            });
        }).finally(() => setLoading(false));
    }, []);

    const now = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Hello, {user?.username || 'Admin'}
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">{now}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs font-medium px-2.5 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
                        All Systems Online
                    </Badge>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Places', value: stats.places, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                    { label: 'Total Events', value: stats.events, icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
                    { label: 'Reviews', value: '—', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                    { label: 'Emergency Svcs', value: '—', icon: Siren, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <Card key={s.label} className={`border shadow-sm hover:shadow-md transition-shadow ${s.border}`}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                                        <Icon className={`w-4.5 h-4.5 ${s.color}`} />
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-slate-300" />
                                </div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {loading ? <span className="inline-block w-10 h-7 bg-slate-100 rounded animate-pulse" /> : s.value}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Module Grid + Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Modules — spans 2 cols */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-slate-800">Admin Modules</h2>
                        <p className="text-xs text-slate-400">6 modules available</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {MODULES.map((mod) => {
                            const Icon = mod.icon;
                            return (
                                <button
                                    key={mod.path}
                                    onClick={() => navigate(mod.path)}
                                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm text-left hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer w-full"
                                >
                                    <div className={`w-10 h-10 rounded-lg ${mod.bg} flex items-center justify-center shrink-0`}>
                                        <Icon className={`w-5 h-5 ${mod.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13.5px] font-semibold text-slate-800">{mod.label}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{mod.desc}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* System Status */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-slate-800">System Status</h2>
                        <Activity className="w-4 h-4 text-slate-300" />
                    </div>
                    <Card className="border-slate-100 shadow-sm">
                        <CardContent className="p-4 space-y-3">
                            {STATUS_ITEMS.map((s) => (
                                <div key={s.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${s.ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                        <span className="text-sm text-slate-600">{s.label}</span>
                                    </div>
                                    <span className={`text-xs font-medium ${s.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {s.status}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Quick actions */}
                    <div className="mt-4 space-y-2">
                        <Button
                            onClick={() => navigate('/admin/places')}
                            className="w-full justify-start gap-3 bg-indigo-600 hover:bg-indigo-700 text-white h-10"
                        >
                            <MapPin className="w-4 h-4" /> Add New Place
                        </Button>
                        <Button
                            onClick={() => navigate('/admin/events')}
                            variant="outline"
                            className="w-full justify-start gap-3 h-10 border-slate-200"
                        >
                            <Calendar className="w-4 h-4 text-violet-500" /> Add New Event
                        </Button>
                        <Button
                            onClick={() => navigate('/admin/notifications')}
                            variant="outline"
                            className="w-full justify-start gap-3 h-10 border-slate-200"
                        >
                            <Bell className="w-4 h-4 text-emerald-500" /> Send Notification
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
