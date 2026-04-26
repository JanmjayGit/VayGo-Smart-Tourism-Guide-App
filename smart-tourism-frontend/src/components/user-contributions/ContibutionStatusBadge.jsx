import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
    APPROVED: { label: 'Approved', cls: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    VERIFIED: { label: 'Verified', cls: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    PENDING: { label: 'Pending', cls: 'bg-amber-100 text-amber-700', icon: Clock },
    REJECTED: { label: 'Rejected', cls: 'bg-red-100   text-red-700', icon: XCircle },
};

export default function ContributionStatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status?.toUpperCase()] ?? STATUS_CONFIG.PENDING;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
            <Icon className="w-3 h-3" />{cfg.label}
        </span>
    );
}