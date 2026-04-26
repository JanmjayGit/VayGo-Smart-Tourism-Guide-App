import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CloudinaryUpload from "@/components/admin/CloudinaryUpload";


export default function RoomRequestCard({ roomType, data, onChange }) {
    return (
        <div className="border rounded-xl p-4 space-y-4 bg-gray-50">

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={data.enabled}
                    onChange={(e) => onChange(roomType, 'enabled', e.target.checked)}
                />
                <span className="font-semibold">{roomType} Room</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <Input
                    type="number"
                    placeholder="Price"
                    disabled={!data.enabled}
                    value={data.price}
                    onChange={(e) => onChange(roomType, 'price', e.target.value)}
                />
                <Input
                    type="number"
                    placeholder="Rooms"
                    disabled={!data.enabled}
                    value={data.count}
                    onChange={(e) => onChange(roomType, 'count', e.target.value)}
                />
                <Input
                    type="number"
                    placeholder="Capacity"
                    disabled={!data.enabled}
                    value={data.capacity}
                    onChange={(e) => onChange(roomType, 'capacity', e.target.value)}
                />
            </div>

            <Textarea
                placeholder="Description"
                disabled={!data.enabled}
                value={data.description}
                onChange={(e) => onChange(roomType, 'description', e.target.value)}
            />

            <CloudinaryUpload
                value={data.imageUrls || []}
                onChange={(urls) => onChange(roomType, 'imageUrls', urls)}
            />
        </div>
    );
}