import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Star, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.75rem',
};

const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // Delhi default

const mapStyle = [];

const categoryColors = {
    ATTRACTION: '#D4745F',
    HISTORICAL: '#C9A961',
    NATURAL: '#8B9D83',
    RELIGIOUS: '#1A3A52',
    ADVENTURE: '#E89580',
    CULTURAL: '#D4745F',
    BEACH: '#4A6A82',
    HOTEL: '#C9A961',
    RESTAURANT: '#8B9D83',
    EVENT: '#E89580',
    EMERGENCY: '#B85D48',
};

const LIBRARIES = ['places'];

export default function MapView({
    markers = [],
    center = defaultCenter,
    zoom = 12,
    height = '500px',
    showInfoWindows = true,
    onMarkerClick,
    className = '',
}) {
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const [selectedMarker, setSelectedMarker] = useState(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY || '',
        libraries: LIBRARIES,
    });

    const onLoad = useCallback((map) => {
        mapRef.current = map;
        if (markers.length > 1) {
            const bounds = new window.google.maps.LatLngBounds();
            markers.forEach((m) => {
                if (m.latitude && m.longitude) {
                    bounds.extend({ lat: m.latitude, lng: m.longitude });
                }
            });
            map.fitBounds(bounds, { padding: 60 });
        }
    }, [markers]);

    const handleMarkerClick = (marker) => {
        if (onMarkerClick) {
            onMarkerClick(marker);
        } else {
            setSelectedMarker(marker);
        }
    };

    const handleViewDetails = (marker) => {
        if (marker.type === 'EVENT') {
            navigate(`/events/${marker.id}`);
        } else {
            navigate(`/places/${marker.id}`);
        }
    };

    if (loadError) {
        return (
            <div
                className={`flex items-center justify-center bg-[#F5F1E8] rounded-xl border border-[#D4C4B0] ${className}`}
                style={{ height }}
            >
                <div className="text-center p-8">
                    <MapPin className="w-12 h-12 text-[#D4745F] mx-auto mb-3 opacity-60" />
                    <p className="font-display text-lg text-[#2C3333]">Map unavailable</p>
                    <p className="font-body text-sm text-[#4A5759]">Please check your connection</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div
                className={`flex items-center justify-center bg-[#F5F1E8] rounded-xl animate-pulse ${className}`}
                style={{ height }}
            >
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#E8DFD0] mx-auto mb-3 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-[#8B9D83]" />
                    </div>
                    <p className="font-body text-sm text-[#4A5759]">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative overflow-hidden rounded-xl shadow-organic ${className}`}
            style={{ height }}
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
                onLoad={onLoad}
                options={{
                    styles: [],
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                }}
            >
            </GoogleMap>
        </div>
    );
}
