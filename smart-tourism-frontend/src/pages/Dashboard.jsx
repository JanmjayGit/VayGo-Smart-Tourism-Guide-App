import { useState, useEffect } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useWeather } from '@/hooks/useWeather';
import { Skeleton } from '@/components/ui/skeleton';
import MapCard from '@/components/dashboard/MapCard';
import WeatherCard from '@/components/weather/WeatherCard';
import EventsCard from '@/components/dashboard/EventsCard';
import FavoritesCard from '@/components/dashboard/FavoritesCard';
import PopularDestinations from '@/components/dashboard/PopularDestinations';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import DashboardWeatherCard from '@/components/dashboard/DashboardWeatherCard';
import LiquidGlass from 'liquid-glass-react';

export default function Dashboard() {
    const navigate = useNavigate();

    // Geolocation + real-time weather
    const [coords, setCoords] = useState(null);
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                () => setCoords({ lat: 28.6139, lon: 77.2090 }) // Delhi fallback
            );
        } else {
            setCoords({ lat: 28.6139, lon: 77.2090 });
        }
    }, []);
    const { weather, loading: weatherLoading } = useWeather(coords ?? {});


    return (
        <div className="min-h-screen bg-gray-50">

            {/* Main Content */}
            <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-10 pb-16 relative z-10 mt-10">

                {/* Map 60% + Weather 40% */}
                <div className="flex flex-col lg:flex-row gap-6 mb-6">
                    <div className="w-full lg:w-[60%]">
                        <MapCard />
                    </div>
                    <div className="w-full lg:w-[40%]">
                        {weatherLoading || !coords ? (
                            <Skeleton className="w-full rounded-2xl" style={{ minHeight: '420px' }} />
                        ) : (
                            <DashboardWeatherCard weather={weather} />
                        )}
                    </div>
                </div>

                {/* Events 50% + Favorites 50% */}
                <div className="flex flex-col lg:flex-row gap-6 mb-10">
                    <div className="w-full lg:w-[50%]">
                        <EventsCard />
                    </div>
                    <div className="w-full lg:w-[50%]">
                        <FavoritesCard />
                    </div>
                </div>

                {/* Popular Destinations */}
                <PopularDestinations />
            </main>


        </div>
    );
}
