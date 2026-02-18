import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MapPlaceholder() {
    return (
        <div className="sticky top-32 h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            <div className="text-center p-8">
                <div className="bg-gradient-to-br from-teal-100 to-orange-100 rounded-full p-6 inline-block mb-6">
                    <MapPin className="w-16 h-16 text-teal-600" />
                </div>
                <h3 className="font-playfair text-2xl font-bold text-gray-800 mb-3">
                    Interactive Map
                </h3>
                <p className="font-outfit text-gray-600 mb-4 max-w-sm">
                    Explore places on an interactive map with real-time location tracking
                </p>
                <Badge variant="outline" className="font-outfit">
                    Google Maps Integration Ready
                </Badge>
            </div>
        </div>
    );
}
