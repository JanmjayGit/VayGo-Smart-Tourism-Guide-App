import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

export default function ReviewsSection({ placeId }) {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const [reviewsRes, statsRes] = await Promise.all([
                    axios.get(apiEndpoints.GET_REVIEWS_BY_PLACE(placeId), {
                        params: { page: 0, size: 5 }
                    }),
                    axios.get(apiEndpoints.GET_RATING_STATS(placeId))
                ]);

                setReviews(reviewsRes.data?.content || []);
                setStats(statsRes.data);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [placeId]);

    const renderStars = (rating) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Reviews ({stats?.totalReviews || 0})</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Rating Summary */}
                {stats && stats.totalReviews > 0 && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-4xl font-bold">{stats.averageRating?.toFixed(1)}</div>
                            <div>
                                {renderStars(Math.round(stats.averageRating))}
                                <p className="text-sm text-gray-600 mt-1">
                                    Based on {stats.totalReviews} reviews
                                </p>
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = stats[`star${star}Count`] || 0;
                                const percentage = stats.totalReviews > 0
                                    ? (count / stats.totalReviews) * 100
                                    : 0;

                                return (
                                    <div key={star} className="flex items-center gap-2">
                                        <span className="text-sm w-8">{star}★</span>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400 transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600 w-12 text-right">
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            No reviews yet. Be the first to review!
                        </p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="border-b pb-4 last:border-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-semibold">{review.userName || 'Anonymous'}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {renderStars(review.rating)}
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
