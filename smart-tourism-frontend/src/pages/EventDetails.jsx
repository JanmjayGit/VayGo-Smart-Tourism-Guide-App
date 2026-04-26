import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    Users,
    Loader2,
    ArrowRight,
    SlidersHorizontal,
    Check
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import axios from "axios";
import apiEndpoints from "@/util/apiEndpoints";
import ImageGallery from "@/components/hotel-details/ImageGallery";
import PlaceCard from "@/components/cards/PlaceCard";
import HotelCard from "@/components/hotel-details/HotelCard";
import SimilarEvents from "@/components/events/SimilarEvents";


const categoryColors = {
    FESTIVAL: 'bg-orange-100 text-orange-700 border-orange-200',
    CULTURAL: 'bg-pink-100   text-pink-700   border-pink-200',
    EXHIBITION: 'bg-green-100  text-green-700  border-green-200',
    CONCERT: 'bg-purple-100 text-purple-700 border-purple-200',
    SPORTS: 'bg-blue-100   text-blue-700   border-blue-200',
    RELIGIOUS: 'bg-amber-100  text-amber-700  border-amber-200',
    WORKSHOP: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    FOOD: 'bg-red-100    text-red-700    border-red-200',
    ART: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    WELLNESS: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    SPIRITUAL: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    BUSINESS: 'bg-slate-100  text-slate-700  border-slate-200',
    TECH: 'bg-cyan-100   text-cyan-700   border-cyan-200',
    TREKKING: 'bg-lime-100   text-lime-700   border-lime-200',
    OTHER: 'bg-gray-100   text-gray-700   border-gray-200',
};


// FilterDropdown
function FilterDropdown({ value, onChange, options = [10, 20, 50] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (!ref.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition"
            >
                <SlidersHorizontal size={14} />
                <span>{value} km</span>
                <span className="bg-teal-600 text-white text-xs font-medium rounded-full px-1.5 py-0.5 leading-none">
                    {value}
                </span>
            </button>

            {open && (
                <div className="absolute right-0 mt-1.5 z-10 bg-white border border-gray-200 rounded-lg shadow-sm py-1 min-w-[100px]">
                    {options.map(r => (
                        <button
                            key={r}
                            onClick={() => { onChange(r); setOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition ${value === r ? "text-teal-700 font-medium" : "text-gray-700"
                                }`}
                        >
                            {r} km
                            {value === r && <Check size={13} className="text-teal-600" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}


// NearbySection
function NearbySection({ title, loading, items, radius, onRadiusChange, renderCard, emptyMessage }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    {title}
                    <ArrowRight size={18} />
                </h2>
                <FilterDropdown value={radius} onChange={onRadiusChange} />
            </div>

            {loading ? (
                <div className="grid grid-cols-2 gap-5">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-56 rounded-xl" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <p className="text-gray-500 text-sm">{emptyMessage}</p>
            ) : (
                <div className="grid grid-cols-2 gap-6">
                    {items.slice(0, 4).map(item => renderCard(item))}
                </div>
            )}
        </div>
    );
}


export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [nearbyHotels, setNearbyHotels] = useState([]);
    const [nearbyHotelLoading, setNearbyHotelLoading] = useState(false);

    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [nearbyPlacesLoading, setNearbyPlacesLoading] = useState(false);

    const [placeRadius, setPlaceRadius] = useState(5);
    const [hotelRadius, setHotelRadius] = useState(10);

    /* Fetch Nearby Places */
    const fetchNearbyPlaces = async (lat, lon, radius = placeRadius) => {
        try {
            setNearbyPlacesLoading(true);
            const res = await axios.get(apiEndpoints.NEARBY_PLACES, {
                params: { lat, lon, radius, size: 6 }
            });

            let placesData = res.data?.content || res.data || [];
            placesData = placesData
                .filter(p => !["HOTEL", "RESORT", "HOSTEL"].includes(p.category))
                .sort((a, b) => (a.distance || 0) - (b.distance || 0));

            setNearbyPlaces(placesData);
        } catch (err) {
            console.error("Nearby places error", err);
        } finally {
            setNearbyPlacesLoading(false);
        }
    };

    /* Fetch Nearby Hotels */
    const fetchNearbyHotels = async (lat, lon, radius = hotelRadius) => {
        try {
            setNearbyHotelLoading(true);
            const res = await axios.get(apiEndpoints.NEARBY_HOTELS, {
                params: { lat, lon, radius, size: 6 }
            });
            setNearbyHotels(res.data?.content || res.data || []);
        } catch {
            toast.error("Failed to load nearby hotels");
        } finally {
            setNearbyHotelLoading(false);
        }
    };

    /* Fetch Event */
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await axios.get(apiEndpoints.GET_EVENT_BY_ID(id));
                const eventData = res.data;
                setEvent(eventData);

                if (eventData?.latitude && eventData?.longitude) {
                    fetchNearbyPlaces(eventData.latitude, eventData.longitude);
                    fetchNearbyHotels(eventData.latitude, eventData.longitude);
                }
            } catch {
                setError("Failed to load event");
                toast.error("Failed to load event");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchEvent();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-teal-600 h-10 w-10" />
            </div>
        );
    }

    if (!event || error) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <h2 className="text-2xl font-semibold mb-3">Event Not Found</h2>
                <Button onClick={() => navigate("/events")}>
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Events
                </Button>
            </div>
        );
    }

    const images = event.imageUrls?.length
        ? event.imageUrls
        : event.imageUrl
            ? [event.imageUrl]
            : [];

    return (
        <div className="bg-gray-50 min-h-screen">

            {/* Back button */}
            <div className="max-w-[1300px] mx-auto px-6 pt-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
                </Button>
            </div>

            {/* Image Gallery */}
            <div className="max-w-[1300px] mx-auto px-6">
                <ImageGallery images={images} />
            </div>

            {/* Title */}
            <div className="max-w-[1300px] mx-auto px-6 mt-6">
                <Badge className={`mb-3 ${categoryColors[event.category]}`}>
                    {event.category}
                </Badge>

                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {event.name}
                </h1>

                <div className="flex gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                        <Calendar size={15} />
                        {new Date(event.eventDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                        <MapPin size={15} />
                        {event.city}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1300px] mx-auto px-6 mt-8 grid lg:grid-cols-3 gap-10">

                {/* LEFT */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold">About This Event</h2>
                    <p className="text-gray-700 leading-relaxed">
                        {event.description || "No description available."}
                    </p>
                </div>

                {/* SIDEBAR */}
                <div>
                    <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24">
                        <h3 className="font-bold text-lg mb-4">Event Details</h3>

                        <Detail icon={Calendar} label="Date">
                            {new Date(event.eventDate).toLocaleDateString()}
                        </Detail>

                        {event.eventTime && (
                            <Detail icon={Clock} label="Time">
                                {event.eventTime}
                            </Detail>
                        )}

                        <Detail icon={MapPin} label="Location">
                            {event.city}
                        </Detail>

                        {event.capacity && (
                            <Detail icon={Users} label="Capacity">
                                {event.capacity} attendees
                            </Detail>
                        )}

                        <div className="mt-6 space-y-3">
                            {event.registrationLink && (
                                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                                    <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                                        Register Now
                                    </a>
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                className="w-full text-white bg-teal-600 hover:bg-teal-700 border-none"
                                onClick={() =>
                                    navigate("/map", {
                                        state: {
                                            destination: {
                                                lat: event.latitude,
                                                lng: event.longitude,
                                                location: event.location,
                                            }
                                        }
                                    })
                                }
                            >
                                Navigate to Event
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nearby Section */}
            <div className="max-w-[1300px] mx-auto px-6 mt-14 mb-14 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Nearby Places */}
                <NearbySection
                    title="Nearby Places to Visit"
                    loading={nearbyPlacesLoading}
                    items={nearbyPlaces}
                    radius={placeRadius}
                    onRadiusChange={(r) => {
                        setPlaceRadius(r);
                        fetchNearbyPlaces(event.latitude, event.longitude, r);
                    }}
                    renderCard={(place) => <PlaceCard key={place.id} place={place} />}
                    emptyMessage="No nearby places found."
                />

                {/* Nearby Hotels */}
                <NearbySection
                    title="Nearby Hotels"
                    loading={nearbyHotelLoading}
                    items={nearbyHotels}
                    radius={hotelRadius}
                    onRadiusChange={(r) => {
                        setHotelRadius(r);
                        fetchNearbyHotels(event.latitude, event.longitude, r);
                    }}
                    renderCard={(hotel) => <HotelCard key={hotel.id} hotel={hotel} />}
                    emptyMessage="No nearby hotels found."
                />

            </div>

            {/* Similar Events */}
            <SimilarEvents currentEventId={id} category={event.category} />

        </div>
    );
}


function Detail({ icon: Icon, label, children }) {
    return (
        <div className="flex items-start gap-3 mb-3">
            <Icon className="text-teal-600 mt-1" size={18} />
            <div>
                <p className="text-gray-700 text-sm">{label}</p>
                <p className="font-medium text-gray-900">{children}</p>
            </div>
        </div>
    );
}