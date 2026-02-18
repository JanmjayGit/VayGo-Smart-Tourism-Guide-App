import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function PlacesHero({ searchQuery, onSearchChange }) {
    return (
        <section className="relative bg-gradient-to-br from-teal-50 via-white to-orange-50 py-16 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Hero Title */}
                <div className="text-center mb-8">
                    <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 leading-tight">
                        Discover Places
                    </h1>
                    <p className="font-outfit text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Explore curated destinations and create unforgettable memories
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search places, locations, or experiences..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-14 pr-6 py-7 text-base md:text-lg font-outfit rounded-full border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all shadow-lg hover:shadow-xl"
                    />
                </div>
            </div>
        </section>
    );
}
