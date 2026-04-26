import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    MapPin, Calendar, MessageSquare, Siren, Bell, Users,
    ArrowRight, TrendingUp, Activity, CheckCircle2, Hotel
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
    { label: 'Manage Hotels', path: '/admin/hotels', icon: Hotel, color: 'text-slate-600', bg: 'bg-slate-100', desc: 'View and manage hotels' },
];

const STATUS_ITEMS = [
    { label: 'Backend API', status: 'Operational', ok: true },
    { label: 'Database', status: 'Connected', ok: true },
    { label: 'Google Maps', status: 'Connected', ok: true },
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

    const now = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const statCards = [
        { label: 'Total Places', value: stats.places, icon: MapPin, color: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-100' },
        { label: 'Total Events', value: stats.events, icon: Calendar, color: 'text-violet-700', bg: 'bg-violet-50', ring: 'ring-violet-100' },
        { label: 'Reviews', value: '—', icon: MessageSquare, color: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-100' },
        { label: 'Emergency Svcs', value: '—', icon: Siren, color: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-100' },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {/* Header */}
                <div className="mb-8 rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Admin Overview
                            </p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                Hello, {user?.username || 'Admin'}
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">{now}</p>
                        </div>

                        <div className="flex items-center gap-3 self-start rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-indigo-700">All Systems Online</p>
                                <p className="text-xs text-indigo-600/80">Everything is running normally</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((s) => {
                        const Icon = s.icon;
                        return (
                            <Card
                                key={s.label}
                                className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
                            >
                                <CardContent className="p-5">
                                    <div className="mb-5 flex items-start justify-between">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.bg} ring-1 ${s.ring}`}>
                                            <Icon className={`h-5 w-5 ${s.color}`} />
                                        </div>
                                        <div className="rounded-full bg-slate-100 p-2">
                                            <TrendingUp className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                                            {s.label}
                                        </p>
                                        <p className="text-3xl font-bold tracking-tight text-slate-950">
                                            {loading ? (
                                                <span className="inline-block h-8 w-14 animate-pulse rounded bg-slate-100" />
                                            ) : s.value}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                    {/* Modules */}
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Admin Modules</h2>
                                <p className="mt-1 text-sm text-slate-500">Core areas you manage every day</p>
                            </div>
                            <Badge className="border border-slate-200 bg-indigo-50 px-3 py-1 text-indigo-600 hover:bg-indigo-50">
                                {MODULES.length} Modules
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {MODULES.map((mod) => (
                                <button
                                    key={mod.path}
                                    onClick={() => navigate(mod.path)}
                                    className="group flex w-full items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-left transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-900">{mod.label}</p>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">{mod.desc}</p>
                                    </div>

                                    <ArrowRight className="ml-4 h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-slate-500" />
                                </button>
                            ))}
                        </div>

                    </section>

                    {/* Right column */}
                    <div className="space-y-6">
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">System Status</h2>
                                    <p className="mt-1 text-sm text-slate-500">Service health and integrations</p>
                                </div>
                                <div className="rounded-full bg-slate-100 p-2">
                                    <Activity className="h-4 w-4 text-slate-500" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {STATUS_ITEMS.map((s) => (
                                    <div
                                        key={s.label}
                                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`h-2.5 w-2.5 rounded-full ${s.ok ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                                            <span className="text-sm font-medium text-slate-700">{s.label}</span>
                                        </div>
                                        <span className={`text-xs font-semibold ${s.ok ? 'text-indigo-600' : 'text-amber-600'}`}>
                                            {s.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
                                <p className="mt-1 text-sm text-slate-500">Common admin shortcuts</p>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={() => navigate('/admin/places')}
                                    className="h-12 w-full justify-center rounded-2xl bg-indigo-600 px-4 text-white hover:bg-indigo-700"
                                >
                                    Add New Place
                                </Button>

                                <Button
                                    onClick={() => navigate('/admin/events')}
                                    variant="outline"
                                    className="h-12 w-full justify-center rounded-2xl bg-indigo-600 px-4 text-white hover:bg-indigo-700"
                                >
                                    Add New Event
                                </Button>

                                <Button
                                    onClick={() => navigate('/admin/notifications')}
                                    variant="outline"
                                    className="h-12 w-full justify-center rounded-2xl bg-indigo-600 px-4 text-white hover:bg-indigo-700"
                                >
                                    Send Notification
                                </Button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
