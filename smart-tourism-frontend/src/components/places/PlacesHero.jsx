import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const CATEGORIES = [
    { id: null, label: 'All Places' },
    { id: 'ATTRACTION', label: 'Attractions' },
    { id: 'HISTORICAL_SITE', label: 'Historical' },
    { id: 'TEMPLE', label: 'Religious' },
    { id: 'PARK', label: 'Parks' },
    { id: 'BEACH', label: 'Beach' },
    { id: 'MOUNTAIN', label: 'Mountains' },
    { id: 'TREK', label: 'Trekking' },
    { id: 'MUSEUM', label: 'Museums' },
    { id: 'ADVENTURE_ACTIVITY', label: 'Adventure' },
    { id: 'RESTAURANT', label: 'Restaurants' },
    { id: 'CAFE', label: 'Cafes' },
    { id: 'STREET_FOOD', label: 'Street Food' },
    { id: 'SHOPPING_MALL', label: 'Shopping' },
    { id: 'OTHER', label: 'Other' },
];

export default function PlacesHero({
    searchQuery,
    onSearchChange,
    activeCategory,
    onCategoryChange,
}) {
    const [isOpen, setIsOpen] = useState(false);

    const activeLabel =
        CATEGORIES.find(c => c.id === activeCategory)?.label ?? 'All Places';

    useEffect(() => {
        const handler = (e) => {
            const target = e.target;

            if (
                target.closest('.category-trigger') ||
                target.closest('.category-modal')
            ) {
                return;
            }

            setIsOpen(false);
        };

        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <section className="relative w-full h-[340px] md:h-[420px] flex items-center justify-center overflow-hidden">

            {/* Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/place_page_iamge.jpg"
                    alt="Explore places"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-3xl mx-auto">

                <motion.p
                    initial={{ opacity: 0, x: -60, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="text-4xl md:text-5xl text-white font-extrabold mb-1 drop-shadow"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Explore & Discover
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 60, scale: 0.85, filter: 'blur(12px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl md:text-6xl text-white font-bold tracking-tight drop-shadow-xl mb-8"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Places
                </motion.h1>

                {/* Search Bar */}
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="flex items-center w-full h-14 rounded-full overflow-visible shadow-2xl"
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(1px)',
                        border: '1px solid rgba(255,255,255,0.30)',
                    }}
                >
                    <Search className="w-5 h-5 ml-4 text-white/70" />

                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search places..."
                        className="flex-1 px-4 bg-transparent text-white placeholder-white/60 outline-none"
                    />

                    <div className="w-px h-6 bg-white/30" />


                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(prev => !prev);
                        }}
                        className="category-trigger flex items-center gap-2 px-4 h-full text-white"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="truncate max-w-[100px]">
                            {activeLabel}
                        </span>
                        <ChevronDown
                            className={`w-4 h-4 transition ${isOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </button>
                </form>
            </div>

            {/* category picker */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="category-modal fixed left-1/2 top-[200px] -translate-x-1/2 w-[90%] max-w-2xl z-[9999]"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 10 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="rounded-2xl bg-black/40 shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="p-4 border-b flex justify-between">
                                <p className="font-semibold text-gray-700">
                                    Select Category
                                </p>
                                <button onClick={() => setIsOpen(false)}>
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>

                            {/* Categories */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 max-h-[300px] overflow-y-auto">
                                {CATEGORIES.map((cat) => {
                                    const isActive = activeCategory === cat.id;

                                    return (
                                        <button
                                            key={cat.id ?? 'all'}
                                            onClick={() => {
                                                onCategoryChange(cat.id);
                                                setIsOpen(false);
                                            }}
                                            className={`
                                                px-4 py-3 rounded-xl text-sm font-medium transition
                                                ${isActive
                                                    ? 'bg-teal-600 text-white'
                                                    : 'bg-black/40 text-white border border-teal-500 hover:bg-black/60'
                                                }
                                            `}
                                        >
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}