import { conditionEmoji } from '@/hooks/useWeather';

/**
 * TomorrowCard
 * Lime-green (#BDEA7B) card showing tomorrow's forecast with an umbrella illustration.
 * Props:
 *   cityName    string
 *   tomorrow    { condition, high, low } or null
 *   currentTemp string fallback temp
 */
export default function TomorrowCard({ cityName, tomorrow, currentTemp }) {
    return (
        <div
            className="rounded-3xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            style={{ background: '#BDEA7B' }}
        >
            <div className="p-5 h-full flex flex-col min-h-[260px]">
                <p className="text-sm text-slate-600 font-medium">Tomorrow</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1 leading-tight">{cityName}</p>

                {/* Temperature + condition */}
                <div className="mt-3">
                    <p className="text-5xl font-extrabold text-slate-800">
                        {tomorrow ? `${tomorrow.high}°C` : currentTemp}
                    </p>
                    <p className="text-sm text-slate-600 mt-1 capitalize">
                        {tomorrow?.condition ?? 'Loading…'}
                    </p>
                </div>

                {/* Person with umbrella — inline SVG illustration */}
                <div className="flex-1 flex items-end justify-end">
                    <svg width="200" height="210" viewBox="0 0 100 110">
                        {/* Umbrella dome */}
                        <path d="M 12 38 Q 12 22 50 18 Q 88 22 88 38" fill="#F59E0B" opacity="0.95" />
                        <ellipse cx="50" cy="38" rx="38" ry="12" fill="#D97706" opacity="0.9" />
                        {/* Handle */}
                        <line x1="50" y1="38" x2="50" y2="90" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M 50 90 Q 44 97 38 90" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Rain drops */}
                        {[20, 35, 55, 70, 80].map((x, i) => (
                            <line key={i} x1={x} y1={50 + i * 4} x2={x - 3} y2={62 + i * 4}
                                stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                        ))}
                        {/* Person head */}
                        <circle cx="50" cy="58" r="7" fill="#1B2A4A" />
                        {/* Body */}
                        <rect x="43" y="65" width="14" height="20" rx="5" fill="#1B2A4A" />
                        {/* Legs */}
                        <line x1="46" y1="85" x2="40" y2="105" stroke="#1B2A4A" strokeWidth="4" strokeLinecap="round" />
                        <line x1="54" y1="85" x2="60" y2="105" stroke="#1B2A4A" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
