import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import DataTable from '@/components/admin/DataTable';
import PageHeader from '@/components/admin/PageHeader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchReviews = async () => {
        try {
            setLoading(true);
            // Fetch places first, then get reviews for each
            const placesRes = await axios.get(apiEndpoints.GET_PLACES, { params: { page: 0, size: 50 } });
            const places = placesRes.data?.content || placesRes.data || [];

            const allReviews = [];
            // Fetch reviews for first 10 places (to avoid too many requests)
            const placeBatch = places.slice(0, 10);
            const reviewPromises = placeBatch.map(p =>
                axios.get(apiEndpoints.PLACE_REVIEWS(p.id)).then(res => {
                    const reviews = res.data?.content || res.data || [];
                    return reviews.map(r => ({ ...r, placeName: p.name, placeId: p.id }));
                }).catch(() => [])
            );

            const results = await Promise.all(reviewPromises);
            results.forEach(r => allReviews.push(...r));

            // Sort by date, newest first
            allReviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setReviews(allReviews);
            setTotalPages(1);
        } catch {
            toast.error('Failed to load reviews');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReviews(); }, []);

    const filteredReviews = search
        ? reviews.filter(r =>
            r.comment?.toLowerCase().includes(search.toLowerCase()) ||
            r.placeName?.toLowerCase().includes(search.toLowerCase()) ||
            r.username?.toLowerCase().includes(search.toLowerCase())
        )
        : reviews;

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await axios.delete(apiEndpoints.ADMIN_DELETE_REVIEW(deleteTarget.id), { headers });
            toast.success('Review deleted');
            setDeleteDialogOpen(false);
            setReviews(reviews.filter(r => r.id !== deleteTarget.id));
        } catch {
            toast.error('Failed to delete review');
        } finally {
            setDeleting(false);
        }
    };

    const renderStars = (rating) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
            ))}
        </div>
    );

    const columns = [
        { key: 'username', label: 'User', render: (r) => <span className="font-medium text-sm">{r.username || 'Anonymous'}</span> },
        { key: 'place', label: 'Place', render: (r) => <span className="text-sm text-slate-600">{r.placeName || '—'}</span> },
        { key: 'rating', label: 'Rating', className: 'w-28', render: (r) => renderStars(r.rating) },
        {
            key: 'comment', label: 'Comment',
            render: (r) => <p className="text-sm text-slate-600 max-w-xs truncate">{r.comment || '—'}</p>,
        },
        {
            key: 'date', label: 'Date', className: 'w-28',
            render: (r) => <span className="text-sm text-slate-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</span>,
        },
        {
            key: 'actions', label: '', className: 'w-16 text-right',
            render: (r) => (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { setDeleteTarget(r); setDeleteDialogOpen(true); }}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            ),
        },
    ];

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <PageHeader title="Review Moderation" subtitle={`${reviews.length} reviews loaded`} />

            <DataTable columns={columns} data={filteredReviews} loading={loading} searchPlaceholder="Search reviews..." onSearch={setSearch} page={page} totalPages={totalPages} onPageChange={setPage} />

            <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Delete this review?" description="This review will be permanently removed. This action cannot be undone." loading={deleting} onConfirm={handleDelete} />
        </div>
    );
}
