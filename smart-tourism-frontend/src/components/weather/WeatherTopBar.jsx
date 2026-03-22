import { Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function WeatherTopBar({ searchInput, setSearchInput, onSearch }) {
    const { user } = useAuth();

    return (
        <header className="flex items-center gap-4 px-4 py-4 bg-slate-100 backdrop-blur border-b border-slate-100 shrink-0">
            {/* Avatar + greeting */}
            <div className="flex items-center gap-3 min-w-[200px]">
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-orange-400 to-amber-300 flex items-center justify-center text-white/80 font-bold text-lg shrink-0">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                    <p className="text-md text-slate-600">Hello,</p>
                    <p className="text-lg font-bold text-slate-800 leading-tight">
                        {user?.username || 'Traveller'}
                    </p>
                </div>
            </div>

            {/* City search bar */}
            <form onSubmit={onSearch} className="flex-1 max-w-[500px] mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-400" />
                <input
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search any city..."
                    className="w-full h-14 pl-14 pr-5 rounded-full bg-slate-200 text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
                />
            </form>

            <NotificationBell />
        </header>
    );
}
