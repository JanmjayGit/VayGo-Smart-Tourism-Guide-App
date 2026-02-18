import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, Phone, Globe, DollarSign, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PlaceInfo({ place }) {
    const infoItems = [
        {
            icon: Clock,
            label: 'Hours',
            value: place.openingHours || 'Not available',
            show: true
        },
        {
            icon: Phone,
            label: 'Phone',
            value: place.contactNumber,
            show: !!place.contactNumber,
            link: `tel:${place.contactNumber}`
        },
        {
            icon: Globe,
            label: 'Website',
            value: 'Visit Website',
            show: !!place.website,
            link: place.website
        },
        {
            icon: DollarSign,
            label: 'Price Range',
            value: place.priceRange,
            show: !!place.priceRange
        }
    ];

    return (
        <div className="space-y-6">
            {/* Description */}
            <Card>
                <CardHeader>
                    <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                        {place.description || 'No description available.'}
                    </p>
                </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {infoItems.filter(item => item.show).map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <item.icon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-600">{item.label}</p>
                                {item.link ? (
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {item.value}
                                    </a>
                                ) : (
                                    <p className="font-medium">{item.value}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <Button
                    className="flex-1"
                    variant="outline"
                    asChild
                >
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <MapPin className="h-4 w-4 mr-2" />
                        Directions
                    </a>
                </Button>
                {place.contactNumber && (
                    <Button
                        className="flex-1"
                        variant="outline"
                        asChild
                    >
                        <a href={`tel:${place.contactNumber}`}>
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                        </a>
                    </Button>
                )}
            </div>
        </div>
    );
}
