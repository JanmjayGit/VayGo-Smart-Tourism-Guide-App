import { useState } from "react";
import Lightbox from "./Lightbox";

export default function ImageGallery({ images = [] }) {

    const [lightboxIdx, setLightboxIdx] = useState(null);

    if (!images.length) {
        return (
            <div className="h-[380px] bg-gradient-to-br from-teal-50 to-gray-100 rounded-3xl flex items-center justify-center mb-8">
                <span className="text-6xl">🎉</span>
            </div>
        );
    }

    const gridImages = images.slice(0, 5);

    return (
        <>
            {lightboxIdx !== null && (
                <Lightbox
                    images={images}
                    startIndex={lightboxIdx}
                    onClose={() => setLightboxIdx(null)}
                />
            )}

            <div className="relative">

                {/* IMAGE GRID */}
                <div
                    className={`grid gap-2 rounded-3xl overflow-hidden mb-8 h-[380px]
                    ${gridImages.length >= 3
                            ? "grid-cols-4 grid-rows-2"
                            : gridImages.length === 2
                                ? "grid-cols-2"
                                : "grid-cols-1"
                        }`}
                >
                    {gridImages.map((img, i) => (
                        <div
                            key={i}
                            onClick={() => setLightboxIdx(i)}
                            className={`cursor-pointer overflow-hidden
                            ${i === 0 && gridImages.length >= 3
                                    ? "col-span-2 row-span-2"
                                    : ""
                                }`}
                        >
                            <img
                                src={img}
                                alt={`Photo ${i + 1}`}
                                className="w-full h-full object-cover hover:brightness-95 transition"
                            />
                        </div>
                    ))}
                </div>

                {/* SHOW ALL PHOTOS BUTTON */}
                {images.length > 1 && (
                    <button
                        onClick={() => setLightboxIdx(0)}
                        className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:bg-white"
                    >
                        Show all photos
                    </button>
                )}

            </div>
        </>
    );
}