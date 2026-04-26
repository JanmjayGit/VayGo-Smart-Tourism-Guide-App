import RoomCard from './RoomCard';

export default function RoomList({
    rooms,
    selectedRoomId,
    onSelectRoom,
    onViewPhotos,
    hotel
}) {
    return (
        <div className="grid gap-5">
            {rooms.map((room) => (
                <RoomCard
                    key={room.id}
                    room={room}
                    hotel={hotel}
                    isSelected={selectedRoomId === room.id}
                    onSelect={onSelectRoom}
                    onViewPhotos={onViewPhotos}
                />
            ))}
        </div>
    );
}