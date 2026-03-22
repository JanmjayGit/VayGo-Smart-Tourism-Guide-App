import { aqiLabel } from '@/hooks/useWeather';


export default function AirQualityCard({ aqi, windSpeed }) {
    const level = aqi?.aqi ?? 3;
    const pm25Display = aqi?.pm25 ? `${aqi.pm25} µg/m³` : '—';
    const mainPollutant = aqi?.mainPollutant || 'PM 2.5';

    // AQI scale: multiply OWM 1-5 index by ≈80 to get a familiar AQI-like number
    const aqiScaleMap = { 1: 25, 2: 75, 3: 125, 4: 175, 5: 280 };
    const displayNum = aqi ? (aqiScaleMap[aqi.aqi] ?? '—') : '—';

    const isGood = level <= 2;
    const isStandard = level === 3;
    const isHazardous = level >= 4;

    return (
        <div
            className="rounded-3xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #4A9FD4 0%, #6BB8E8 50%, #98CFEE 100%)' }}
        >
            <div className="p-5 relative">
                {/* Kite and cloud illustration */}
                <svg className="absolute right-2 top-2 opacity-80" width="110" height="90" viewBox="0 0 110 90">
                    <ellipse cx="30" cy="50" rx="28" ry="18" fill="white" opacity="0.7" />
                    <ellipse cx="55" cy="40" rx="35" ry="22" fill="white" opacity="0.6" />
                    <ellipse cx="75" cy="55" rx="25" ry="16" fill="white" opacity="0.5" />
                    <polygon points="85,10 100,30 85,50 70,30" fill="#FF8C00" opacity="0.9" />
                    <polygon points="85,10 100,30 85,28 70,30" fill="#FFB347" opacity="0.7" />
                    <line x1="85" y1="50" x2="80" y2="80" stroke="#FF8C00" strokeWidth="1.5" strokeDasharray="3 2" />
                </svg>

                {/* Header dynamic mainPollutant */}
                <div className="mb-2">
                    <p className="text-lg font-bold text-slate-900">Air Quality</p>
                    <p className="text-sm text-slate-900/90">
                        Main pollutant : <span className="font-semibold">{mainPollutant}</span>
                    </p>
                </div>

                {/* AQI display number + badge */}
                <div className="mt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-5xl font-extrabold text-gray-800">{displayNum}</span>
                        {aqi && (
                            <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-yellow-300 text-yellow-900">
                                AQI
                            </span>
                        )}
                    </div>
                    {/* Wind speed + PM 2.5 */}
                    <p className="text-lg text-slate-900 mt-3 font-medium">
                        {windSpeed ? `${windSpeed} m/s Wind` : 'Wind data loading'}
                        {aqi?.pm25 && <span className="ml-2 text-sm text-slate-700">· PM 2.5: {pm25Display}</span>}
                    </p>
                </div>

                {/* Quality segmented toggle — active pill follows current level */}
                <div className="mt-4 bg-white/20 backdrop-blur rounded-2xl p-1 flex">
                    {[
                        { label: 'Good', active: isGood },
                        { label: 'Standard', active: isStandard },
                        { label: 'Hazardous', active: isHazardous },
                    ].map(({ label, active }) => (
                        <div
                            key={label}
                            className={`flex-1 text-center text-lg py-1 rounded-xl font-bold transition-all ${active ? 'bg-gray-100 text-gray-800 shadow-lg' : 'text-white-800'
                                }`}
                        >
                            {label}
                        </div>
                    ))}
                </div>

                {/* Progress bar — width proportional to AQI level */}
                <div className="mt-5 h-1.5 rounded-full bg-white/30">
                    <div
                        className="h-full rounded-full bg-orange-500 transition-all duration-700"
                        style={{ width: aqi ? `${(level / 5) * 100}%` : '50%' }}
                    />
                </div>
            </div>
        </div>
    );
}
