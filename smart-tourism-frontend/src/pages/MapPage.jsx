import { useState, useRef, useCallback, useEffect, } from 'react';
import { useLocation } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { toast } from 'sonner';
import { Map, List } from 'lucide-react';

import RoutePlanner from '@/components/map/RoutePlanner';
import DirectionsMap from '@/components/map/DirectionsMap';

const LIBRARIES = ['places'];
const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

export default function MapPage() {
    const routerLocation = useLocation();
    const passedDest = routerLocation.state?.destination;

    // Mobile view toggle: 'planner' | 'map'
    const [mobileView, setMobileView] = useState('map');

    const [originValue, setOriginValue] = useState('');
    const [destinationValue, setDestinationValue] = useState(passedDest?.name || '');
    const [directionsResult, setDirectionsResult] = useState(null);
    const [allRoutes, setAllRoutes] = useState([]);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
    const [travelMode, setTravelMode] = useState('DRIVING');
    const [routeSummary, setRouteSummary] = useState(null);
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSteps, setShowSteps] = useState(true);
    const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

    const [navigating, setNavigating] = useState(false);
    const [userPosition, setUserPosition] = useState(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [locatingOrigin, setLocatingOrigin] = useState(false);
    const watchIdRef = useRef(null);

    const originAutocomplete = useRef(null);
    const destinationAutocomplete = useRef(null);
    const mapRef = useRef(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY || '',
        libraries: LIBRARIES,
    });

    // Auto-detect user location on load
    useEffect(() => {
        if (!isLoaded || originValue) return;
        navigator.geolocation?.getCurrentPosition((pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            setMapCenter({ lat, lng });
            setUserPosition({ lat, lng });
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) setOriginValue(results[0].formatted_address);
            });
        });
    }, [isLoaded]);

    const handleDetectLocation = useCallback(() => {
        if (!isLoaded) { toast.error('Map not ready yet'); return; }
        if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
        setLocatingOrigin(true);

        const geocodePosition = (lat, lng) => {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                setLocatingOrigin(false);
                if (status === 'OK' && results[0]) {
                    setOriginValue(results[0].formatted_address);
                    toast.success('Location detected!');
                } else {
                    setOriginValue(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                    toast.success('Location detected (coordinates)');
                }
            });
        };

        const tryLowAccuracy = () => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude: lat, longitude: lng } = pos.coords;
                    setUserPosition({ lat, lng });
                    setMapCenter({ lat, lng });
                    geocodePosition(lat, lng);
                },
                () => { setLocatingOrigin(false); toast.error('Could not access location'); },
                { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
            );
        };

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setUserPosition({ lat, lng });
                setMapCenter({ lat, lng });
                geocodePosition(lat, lng);
            },
            (err) => {
                if (err.code === 3) { toast('GPS timeout — retrying…'); tryLowAccuracy(); }
                else { setLocatingOrigin(false); toast.error('Could not access location'); }
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
        );
    }, [isLoaded]);

    useEffect(() => {
        if (passedDest && isLoaded && originValue) handleGetDirections();
    }, [passedDest, isLoaded, originValue]);

    const selectRoute = useCallback((index) => {
        if (!directionsResult) return;
        setSelectedRouteIndex(index);
        const leg = directionsResult.routes[index]?.legs[0];
        if (leg) {
            setRouteSummary({ duration: leg.duration.text, distance: leg.distance.text });
            setSteps(leg.steps);
        }
    }, [directionsResult]);

    const handleGetDirections = useCallback(() => {
        const origin = originAutocomplete.current?.getPlace()?.formatted_address || originValue;
        const dest = destinationAutocomplete.current?.getPlace()?.formatted_address || destinationValue;

        if (!origin?.trim()) { toast.error('Please enter your starting location'); return; }
        if (!dest?.trim() && !passedDest) { toast.error('Please enter your destination'); return; }

        setLoading(true);
        setError(null);
        setDirectionsResult(null);
        setAllRoutes([]);
        setSelectedRouteIndex(0);
        setCurrentStepIndex(0);

        // Switch to map view on mobile when directions are fetched
        setMobileView('map');

        const tryDirections = (mode, isRetry = false) => {
            const svc = new window.google.maps.DirectionsService();
            svc.route(
                {
                    origin: origin.trim(),
                    destination: passedDest && !destinationValue.trim()
                        ? { lat: passedDest.lat, lng: passedDest.lng }
                        : dest.trim(),
                    travelMode: window.google.maps.TravelMode[mode],
                    provideRouteAlternatives: true,
                },
                (result, status) => {
                    if (status === 'OK') {
                        setLoading(false);
                        setDirectionsResult(result);
                        setAllRoutes(result.routes);
                        const leg = result.routes[0].legs[0];
                        setRouteSummary({ duration: leg.duration.text, distance: leg.distance.text });
                        setSteps(leg.steps);
                        setShowSteps(true);
                        if (isRetry) toast('🚴 Bike route unavailable – showing driving route', { duration: 5000 });
                    } else if (status === 'ZERO_RESULTS' && mode === 'BICYCLING' && !isRetry) {
                        tryDirections('DRIVING', true);
                    } else {
                        setLoading(false);
                        const msgs = {
                            ZERO_RESULTS: 'No route found between these locations.',
                            NOT_FOUND: 'One or more locations could not be found.',
                        };
                        setError(msgs[status] ?? `Could not get directions (${status}).`);
                    }
                }
            );
        };

        tryDirections(travelMode);
    }, [originValue, destinationValue, passedDest, travelMode]);

    const startNavigation = useCallback(() => {
        if (!steps.length) { toast.error('Get directions first'); return; }
        setNavigating(true);
        setCurrentStepIndex(0);
        setMobileView('map');
        toast.success('Navigation started');

        watchIdRef.current = navigator.geolocation?.watchPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setUserPosition({ lat, lng });
                setMapCenter({ lat, lng });
                setCurrentStepIndex((prev) => {
                    if (prev >= steps.length - 1) return prev;
                    const stepEnd = steps[prev].end_location;
                    if (!stepEnd) return prev;
                    const dist = Math.sqrt(
                        Math.pow(lat - stepEnd.lat(), 2) + Math.pow(lng - stepEnd.lng(), 2)
                    ) * 111000;
                    return dist < 30 ? prev + 1 : prev;
                });
            },
            () => toast.error('Unable to get live location'),
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
        );
    }, [steps]);

    const stopNavigation = useCallback(() => {
        if (watchIdRef.current != null) {
            navigator.geolocation?.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setNavigating(false);
        toast('Navigation stopped');
    }, []);

    useEffect(() => () => {
        if (watchIdRef.current != null) navigator.geolocation?.clearWatch(watchIdRef.current);
    }, []);

    const handleSwap = () => {
        setOriginValue(destinationValue);
        setDestinationValue(originValue);
        setDirectionsResult(null);
        setAllRoutes([]);
        setRouteSummary(null);
        setSteps([]);
        setError(null);
    };

    const handleClear = () => {
        stopNavigation();
        setOriginValue('');
        setDestinationValue('');
        setDirectionsResult(null);
        setAllRoutes([]);
        setRouteSummary(null);
        setSteps([]);
        setError(null);
    };

    const reCenter = () => {
        if (userPosition && mapRef.current) {
            mapRef.current.panTo(userPosition);
            mapRef.current.setZoom(16);
        } else {
            navigator.geolocation?.getCurrentPosition((pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setUserPosition({ lat, lng });
                setMapCenter({ lat, lng });
                mapRef.current?.panTo({ lat, lng });
                mapRef.current?.setZoom(16);
            });
        }
    };

    return (
        <div
            className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-gray-100"
            style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
            {/* ── Mobile toggle bar ── */}
            <div className="md:hidden flex border-b border-gray-200 bg-white shrink-0">
                <button
                    onClick={() => setMobileView('planner')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold
                                transition-colors ${mobileView === 'planner'
                            ? 'text-teal-600 border-b-2 border-teal-600'
                            : 'text-gray-500'
                        }`}
                >
                    <List className="w-4 h-4" /> Planner
                </button>
                <button
                    onClick={() => setMobileView('map')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold
                                transition-colors ${mobileView === 'map'
                            ? 'text-teal-600 border-b-2 border-teal-600'
                            : 'text-gray-500'
                        }`}
                >
                    <Map className="w-4 h-4" /> Map
                </button>
            </div>

            {/* ── Planner panel ── */}
            <div className={`
                md:flex md:w-[300px] md:shrink-0 flex-col overflow-hidden
                ${mobileView === 'planner' ? 'flex flex-1' : 'hidden'}
            `}>
                <RoutePlanner
                    isLoaded={isLoaded}
                    loading={loading}
                    error={error}
                    originValue={originValue}
                    destinationValue={destinationValue}
                    travelMode={travelMode}
                    routeSummary={routeSummary}
                    steps={steps}
                    allRoutes={allRoutes}
                    selectedRouteIndex={selectedRouteIndex}
                    showSteps={showSteps}
                    navigating={navigating}
                    currentStepIndex={currentStepIndex}
                    originAutocomplete={originAutocomplete}
                    destinationAutocomplete={destinationAutocomplete}
                    onOriginChange={setOriginValue}
                    onDestinationChange={setDestinationValue}
                    onTravelModeChange={setTravelMode}
                    onGetDirections={handleGetDirections}
                    onSelectRoute={selectRoute}
                    onSwap={handleSwap}
                    onClear={handleClear}
                    onToggleSteps={() => setShowSteps(s => !s)}
                    onStartNavigation={startNavigation}
                    onStopNavigation={stopNavigation}
                    onDetectLocation={handleDetectLocation}
                    locatingOrigin={locatingOrigin}
                    onShowMap={() => setMobileView('map')}
                />
            </div>

            {/* ── Map panel ── */}
            <div className={`
                md:flex flex-1 overflow-hidden
                ${mobileView === 'map' ? 'flex' : 'hidden'}
            `}>
                <DirectionsMap
                    isLoaded={isLoaded}
                    loadError={loadError}
                    directionsResult={directionsResult}
                    selectedRouteIndex={selectedRouteIndex}
                    allRoutes={allRoutes}
                    travelMode={travelMode}
                    mapCenter={mapCenter}
                    routeSummary={routeSummary}
                    userPosition={userPosition}
                    navigating={navigating}
                    currentStep={steps[currentStepIndex] || null}
                    onMapLoad={(map) => (mapRef.current = map)}
                    onReCenter={reCenter}
                />
            </div>
        </div>
    );
}