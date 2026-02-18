import { useState, useEffect } from 'react';
import { Phone, MapPin, AlertCircle, Hospital, Shield, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';

const serviceIcons = {
    POLICE: Shield,
    HOSPITAL: Hospital,
    FIRE: Flame,
    AMBULANCE: AlertCircle,
};

const serviceColors = {
    POLICE: 'bg-blue-100 text-blue-800 border-blue-300',
    HOSPITAL: 'bg-red-100 text-red-800 border-red-300',
    FIRE: 'bg-orange-100 text-orange-800 border-orange-300',
    AMBULANCE: 'bg-green-100 text-green-800 border-green-300',
};

export default function EmergencyServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        fetchEmergencyServices();
    }, [selectedCity]);

    const fetchEmergencyServices = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = selectedCity ? { city: selectedCity } : {};
            const response = await axios.get(apiEndpoints.EMERGENCY_SERVICES, { params });

            setServices(response.data?.content || response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load emergency services');
            toast.error('Failed to load emergency services');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b">
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-4xl font-bold">Emergency Services</h1>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-32 w-full rounded-xl" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-red-600 text-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="h-10 w-10" />
                        <h1 className="text-4xl font-bold">Emergency Services</h1>
                    </div>
                    <p className="text-red-100">
                        Quick access to emergency contacts in your area
                    </p>
                </div>
            </div>

            {/* Emergency Banner */}
            <div className="bg-yellow-50 border-b border-yellow-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-yellow-900">In case of emergency</p>
                            <p className="text-sm text-yellow-800">
                                Call the appropriate emergency number immediately. These services are available 24/7.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                {error ? (
                    <div className="text-center py-16">
                        <AlertCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Failed to load services</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button onClick={fetchEmergencyServices}>Try Again</Button>
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-16">
                        <AlertCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">No services found</h2>
                        <p className="text-gray-600">
                            Emergency services information is not available for this location.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => {
                            const Icon = serviceIcons[service.type] || AlertCircle;
                            const colorClass = serviceColors[service.type] || 'bg-gray-100 text-gray-800';

                            return (
                                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader className={`${colorClass} border-b`}>
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-8 w-8" />
                                            <CardTitle>{service.name}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-3">
                                        {/* Phone */}
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-gray-600" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-600">Emergency Number</p>
                                                <a
                                                    href={`tel:${service.phoneNumber}`}
                                                    className="font-bold text-lg text-blue-600 hover:underline"
                                                >
                                                    {service.phoneNumber}
                                                </a>
                                            </div>
                                        </div>

                                        {/* Address */}
                                        {service.address && (
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-600">Location</p>
                                                    <p className="text-sm">{service.address}</p>
                                                    {service.city && (
                                                        <p className="text-sm text-gray-500">{service.city}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Description */}
                                        {service.description && (
                                            <p className="text-sm text-gray-600 pt-2 border-t">
                                                {service.description}
                                            </p>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                className="flex-1"
                                                variant="default"
                                                asChild
                                            >
                                                <a href={`tel:${service.phoneNumber}`}>
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    Call Now
                                                </a>
                                            </Button>
                                            {service.latitude && service.longitude && (
                                                <Button
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <a
                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <MapPin className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
