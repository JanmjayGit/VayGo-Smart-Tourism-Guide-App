import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RoomEditorCard from '@/components/admin/RoomEditorCard';

export default function RoomTypesSection({
    rooms, loading, onAdd, onFieldChange, onToggleAmenity, onRemove
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Room Types</h3>
                <Button type="button" onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Add Room Type
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading rooms...
                </div>
            ) : rooms.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
                    No room types added yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {rooms.map((room, index) => (
                        <RoomEditorCard
                            key={room.id || `draft-${index}`}
                            room={room} index={index}
                            onFieldChange={onFieldChange}
                            onToggleAmenity={onToggleAmenity}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}