import { Cloud, CloudRain, Sun, CloudSnow, Wind, MapPin, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeather } from '@/hooks/useWeather';
import { useNavigate } from 'react-router-dom';

const WeatherIcon = ({ condition }) => {
    const iconClass = "h-10 w-10 text-white/90";

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
    const navigate = useNavigate();

    if (loading) {
        return (
            <Card className="p-6 border-0 shadow-organic">
                <Skeleton className="h-32 w-full rounded-lg" />
            </Card>
        );
    }

    if (error || !weather) {
        return (
            <Card className="p-6 bg-gradient-to-br from-[#4A5759] to-[#2C3333] text-white border-0 shadow-organic">
                <Cloud className="w-8 h-8 text-white/50 mb-2" />
                <p className="font-body text-sm text-white/70">Weather data unavailable</p>
            </Card>
        );
    }

    return (
        <Card
            className="p-6 bg-gradient-to-br from-[#1A3A52] to-[#2C3333] text-white border-0 shadow-organic-lg cursor-pointer group hover:shadow-organic transition-all duration-500"
            onClick={() => navigate('/weather')}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <WeatherIcon condition={weather.condition} />
                    <p className="font-display text-4xl font-bold leading-none">
                        {Math.round(weather.temperature)}°C
                    </p>
                </div>
            </div>
            <p className="font-body text-lg font-medium text-white/90 mb-1">
                {weather.condition || 'Clear'}
            </p>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-white/60">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="font-body">{weather.city || 'Current Location'}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
            </div>
        </Card>
    );
}
