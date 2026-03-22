import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, ImageOff, Star } from 'lucide-react';

export default function PhotoUrlInput({ value = [], onChange }) {
    const [inputVal, setInputVal] = useState('');

    const addUrl = () => {
        const trimmed = inputVal.trim();
        if (!trimmed || value.includes(trimmed)) return;
        onChange([...value, trimmed]);
        setInputVal('');
    };

    const removeUrl = (idx) => onChange(value.filter((_, i) => i !== idx));

    return (
        <div className="space-y-3">
            {/* Input row */}
            <div className="flex gap-2">
                <Input
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
                    placeholder="Paste a photo URL and click Add..."
                    className="flex-1 h-10 text-sm font-mono"
                />
                <Button type="button" onClick={addUrl} disabled={!inputVal.trim()}
                    variant="outline" className="gap-1.5 shrink-0">
                    <Plus className="w-4 h-4" /> Add
                </Button>
            </div>

            {/* Photo grid */}
            {value.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                    {value.map((url, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                            <PhotoThumb url={url} />
                            {/* Primary badge */}
                            {idx === 0 && (
                                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-sm">
                                    <Star className="w-2.5 h-2.5 fill-white" /> Primary
                                </div>
                            )}
                            {/* Remove button */}
                            <button type="button" onClick={() => removeUrl(idx)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 cursor-pointer">
                                <X className="w-3 h-3" />
                            </button>
                            {/* URL on hover */}
                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[9px] text-slate-200 font-mono truncate">{url}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-3 px-3 rounded-lg border border-dashed border-slate-200 bg-slate-50">
                    <ImageOff className="w-4 h-4 text-slate-300" />
                    No photos yet. The first photo added will be used as the primary image.
                </div>
            )}
        </div>
    );
}

function PhotoThumb({ url }) {
    const [err, setErr] = useState(false);
    return err ? (
        <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <ImageOff className="w-6 h-6 text-slate-300" />
        </div>
    ) : (
        <img src={url} alt="" onError={() => setErr(true)} className="w-full h-full object-cover" />
    );
}
