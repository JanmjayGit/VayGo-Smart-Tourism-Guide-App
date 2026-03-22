import { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, User, Loader2, MessageSquare } from 'lucide-react';
import apiEndpoints from '@/util/apiEndpoints';

function StarRow({ rating }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
                />
            ))}
        </div>
    );
}

export default function HotelReviews({ hotelId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!hotelId) { setLoading(false); return; }
        axios.get(apiEndpoints.HOTEL_REVIEWS(hotelId))
            .then(res => setReviews(res.data?.content || res.data || []))
            .catch(() => setReviews([]))
            .finally(() => setLoading(false));
    }, [hotelId]);

    if (!loading && reviews.length === 0) return null;

    return (
        <section className="pb-5 border-t border-gray-100 pt-7">
            <h2
                className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"
                style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
                <MessageSquare className="w-5 h-5 text-teal-500" />
                Guest Reviews
                {reviews.length > 0 && (
                    <span className="text-sm font-normal text-gray-400">({reviews.length})</span>
                )}
            </h2>

            {loading ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews…
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(r => (
                        <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-teal-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <p className="text-sm font-semibold text-gray-800">{r.userName || r.username || 'Guest'}</p>
                                        <p className="text-xs text-gray-400">
                                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ''}
                                        </p>
                                    </div>
                                    <StarRow rating={Math.round(r.rating || r.starRating || 0)} />
                                    {r.comment && (
                                        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{r.comment}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
