import { MapPin, Star, Navigation, CheckCircle2, Wifi, Car, Waves, ChefHat, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import RoomSelector from './RoomSelector';
import NearbyHotels from './NearbyHotels';

const AMENITY_ICONS = { WiFi: Wifi, Parking: Car, Pool: Waves, Kitchen: ChefHat, Gym: Dumbbell };

export default function HotelInfo({ hotel, rooms, selectedRoomId, onSelectRoom, nearbyState, onFetchNearby }) {
    const navigate = useNavigate();

    return (
        <div className="lg:col-span-2 space-y-7">

            {/* Title row */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-gray-100">
                <div className="min-w-0">
                    <h1
                        className="text-3xl font-black text-gray-900 mb-2 leading-tight"
                        style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                        {hotel.name}
                    </h1>
                    {(hotel.city || hotel.address) && (
                        <p className="flex items-center gap-1.5 text-gray-500 text-sm">
                            <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                            {[hotel.address, hotel.city].filter(Boolean).join(', ')}
                        </p>
                    )}
                </div>
                {hotel.rating != null && (
                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-2xl shrink-0">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-gray-800">{Number(hotel.rating).toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* About */}
            {hotel.description && (
                <div className="pb-5 border-b border-gray-100">
                    <h2
                        className="text-lg font-bold text-gray-900 mb-2"
                        style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                        About this place
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-sm">{hotel.description}</p>
                </div>
            )}

            {/* Amenities */}
            {hotel.amenities?.length > 0 && (
                <div className="pb-5 border-b border-gray-100">
                    <h2
                        className="text-lg font-bold text-gray-900 mb-3"
                        style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                        What this place offers
                    </h2>
                    <div className="grid grid-cols-2 gap-2.5">
                        {hotel.amenities.map((a, i) => {
                            const Icon = AMENITY_ICONS[a] || CheckCircle2;
                            return (
                                <div key={i} className="flex items-center gap-3 text-sm text-gray-700 py-1">
                                    <Icon className="w-5 h-5 text-gray-500 shrink-0" />
                                    <span>{a}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Room Types */}
            <RoomSelector rooms={rooms} selectedRoomId={selectedRoomId} onSelect={onSelectRoom} />

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                <Button
                    variant="outline"
                    className="border-gray-300 rounded-xl text-sm bg-gray-900 text-white"
                    onClick={() => navigate('/map', {
                        state: { destination: { lat: hotel.latitude, lng: hotel.longitude, name: hotel.name } }
                    })}
                >
                    <Navigation className="w-4 h-4 mr-2" /> Get Directions
                </Button>

                <NearbyHotels
                    hasCoords={!!(hotel.latitude && hotel.longitude)}
                    loading={nearbyState.loading}
                    checked={nearbyState.checked}
                    hotels={nearbyState.hotels}
                    onFetch={onFetchNearby}
                />
            </div>
        </div>
    );
}