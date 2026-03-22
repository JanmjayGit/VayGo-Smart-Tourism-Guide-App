import { Heart, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/hooks/useFavorites';

export default function FavoritesCard() {
    const navigate = useNavigate();
    const { favorites, loading, error } = useFavorites();

    // Use only top 4 for 2x2 grid
    const topFavorites = favorites ? favorites.slice(0, 4) : [];

    // Add placeholders if less than 4
    const displayTiles = [...topFavorites];
    while (displayTiles.length < 4) {
        displayTiles.push({ isPlaceholder: true });
    }

    return (
        <Card className="p-6 rounded-2xl shadow-lg border-white/50 bg-white shadow-organic flex flex-col h-full min-h-[350px]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-dmsans text-lg font-bold text-[#1a2b38] flex items-center gap-2">
                    Favorite Places
                </h3>
                <button
                    onClick={() => navigate('/favorites')}
                    className="text-teal-700 bg-teal-100 px-4 py-1.5 flex items-center gap-1 rounded-full text-xs font-semibold hover:bg-teal-200 transition-colors"
                >
                    Manage <span className="ml-1"><ArrowRight className="w-4 h-4" /></span>
                </button>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                {loading ? (
                    <div className="grid grid-cols-2 gap-3 h-full">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="rounded-xl h-full w-full aspect-4/3" />)}
                    </div>
                ) : error ? (
                    <div className="text-center text-gray-400 py-6 text-sm flex flex-col items-center">
                        <Heart className="w-8 h-8 text-gray-200 mb-2" />
                        <p>Failed to load favorites</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {displayTiles.map((fav, i) => {
                            if (fav.isPlaceholder) {
                                return (
                                    <div
                                        key={`placeholder-${i}`}
                                        onClick={() => navigate('/places')}
                                        className="aspect-4/3 rounded-xl border-2 border-dashed border-teal-100 bg-teal-50/30 flex flex-col justify-center items-center text-teal-600/70 cursor-pointer hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition-all font-medium text-sm gap-1 group"
                                    >
                                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Add Place
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={fav.id}
                                    onClick={() => navigate(`/places/${fav.placeId}`)}
                                    className="relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer group shadow-sm"
                                >
                                    <img
                                        src={fav.imageUrl || '/placeholder.jpg'}
                                        alt={fav.placeName}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                    />

                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                                    <div className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
                                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                    </div>

                                    <div className="absolute bottom-2 left-3 pr-2">
                                        <p className="text-white font-bold text-sm tracking-wide shadow-black/50 drop-shadow-md truncate">
                                            {fav.placeName}
                                        </p>
                                        {fav.city && (
                                            <p className="text-white/75 text-xs truncate">{fav.city}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Card>
    );
}
