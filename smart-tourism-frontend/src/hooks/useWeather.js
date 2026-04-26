import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

const OWM_KEY = import.meta.env.VITE_OWM_API_KEY;
const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

export const conditionEmoji = (condition = '') => {
    const c = condition.toLowerCase();
    if (c.includes('thunderstorm')) return '⛈️';
    if (c.includes('drizzle')) return '🌦️';
    if (c.includes('rain')) return '🌧️';
    if (c.includes('snow')) return '❄️';
    if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return '🌫️';
    if (c.includes('clear')) return '☀️';
    if (c.includes('clouds') || c.includes('cloud')) return '⛅';
    return '🌡️';
};

export const aqiLabel = (aqi) => {
    if (aqi === 1) return { label: 'Good', color: '#22c55e' };
    if (aqi === 2) return { label: 'Fair', color: '#84cc16' };
    if (aqi === 3) return { label: 'Moderate', color: '#f59e0b' };
    if (aqi === 4) return { label: 'Poor', color: '#f97316' };
    return { label: 'Hazardous', color: '#ef4444' };
};

export const uvLabel = (uvi) => {
    if (uvi <= 2) return { label: 'Low', color: '#22c55e' };
    if (uvi <= 5) return { label: 'Moderate', color: '#f59e0b' };
    if (uvi <= 7) return { label: 'High', color: '#f97316' };
    if (uvi <= 10) return { label: 'Very High', color: '#ef4444' };
    return { label: 'Extreme', color: '#9333ea' };
};

const dominantPollutant = (components = {}) => {
    const pollutants = [
        { key: 'pm2_5', label: 'PM 2.5' },
        { key: 'pm10', label: 'PM 10' },
        { key: 'no2', label: 'NO₂' },
        { key: 'o3', label: 'O₃' },
        { key: 'so2', label: 'SO₂' },
        { key: 'co', label: 'CO' },
        { key: 'nh3', label: 'NH₃' },
    ];
    let maxVal = -1, label = 'PM 2.5';
    for (const { key, label: lbl } of pollutants) {
        const val = components[key] ?? 0;
        if (val > maxVal) { maxVal = val; label = lbl; }
    }
    return label;
};


const SLOT_TARGETS = [
    { label: 'Morning', targetHour: 6 },
    { label: 'Afternoon', targetHour: 12 },
    { label: 'Evening', targetHour: 18 },
    { label: 'Night', targetHour: 21 },
];

const pickSlots = (list) =>
    SLOT_TARGETS.map(({ label, targetHour }) => {
        const slot = list.reduce((best, s) => {
            const h = parseInt(s.dt_txt.split(' ')[1].split(':')[0], 10);
            const bestH = parseInt(best.dt_txt.split(' ')[1].split(':')[0], 10);
            return Math.abs(h - targetHour) < Math.abs(bestH - targetHour) ? s : best;
        }, list[0]);
        return {
            label,
            temp: Math.round(slot.main.temp),
            humidity: slot.main.humidity,
            windSpeed: Math.round(slot.wind?.speed ?? 0),
            condition: slot.weather[0]?.main || 'Clear',
        };
    });

export const useWeather = ({ city = null, lat = null, lon = null } = {}) => {
    const [weather, setWeather] = useState(null);
    const [extra, setExtra] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [aqi, setAqi] = useState(null);
    const [hourly, setHourly] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchExtras = useCallback(async (lat2, lon2, sys) => {
        const [fRes, aqiRes] = await Promise.allSettled([
            axios.get(`${OWM_BASE}/forecast`, {
                params: { lat: lat2, lon: lon2, appid: OWM_KEY, units: 'metric', cnt: 40 },
            }),
            axios.get(`${OWM_BASE}/air_pollution`, {
                params: { lat: lat2, lon: lon2, appid: OWM_KEY },
            }),
        ]);

        setExtra({ sunrise: sys?.sunrise, sunset: sys?.sunset });

        if (fRes.status === 'fulfilled') {
            const list = fRes.value.data.list;

            const byDay = {};
            list.forEach(s => {
                const date = s.dt_txt.split(' ')[0];
                if (!byDay[date]) byDay[date] = [];
                byDay[date].push(s);
            });

            const days = Object.entries(byDay).slice(0, 7).map(([date, slots]) => {
                const noon = slots.find(s => s.dt_txt.includes('12:00:00')) || slots[0];
                const allTemps = slots.map(s => s.main.temp);
                return {
                    date,
                    condition: noon.weather[0]?.main || 'Clear',
                    description: noon.weather[0]?.description || '',
                    high: Math.round(Math.max(...allTemps)),
                    low: Math.round(Math.min(...allTemps)),
                    humidity: noon.main.humidity,
                    windSpeed: noon.wind?.speed ?? 0,
                    pop: noon.pop ?? 0,
                };
            });
            setForecast(days);

            setHourly(pickSlots(list));
        }

        // air quality
        if (aqiRes.status === 'fulfilled') {
            const item = aqiRes.value.data.list[0];
            const comp = item.components || {};
            setAqi({
                aqi: item.main.aqi,
                pm25: comp.pm2_5?.toFixed(1),
                components: comp,
                mainPollutant: dominantPollutant(comp),
            });
        }
    }, []);

    const fetchAll = useCallback(async (resolvedCity, resolvedLat, resolvedLon) => {
        setLoading(true);
        setError(null);
        try {
            let backendRes;
            if (resolvedCity) {
                backendRes = await axios.get(apiEndpoints.WEATHER_BY_CITY(resolvedCity));
            } else {
                backendRes = await axios.get(apiEndpoints.WEATHER_BY_LOCATION, {
                    params: { lat: resolvedLat, lon: resolvedLon },
                });
            }
            setWeather(backendRes.data);

            const lat2 = backendRes.data?.latitude || resolvedLat;
            const lon2 = backendRes.data?.longitude || resolvedLon;

            try {
                const owmParams = lat2 && lon2
                    ? { lat: lat2, lon: lon2, appid: OWM_KEY, units: 'metric' }
                    : { q: resolvedCity, appid: OWM_KEY, units: 'metric' };

                const owmCur = await axios.get(`${OWM_BASE}/weather`, { params: owmParams });
                const { coord, sys } = owmCur.data;
                await fetchExtras(coord?.lat ?? lat2, coord?.lon ?? lon2, sys);
            } catch (extrasErr) {
                //Extras failed
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch weather');
        } finally {
            setLoading(false);
        }
    }, [fetchExtras]);


    useEffect(() => {
        if (city) {
            fetchAll(city, null, null);
        } else if (lat && lon) {
            fetchAll(null, lat, lon);
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => fetchAll(null, coords.latitude, coords.longitude),
                () => fetchAll('New Delhi', null, null),
            );
        } else {
            fetchAll('New Delhi', null, null);
        }
    }, [city, lat, lon, fetchAll]);

    return { weather, extra, forecast, aqi, hourly, loading, error };
};
