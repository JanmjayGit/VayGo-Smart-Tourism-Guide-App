import { Badge } from '@/components/ui/badge';

const categories = [
    { value: 'ALL', label: 'All Events' },
    { value: 'MUSIC', label: 'Music' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'CULTURAL', label: 'Cultural' },
    { value: 'FESTIVAL', label: 'Festival' },
    { value: 'EXHIBITION', label: 'Exhibition' },
    { value: 'CONFERENCE', label: 'Conference' },
];

export default function EventFilters({ selectedCategory, onCategoryChange }) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
                <Badge
                    key={category.value}
                    variant={selectedCategory === category.value ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap hover:bg-blue-100 transition-colors"
                    onClick={() => onCategoryChange(category.value)}
                >
                    {category.label}
                </Badge>
            ))}
        </div>
    );
}
