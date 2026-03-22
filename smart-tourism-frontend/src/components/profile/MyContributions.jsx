import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapPin, CalendarDays, Hotel, Loader2, Trash2, Edit2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import apiEndpoints from '@/util/apiEndpoints';

const TABS = [
    { key: 'places', label: 'Places Added', icon: MapPin, color: 'teal' },
    { key: 'events', label: 'Events Added', icon: CalendarDays, color: 'blue' },
    { key: 'hotels', label: 'Hotels Added', icon: Hotel, color: 'indigo' },
];

const STATUS_ICON = {
    APPROVED: { icon: CheckCircle, cls: 'text-emerald-500 bg-emerald-50', label: 'Approved' },
    PENDING: { icon: Clock, cls: 'text-amber-500 bg-amber-50', label: 'Pending' },
    REJECTED: { icon: XCircle, cls: 'text-red-500 bg-red-50', label: 'Rejected' },
    PENDING_REVIEW: { icon: AlertCircle, cls: 'text-amber-500 bg-amber-50', label: 'In Review' },
};

function StatusBadge({ status }) {
    const s = STATUS_ICON[status] ?? STATUS_ICON.PENDING;
    const Icon = s.icon;
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}>
            <Icon className="w-3 h-3" /> {s.label}
        </span>
    );
}

function ContributionCard({ item, type, onDelete }) {
    const navigate = useNavigate();
    const image = item.imageUrls?.[0] || item.imageUrl;
    const city = item.city || item.address?.split(',')[0] || '';
    const date = item.createdAt
        ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : null;

    const editRoute = type === 'places' ? `/places/submit?edit=${item.id}` :
        type === 'events' ? `/events/submit?edit=${item.id}` :
            `/hotels/request?edit=${item.id}`;

    return (
        <div className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white">
            {/* Image */}
            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {image
                    ? <img src={image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">
                        {type === 'places' ? '📍' : type === 'events' ? '🎉' : '🏨'}
                    </div>
                }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.name}</p>
                    <StatusBadge status={item.status || item.approvalStatus || 'PENDING'} />
                </div>
                {city && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" /> {city}
                    </p>
                )}
                {date && <p className="text-xs text-gray-400 mt-0.5">Added {date}</p>}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1 shrink-0">
                <button
                    onClick={() => navigate(editRoute)}
                    title="Edit"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                >
                    <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => onDelete(item.id)}
                    title="Delete"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

export default function MyContributions() {
    const token = localStorage.getItem('token');
    const [activeTab, setActiveTab] = useState('places');
    const [contributions, setContributions] = useState({ places: [], events: [], hotels: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const headers = { Authorization: `Bearer ${token}` };
        setLoading(true);

        Promise.allSettled([
            // Try dedicated contributions endpoint first
            axios.get(apiEndpoints.GET_USER_CONTRIBUTIONS, { headers }),
            // Fallback fetches per-type
            axios.get(apiEndpoints.SUBMIT_PLACE, { headers }).catch(() => ({ data: [] })),
            axios.get(apiEndpoints.SUBMIT_EVENT, { headers }).catch(() => ({ data: [] })),
            axios.get(apiEndpoints.REQUEST_HOTEL, { headers }).catch(() => ({ data: [] })),
        ]).then(([contribRes, placesRes, eventsRes, hotelsRes]) => {
            if (contribRes.status === 'fulfilled' && contribRes.value?.data) {
                const all = contribRes.value.data;
                // Backend may return flat list with a `type` field, or separate arrays
                if (Array.isArray(all)) {
                    setContributions({
                        places: all.filter(c => c.type === 'PLACE' || c.category),
                        events: all.filter(c => c.type === 'EVENT' || c.eventDate),
                        hotels: all.filter(c => c.type === 'HOTEL' || c.pricePerNight),
                    });
                } else {
                    setContributions({
                        places: all.places || [],
                        events: all.events || [],
                        hotels: all.hotels || [],
                    });
                }
            } else {
                // Use individual fallback results
                setContributions({
                    places: Array.isArray(placesRes.value?.data) ? placesRes.value.data :
                        (placesRes.value?.data?.content || []),
                    events: Array.isArray(eventsRes.value?.data) ? eventsRes.value.data :
                        (eventsRes.value?.data?.content || []),
                    hotels: Array.isArray(hotelsRes.value?.data) ? hotelsRes.value.data :
                        (hotelsRes.value?.data?.content || []),
                });
            }
        }).finally(() => setLoading(false));
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this contribution? This cannot be undone.')) return;
        try {
            const headers = { Authorization: `Bearer ${token}` };
            if (activeTab === 'places') await axios.delete(`${apiEndpoints.SUBMIT_PLACE}/${id}`, { headers });
            else if (activeTab === 'events') await axios.delete(`${apiEndpoints.SUBMIT_EVENT}/${id}`, { headers });
            else await axios.delete(`${apiEndpoints.REQUEST_HOTEL}/${id}`, { headers });

            setContributions(prev => ({
                ...prev,
                [activeTab]: prev[activeTab].filter(c => c.id !== id),
            }));
            toast.success('Contribution deleted');
        } catch {
            toast.error('Failed to delete. You may not have permission.');
        }
    };

    const activeItems = contributions[activeTab] || [];

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all ${activeTab === key
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                        {contributions[key]?.length > 0 && (
                            <span className={`ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-600'}`}>
                                {contributions[key].length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
                </div>
            ) : activeItems.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <p className="text-3xl mb-2">
                        {activeTab === 'places' ? '📍' : activeTab === 'events' ? '🎉' : '🏨'}
                    </p>
                    <p className="text-sm font-medium text-gray-500">No {activeTab} submitted yet</p>
                    <p className="text-xs text-gray-400 mt-1">Use the menu to add your first submission</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {activeItems.map(item => (
                        <ContributionCard
                            key={item.id}
                            item={item}
                            type={activeTab}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
