import { Navigation, MapPin } from 'lucide-react';

/**
 * StepIcon — colored dot/pin displayed next to each directions step.
 * index=0 → teal location dot (origin)
 * isLast  → red pin (destination)
 * middle  → small hollow teal circle
 */
export default function StepIcon({ index, isLast }) {
    if (index === 0) {
        return (
            <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
                <Navigation className="w-3 h-3 text-white" />
            </div>
        );
    }
    if (isLast) {
        return (
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                <MapPin className="w-3 h-3 text-white" />
            </div>
        );
    }
    return (
        <div className="w-5 h-5 rounded-full border-2 border-teal-400 bg-white shrink-0 mt-0.5" />
    );
}
