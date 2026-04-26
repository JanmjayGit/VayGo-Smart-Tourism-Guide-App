import { Hotel } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RoomCard({
    room,
    hotel,
    isSelected,
    onSelect,
    onViewPhotos
}) {
    const roomImages =
        room.imageUrls?.length
            ? room.imageUrls
            : hotel.imageUrls?.length
                ? hotel.imageUrls
                : hotel.imageUrl
                    ? [hotel.imageUrl]
                    : [];

    return (
        <div
            className={`group rounded-3xl border transition-all duration-300 overflow-hidden
        ${isSelected
                    ? 'border-teal-500 shadow-lg bg-white'
                    : 'border-gray-200 hover:shadow-xl hover:-translate-y-1'
                }`}
        >
            <div className="grid md:grid-cols-[220px_1fr]">

                {/* IMAGE */}
                <div className="relative h-52 md:h-full overflow-hidden">
                    {roomImages.length > 0 ? (
                        <img
                            src={roomImages[0]}
                            alt={room.roomType}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100">
                            <Hotel className="w-10 h-10 text-gray-400" />
                        </div>
                    )}

                    {/* overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition" />
                </div>

                {/* CONTENT */}
                <div className="p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {room.roomType} Room
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                                {room.availableRooms} available · up to {room.capacity} guests
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-2xl font-extrabold text-gray-900">
                                ₹{room.pricePerNight}
                            </p>
                            <span className="text-xs text-gray-400">/ night</span>
                        </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex gap-3 mt-4 justify-end">
                        <Button
                            variant="outline"
                            className="rounded-xl bg-gray-900 text-white hover:bg-black"
                            onClick={() => onViewPhotos(room)}
                        >
                            View Photos
                        </Button>

                        <Button
                            className={`rounded-xl px-5 transition-all
                                ${isSelected
                                    ? 'bg-teal-600 text-white shadow-md hover:bg-teal-700'
                                    : 'bg-teal-500 hover:bg-teal-600 text-white'
                                }`}
                            onClick={() => onSelect(room)}
                        >
                            {isSelected ? 'Selected' : 'Select Room'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}