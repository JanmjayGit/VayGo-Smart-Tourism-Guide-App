export default function WeatherCard({ weather }) {
    const temp = weather ? `${Math.round(weather.temperature)}°C` : '—';
    const feels = weather ? `${Math.round(weather.feelsLike)}°C` : null;
    const vis = weather?.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : '—';

    return (
        <div
            className="rounded-3xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #c8e8f7 0%, #dbeffe 40%, #f5e6cb 100%)' }}
        >
            <div className="p-5 relative">
                {/* Inline cloud + sun illustration */}
                <svg className="absolute right-3 top-2 opacity-80" width="120" height="90" viewBox="0 0 120 90">
                    <circle cx="88" cy="28" r="22" fill="#FFD166" opacity="0.9" />
                    <circle cx="88" cy="28" r="16" fill="#FFEB99" opacity="0.7" />
                    <ellipse cx="45" cy="58" rx="36" ry="22" fill="white" opacity="0.95" />
                    <ellipse cx="65" cy="52" rx="28" ry="18" fill="white" opacity="0.9" />
                    <ellipse cx="30" cy="62" rx="22" ry="14" fill="white" opacity="0.85" />
                    <ellipse cx="60" cy="68" rx="40" ry="18" fill="#e0f0ff" opacity="0.6" />
                </svg>

                {/* Label */}
                <div className="mb-2">
                    <p className="text-lg font-bold text-slate-800">Weather</p>
                    <p className="text-md text-slate-600">What's the weather.</p>
                </div>

                {/* Temperature */}
                <div className="mt-6">
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-extrabold text-slate-800">{temp}</span>
                        {feels && <span className="text-md text-slate-600 mb-2">{feels}</span>}
                    </div>
                    <p className="text-md text-slate-800 mt-1 capitalize">
                        {weather?.description || weather?.condition || '—'}
                    </p>
                </div>

                {/* Stat pills */}
                <div className="flex gap-14 mt-5">
                    <div className="rounded-2xl px-6 py-2 bg-slate-800 text-white text-center">
                        <p className="text-[14px] opacity-60">Pressure</p>
                        <p className="text-lg font-bold">{weather?.pressure || '—'} mb</p>
                    </div>
                    <div className="rounded-2xl px-6 py-2 bg-green-500 text-white text-center">
                        <p className="text-[14px] opacity-80">Visibility</p>
                        <p className="text-lg font-bold">{vis}</p>
                    </div>
                    <div className="rounded-2xl px-6 py-2 bg-white text-slate-700 text-center">
                        <p className="text-[14px] text-slate-600">Humidity</p>
                        <p className="text-lg font-bold">{weather?.humidity || '—'}%</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
