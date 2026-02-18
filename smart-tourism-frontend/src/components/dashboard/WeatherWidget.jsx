import { Cloud, CloudRain, Sun, CloudSnow, Wind, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeather } from '@/hooks/useWeather';

const WeatherIcon = ({ condition }) => {
    const iconClass = "h-12 w-12 text-white";

    switch (condition?.toLowerCase()) {
        case 'clear':
        case 'sunny':
            return <Sun className={iconClass} />;
        case 'rain':
        case 'rainy':
            return <CloudRain className={iconClass} />;
        case 'snow':
        case 'snowy':
            return <CloudSnow className={iconClass} />;
        case 'wind':
        case 'windy':
            return <Wind className={iconClass} />;
        default:
            return <Cloud className={iconClass} />;
    }
};

export default function WeatherWidget({ city }) {
    const { weather, loading, error } = useWeather(city);

    if (loading) {
        return (
            <Card className="p-6">
                <Skeleton className="h-32 w-full" />
            </Card>
        );
    }

    if (error || !weather) {
        return (
            <Card className="p-6 bg-gradient-to-br from-gray-400 to-gray-500 text-white">
                <p className="text-sm">Weather data unavailable</p>
            </Card>
        );
    }

    return (
        <Card className="p-6 bg-gradient-to-br from-blue-400 to-purple-500 text-white border-0 shadow-lg">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                        <WeatherIcon condition={weather.condition} />
                        <div>
                            <p className="text-5xl font-bold">{Math.round(weather.temperature)}°C</p>
                        </div>
                    </div>
                    <p className="text-xl font-medium mb-1">
                        {weather.condition || 'Sunny'}
                    </p>
                    <div className="flex items-center gap-1 text-sm opacity-90">
                        <MapPin className="h-4 w-4" />
                        <span>{weather.city || 'Current Location'}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
