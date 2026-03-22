import { Hotel, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NearbyCard from './NearbyCard';

export default function NearbyHotels({ hasCoords, loading, checked, hotels, onFetch }) {
    return (
        <div>
            <Button
                variant="outline"
                className="border-gray-300 rounded-xl text-sm bg-gray-900 text-white"
                onClick={onFetch}
                disabled={loading || !hasCoords}
            >
                {loading
                    ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    : <Hotel className="w-4 h-4 mr-2" />
                }
                Nearby Hotels
            </Button>

            {checked && !loading && (
                <div className="mt-5">
                    <h2
                        className="text-lg font-bold text-gray-900 mb-3"
                        style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                        Nearby Hotels
                    </h2>
                    {hotels.length === 0 ? (
                        <p className="text-gray-400 text-sm">No other hotels found within 10km.</p>
                    ) : (
                        <div className="grid gap-1">
                            {hotels.slice(0, 5).map(h => <NearbyCard key={h.id} hotel={h} />)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}