import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeather, conditionEmoji } from '@/hooks/useWeather';

import WeatherTopBar from '@/components/weather/WeatherTopBar';
import WeatherCard from '@/components/weather/WeatherCard';
import AirQualityCard from '@/components/weather/AirQualityCard';
import TemperatureTimeline from '@/components/weather/TemperatureTimeline';
import TomorrowCard from '@/components/weather/TomorrowCard';
import SunArcCard from '@/components/weather/SunArcCard';
import UVIndexCard from '@/components/weather/UVIndexCard';
import WeatherPrediction from '@/components/weather/WeatherPrediction';
import { Cloudy } from 'lucide-react';

function DashboardSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-52 rounded-3xl" />
                <Skeleton className="h-52 rounded-3xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
                <Skeleton className="h-56 rounded-3xl" />
                <Skeleton className="h-56 rounded-3xl" />
            </div>
        </div>
    );
}

function ErrorState({ message }) {
    return (
        <div className="flex h-64 flex-col items-center justify-center gap-3 px-4 text-center text-slate-400">
            <span className="text-4xl"><Cloudy /></span>
            <p className="font-semibold text-slate-600">Could not load weather</p>
            <p className="text-sm">{message}</p>
        </div>
    );
}

export default function WeatherPage() {
    const [searchInput, setSearchInput] = useState('');
    const [city, setCity] = useState('');

    const { weather, extra, forecast, aqi, hourly, loading, error } =
        useWeather({ city: city || undefined });

    const cityName = weather?.location || 'Your Location';
    const currentTemp = weather ? `${Math.round(weather.temperature)}°C` : '—';
    const tomorrow = forecast[1] ?? null;
    const fiveDays = forecast.slice(1, 6);

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
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
                href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
                rel="stylesheet"
            />

            <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col xl:flex-row overflow-hidden">
                <div className="flex min-h-0 flex-1 flex-col">
                    <WeatherTopBar
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        onSearch={handleSearch}
                    />

                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 min-h-0">
                        {loading ? (
                            <DashboardSkeleton />
                        ) : error && !weather ? (
                            <ErrorState message={error} />
                        ) : (
                            <div className="space-y-4 sm:space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                                    <WeatherCard weather={weather} />
                                    <AirQualityCard
                                        aqi={aqi}
                                        windSpeed={weather?.windSpeed}
                                    />
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4 sm:gap-5">
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

                <aside className="w-full xl:w-[380px] 2xl:w-[400px] shrink-0 border-t xl:border-t-0 xl:border-l border-slate-100 bg-gray-50 p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
                                {conditionEmoji(weather?.condition)} {weather?.condition || 'Loading…'}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                                <span className="h-2 w-2 shrink-0 rounded-full bg-green-500"></span>
                                <p className="text-base sm:text-xl font-medium text-slate-800 truncate">
                                    {cityName}
                                </p>
                            </div>
                        </div>
                        <p className="shrink-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#FF8C00]">
                            {currentTemp}
                        </p>
                    </div>

                    <SunArcCard
                        sunrise={extra?.sunrise}
                        sunset={extra?.sunset}
                    />

                    <UVIndexCard temperature={weather?.temperature} />

                    <WeatherPrediction days={fiveDays} loading={loading} />
                </aside>
            </div>
        </div>
    );
}



// import { useState } from 'react';
// import { Skeleton } from '@/components/ui/skeleton';
// import { useWeather, conditionEmoji } from '@/hooks/useWeather';

// import WeatherTopBar from '@/components/weather/WeatherTopBar';
// import WeatherCard from '@/components/weather/WeatherCard';
// import AirQualityCard from '@/components/weather/AirQualityCard';
// import TemperatureTimeline from '@/components/weather/TemperatureTimeline';
// import TomorrowCard from '@/components/weather/TomorrowCard';
// import SunArcCard from '@/components/weather/SunArcCard';
// import UVIndexCard from '@/components/weather/UVIndexCard';
// import WeatherPrediction from '@/components/weather/WeatherPrediction';


// function DashboardSkeleton() {
//     return (
//         <div className="space-y-4 animate-pulse">
//             <div className="grid grid-cols-2 gap-4">
//                 <Skeleton className="h-52 rounded-3xl" />
//                 <Skeleton className="h-52 rounded-3xl" />
//             </div>
//             <Skeleton className="h-56 rounded-3xl" />
//         </div>
//     );
// }

// function ErrorState({ message }) {
//     return (
//         <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
//             <span className="text-4xl">🌩️</span>
//             <p className="font-semibold text-slate-600">Could not load weather</p>
//             <p className="text-sm">{message}</p>
//         </div>
//     );
// }

// export default function WeatherPage() {
//     const [searchInput, setSearchInput] = useState('');
//     const [city, setCity] = useState('');


//     const { weather, extra, forecast, aqi, hourly, loading, error } =
//         useWeather({ city: city || undefined });


//     const cityName = weather?.location || 'Your Location';
//     const currentTemp = weather ? `${Math.round(weather.temperature)}°C` : '—';
//     const tomorrow = forecast[1] ?? null;
//     const fiveDays = forecast.slice(1, 6);


//     const handleSearch = (e) => {
//         e.preventDefault();
//         if (searchInput.trim()) {
//             setCity(searchInput.trim());
//             setSearchInput('');
//         }
//     };

//     return (
//         <div
//             className="min-h-screen bg-[#F5F7FA]"
//             style={{ fontFamily: "'Poppins', sans-serif" }}
//         >
//             <link rel="preconnect" href="https://fonts.googleapis.com" />
//             <link
//                 href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
//                 rel="stylesheet"
//             />

//             <div className="flex h-full w-full overflow-hidden">

//                 <div className="flex-1 flex flex-col min-h-0">

//                     {/* Top bar: avatar + search + bell */}
//                     <WeatherTopBar
//                         searchInput={searchInput}
//                         setSearchInput={setSearchInput}
//                         onSearch={handleSearch}
//                     />

//                     {/* Main scrollable content */}
//                     <div className="flex-1 overflow-y-auto p-5 min-h-0">
//                         {loading ? (
//                             <DashboardSkeleton />
//                         ) : (error && !weather) ? (
//                             <ErrorState message={error} />
//                         ) : (
//                             <div className="space-y-5">

//                                 {/* ── Row 1: Weather card + Air Quality card ── */}
//                                 <div className="grid grid-cols-2 gap-5">
//                                     <WeatherCard weather={weather} />
//                                     <AirQualityCard
//                                         aqi={aqi}
//                                         windSpeed={weather?.windSpeed}
//                                     />
//                                 </div>

//                                 {/* ── Row 2: Temperature timeline + Tomorrow ── */}
//                                 <div
//                                     className="grid gap-5 pr-5"
//                                     style={{ gridTemplateColumns: '60% 40%' }}
//                                 >
//                                     <TemperatureTimeline hourly={hourly} />
//                                     <TomorrowCard
//                                         cityName={cityName}
//                                         tomorrow={tomorrow}
//                                         currentTemp={currentTemp}
//                                     />
//                                 </div>

//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/*  RIGHT PANEL (~35%, fixed 400px)*/}
//                 <div className="w-[400px] shrink-0 bg-gray-50 border-l border-slate-100 flex flex-col overflow-y-auto p-6 space-y-5 mb-4">

//                     {/* City name + current temperature header */}
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-2xl font-bold text-slate-900">
//                                 {conditionEmoji(weather?.condition)} {weather?.condition || 'Loading…'}
//                             </p>
//                             <div className="flex items-center gap-2 mt-1">
//                                 <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                                 <p className="text-xl font-medium text-slate-800 mt-0.5">{cityName}</p>
//                             </div>
//                         </div>
//                         <p className="text-5xl font-extrabold text-[#FF8C00]">{currentTemp}</p>
//                     </div>

//                     {/* Dashed sun arc showing sunrise–sunset progress */}
//                     <SunArcCard
//                         sunrise={extra?.sunrise}
//                         sunset={extra?.sunset}
//                     />

//                     {/* UV Index  */}
//                     <UVIndexCard temperature={weather?.temperature} />

//                     {/* 5-day forecast + Next 5 Days button */}
//                     <WeatherPrediction days={fiveDays} loading={loading} />

//                 </div>
//             </div>
//         </div>
//     );
// }

