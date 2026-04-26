import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { MapPin, CalendarDays, Hotel, Plus } from 'lucide-react';

import ContributionCard from '@/components/user-contributions/ContributionCard';
import ContributionEditModal from '@/components/user-contributions/ContributionEditModal';
import apiEndpoints from '@/util/apiEndpoints';


const TABS = [
    {
        id: 'places',
        label: 'Places',
        Icon: MapPin,
        fetchUrl: apiEndpoints.MY_PLACES,
        editUrl: (id) => apiEndpoints.USER_EDIT_PLACE(id),
        addRoute: '/places/submit',
        emptyMsg: 'No places submitted yet',
    },
    {
        id: 'events',
        label: 'Events',
        Icon: CalendarDays,
        fetchUrl: apiEndpoints.MY_EVENTS,
        editUrl: (id) => apiEndpoints.USER_EDIT_EVENT(id),
        addRoute: '/events/submit',
        emptyMsg: 'No events submitted yet',
    },
    {
        id: 'hotels',
        label: 'Hotels',
        Icon: Hotel,
        fetchUrl: apiEndpoints.MY_HOTELS,
        editUrl: (id) => apiEndpoints.USER_EDIT_HOTEL(id),
        addRoute: '/hotels/request',
        emptyMsg: 'No hotels requested yet',
    },
];

function CardSkeleton() {
    return (
        <div className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white animate-pulse">
            <div className="w-16 h-16 rounded-xl bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
        </div>
    );
}

export default function MyContributions() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const [activeTab, setActiveTab] = useState('places');
    const [data, setData] = useState({ places: [], events: [], hotels: [] });
    const [loading, setLoading] = useState(true);
    const [editTarget, setEditTarget] = useState(null);

    const fetchTab = useCallback(async (tabId) => {
        const cfg = TABS.find(t => t.id === tabId);
        if (!cfg || !token) return;
        setLoading(true);
        try {
            const res = await axios.get(cfg.fetchUrl, { headers });

            const list = Array.isArray(res.data)
                ? res.data
                : (res.data?.content || []);
            setData(prev => ({ ...prev, [tabId]: list }));
        } catch {
            setData(prev => ({ ...prev, [tabId]: [] }));
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchTab(activeTab); }, [activeTab, fetchTab]);


    const handleEdit = (type, item) => setEditTarget({ type, item });

    const handleSave = async (type, id, form) => {
        const cfg = TABS.find(t => t.id === type);
        if (!cfg) {
            toast.error('Edit not supported');
            return;
        }

        let payload = form;

        if (type === 'places') {
            payload = {
                name: form.name,
                description: form.description || null,
                category: form.category || null,
                city: form.city || null,
                address: form.address || null,
                latitude: form.latitude !== '' ? Number(form.latitude) : null,
                longitude: form.longitude !== '' ? Number(form.longitude) : null,
                contactInfo: form.contactInfo || null,
                openingHours: form.openingHours || null,
                imageUrl: form.imageUrls?.[0] || null,
                imageUrls: form.imageUrls || [],
            };
        }

        if (type === 'events') {
            payload = {
                name: form.name,
                description: form.description || null,
                category: form.category || null,
                eventDate: form.eventDate || null,
                endDate: form.endDate || null,
                eventTime: form.eventTime || null,
                city: form.city || null,
                venue: form.venue || null,
                address: form.address || null,
                latitude: form.latitude !== '' ? Number(form.latitude) : null,
                longitude: form.longitude !== '' ? Number(form.longitude) : null,
                organizerName: form.organizerName || null,
                organizerContact: form.organizerContact || null,
                ticketInfo: form.ticketInfo || null,
                entryFee: form.entryFee !== '' ? Number(form.entryFee) : null,
                websiteUrl: form.websiteUrl || null,
                imageUrl: form.imageUrls?.[0] || null,
                imageUrls: form.imageUrls || [],
            };
        }

        if (type === 'hotels') {
            payload = {
                name: form.name,
                description: form.description || null,
                city: form.city || null,
                address: form.address || null,
                latitude: form.latitude !== '' ? Number(form.latitude) : null,
                longitude: form.longitude !== '' ? Number(form.longitude) : null,
                pricePerNight: form.pricePerNight !== '' ? Number(form.pricePerNight) : null,
                rating: form.rating !== '' ? Number(form.rating) : null,
                contactInfo: form.contactInfo || null,
                openingHours: form.openingHours || null,
                imageUrl: form.imageUrls?.[0] || null,
                imageUrls: form.imageUrls || [],
            };
        }

        await axios.put(cfg.editUrl(id), payload, { headers });
        toast.success('Submission updated!');
        fetchTab(type);
    };



    const handleNavigate = (type, id) => navigate(`/${type}/${id}`);

    const activeCfg = TABS.find(t => t.id === activeTab);
    const items = data[activeTab] || [];

    return (
        <div className="space-y-5">

            {/* Tab Bar */}
            <div className="flex justify-center gap-12 flex-wrap">
                {TABS.map(({ id, label, Icon }) => {
                    const active = id === activeTab;
                    const count = data[id]?.length ?? 0;
                    return (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                        border transition-all duration-200 ${active
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-200'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300 hover:text-teal-600'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full
                                             text-[10px] font-bold ${active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-3">
                    <CardSkeleton /><CardSkeleton /><CardSkeleton />
                </div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                        {activeCfg && <activeCfg.Icon className="w-8 h-8 text-gray-300" />}
                    </div>
                    <div>
                        <p className="text-gray-500 font-medium">{activeCfg?.emptyMsg}</p>
                        <p className="text-sm text-gray-400 mt-1">Be the first to add one!</p>
                    </div>
                    <button
                        onClick={() => navigate(activeCfg?.addRoute)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white
                                   text-sm font-semibold hover:bg-teal-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add {activeCfg?.label}
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map(item => (
                        <ContributionCard
                            key={item.id}
                            item={item}
                            type={activeTab}
                            onNavigate={handleNavigate}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}

            {editTarget && (
                <ContributionEditModal
                    item={editTarget.item}
                    type={editTarget.type}
                    onSave={handleSave}
                    onClose={() => setEditTarget(null)}
                />
            )}
        </div>
    );
}