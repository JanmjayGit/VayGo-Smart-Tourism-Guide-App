import { Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/hooks/useFavorites';

export default function FavoritePlaces() {
    const { favorites, loading, error } = useFavorites();

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Favorite Places</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 overflow-x-auto">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-16 w-16 rounded-full flex-shrink-0" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !favorites || favorites.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Favorite Places</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4 text-gray-500">
                        <Heart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No favorites yet</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Favorite Places</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {favorites.slice(0, 6).map((favorite) => (
                        <div
                            key={favorite.id}
                            className="flex-shrink-0 cursor-pointer group"
                            title={favorite.place?.name}
                        >
                            <Avatar className="h-16 w-16 border-2 border-white shadow-md group-hover:scale-110 transition-transform">
                                <AvatarImage
                                    src={favorite.place?.imageUrl}
                                    alt={favorite.place?.name}
                                />
                                <AvatarFallback>
                                    {favorite.place?.name?.charAt(0) || 'P'}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
