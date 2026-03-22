import { Skeleton } from '@/components/ui/skeleton';
import { conditionEmoji } from '@/hooks/useWeather';

const fmtShortDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};


export default function WeatherPrediction({ days = [], loading }) {
    return (
        <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Weather Prediction</h3>

            <div className="space-y-1">
                {loading ? (
                    [1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-12 rounded-xl" />
                    ))
                ) : days.length ? (
                    days.map((day, i) => {
                        // Prefer description for the emoji because it carries more detail
                        // e.g. "light rain", "overcast clouds", "clear sky"
                        const condStr = day.description || day.condition || '';
                        const emoji = conditionEmoji(condStr);
                        const popPct = day.pop != null ? Math.round(day.pop * 100) : 0;
                        const showPop = popPct >= 20;

                        return (
                            <div
                                key={i}
                                className="flex items-center gap-3 py-3 border-b border-slate-200 last:border-0"
                            >
                                {/* Emoji icon — reflects actual forecast condition */}
                                <span className="text-2xl w-8 text-center shrink-0">
                                    {emoji}
                                </span>

                                {/* Date + condition name */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-600">{fmtShortDate(day.date)}</p>
                                    <p className="text-sm font-semibold text-slate-800 truncate capitalize">
                                        {day.description || day.condition}
                                    </p>
                                </div>

                                {/* Right side: high/low + optional rain % */}
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-bold text-[#FF8C00]">
                                        {day.high}° / {day.low}°
                                    </p>
                                    {showPop && (
                                        <p className="text-[11px] text-blue-400 font-medium">
                                            🌧 {popPct}%
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-slate-600">Forecast unavailable</p>
                )}
            </div>
        </div>
    );
}
