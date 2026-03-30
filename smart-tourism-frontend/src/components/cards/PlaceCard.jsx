import { useState } from 'react';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FALLBACK_IMAGE = '/placeholder-place.jpg';

export default function PlaceCard({ place, onToggleFavorite }) {
    const navigate = useNavigate();
    const [currentImg, setCurrentImg] = useState(0);
    const [isFavoriting, setIsFavoriting] = useState(false);
    const [imgError, setImgError] = useState(false);

    const images = place.images?.length ? place.images : [place.imageUrl || FALLBACK_IMAGE];

    // Try multiple possible field names your API might use
    const rating = place.averageRating || place.rating || place.avgRating || 0;
    const reviewCount =
        place.reviewCount ??
        place.totalReviews ??
        place.numReviews ??
        place.ratingsCount ??
        place.reviews?.length ??
        place.popularity ??   // backend stores review count in popularity field
        0;

    // Safely get string fields — guard against literal "undefined" / "null" strings
    const safe = (val) => (val && val !== 'undefined' && val !== 'null' ? val : null);
    const location = safe(place.location) || safe(place.city) || safe(place.address);
    const description = safe(place.description) || safe(place.about) || safe(place.summary);

    const handleFavorite = async (e) => {
        e.stopPropagation();
        setIsFavoriting(true);
        await onToggleFavorite?.(place.id, place.isFavorite);
        setIsFavoriting(false);
    };

    const prevImg = (e) => {
        e.stopPropagation();
        setCurrentImg((p) => (p === 0 ? images.length - 1 : p - 1));
    };

    const nextImg = (e) => {
        e.stopPropagation();
        setCurrentImg((p) => (p === images.length - 1 ? 0 : p + 1));
    };

    return (
        <div
            onClick={() => navigate(`/places/${place.id}`)}
            className="group cursor-pointer select-none"
            style={{ fontFamily: "'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
            {/* Photo — 4:3 ratio (shorter/smaller than square) */}
            <div className="relative w-full overflow-hidden rounded-xl bg-gray-100" style={{ aspectRatio: '4/3' }}>
                {!imgError ? (
                    <img
                        src={images[currentImg]}
                        alt={place.name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-5xl">🏔</span>
                    </div>
                )}

                {/* Heart */}
                <button
                    onClick={handleFavorite}
                    disabled={isFavoriting}
                    aria-label={place.isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
                    className="absolute top-2.5 right-2.5 z-10 transition-transform duration-150 active:scale-90 hover:scale-110"
                    style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))' }}
                >
                    <Heart
                        className="w-5 h-5"
                        style={{
                            fill: place.isFavorite ? '#FF385C' : 'rgba(0,0,0,0.35)',
                            stroke: place.isFavorite ? '#FF385C' : 'white',
                            strokeWidth: 2,
                        }}
                    />
                </button>

                {/* Category pill */}
                <div className="absolute top-2.5 left-2.5 z-10">
                    <span
                        className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.92)', color: '#222', backdropFilter: 'blur(4px)' }}
                    >
                        {place.category}
                    </span>
                </div>

                {/* Carousel arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImg}
                            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center
                         bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 text-gray-800" strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={nextImg}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center
                         bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                            <ChevronRight className="w-3.5 h-3.5 text-gray-800" strokeWidth={2.5} />
                        </button>
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {images.map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-full"
                                    style={{
                                        width: i === currentImg ? 5 : 4,
                                        height: i === currentImg ? 5 : 4,
                                        background: i === currentImg ? 'white' : 'rgba(255,255,255,0.55)',
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/*  card Info */}
            <div className="mt-2 px-0.5 space-y-1">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 line-clamp-1 text-sm font-semibold leading-snug text-gray-900">
                        {place.name}
                    </h3>

                    <div className="flex shrink-0 items-center gap-1 text-xs">
                        {rating > 0 ? (
                            <>
                                <Star className="h-3 w-3 fill-gray-800 text-gray-800" strokeWidth={0} />
                                <span className="font-semibold text-gray-800">{rating.toFixed(1)}</span>
                                <span className="text-gray-300">·</span>
                                <span className="text-gray-400">
                                    {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                                </span>
                            </>
                        ) : reviewCount > 0 ? (
                            <span className="text-gray-400">
                                {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                            </span>
                        ) : (
                            <span className="text-gray-400">No reviews</span>
                        )}
                    </div>
                </div>

                <div>
                    {location ? (
                        <p className="line-clamp-1 text-xs leading-snug text-gray-400">
                            {location}
                        </p>
                    ) : (
                        <p className="text-xs leading-snug text-gray-400">
                            Location unavailable
                        </p>
                    )}
                </div>
            </div>


        </div>
    );
}