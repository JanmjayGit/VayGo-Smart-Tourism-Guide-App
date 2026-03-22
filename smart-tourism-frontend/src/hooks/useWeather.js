import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

const OWM_KEY = import.meta.env.VITE_OWM_API_KEY || 'dd8cd8cd8e6a9d28b4b0eea29c4d46e6';
const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

// ── Weather condition → emoji ─────────────────────────────────────────────────
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

// ── AQI 1-5 → label + colour ─────────────────────────────────────────────────
export const aqiLabel = (aqi) => {
    if (aqi === 1) return { label: 'Good', color: '#22c55e' };
    if (aqi === 2) return { label: 'Fair', color: '#84cc16' };
    if (aqi === 3) return { label: 'Moderate', color: '#f59e0b' };
    if (aqi === 4) return { label: 'Poor', color: '#f97316' };
    return { label: 'Hazardous', color: '#ef4444' };
};

// ── UV index → label + colour ─────────────────────────────────────────────────
export const uvLabel = (uvi) => {
    if (uvi <= 2) return { label: 'Low', color: '#22c55e' };
    if (uvi <= 5) return { label: 'Moderate', color: '#f59e0b' };
    if (uvi <= 7) return { label: 'High', color: '#f97316' };
    if (uvi <= 10) return { label: 'Very High', color: '#ef4444' };
    return { label: 'Extreme', color: '#9333ea' };
};

// ── Determine the dominant air pollutant from OWM components ─────────────────
// Returns the human-readable name of the pollutant with the highest concentration.
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


// ── Hourly slot targets: always pick Morning / Afternoon / Evening / Night ──────
const SLOT_TARGETS = [
    { label: 'Morning', targetHour: 6 },
    { label: 'Afternoon', targetHour: 12 },
    { label: 'Evening', targetHour: 18 },
    { label: 'Night', targetHour: 21 },
];

// For each target scan the full forecast list and pick the slot whose hour is closest.
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

// ── Main hook ─────────────────────────────────────────────────────────────────
export const useWeather = ({ city = null, lat = null, lon = null } = {}) => {
    const [weather, setWeather] = useState(null);   // backend WeatherDto
    const [extra, setExtra] = useState(null);   // { sunrise, sunset }
    const [forecast, setForecast] = useState([]);     // next-6-day array
    const [aqi, setAqi] = useState(null);   // { aqi, pm25, mainPollutant }
    const [hourly, setHourly] = useState([]);     // 4 slots: { label, temp, humidity, windSpeed, condition }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── fetchExtras: called with confirmed lat/lon ────────────────────────────
    const fetchExtras = useCallback(async (lat2, lon2, sys) => {
        const [fRes, aqiRes] = await Promise.allSettled([
            axios.get(`${OWM_BASE}/forecast`, {
                params: { lat: lat2, lon: lon2, appid: OWM_KEY, units: 'metric', cnt: 40 },
            }),
            axios.get(`${OWM_BASE}/air_pollution`, {
                params: { lat: lat2, lon: lon2, appid: OWM_KEY },
            }),
        ]);

        // Sunrise / sunset
        setExtra({ sunrise: sys?.sunrise, sunset: sys?.sunset });

        // ── Forecast ──────────────────────────────────────────────────────────
        if (fRes.status === 'fulfilled') {
            const list = fRes.value.data.list;

            // Group by calendar date
            const byDay = {};
            list.forEach(s => {
                const date = s.dt_txt.split(' ')[0];
                if (!byDay[date]) byDay[date] = [];
                byDay[date].push(s);
            });

            // For each day pick the 12:00 slot (most representative of daytime)
            // Fall back to first slot if 12:00 isn't in the next 40 items
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
                    pop: noon.pop ?? 0, // probability of precipitation 0–1
                };
            });
            setForecast(days);

            // Hourly — always 4 named slots: Morning / Afternoon / Evening / Night
            setHourly(pickSlots(list));
        }

        // ── AQI ───────────────────────────────────────────────────────────────
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

    // ── fetchAll: resolve city or coords then call backend + OWM ─────────────
    const fetchAll = useCallback(async (resolvedCity, resolvedLat, resolvedLon) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Primary: current weather from backend (sets the main error if this fails)
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

            // 2. Secondary: OWM extras — wrapped in its own try-catch so a
            //    failure here never overwrites the successfully loaded weather
            try {
                const owmParams = lat2 && lon2
                    ? { lat: lat2, lon: lon2, appid: OWM_KEY, units: 'metric' }
                    : { q: resolvedCity, appid: OWM_KEY, units: 'metric' };

                const owmCur = await axios.get(`${OWM_BASE}/weather`, { params: owmParams });
                const { coord, sys } = owmCur.data;
                await fetchExtras(coord?.lat ?? lat2, coord?.lon ?? lon2, sys);
            } catch (extrasErr) {
                // Extras failed (OWM quota, network, etc.) — show weather but skip extras
                console.warn('[useWeather] extras fetch failed:', extrasErr.message);
            }

        } catch (err) {
            // Primary backend call failed — show the error panel
            setError(err.response?.data?.message || 'Failed to fetch weather');
        } finally {
            setLoading(false);
        }
    }, [fetchExtras]);

    // ── Effect: trigger on city / coords change ───────────────────────────────
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
