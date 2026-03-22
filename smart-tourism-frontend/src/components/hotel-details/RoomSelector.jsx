export default function RoomSelector({ rooms, selectedRoomId, onSelect }) {
    if (!rooms.length) return null;

    return (
        <div className="pb-5 border-b border-gray-100">
            <h2
                className="text-lg font-bold text-gray-900 mb-3"
                style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
                Available Room Types
            </h2>
            <div className="grid gap-3">
                {rooms.map(room => (
                    <button
                        key={room.id}
                        type="button"
                        onClick={() => room.available && onSelect(room.id)}
                        className={`text-left p-4 rounded-2xl border-2 transition-all ${selectedRoomId === room.id
                                ? 'border-gray-900 bg-gray-50'
                                : room.available
                                    ? 'border-gray-200 hover:border-gray-400'
                                    : 'border-gray-100 opacity-50 cursor-not-allowed'
                            }`}
                        disabled={!room.available}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">
                                    {room.roomType.charAt(0) + room.roomType.slice(1).toLowerCase()} Room
                                </p>
                                {room.description && (
                                    <p className="text-gray-500 text-xs mt-0.5">{room.description}</p>
                                )}
                                <p className={`text-xs mt-1 ${room.available ? 'text-teal-600' : 'text-red-500'}`}>
                                    {room.available ? `${room.availableRooms} available` : 'Fully booked'}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-bold text-gray-900">
                                    ₹{Number(room.pricePerNight).toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs text-gray-400">/ night</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}