import { Badge } from '@/components/ui/badge';

export default function StatusBadge({ verified }) {
    return verified
        ? <Badge className="bg-emerald-50 text-indigo-700 border border-indigo-200 text-xs">Verified</Badge>
        : <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs">Pending Review</Badge>;
}