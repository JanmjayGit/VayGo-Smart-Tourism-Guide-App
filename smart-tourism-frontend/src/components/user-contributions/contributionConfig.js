import { MapPin, CalendarDays, Hotel, CheckCircle2, Clock, XCircle } from 'lucide-react';

export const STATUS_CONFIG = {
    APPROVED: { label: 'Approved', cls: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    VERIFIED: { label: 'Verified', cls: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    PENDING: { label: 'Pending', cls: 'bg-amber-100 text-amber-700', icon: Clock },
    REJECTED: { label: 'Rejected', cls: 'bg-red-100 text-red-700', icon: XCircle },
};

export const TABS = [
    { id: 'places', label: 'Places', icon: MapPin, addRoute: '/places/submit', emptyMsg: 'No places submitted yet' },
    { id: 'events', label: 'Events', icon: CalendarDays, addRoute: '/events/submit', emptyMsg: 'No events submitted yet' },
    { id: 'hotels', label: 'Hotels', icon: Hotel, addRoute: '/hotels/request', emptyMsg: 'No hotels submitted yet' },
];