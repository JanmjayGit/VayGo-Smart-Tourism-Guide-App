import {
    Navigation, MapPin, Loader2, ArrowLeftRight,
    X, ChevronDown, ChevronUp, Clock, Route,
    Car, Bike, Bus, Footprints, Play, Square, LocateFixed,
} from 'lucide-react';
import { Autocomplete } from '@react-google-maps/api';
import StepIcon from './StepIcon';

/** Strip Google's HTML tags */
const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') ?? '';

const TRAVEL_MODES = [
    { key: 'DRIVING', label: 'Drive', Icon: Car },
    { key: 'BICYCLING', label: 'Bike', Icon: Bike },
    { key: 'TRANSIT', label: 'Transit', Icon: Bus },
    { key: 'WALKING', label: 'Walk', Icon: Footprints },
];

export default function RoutePlanner({
    isLoaded,
    loading,
    error,
    originValue,
    destinationValue,
    travelMode,
    routeSummary,
    steps,
    allRoutes,
    selectedRouteIndex,
    showSteps,
    navigating,
    currentStepIndex,
    originAutocomplete,
    destinationAutocomplete,
    onOriginChange,
    onDestinationChange,
    onTravelModeChange,
    onGetDirections,
    onSelectRoute,
    onSwap,
    onClear,
    onToggleSteps,
    onStartNavigation,
    onStopNavigation,
    onDetectLocation,
    locatingOrigin,
}) {
    return (
        <aside className="w-[300px] shrink-0 bg-white flex flex-col shadow-lg z-10 overflow-y-auto">

            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1">
                    Route Planner
                </p>
                <h1 className="text-lg font-bold text-gray-800 leading-tight">Discover Locations</h1>
                <p className="text-xs text-gray-500 mt-0.5">Navigate with real-time directions</p>
            </div>

            {/* Travel Mode Tabs */}
            <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                <div className="flex gap-1">
                    {TRAVEL_MODES.map(({ key, label, Icon }) => (
                        <button
                            key={key}
                            onClick={() => onTravelModeChange(key)}
                            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-semibold transition-all ${travelMode === key
                                ? 'bg-teal-600 text-white shadow'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            title={label}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Inputs */}
            <div className="px-4 pt-4 space-y-2">

                {/* Origin */}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center z-10">
                        <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    {isLoaded ? (
                        <Autocomplete
                            onLoad={(ac) => (originAutocomplete.current = ac)}
                            onPlaceChanged={() => {
                                const place = originAutocomplete.current?.getPlace();
                                if (place?.formatted_address) onOriginChange(place.formatted_address);
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Your location"
                                value={originValue}
                                onChange={(e) => onOriginChange(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                            />
                        </Autocomplete>
                    ) : (
                        <input
                            type="text"
                            placeholder="Your location"
                            value={originValue}
                            onChange={(e) => onOriginChange(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
                        />
                    )}
                    {/* GPS locate button */}
                    <button
                        onClick={onDetectLocation}
                        disabled={locatingOrigin}
                        title="Use my current location"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-teal-600 hover:text-teal-800 transition-colors disabled:opacity-50"
                    >
                        {locatingOrigin
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <LocateFixed className="w-4 h-4" />
                        }
                    </button>
                </div>

                {/* Destination */}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                        <MapPin className="w-4 h-4 text-red-500" />
                    </div>
                    {isLoaded ? (
                        <Autocomplete
                            onLoad={(ac) => (destinationAutocomplete.current = ac)}
                            onPlaceChanged={() => {
                                const place = destinationAutocomplete.current?.getPlace();
                                if (place?.formatted_address) onDestinationChange(place.formatted_address);
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Destination"
                                value={destinationValue}
                                onChange={(e) => onDestinationChange(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                            />
                        </Autocomplete>
                    ) : (
                        <input
                            type="text"
                            placeholder="Destination"
                            value={destinationValue}
                            onChange={(e) => onDestinationChange(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
                        />
                    )}
                </div>

                {/* Get Directions */}
                <button
                    onClick={onGetDirections}
                    disabled={loading || !isLoaded}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                    {loading ? 'Getting Directions…' : 'Get Directions'}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-4 mt-3 px-3 py-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-red-600 text-xs font-medium leading-snug">{error}</p>
                </div>
            )}

            {/* ── Route Alternatives ── */}
            {allRoutes.length > 1 && (
                <div className="px-4 pt-4">
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
                        {allRoutes.length} Routes Available
                    </p>
                    <div className="space-y-2">
                        {allRoutes.map((route, idx) => {
                            const leg = route.legs[0];
                            const isSelected = idx === selectedRouteIndex;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => onSelectRoute(idx)}
                                    className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${isSelected
                                        ? 'border-teal-500 bg-teal-50 shadow-sm'
                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`font-bold text-sm ${isSelected ? 'text-teal-800' : 'text-gray-700'}`}>
                                                {leg.duration.text}
                                            </p>
                                            <p className={`text-xs mt-0.5 ${isSelected ? 'text-teal-600' : 'text-gray-500'}`}>
                                                {leg.distance.text}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {idx === 0 && (
                                                <span className="text-[10px] font-semibold bg-teal-600 text-white px-2 py-0.5 rounded-full">
                                                    Fastest
                                                </span>
                                            )}
                                            {route.summary && (
                                                <span className="text-[10px] text-gray-400 truncate max-w-[80px]">
                                                    via {route.summary}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Route Summary + Steps ── */}
            {routeSummary && (
                <div className="px-4 pt-4 flex-1">
                    {/* Summary card (only when 1 route) */}
                    {allRoutes.length <= 1 && (
                        <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 mb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                                        <span className="font-bold text-teal-800 text-base">
                                            {routeSummary.duration}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Route className="w-3.5 h-3.5 text-teal-500" />
                                        <span className="text-teal-600 text-sm font-medium">
                                            {routeSummary.distance}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs text-teal-500 bg-teal-100 px-2 py-1 rounded-lg">
                                    Fastest
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Start / Stop Navigation */}
                    <button
                        onClick={navigating ? onStopNavigation : onStartNavigation}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all mb-3 ${navigating
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        {navigating ? (
                            <><Square className="w-4 h-4" /> Stop Navigation</>
                        ) : (
                            <><Play className="w-4 h-4" /> Start Navigation</>
                        )}
                    </button>

                    {/* Toggle steps header */}
                    <button
                        onClick={onToggleSteps}
                        className="w-full flex items-center justify-between px-1 py-2 text-sm font-bold text-gray-700 hover:text-teal-700 transition-colors"
                    >
                        <span>Directions ({steps.length} steps)</span>
                        {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Step-by-step list */}
                    {showSteps && steps.length > 0 && (
                        <div className="space-y-0 relative pb-4">
                            {/* Vertical connector line */}
                            <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gray-100" />

                            {steps.map((step, i) => {
                                const isCurrent = navigating && i === currentStepIndex;
                                return (
                                    <div
                                        key={i}
                                        className={`flex gap-3 items-start py-2.5 relative px-1 rounded-lg transition-colors ${isCurrent ? 'bg-green-50' : ''
                                            }`}
                                    >
                                        <StepIcon index={i} isLast={i === steps.length - 1} />
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm font-medium leading-snug ${isCurrent ? 'text-green-800 font-bold' : 'text-gray-800'
                                                }`}>
                                                {stripHtml(step.html_instructions)}
                                            </p>
                                            {step.distance?.text && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {step.distance.text}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Bottom actions */}
            <div className="px-4 py-4 border-t border-gray-100 flex gap-3 mt-auto">
                <button
                    onClick={onSwap}
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeftRight className="w-4 h-4" /> Swap
                </button>
                <button
                    onClick={onClear}
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors ml-auto"
                >
                    <X className="w-4 h-4" /> Clear
                </button>
            </div>
        </aside>
    );
}
