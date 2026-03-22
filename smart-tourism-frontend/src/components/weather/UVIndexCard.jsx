import { Sun } from 'lucide-react';
import { uvLabel } from '@/hooks/useWeather';

export default function UVIndexCard({ temperature }) {
    const uvi = temperature != null ? Math.max(1, Math.round(temperature / 5) + 1) : null;
    const meta = uvi ? uvLabel(uvi) : { label: '—', color: '#94a3b8' };

    return (
        <div
            className="rounded-2xl p-5 flex items-center gap-4 text-white"
            style={{ background: '#1B2A4A' }}
        >
            {/* Sun icon */}
            <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center shrink-0">
                <Sun className="w-6 h-6 text-yellow-900" />
            </div>

            {/* UVI + badge */}
            <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-3xl font-extrabold">
                        {uvi ?? '—'} UVI
                    </p>
                    <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: meta.color + '33', color: meta.color }}
                    >
                        {meta.label}
                    </span>
                </div>
                <p className="text-sm text-white/60 mt-1">Moderate risk of UV rays</p>
            </div>
        </div>
    );
}
