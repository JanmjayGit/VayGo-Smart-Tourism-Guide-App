import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, SlidersHorizontal, X, Wifi, Car, Waves, ChefHat, Dumbbell, Image } from 'lucide-react';

const AMENITY_ICONS = { WiFi: Wifi, Parking: Car, Pool: Waves, Kitchen: ChefHat, Gym: Dumbbell };

//Hotel Card
export default function HotelCard({ hotel }) {
    const navigate = useNavigate();

    const images =
        hotel.imageUrls?.length
            ? hotel.imageUrls
            : hotel.imageUrl
                ? [hotel.imageUrl]
                : [];

    const amenities = hotel.amenities?.slice(0, 3) || [];

    return (
        <article
            className="group cursor-pointer"
            onClick={() => navigate(`/hotels/${hotel.id}`)}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/hotels/${hotel.id}`)}
        >
            {/* Image */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                {images[0] ? (
                    <img
                        src={images[0]}
                        alt={hotel.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                        <Image className='w-10 h-10 text-gray-400' />
                    </div>
                )}

                {/* Rating */}
                {hotel.rating != null && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                        <Star className="w-3 h-3 fill-black" />
                        {Number(hotel.rating).toFixed(1)}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="mt-3 space-y-1">
                {/* Title */}
                <h3 className="font-semibold text-gray-900 text-[15px] leading-tight line-clamp-1">
                    {hotel.name}
                </h3>

                {/* Location */}
                {(hotel.city || hotel.address) && (
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {hotel.city}
                    </p>
                )}

                {/* Amenities */}
                {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                        {amenities.map((a, i) => {
                            const Icon = AMENITY_ICONS[a];
                            // console.log(hotel);
                            return (
                                <span
                                    key={i}
                                    className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-2 py-[2px] rounded-full"
                                >
                                    {Icon && <Icon className="w-3 h-3" />}
                                    {a}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Price */}
                {hotel.pricePerNight != null ? (
                    <p className="pt-1 text-sm text-gray-900">
                        <span className="font-bold">
                            ₹{Number(hotel.pricePerNight).toLocaleString("en-IN")}
                        </span>{" "}
                        <span className="text-gray-500 font-normal">night</span>
                    </p>
                ) : (
                    <p className="text-xs text-gray-400">Price on request</p>
                )}
            </div>
        </article>
    );
}