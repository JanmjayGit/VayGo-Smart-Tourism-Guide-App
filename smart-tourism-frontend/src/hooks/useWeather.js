import { useState, useEffect } from 'react';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

export const useWeather = (city = null, lat = null, lon = null) => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                setLoading(true);
                setError(null);

                let response;
                if (city) {
                    response = await axios.get(apiEndpoints.WEATHER_BY_CITY(city));
                } else if (lat && lon) {
                    response = await axios.get(apiEndpoints.WEATHER_BY_LOCATION, {
                        params: { lat, lon }
                    });
                } else {
                    // Default to user's current location
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            async (position) => {
                                const { latitude, longitude } = position.coords;
                                response = await axios.get(apiEndpoints.WEATHER_BY_LOCATION, {
                                    params: { lat: latitude, lon: longitude }
                                });
                                setWeather(response.data);
                                setLoading(false);
                            },
                            (err) => {
                                setError('Unable to get location');
                                setLoading(false);
                            }
                        );
                        return;
                    }
                }

                if (response) {
                    setWeather(response.data);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch weather');
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [city, lat, lon]);

    return { weather, loading, error };
};
