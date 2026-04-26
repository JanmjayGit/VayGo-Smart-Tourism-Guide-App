import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyState({ message, addRoute, label }) {
    const navigate = useNavigate();
    return (
        <div className="text-center py-10 space-y-3">
            <p className="text-3xl"></p>
            <p className="text-sm text-gray-500">{message}</p>
            <Button
                size="sm"
                onClick={() => navigate(addRoute)}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-1.5"
            >
                <Plus className="w-4 h-4" /> Add {label}
            </Button>
        </div>
    );
}