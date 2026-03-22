import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeather, conditionEmoji } from '@/hooks/useWeather';

// ── Weather sub-components ────────────────────────────────────────────────────
import WeatherTopBar from '@/components/weather/WeatherTopBar';
import WeatherCard from '@/components/weather/WeatherCard';
import AirQualityCard from '@/components/weather/AirQualityCard';
import TemperatureTimeline from '@/components/weather/TemperatureTimeline';
import TomorrowCard from '@/components/weather/TomorrowCard';
import SunArcCard from '@/components/weather/SunArcCard';
import UVIndexCard from '@/components/weather/UVIndexCard';
import WeatherPrediction from '@/components/weather/WeatherPrediction';

// ── Loading skeleton ──────────────────────────────────────────────────────────
function DashboardSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-52 rounded-3xl" />
                <Skeleton className="h-52 rounded-3xl" />
            </div>
            <Skeleton className="h-56 rounded-3xl" />
        </div>
    );
}

// ── Error state ───────────────────────────────────────────────────────────────
function ErrorState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
            <span className="text-4xl">🌩️</span>
            <p className="font-semibold text-slate-600">Could not load weather</p>
            <p className="text-sm">{message}</p>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WeatherPage() {
    const [searchInput, setSearchInput] = useState('');
    const [city, setCity] = useState('');

    // ── Fetch all weather data via the hook ───────────────────────────────────
    const { weather, extra, forecast, aqi, hourly, loading, error } =
        useWeather({ city: city || undefined });

    // ── Derived values ────────────────────────────────────────────────────────
    const cityName = weather?.location || 'Your Location';
    const currentTemp = weather ? `${Math.round(weather.temperature)}°C` : '—';
    const tomorrow = forecast[1] ?? null;
    const fiveDays = forecast.slice(1, 6);

    // ── Search handler ────────────────────────────────────────────────────────
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setCity(searchInput.trim());
            setSearchInput('');
        }
    };

    return (
        <div
            className="min-h-screen bg-[#F5F7FA]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
        >
            {/* Google Font: Poppins */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
                href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
                rel="stylesheet"
            />

            {/* ── Full-width flex row: left column + right panel ─────────────── */}
            <div className="flex h-full w-full overflow-hidden">

                {/* ════════════ LEFT / MAIN COLUMN (flex-1, ~65%) ══════════════ */}
                <div className="flex-1 flex flex-col min-h-0">

                    {/* Top bar: avatar + search + bell */}
                    <WeatherTopBar
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        onSearch={handleSearch}
                    />

                    {/* Main scrollable content */}
                    <div className="flex-1 overflow-y-auto p-5 min-h-0">
                        {loading ? (
                            <DashboardSkeleton />
                        ) : (error && !weather) ? (
                            <ErrorState message={error} />
                        ) : (
                            <div className="space-y-5">

                                {/* ── Row 1: Weather card + Air Quality card ── */}
                                <div className="grid grid-cols-2 gap-5">
                                    <WeatherCard weather={weather} />
                                    <AirQualityCard
                                        aqi={aqi}
                                        windSpeed={weather?.windSpeed}
                                    />
                                </div>

                                {/* ── Row 2: Temperature timeline + Tomorrow ── */}
                                <div
                                    className="grid gap-5 pr-5"
                                    style={{ gridTemplateColumns: '60% 40%' }}
                                >
                                    <TemperatureTimeline hourly={hourly} />
                                    <TomorrowCard
                                        cityName={cityName}
                                        tomorrow={tomorrow}
                                        currentTemp={currentTemp}
                                    />
                                </div>

                            </div>
                        )}
                    </div>
                </div>

                {/*  RIGHT PANEL (~35%, fixed 400px)*/}
                <div className="w-[400px] shrink-0 bg-gray-50 border-l border-slate-100 flex flex-col overflow-y-auto p-6 space-y-5 mb-4">

                    {/* City name + current temperature header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {conditionEmoji(weather?.condition)} {weather?.condition || 'Loading…'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <p className="text-xl font-medium text-slate-800 mt-0.5">{cityName}</p>
                            </div>
                        </div>
                        <p className="text-5xl font-extrabold text-[#FF8C00]">{currentTemp}</p>
                    </div>

                    {/* Dashed sun arc showing sunrise–sunset progress */}
                    <SunArcCard
                        sunrise={extra?.sunrise}
                        sunset={extra?.sunset}
                    />

                    {/* UV Index  */}
                    <UVIndexCard temperature={weather?.temperature} />

                    {/* 5-day forecast + Next 5 Days button */}
                    <WeatherPrediction days={fiveDays} loading={loading} />

                </div>
            </div>
        </div>
    );
}
