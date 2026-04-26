import CloudinaryUpload from "./CloudinaryUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function RoomRow({ roomType, data, onChange }) {
    return (
        <div className="rounded-xl border border-slate-200 p-4 space-y-4">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id={`room-${roomType}`}
                    checked={data.enabled}
                    onChange={e => onChange(roomType, 'enabled', e.target.checked)}
                    className="w-4 h-4 accent-indigo-600"
                />
                <label htmlFor={`room-${roomType}`} className="text-sm font-semibold text-slate-800 capitalize">
                    {roomType.charAt(0) + roomType.slice(1).toLowerCase()} Room
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                    type="number"
                    placeholder="Price / night"
                    disabled={!data.enabled}
                    value={data.price}
                    onChange={e => onChange(roomType, 'price', e.target.value)}
                    className="rounded-lg border-slate-200 h-9 text-sm"
                />
                <Input
                    type="number"
                    placeholder="Number of rooms"
                    disabled={!data.enabled}
                    value={data.count}
                    onChange={e => onChange(roomType, 'count', e.target.value)}
                    className="rounded-lg border-slate-200 h-9 text-sm"
                />
                <Input
                    type="number"
                    placeholder="Capacity"
                    disabled={!data.enabled}
                    value={data.capacity}
                    onChange={e => onChange(roomType, 'capacity', e.target.value)}
                    className="rounded-lg border-slate-200 h-9 text-sm"
                />
            </div>

            <Textarea
                placeholder="Room description"
                disabled={!data.enabled}
                value={data.description}
                onChange={e => onChange(roomType, 'description', e.target.value)}
                className="rounded-lg border-slate-200 resize-none"
                rows={3}
            />

            <div className={`${!data.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <p className="text-sm font-medium text-slate-700 mb-2">Room Photos</p>
                <CloudinaryUpload
                    value={data.imageUrls || []}
                    onChange={(urls) => onChange(roomType, 'imageUrls', urls)}
                />
            </div>
        </div>
    );
}