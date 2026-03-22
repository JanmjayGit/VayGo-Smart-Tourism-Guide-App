import { useNavigate } from 'react-router-dom';

export default function NearbyCard({ hotel }) {
    const navigate = useNavigate();
    const img = hotel.imageUrls?.[0] || hotel.imageUrl;

    return (
        <div
            className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => navigate(`/hotels/${hotel.id}`)}
        >
            <div className="w-[70px] h-[70px] rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {img
                    ? <img src={img} alt={hotel.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🏨</div>
                }
            </div>
            <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-900 line-clamp-1">{hotel.name}</p>
                <p className="text-xs text-gray-400 mb-0.5">{hotel.city}</p>
                {hotel.pricePerNight != null && (
                    <p className="text-sm font-bold text-teal-700">
                        ₹{Number(hotel.pricePerNight).toLocaleString('en-IN')}
                        <span className="text-gray-400 font-normal text-xs">/night</span>
                    </p>
                )}
            </div>
        </div>
    );
}