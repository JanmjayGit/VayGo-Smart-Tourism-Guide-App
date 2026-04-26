import {
    MapPin, Pencil, ExternalLink,
    CheckCircle2, Clock, XCircle,
    MapIcon, Calendar, Building2,
} from 'lucide-react';


const STATUS_CFG = {
    APPROVED: { label: 'Approved', cls: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/20', icon: CheckCircle2 },
    PENDING: { label: 'Pending', cls: 'bg-teal-500/15  text-teal-700  ring-teal-500/20', icon: Clock },
    REJECTED: { label: 'Rejected', cls: 'bg-red-500/15    text-red-700    ring-red-500/20', icon: XCircle },
};

const TYPE_CFG = {
    places: { label: 'Place', Icon: MapIcon, grad: 'from-teal-400 to-cyan-500' },
    events: { label: 'Event', Icon: Calendar, grad: 'from-violet-400 to-purple-500' },
    hotels: { label: 'Hotel', Icon: Building2, grad: 'from-amber-400 to-orange-500' },
};


function resolveStatus(item) {
    if (typeof item.status === 'string') {
        const status = item.status.toUpperCase();

        if (status === 'APPROVED') return 'APPROVED';
        if (status === 'REJECTED') return 'REJECTED';
        if (status === 'PENDING') return 'PENDING';
    }

    if (item.verified === true || item.approved === true) return 'APPROVED';
    if (item.verified === false || item.approved === false) return 'PENDING';

    return 'PENDING';
}




export default function ContributionCard({ item, type, onNavigate, onEdit = null }) {
    const imageUrl = item.imageUrl || item.imageUrls?.[0] || null;
    const typeCfg = TYPE_CFG[type] || TYPE_CFG.places;
    const { Icon: TypeIcon, grad, label: typeLabel } = typeCfg;

    const resolvedStatus = resolveStatus(item);

    const statusCfg = STATUS_CFG[resolvedStatus] ?? STATUS_CFG.PENDING;
    const StatusIcon = statusCfg.icon;
    const isPending = resolvedStatus === 'PENDING';

    const title = item.name || item.title || '—';
    const city = item.city || item.location || item.venue || null;
    const cat = item.category
        ? String(item.category).toLowerCase().replace(/_/g, ' ')
        : null;

    return (
        <div className="group flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white
                        hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50
                        transition-all duration-300">

            {/* Thumbnail */}
            <div
                className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm cursor-pointer"
                onClick={() => onNavigate?.(type, item.id)}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
                        <TypeIcon className="w-7 h-7 text-white/90" />
                    </div>
                )}
                {/* Type badge */}
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${grad}
                                 opacity-90 py-0.5 text-center`}>
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                        {typeLabel}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                {/* Title + status badge */}
                <div className="flex items-start justify-between gap-2">
                    <p
                        className="text-sm font-semibold text-gray-800 truncate leading-snug
                                   group-hover:text-teal-700 transition-colors cursor-pointer"
                        onClick={() => onNavigate?.(type, item.id)}
                    >
                        {title}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                      text-[10px] font-semibold ring-1 shrink-0 ${statusCfg.cls}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {statusCfg.label}
                    </span>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2 flex-wrap">
                    {city && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[120px]">{city}</span>
                        </span>
                    )}
                    {cat && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500
                                         rounded-md font-medium capitalize">
                            {cat}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-center gap-2 shrink-0">
                <button
                    onClick={() => onNavigate?.(type, item.id)}
                    title="View"
                    className="p-1.5 rounded-lg text-gray-300 hover:text-teal-600
                               hover:bg-teal-50 transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                </button>
                {isPending && typeof onEdit === 'function' && (
                    <button
                        onClick={() => onEdit(type, item)}
                        title="Edit submission"
                        className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600
                                   hover:bg-gray-50 transition-colors"
                    >
                        <Pencil className="w-4 h-4 hover:bg-teal-50 hover:text-teal-600" />
                    </button>
                )}
            </div>
        </div>
    );
}