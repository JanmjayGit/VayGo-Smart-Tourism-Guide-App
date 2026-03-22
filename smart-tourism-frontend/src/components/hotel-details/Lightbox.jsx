import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Lightbox({ images, startIndex, onClose }) {
    const [cur, setCur] = useState(startIndex);

    useEffect(() => {
        const h = (e) => {
            if (e.key === 'ArrowRight') setCur(i => (i + 1) % images.length);
            if (e.key === 'ArrowLeft') setCur(i => (i - 1 + images.length) % images.length);
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [images.length, onClose]);

    return (
        <div className="fixed inset-0 z-200 bg-black/95 flex items-center justify-center" onClick={onClose}>
            <button className="absolute top-5 right-5 text-white/60 hover:text-white" onClick={onClose}>
                <X className="w-7 h-7" />
            </button>
            <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-all"
                onClick={e => { e.stopPropagation(); setCur(i => (i - 1 + images.length) % images.length); }}
            >
                <ChevronLeft className="w-7 h-7" />
            </button>
            <img
                src={images[cur]}
                alt={`Photo ${cur + 1}`}
                className="max-h-[88vh] max-w-[88vw] object-contain rounded-xl shadow-2xl"
                onClick={e => e.stopPropagation()}
            />
            <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-all"
                onClick={e => { e.stopPropagation(); setCur(i => (i + 1) % images.length); }}
            >
                <ChevronRight className="w-7 h-7" />
            </button>
            <span className="absolute bottom-6 text-white/40 text-sm">{cur + 1} / {images.length}</span>
        </div>
    );
}