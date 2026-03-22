import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlacesHero({ searchQuery, onSearchChange }) {
    return (
        <section className="relative w-full h-[340px] md:h-[420px] flex items-center justify-center overflow-hidden">

            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/place_page_iamge.jpg"
                    alt="Explore places"
                    className="w-full h-full object-cover"
                />
                {/* dark gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{ background: 'rgba(0, 0, 0, 0.15)' }}
                />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-3xl mx-auto">
                <motion.p
                    initial={{ opacity: 0, x: -60, filter: "blur(8px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="text-4xl md:text-5xl text-white font-extrabold mb-1 drop-shadow"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Explore & Discover
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 60, scale: 0.85, filter: "blur(12px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl md:text-6xl text-white font-bold tracking-tight drop-shadow-xl mb-8"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Places
                </motion.h1>

                {/* Frosted Search Bar */}
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="flex items-center w-full h-14 rounded-full px-2 overflow-hidden shadow-2xl"
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(1px)',
                        border: '1px solid rgba(255,255,255,0.30)',
                    }}
                >
                    <Search className="w-5 h-5 ml-4 shrink-0 text-white/60" />
                    <input
                        type="text"
                        placeholder="Search places, locations, or experiences..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="flex-1 border-none outline-none px-4 text-sm font-medium h-full placeholder-white/60 text-white bg-transparent"
                    />
                </form>
            </div>
        </section>
    );
}
