import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, MapPin, ArrowRight, ImageOff } from 'lucide-react';
import apiEndpoints from '@/util/apiEndpoints';

function PlaceCard({ place }) {
    const navigate = useNavigate();
    const rating = place.averageRating ?? place.rating ?? 0;
    const reviewCount = place.reviewCount ?? place.popularity ?? 0;
    const city = place.city ?? place.address?.split(',')[0] ?? '';

    return (
        <article
            className="group cursor-pointer"
            onClick={() => navigate(`/places/${place.id}`)}
        >
            {/* Image */}
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-50 mb-3">
                {place.imageUrl ? (
                    <img
                        src={place.imageUrl}
                        alt={place.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ImageOff className="w-10 h-10 text-gray-300" />
                    </div>
                )}
                {/* Category badge */}
                <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
                        {place.category?.replace(/_/g, ' ')}
                    </span>
                </div>
                {/* Rating badge */}
                {Number(rating) > 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-gray-800">{Number(rating).toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="px-0.5">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-0.5">{place.name}</h3>
                {city && (
                    <p className="text-gray-400 text-xs flex items-center gap-1 mb-0.5">
                        <MapPin className="w-3 h-3 shrink-0" /> {city}
                    </p>
                )}
                <p className="text-gray-400 text-xs">
                    {reviewCount > 0 ? `${reviewCount} review${reviewCount > 1 ? 's' : ''}` : 'No reviews yet'}
                </p>
            </div>
        </article>
    );
}

function Skeleton() {
    return (
        <div className="animate-pulse">
            <div className="aspect-4/3 rounded-2xl bg-gray-200 mb-3" />
            <div className="h-3.5 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
    );
}

export default function PopularPlaces() {
    const navigate = useNavigate();
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(apiEndpoints.GET_PLACES, { params: { page: 0, size: 8 } })
            .then(res => setPlaces((res.data?.content || res.data || []).slice(0, 4)))
            .catch(() => setPlaces([]))
            .finally(() => setLoading(false));
    }, []);

    if (!loading && places.length === 0) return null;

    return (
        <section className="py-20 px-4 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <p className="text-teal-600 text-xs font-bold tracking-[0.3em] uppercase mb-2">Popular Destinations</p>
                        <h2
                            className="text-4xl sm:text-5xl font-black text-gray-900"
                            style={{ fontFamily: "'Inter Tight', sans-serif" }}
                        >
                            Most Visited Places
                        </h2>
                    </div>
                    <button
                        onClick={() => navigate('/places')}
                        className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors group"
                    >
                        View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
                        : places.map(p => <PlaceCard key={p.id} place={p} />)
                    }
                </div>

                {/* Mobile view all */}
                <div className="flex justify-center mt-8 sm:hidden">
                    <button
                        onClick={() => navigate('/places')}
                        className="text-sm font-semibold text-white bg-teal-500 px-6 py-2.5 rounded-full hover:bg-teal-600 transition-colors"
                    >
                        View All Places
                    </button>
                </div>
            </div>
        </section>
    );
}
