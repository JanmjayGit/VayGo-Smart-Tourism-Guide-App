import {
    Navigation, MapPin, Loader2, ArrowLeftRight,
    X, ChevronDown, ChevronUp, Clock, Route,
    Car, Bike, Bus, Footprints, Play, Square, LocateFixed,
    MoveRight, Flag, CircleDot, Map,
    CornerUpRight,
    CornerDownRight,
} from 'lucide-react';

import { Autocomplete } from '@react-google-maps/api';
import { useState } from 'react';

/** Strip Google's HTML tags */
const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') ?? '';

const TRAVEL_MODES = [
    { key: 'DRIVING', label: 'Drive', Icon: Car },
    { key: 'BICYCLING', label: 'Bike', Icon: Bike },
    { key: 'TRANSIT', label: 'Transit', Icon: Bus },
    { key: 'WALKING', label: 'Walk', Icon: Footprints },
];

/** Pick a maneuver icon based on Google's maneuver string */
function ManeuverIcon({ maneuver, isFirst, isLast }) {
    if (isFirst) return (
        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shrink-0 shadow">
            <Navigation className="w-4 h-4 text-white" />
        </div>
    );
    if (isLast) return (
        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0 shadow">
            <Flag className="w-4 h-4 text-white" />
        </div>
    );

    const m = maneuver || '';
    let icon = <MoveRight className="w-4 h-4 text-teal-700" />;
    if (m.includes('turn-right') || m.includes('ramp-right'))
        icon = <CornerUpRight className="w-4 h-4 text-teal-700" />;
    else if (m.includes('turn-left') || m.includes('ramp-left'))
        icon = <CornerDownRight className="w-4 h-4 text-teal-700 scale-x-[-1]" />;
    else if (m.includes('roundabout'))
        icon = <CircleDot className="w-4 h-4 text-teal-700" />;

    return (
        <div className="w-8 h-8 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center shrink-0">
            {icon}
        </div>
    );
}

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
    onShowMap,       // mobile: switch to map view
}) {
    return (
        <aside className="w-full md:w-[300px] shrink-0 bg-white flex flex-col shadow-lg z-10 overflow-y-auto
                          h-full">

            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1">
                        Route Planner
                    </p>
                    <h1 className="text-lg font-bold text-gray-800 leading-tight">Discover Locations</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Navigate with real-time directions</p>
                </div>
                {/* Mobile: show map button */}
                {onShowMap && (
                    <button
                        onClick={onShowMap}
                        className="md:hidden flex items-center gap-1.5 text-xs font-semibold text-teal-600
                                   bg-teal-50 px-3 py-2 rounded-xl border border-teal-200"
                    >
                        <Map className="w-4 h-4" /> Map
                    </button>
                )}
            </div>

            {/* Travel Mode Tabs */}
            <div className="px-4 pt-3 pb-2 border-b border-gray-100">
                <div className="flex gap-1">
                    {TRAVEL_MODES.map(({ key, label, Icon }) => (
                        <button
                            key={key}
                            onClick={() => onTravelModeChange(key)}
                            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl
                                        text-[10px] font-semibold transition-all ${travelMode === key
                                    ? 'bg-teal-600 text-white shadow'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
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
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
                                    bg-teal-500 flex items-center justify-center z-10">
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
                                className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200
                                           rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400
                                           focus:border-transparent"
                            />
                        </Autocomplete>
                    ) : (
                        <input
                            type="text"
                            placeholder="Your location"
                            value={originValue}
                            onChange={(e) => onOriginChange(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200
                                       rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
                        />
                    )}
                    <button
                        onClick={onDetectLocation}
                        disabled={locatingOrigin}
                        title="Use my current location"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center
                                   justify-center text-teal-600 hover:text-teal-800 transition-colors
                                   disabled:opacity-50"
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
                                className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200
                                           rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400
                                           focus:border-transparent"
                            />
                        </Autocomplete>
                    ) : (
                        <input
                            type="text"
                            placeholder="Destination"
                            value={destinationValue}
                            onChange={(e) => onDestinationChange(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200
                                       rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
                        />
                    )}
                </div>

                {/* Get Directions */}
                <button
                    onClick={onGetDirections}
                    disabled={loading || !isLoaded}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600
                               hover:bg-teal-700 disabled:opacity-60 text-white font-semibold text-sm
                               transition-colors"
                >
                    {loading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Navigation className="w-4 h-4" />
                    }
                    {loading ? 'Getting Directions…' : 'Get Directions'}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-4 mt-3 px-3 py-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-red-600 text-xs font-medium leading-snug">{error}</p>
                </div>
            )}

            {/* Route Alternatives */}
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
                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
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

            {/* Route Summary + Steps */}
            {routeSummary && (
                <div className="px-4 pt-4 flex-1">

                    {/* Summary card */}
                    {allRoutes.length <= 1 && (
                        <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl px-4 py-4 mb-3 shadow">
                            <div className="flex items-center justify-between text-white">
                                <div>
                                    <p className="text-xs font-semibold text-teal-100 mb-1">Estimated Time</p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        <span className="font-black text-xl">{routeSummary.duration}</span>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-teal-400" />
                                <div>
                                    <p className="text-xs font-semibold text-teal-100 mb-1">Distance</p>
                                    <div className="flex items-center gap-2">
                                        <Route className="w-5 h-5" />
                                        <span className="font-bold text-lg">{routeSummary.distance}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Start / Stop Navigation */}
                    <button
                        onClick={navigating ? onStopNavigation : onStartNavigation}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl
                                    font-bold text-sm transition-all mb-4 shadow ${navigating
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        {navigating
                            ? <><Square className="w-4 h-4" /> Stop Navigation</>
                            : <><Play className="w-4 h-4" /> Start Navigation</>
                        }
                    </button>

                    {/* Toggle steps */}
                    <button
                        onClick={onToggleSteps}
                        className="w-full flex items-center justify-between px-1 py-2 text-sm font-bold
                                   text-gray-700 hover:text-teal-700 transition-colors mb-2"
                    >
                        <span>Directions <span className="text-gray-400 font-normal">({steps.length} steps)</span></span>
                        {showSteps
                            ? <ChevronUp className="w-4 h-4" />
                            : <ChevronDown className="w-4 h-4" />
                        }
                    </button>

                    {/* Step list */}
                    {showSteps && steps.length > 0 && (
                        <div className="space-y-0 pb-4">
                            {steps.map((step, i) => {
                                const isCurrent = navigating && i === currentStepIndex;
                                const isFirst = i === 0;
                                const isLast = i === steps.length - 1;
                                const instruction = stripHtml(step.html_instructions);

                                return (
                                    <div key={i} className="flex gap-0 items-stretch">

                                        {/* Left: icon + connector line */}
                                        <div className="flex flex-col items-center w-10 shrink-0">
                                            <ManeuverIcon
                                                maneuver={step.maneuver}
                                                isFirst={isFirst}
                                                isLast={isLast}
                                            />
                                            {!isLast && (
                                                <div className="w-0.5 flex-1 bg-gray-200 my-1 min-h-[20px]" />
                                            )}
                                        </div>

                                        {/* Right: instruction + distance */}
                                        <div
                                            className={`flex-1 ml-3 pb-4 min-w-0 ${isCurrent ? 'bg-green-50 rounded-xl px-2 -mx-2' : ''
                                                }`}
                                        >
                                            {/* Step number badge */}
                                            <div className="flex items-start justify-between gap-2 pt-1">
                                                <p className={`text-sm leading-snug ${isCurrent
                                                    ? 'text-green-800 font-bold'
                                                    : isFirst || isLast
                                                        ? 'text-gray-900 font-bold'
                                                        : 'text-gray-700 font-medium'
                                                    }`}>
                                                    {instruction || '—'}
                                                </p>
                                                {isCurrent && (
                                                    <span className="shrink-0 text-[9px] font-bold bg-green-600
                                                                     text-white px-1.5 py-0.5 rounded-full mt-0.5">
                                                        NOW
                                                    </span>
                                                )}
                                            </div>

                                            {/* Distance + duration for this step */}
                                            <div className="flex items-center gap-3 mt-1">
                                                {step.distance?.text && (
                                                    <span className="text-xs text-teal-600 font-semibold">
                                                        {step.distance.text}
                                                    </span>
                                                )}
                                                {step.duration?.text && (
                                                    <span className="text-xs text-gray-400">
                                                        ~{step.duration.text}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Bottom actions */}
            <div className="px-4 py-4 border-t border-gray-100 flex gap-3 mt-auto sticky bottom-0 bg-white">
                <button
                    onClick={onSwap}
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-600
                               hover:text-gray-800 transition-colors"
                >
                    <ArrowLeftRight className="w-4 h-4" /> Swap
                </button>
                <button
                    onClick={onClear}
                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-600
                               hover:text-gray-800 transition-colors ml-auto"
                >
                    <X className="w-4 h-4" /> Clear
                </button>
            </div>
        </aside>
    );
}