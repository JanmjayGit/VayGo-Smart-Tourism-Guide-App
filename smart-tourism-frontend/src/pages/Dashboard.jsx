import HeroSection from '@/components/dashboard/HeroSection';
import MapSection from '@/components/dashboard/MapSection';
import WeatherWidget from '@/components/dashboard/WeatherWidget';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import FavoritePlaces from '@/components/dashboard/FavoritePlaces';
import PlacesGrid from '@/components/dashboard/PlacesGrid';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}

            {/* Main Content */}
            <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <HeroSection />

                {/* Two Column Layout: Map + Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Map Section - Takes 2 columns on large screens */}
                    <div className="lg:col-span-2">
                        <MapSection />
                    </div>

                    {/* Right Sidebar - Takes 1 column */}
                    <div className="space-y-6">
                        <WeatherWidget />
                        <UpcomingEvents />
                        <FavoritePlaces />
                    </div>
                </div>

                {/* Popular Destinations Grid */}
                <PlacesGrid title="Popular Destinations" />
            </main>
        </div>
    );
}
