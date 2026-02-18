import { Card, CardContent } from '@/components/ui/card';

export default function PlaceCardSkeleton() {
    return (
        <Card className="overflow-hidden border-0">
            {/* Image Skeleton */}
            <div className="aspect-video bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]" />

            {/* Content Skeleton */}
            <CardContent className="p-5 space-y-3">
                {/* Title */}
                <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-3/4" />

                {/* Rating */}
                <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-1/2" />

                {/* Location */}
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-2/3" />

                {/* Description Lines */}
                <div className="space-y-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-full" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-5/6" />
                </div>
            </CardContent>
        </Card>
    );
}
