import { Building2, Landmark, Church, Trees, Waves, Utensils, Bike, Coffee, Mountain, Ticket } from 'lucide-react';

const categories = [
    { id: null, label: 'All Places', icon: null },
    { id: 'ATTRACTION', label: 'Attractions', icon: Ticket },
    { id: 'HISTORICAL_SITE', label: 'Historical', icon: Landmark },
    { id: 'RELIGIOUS_SITE', label: 'Religious', icon: Church },
    { id: 'PARK', label: 'Parks', icon: Trees },
    { id: 'BEACH', label: 'Beach', icon: Waves },
    { id: 'MOUNTAIN', label: 'Mountains', icon: Mountain },
    { id: 'TREK', label: 'Trekking', icon: Mountain },
    { id: 'MUSEUM', label: 'Museums', icon: Ticket },
    { id: 'ADVENTURE_ACTIVITY', label: 'Adventure', icon: Bike },
    { id: 'RESTAURANT', label: 'Restaurants', icon: Utensils },
    { id: 'CAFE', label: 'Cafes', icon: Coffee },
];

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
    return (
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        const isActive = activeCategory === category.id;

                        return (
                            <button
                                key={category.id || 'all'}
                                onClick={() => onCategoryChange(category.id)}
                                className={`
                                    flex items-center gap-2 px-6 py-3 rounded-full font-outfit font-medium
                                    whitespace-nowrap transition-all duration-300 transform
                                    ${isActive
                                        ? 'bg-teal-600 text-white shadow-lg scale-105 hover:bg-teal-700'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-teal-300'
                                    }
                                `}
                            >
                                {Icon && <Icon className="w-4 h-4" />}
                                {category.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
