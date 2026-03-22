

export default function DashboardWeatherCard({ weather }) {
    const temp = weather ? `${Math.round(weather.temperature)}°C` : '—';
    const feels = weather ? `${Math.round(weather.feelsLike)}°C` : null;
    const vis = weather?.visibility
        ? `${(weather.visibility / 1000).toFixed(1)} km`
        : '—';

    return (
        <div
            className="h-full rounded-3xl shadow-lg flex flex-col justify-between p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{
                background:
                    'linear-gradient(135deg, #4A9FD4 0%, #6BB8E8 50%, #98CFEE 100%)'
            }}
        >

            {/* Top Section */}
            <div>
                {/* <p className="text-xl font-bold text-slate-800">Weather</p>
                <p className="text-md text-slate-600 mb-4">
                    Current conditions
                </p> */}

                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-2xl font-bold text-slate-900">Weather</p>
                        <p className="text-md text-slate-700">
                            Current conditions
                        </p>
                    </div>

                    <span className="text-xl font-semibold bg-white/70 px-4 py-2 rounded-full text-slate-900">
                        {weather?.location || weather?.city || "Your Location"}
                    </span>
                </div>
                {/* <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    <p className="text-2xl font-bold text-slate-800 ">
                        {weather?.location || "Your Location"}
                    </p>
                </div> */}

                <div className="flex items-end gap-3 mt-6">
                    <span className="text-5xl font-extrabold text-slate-900">
                        {temp}
                    </span>
                    {feels && (
                        <span className="text-xl text-slate-700 mb-1">
                            {feels}
                        </span>
                    )}
                </div>

                <p className="text-2xl text-slate-800 mt-3 capitalize">
                    {weather?.description || '—'}
                </p>
            </div>

            {/* Bottom Pills */}
            <div className="flex justify-between gap-4 mt-6">
                <div className="flex-1 rounded-xl p-3 bg-slate-800 text-white text-center">
                    <p className="text-lg opacity-70">Pressure</p>
                    <p className="font-bold text-md">{weather?.pressure || '—'} mb</p>
                </div>

                <div className="flex-1 rounded-xl p-3 bg-green-500 text-white text-center">
                    <p className="text-lg opacity-90">Visibility</p>
                    <p className="font-bold text-md">{vis}</p>
                </div>

                <div className="flex-1 rounded-xl p-3 bg-white text-slate-700 text-center">
                    <p className="text-lg text-slate-600">Humidity</p>
                    <p className="font-bold text-md">
                        {weather?.humidity || '—'}%
                    </p>
                </div>
            </div>
        </div>
    );
}
