import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import CloudinaryUpload from "./CloudinaryUpload";

export default function RoomEditorCard({ room, index, onFieldChange, onToggleAmenity, onRemove }) {
    const ROOM_TYPES = ['STANDARD', 'DELUXE', 'SUITE', 'FAMILY'];

    const AMENITIES = [
        'WiFi', 'Parking', 'Air Conditioning', 'Swimming Pool',
        'Breakfast', 'Room Service', 'Gym', 'Spa',
        'Restaurant', 'Bar', 'Business Center', 'Laundry',
        'Pet Friendly', 'Rooftop Terrace', '24hr Front Desk', 'Airport Shuttle',
    ];

    return (
        <div className="rounded-xl border border-slate-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800">
                    Room {index + 1}
                </h4>
                <Button
                    type="button"
                    variant="ghost"
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => onRemove(index)}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-slate-600">Room Type</label>
                    <select
                        className="w-full border rounded-lg p-2 mt-1 bg-white"
                        value={room.roomType}
                        onChange={(e) => onFieldChange(index, 'roomType', e.target.value)}
                    >
                        {ROOM_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-sm text-slate-600">Price Per Night</label>
                    <input
                        type="number"
                        className="w-full border rounded-lg p-2 mt-1"
                        value={room.pricePerNight}
                        onChange={(e) => onFieldChange(index, 'pricePerNight', e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-sm text-slate-600">Total Rooms</label>
                    <input
                        type="number"
                        className="w-full border rounded-lg p-2 mt-1"
                        value={room.totalRooms}
                        onChange={(e) => onFieldChange(index, 'totalRooms', e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-sm text-slate-600">Capacity</label>
                    <input
                        type="number"
                        className="w-full border rounded-lg p-2 mt-1"
                        value={room.capacity}
                        onChange={(e) => onFieldChange(index, 'capacity', e.target.value)}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="text-sm text-slate-600">Description</label>
                    <textarea
                        rows="3"
                        className="w-full border rounded-lg p-2 mt-1"
                        value={room.description}
                        onChange={(e) => onFieldChange(index, 'description', e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Room Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {AMENITIES.map((amenity) => {
                        const selected = room.amenities.includes(amenity);
                        return (
                            <button
                                key={amenity}
                                type="button"
                                onClick={() => onToggleAmenity(index, amenity)}
                                className={`px-3 py-2 rounded-lg border text-sm transition ${selected
                                    ? 'bg-indigo-50 text-black border-indigo-600'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                                    }`}
                            >
                                {amenity}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Room Photos</label>
                <CloudinaryUpload
                    value={room.imageUrls || []}
                    onChange={(urls) => onFieldChange(index, 'imageUrls', urls)}
                />
            </div>
        </div>
    );
}