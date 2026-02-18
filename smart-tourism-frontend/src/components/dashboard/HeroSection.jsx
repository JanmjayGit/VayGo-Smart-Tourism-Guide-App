import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function HeroSection() {
    return (
        <section className="bg-gray-100 rounded-2xl p-8 mb-6">
            <div className="max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                    Find your next place
                </h1>
                <p className="text-gray-600 text-lg mb-6">
                    Discover amazing destinations and create unforgettable memories
                </p>

                {/* Optional Search Bar */}
                <div className="relative max-w-2xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search for places, events, or experiences..."
                        className="pl-10 h-12 text-base"
                    />
                </div>
            </div>
        </section>
    );
}
