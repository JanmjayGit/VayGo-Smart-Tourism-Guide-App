import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function RoomPhotoModal({
    open,
    images = [],
    index = 0,
    title = 'Room Photos',
    onClose,
    onPrev,
    onNext,
    onSelect,
}) {
    if (!open || !images.length) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-5xl">
                <div className="absolute -top-14 left-0 right-0 flex items-center justify-between">
                    <h3 className="text-white text-lg font-semibold">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-white text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-hidden rounded-3xl bg-black shadow-2xl">
                    <img
                        src={images[index]}
                        alt={`${title} ${index + 1}`}
                        className="w-full max-h-[60vh] object-cover"
                    />
                </div>

                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={onPrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-black rounded-full w-11 h-11 text-xl"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                            type="button"
                            onClick={onNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-black rounded-full w-11 h-11 text-xl"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}

                {images.length > 1 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                        {images.map((img, i) => (
                            <button
                                key={`${img}-${i}`}
                                type="button"
                                onClick={() => onSelect(i)}
                                className={`shrink-0 rounded-2xl overflow-hidden border-2 ${i === index ? 'border-teal-400' : 'border-transparent'
                                    }`}
                            >
                                <img
                                    src={img}
                                    alt={`Thumbnail ${i + 1}`}
                                    className="w-20 h-20 object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
