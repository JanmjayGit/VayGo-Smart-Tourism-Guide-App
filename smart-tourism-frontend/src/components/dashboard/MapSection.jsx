import { MapPin, Navigation, ZoomIn, ZoomOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MapSection() {
    return (
        <Card className="relative h-96 overflow-hidden bg-gray-100">
            {/* Map Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <MapPin className="h-16 w-16 mx-auto mb-2" />
                    <p className="text-lg font-medium">Map View</p>
                    <p className="text-sm">Interactive map will be integrated here</p>
                </div>
            </div>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button size="icon" variant="secondary" className="bg-white">
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" className="bg-white">
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" className="bg-white">
                    <Navigation className="h-4 w-4" />
                </Button>
            </div>

            {/* Emergency Services Button */}
            <div className="absolute bottom-4 left-4">
                <Button className="bg-red-500 hover:bg-red-600 text-white">
                    Emergency Services
                </Button>
            </div>
        </Card>
    );
}
