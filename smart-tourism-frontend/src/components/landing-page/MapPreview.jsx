import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight } from 'lucide-react';
import MapView from '@/components/map/MapView';
import apiEndpoints from '@/util/apiEndpoints';

// Convert a places/hotels API item into a MapView marker shape
function toMarker(item, type) {
    return {
        id: item.id,
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        category: item.category || type,
        type,
        averageRating: item.rating || item.averageRating || 0,
    };
}

export default function MapPreview() {
    const navigate = useNavigate();
    const [markers, setMarkers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch a handful of places + hotels to display as markers
        Promise.allSettled([
            axios.get(apiEndpoints.GET_PLACES, { params: { page: 0, size: 6 } }),
            axios.get(apiEndpoints.SEARCH_HOTELS, { params: { page: 0, size: 6 } }),
        ]).then(([placesResult, hotelsResult]) => {
            const places = (placesResult.status === 'fulfilled'
                ? (placesResult.value.data?.content || placesResult.value.data || [])
                : []
            ).filter(p => p.latitude && p.longitude).slice(0, 5).map(p => toMarker(p, 'ATTRACTION'));

            const hotels = (hotelsResult.status === 'fulfilled'
                ? (hotelsResult.value.data?.content || hotelsResult.value.data || [])
                : []
            ).filter(h => h.latitude && h.longitude).slice(0, 5).map(h => toMarker(h, 'HOTEL'));

            setMarkers([...places, ...hotels]);
        }).finally(() => setLoading(false));
    }, []);

    // Compute center from markers or fall back to Delhi
    const center = markers.length > 0
        ? {
            lat: markers.reduce((s, m) => s + m.latitude, 0) / markers.length,
            lng: markers.reduce((s, m) => s + m.longitude, 0) / markers.length,
        }
        : { lat: 28.6139, lng: 77.2090 };

    return (
        <section className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <p className="text-teal-600 text-xs font-bold tracking-[0.3em] uppercase mb-2">
                            Discover Nearby
                        </p>
                        <h2
                            className="text-4xl sm:text-5xl font-black text-gray-900"
                            style={{ fontFamily: "'Inter Tight', sans-serif" }}
                        >
                            Explore on Map
                        </h2>
                    </div>
                    <button
                        onClick={() => navigate('/map')}
                        className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors group"
                    >
                        Open full map <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Map */}
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100" style={{ height: '420px' }}>
                    {loading ? (
                        <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
                            <p className="text-gray-400 text-sm">Loading map…</p>
                        </div>
                    ) : (
                        <MapView
                            markers={markers}
                            center={center}
                            zoom={markers.length > 1 ? 11 : 12}
                            height="420px"
                            showInfoWindows
                            className="w-full h-full"
                        />
                    )}

                    {/* Overlay CTA */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                        <button
                            onClick={() => navigate('/map')}
                            className="flex items-center gap-2 bg-black/40 text-white font-semibold px-6 py-2.5 rounded-full shadow-xl transition-all hover:scale-105 text-sm backdrop-blur"
                        >
                            Open Full Map <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
