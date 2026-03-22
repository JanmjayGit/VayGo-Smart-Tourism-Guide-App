import { useState, useCallback, useRef } from 'react';
import { UploadCloud, X, ImagePlus, Loader2 } from 'lucide-react';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * CloudinaryUpload
 * Drag-and-drop / click-to-browse multi-image uploader.
 * Uploads files directly to Cloudinary via unsigned upload preset.
 *
 * Props:
 *   value     string[]          – current list of Cloudinary URLs
 *   onChange  (urls: string[]) => void
 */
export default function CloudinaryUpload({ value = [], onChange }) {
    const [uploads, setUploads] = useState({}); // { tempId: { name, progress, error, url } }
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    // ── Upload a single File to Cloudinary ───────────────────────────────────
    const uploadFile = useCallback(async (file) => {
        const id = `${Date.now()}-${Math.random()}`;

        setUploads(prev => ({
            ...prev,
            [id]: { name: file.name, progress: 0, error: null, url: null },
        }));

        const form = new FormData();
        form.append('file', file);
        form.append('upload_preset', UPLOAD_PRESET);

        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', UPLOAD_URL);

            xhr.upload.onprogress = (e) => {
                if (!e.lengthComputable) return;
                const pct = Math.round((e.loaded / e.total) * 100);
                setUploads(prev => ({
                    ...prev,
                    [id]: { ...prev[id], progress: pct },
                }));
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    const url = data.secure_url;
                    setUploads(prev => ({
                        ...prev,
                        [id]: { ...prev[id], progress: 100, url },
                    }));
                    resolve({ id, url });
                } else {
                    const msg = JSON.parse(xhr.responseText)?.error?.message || 'Upload failed';
                    setUploads(prev => ({
                        ...prev,
                        [id]: { ...prev[id], error: msg },
                    }));
                    resolve({ id, url: null });
                }
            };

            xhr.onerror = () => {
                setUploads(prev => ({
                    ...prev,
                    [id]: { ...prev[id], error: 'Network error — please retry' },
                }));
                resolve({ id, url: null });
            };

            xhr.send(form);
        });
    }, []);

    // ── Handle file selection (from input or drop) ───────────────────────────
    const handleFiles = useCallback(async (files) => {
        const accepted = Array.from(files).filter(f =>
            /\.(jpe?g|png)$/i.test(f.name),
        );
        if (!accepted.length) return;

        const results = await Promise.all(accepted.map(uploadFile));
        const newUrls = results.filter(r => r.url).map(r => r.url);
        if (newUrls.length) onChange([...value, ...newUrls]);
    }, [uploadFile, value, onChange]);

    // ── Remove an already-uploaded URL ──────────────────────────────────────
    const removeUrl = (url) => onChange(value.filter(u => u !== url));

    // ── Drag handlers ────────────────────────────────────────────────────────
    const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const onDragLeave = () => setDragging(false);
    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    // Active uploads still in progress or errored (no url yet)
    const inFlight = Object.entries(uploads).filter(([, u]) => !u.url);
    const anyLoading = inFlight.some(([, u]) => !u.error);

    return (
        <div className="space-y-4">

            {/* ── Drag-and-drop zone ─────────────────────────────────────── */}
            <div
                role="button"
                tabIndex={0}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                className={`
                    relative flex flex-col items-center justify-center gap-2
                    border-2 border-dashed rounded-xl p-8 cursor-pointer
                    transition-colors duration-200 select-none
                    ${dragging
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}
                `}
            >
                {anyLoading
                    ? <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    : <UploadCloud className={`w-8 h-8 ${dragging ? 'text-indigo-500' : 'text-slate-300'}`} />
                }
                <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">
                        {dragging ? 'Drop images here' : 'Drag & drop images, or click to browse'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">JPG, JPEG, PNG — multiple files supported</p>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            {/* ── In-flight progress bars ────────────────────────────────── */}
            {inFlight.length > 0 && (
                <div className="space-y-2">
                    {inFlight.map(([id, u]) => (
                        <div key={id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                            <div className="flex items-center justify-between mb-1.5">
                                <p className="text-xs font-medium text-slate-600 truncate max-w-[70%]">{u.name}</p>
                                {u.error
                                    ? <span className="text-[11px] text-red-500 font-medium">Failed</span>
                                    : <span className="text-[11px] text-indigo-600 font-medium">{u.progress}%</span>
                                }
                            </div>
                            {u.error
                                ? <p className="text-[11px] text-red-400">{u.error}</p>
                                : (
                                    <div className="h-1 rounded-full bg-slate-200 overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                            style={{ width: `${u.progress}%` }}
                                        />
                                    </div>
                                )
                            }
                        </div>
                    ))}
                </div>
            )}

            {/* ── Uploaded thumbnails grid ───────────────────────────────── */}
            {value.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">
                        {value.length} {value.length === 1 ? 'image' : 'images'} uploaded
                        <span className="ml-1 text-slate-400">· First image is primary</span>
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                        {value.map((url, i) => (
                            <div key={url} className="relative group rounded-lg overflow-hidden aspect-square bg-slate-100 border border-slate-200">
                                <img
                                    src={url}
                                    alt={`Photo ${i + 1}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                {/* Primary badge */}
                                {i === 0 && (
                                    <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                        PRIMARY
                                    </span>
                                )}
                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeUrl(url); }}
                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        {/* Add-more tile */}
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-400 transition-colors"
                        >
                            <ImagePlus className="w-5 h-5" />
                            <span className="text-[10px] mt-1">Add more</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
