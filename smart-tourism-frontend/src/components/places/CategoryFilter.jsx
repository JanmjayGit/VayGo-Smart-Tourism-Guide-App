import { Landmark, Trees, Church, Mountain, Palette, Waves } from 'lucide-react';

const categories = [
    { id: null, name: 'All Places', icon: null },
    { id: 'HISTORICAL', name: 'Historical', icon: Landmark },
    { id: 'NATURAL', name: 'Natural', icon: Trees },
    { id: 'RELIGIOUS', name: 'Religious', icon: Church },
    { id: 'ADVENTURE', name: 'Adventure', icon: Mountain },
    { id: 'CULTURAL', name: 'Cultural', icon: Palette },
    { id: 'BEACH', name: 'Beach', icon: Waves },
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
                                {category.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
