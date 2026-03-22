import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, MapPin, ArrowRight, ImageOff } from 'lucide-react';
import apiEndpoints from '@/util/apiEndpoints';

function HotelCard({ hotel }) {
    const navigate = useNavigate();
    const image = hotel.imageUrls?.[0] || hotel.imageUrl;
    const rating = hotel.rating != null ? Number(hotel.rating) : null;

    return (
        <article
            className="group cursor-pointer"
            onClick={() => navigate(`/hotels/${hotel.id}`)}
        >
            {/* Image */}
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 mb-3">
                {image ? (
                    <img
                        src={image}
                        alt={hotel.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ImageOff className="w-10 h-10 text-gray-300" />
                    </div>
                )}
                {/* Star rating */}
                {hotel.starRating && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: Math.min(hotel.starRating, 5) }).map((_, i) => (
                                <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            ))}
                        </div>
                    </div>
                )}
                {/* Rating */}
                {rating != null && rating > 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-gray-800">{rating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="px-0.5">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-0.5">{hotel.name}</h3>
                {(hotel.city || hotel.address) && (
                    <p className="text-gray-400 text-xs flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3 shrink-0" /> {hotel.city || hotel.address?.split(',')[0]}
                    </p>
                )}
                {hotel.pricePerNight != null ? (
                    <p className="text-sm">
                        <span className="font-bold text-gray-900">₹{Number(hotel.pricePerNight).toLocaleString('en-IN')}</span>
                        <span className="text-gray-400 font-normal text-xs"> / night</span>
                    </p>
                ) : (
                    <p className="text-xs text-gray-400">Price on request</p>
                )}
            </div>
        </article>
    );
}

function Skeleton() {
    return (
        <div className="animate-pulse">
            <div className="aspect-4/3 rounded-2xl bg-gray-200 mb-3" />
            <div className="h-3.5 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
    );
}

export default function PopularHotels() {
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(apiEndpoints.SEARCH_HOTELS, { params: { page: 0, size: 8 } })
            .then(res => setHotels((res.data?.content || res.data || []).slice(0, 4)))
            .catch(() => setHotels([]))
            .finally(() => setLoading(false));
    }, []);

    if (!loading && hotels.length === 0) return null;

    return (
        <section className="py-20 px-4 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-teal-600 text-xs font-bold tracking-[0.3em] uppercase mb-2">Handpicked Stays</p>
                        <h2
                            className="text-4xl sm:text-5xl font-black text-gray-900"
                            style={{ fontFamily: "'Inter Tight', sans-serif" }}
                        >
                            Popular Hotels
                        </h2>
                    </div>
                    <button
                        onClick={() => navigate('/hotels')}
                        className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors group"
                    >
                        View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
                        : hotels.map(h => <HotelCard key={h.id} hotel={h} />)
                    }
                </div>

                <div className="flex justify-center mt-8 sm:hidden">
                    <button
                        onClick={() => navigate('/hotels')}
                        className="text-sm font-semibold text-teal-600 border border-teal-200 px-6 py-2.5 rounded-full hover:bg-teal-50 transition-colors"
                    >
                        View All Hotels
                    </button>
                </div>
            </div>
        </section>
    );
}
