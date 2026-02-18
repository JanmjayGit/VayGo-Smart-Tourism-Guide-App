import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Star, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const categoryColors = {
    HISTORICAL: 'bg-[#C9A961]/20 text-[#C9A961] border-[#C9A961]/30 font-accent',
    NATURAL: 'bg-[#8B9D83]/20 text-[#6D7D66] border-[#8B9D83]/30 font-accent',
    RELIGIOUS: 'bg-[#1A3A52]/20 text-[#1A3A52] border-[#1A3A52]/30 font-accent',
    ADVENTURE: 'bg-[#D4745F]/20 text-[#B85D48] border-[#D4745F]/30 font-accent',
    CULTURAL: 'bg-[#C9A961]/20 text-[#C9A961] border-[#C9A961]/30 font-accent',
    BEACH: 'bg-[#8B9D83]/20 text-[#6D7D66] border-[#8B9D83]/30 font-accent',
};

export default function PlaceCard({ place, onToggleFavorite }) {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);
    const [isFavoriting, setIsFavoriting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        setIsFavoriting(true);
        await onToggleFavorite(place.id, place.isFavorite);
        setIsFavoriting(false);
    };

    const handleCardClick = () => {
        navigate(`/places/${place.id}`);
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < fullStars ? 'fill-[#C9A961] text-[#C9A961]' : 'text-[#D4C4B0]'
                        }`}
                />
            );
        }
        return stars;
    };

    return (
        <Card
            className="group relative overflow-hidden border-0 bg-white shadow-organic hover:shadow-organic-lg transition-all duration-700 cursor-pointer animate-fade-in-up"
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Asymmetric Image Container with Ken Burns Effect */}
            <div className="relative overflow-hidden h-72 bg-[#E8DFD0]">
                {!imageError ? (
                    <img
                        src={place.imageUrl || '/placeholder-place.jpg'}
                        alt={place.name}
                        className={`object-cover w-full h-full transition-all duration-[3000ms] ease-out ${isHovered ? 'scale-110' : 'scale-100'
                            }`}
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-subtle">
                        <MapPin className="w-20 h-20 text-[#8B9D83] opacity-30" />
                    </div>
                )}

                {/* Dramatic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C3333]/80 via-[#2C3333]/20 to-transparent opacity-90" />

                {/* Category Badge - Top Left with Accent Font */}
                <Badge
                    className={`absolute top-4 left-4 px-3 py-1.5 text-xs tracking-widest border shadow-lg backdrop-blur-sm ${categoryColors[place.category] || 'bg-[#E8DFD0]/20 text-[#4A5759] border-[#D4C4B0]/30 font-accent'
                        }`}
                >
                    {place.category}
                </Badge>

                {/* Favorite Button - Top Right */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm rounded-full w-10 h-10 transition-all duration-300 hover:scale-110"
                    onClick={handleFavoriteClick}
                    disabled={isFavoriting}
                >
                    <Heart
                        className={`w-5 h-5 transition-all duration-300 ${place.isFavorite
                                ? 'fill-[#D4745F] text-[#D4745F] scale-110'
                                : 'text-[#4A5759] hover:text-[#D4745F]'
                            }`}
                    />
                </Button>

                {/* Asymmetric Content Overlay - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    {/* Place Name with Display Font */}
                    <h3 className="font-display text-3xl font-bold leading-tight mb-2 drop-shadow-lg">
                        {place.name}
                    </h3>

                    {/* Location */}
                    {place.location && (
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-[#E89580]" />
                            <span className="text-sm font-body text-white/90">{place.location}</span>
                        </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                            {renderStars(place.averageRating || 0)}
                        </div>
                        <span className="text-sm font-body font-semibold text-white">
                            {place.averageRating?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-sm font-body text-white/70">
                            ({place.reviewCount || 0} reviews)
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Section - Asymmetric */}
            <CardContent className="p-6 space-y-4 bg-white relative">
                {/* Decorative Element */}
                <div className="absolute top-0 left-0 w-16 h-1 bg-gradient-to-r from-[#D4745F] to-[#E89580]" />

                {/* Description */}
                <p className="text-[#4A5759] font-body text-sm leading-relaxed line-clamp-2 pt-2">
                    {place.description || 'Discover this amazing destination and create unforgettable memories.'}
                </p>

                {/* Explore Button with Arrow */}
                <div className="flex items-center justify-between pt-2">
                    <span className="font-accent text-xs text-[#8B9D83] tracking-widest">
                        EXPLORE MORE
                    </span>
                    <ArrowRight
                        className={`w-5 h-5 text-[#D4745F] transition-transform duration-300 ${isHovered ? 'translate-x-2' : 'translate-x-0'
                            }`}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
