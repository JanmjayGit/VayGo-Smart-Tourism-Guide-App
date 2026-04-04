import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

export default function FeaturedBanner({ event }) {
    const navigate = useNavigate();
    const [currentImage, setCurrentImage] = useState(0);

    if (!event) return null;

    const images = [
        ...(Array.isArray(event.imageUrls) ? event.imageUrls : []),
        ...(event.imageUrl ? [event.imageUrl] : []),
    ].filter(Boolean);

    const uniqueImages = [...new Set(images)];
    const bannerImages = uniqueImages.length ? uniqueImages : ['/placeholder-event.jpg'];

    useEffect(() => {
        setCurrentImage(0);
    }, [event?.id]);

    useEffect(() => {
        if (bannerImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % bannerImages.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [bannerImages.length]);



    return (
        <motion.div
            className="group relative mb-8 h-[260px] cursor-pointer overflow-hidden rounded-2xl shadow-lg md:h-[300px]"
            onClick={() => navigate(`/events/${event.id}`)}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
        >
            <AnimatePresence mode="wait">
                <motion.img
                    key={bannerImages[currentImage]}
                    src={bannerImages[currentImage]}
                    alt={event.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1.06 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-black backdrop-blur-sm">
                    Next Event
                </span>
            </div>

            {bannerImages.length > 1 && (
                <div className="absolute bottom-4 right-4 z-10 flex gap-1.5">
                    {bannerImages.map((_, index) => (
                        <span
                            key={index}
                            className={`h-2 rounded-full transition-all ${index === currentImage ? 'w-5 bg-white' : 'w-2 bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between gap-4 p-5">
                <div>
                    <h2 className="mb-2 text-2xl font-bold leading-tight text-white drop-shadow">
                        {event.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-white/80">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> {fmtDate(event.eventDate)}
                        </span>

                        {(event.city || event.location) && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" /> {event.city || event.location}
                            </span>
                        )}
                    </div>
                </div>

                <Button
                    className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-black backdrop-blur-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event.id}`);
                    }}
                >
                    View Event
                </Button>
            </div>
        </motion.div>
    );
}

