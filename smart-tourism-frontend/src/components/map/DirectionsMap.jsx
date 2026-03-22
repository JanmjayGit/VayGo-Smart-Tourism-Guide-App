import { useEffect, useRef } from 'react';
import { GoogleMap, DirectionsRenderer, Marker, Circle } from '@react-google-maps/api';
import { Loader2, Clock, Route, Navigation, Crosshair } from 'lucide-react';

const MAP_OPTIONS = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: true,
};

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

// Strip HTML tags from Google's instruction strings
const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') ?? '';

/* Arrow icon color per travel mode */
const MODE_COLOR = {
    DRIVING: '#193ED2',
    BICYCLING: '#C90A96',
    TRANSIT: '#6D28D9',
    WALKING: '#D97706',
};

export default function DirectionsMap({
    isLoaded,
    loadError,
    directionsResult,
    selectedRouteIndex = 0,
    allRoutes = [],
    travelMode = 'DRIVING',
    mapCenter = DEFAULT_CENTER,
    routeSummary,
    userPosition,
    navigating,
    currentStep,
    onMapLoad,
    onReCenter,
}) {
    const mapRef = useRef(null);

    // Pan to user when navigating
    useEffect(() => {
        if (navigating && userPosition && mapRef.current) {
            mapRef.current.panTo(userPosition);
        }
    }, [navigating, userPosition]);

    if (loadError) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-gray-600 font-medium">Map failed to load</p>
                    <p className="text-gray-500 text-sm mt-1">Check your API key.</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Loading map…</p>
                </div>
            </div>
        );
    }

    const routeColor = MODE_COLOR[travelMode] || '#1967D2';

    return (
        <div className="flex-1 relative">
            {/* Navigation Instruction Banner */}
            {navigating && currentStep && (
                <div className="absolute top-0 left-0 right-0 z-20 shadow-lg">
                    <div className="bg-[#1a6640] text-white px-5 py-3 flex items-center gap-3">
                        <Navigation className="w-6 h-6 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-base leading-tight truncate">
                                {stripHtml(currentStep.html_instructions)}
                            </p>
                            {currentStep.distance?.text && (
                                <p className="text-green-200 text-sm mt-0.5">
                                    {currentStep.distance.text}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={directionsResult ? (navigating ? 16 : 12) : 11}
                options={MAP_OPTIONS}
                onLoad={(map) => {
                    mapRef.current = map;
                    onMapLoad?.(map);
                }}
            >
                {/* ── Alternative routes (grey/lighter) ── */}
                {directionsResult && allRoutes.map((_, idx) => {
                    if (idx === selectedRouteIndex) return null;
                    return (
                        <DirectionsRenderer
                            key={`alt-${idx}`}
                            directions={directionsResult}
                            routeIndex={idx}
                            options={{
                                suppressMarkers: true,
                                polylineOptions: {
                                    strokeColor: '#4C6FE1',
                                    strokeWeight: 5,
                                    strokeOpacity: 0.7,
                                    zIndex: 1,
                                },
                            }}
                        />
                    );
                })}

                {/* Selected / primary route */}
                {directionsResult && (
                    <DirectionsRenderer
                        directions={directionsResult}
                        routeIndex={selectedRouteIndex}
                        options={{
                            suppressMarkers: false,
                            polylineOptions: {
                                strokeColor: routeColor,
                                strokeWeight: 7,
                                strokeOpacity: 1,
                                zIndex: 10,
                            },
                        }}
                    />
                )}

                {/* Live GPS dot */}
                {userPosition && (
                    <>
                        <Circle
                            center={userPosition}
                            radius={22}
                            options={{
                                fillColor: routeColor,
                                fillOpacity: 1,
                                strokeColor: '#FFFFFF',
                                strokeWeight: 3,
                                zIndex: 50,
                            }}
                        />
                        <Circle
                            center={userPosition}
                            radius={80}
                            options={{
                                fillColor: routeColor,
                                fillOpacity: 0.12,
                                strokeColor: routeColor,
                                strokeWeight: 1,
                                strokeOpacity: 0.4,
                                zIndex: 49,
                            }}
                        />
                    </>
                )}
            </GoogleMap>

            {/* Floating route summary chip */}
            {routeSummary && !navigating && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-5 py-3.5 flex items-center gap-4 z-10 border border-gray-100">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <span className="font-bold text-gray-800">{routeSummary.duration}</span>
                    </div>
                    <div className="w-px h-5 bg-gray-200" />
                    <div className="flex items-center gap-2">
                        <Route className="w-4 h-4 text-teal-500" />
                        <span className="font-semibold text-gray-600">{routeSummary.distance}</span>
                    </div>
                    {allRoutes.length > 1 && (
                        <>
                            <div className="w-px h-5 bg-gray-200" />
                            <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                                {allRoutes.length} routes
                            </span>
                        </>
                    )}
                </div>
            )}

            {/* Re-centre button */}
            <button
                onClick={onReCenter}
                className="absolute bottom-20 right-4 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition z-10 border border-gray-200"
                title="Re-centre on my location"
            >
                <Crosshair className="w-5 h-5 text-gray-700" />
            </button>
        </div>
    );
}
