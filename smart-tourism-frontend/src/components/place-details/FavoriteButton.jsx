import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

export default function FavoriteButton({ placeId, initialIsFavorite = false, size = 'default' }) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isLoading, setIsLoading] = useState(false);

    const toggleFavorite = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to add favorites');
            return;
        }

        // Optimistic update
        const previousState = isFavorite;
        setIsFavorite(!isFavorite);
        setIsLoading(true);

        try {
            if (previousState) {
                // Remove from favorites
                await axios.delete(apiEndpoints.REMOVE_FAVORITE(placeId), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Removed from favorites');
            } else {
                // Add to favorites
                await axios.post(apiEndpoints.ADD_FAVORITE(placeId), {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Added to favorites');
            }
        } catch (error) {
            // Revert on error
            setIsFavorite(previousState);
            toast.error('Failed to update favorite');
            console.error('Favorite toggle error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={isFavorite ? 'default' : 'outline'}
            size={size}
            onClick={toggleFavorite}
            disabled={isLoading}
            className={isFavorite ? 'bg-red-500 hover:bg-red-600' : ''}
        >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            <span className="ml-2">{isFavorite ? 'Saved' : 'Save'}</span>
        </Button>
    );
}
