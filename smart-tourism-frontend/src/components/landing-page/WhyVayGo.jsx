import { Eye, Building2, CalendarCheck, Compass, BadgeCheck } from 'lucide-react';

const BENEFITS = [
    {
        icon: Eye,
        title: 'Discover Hidden Gems',
        desc: 'Go beyond the tourist trail. Find places locals love that rarely appear on mainstream travel apps.',
        color: 'text-teal-500',
    },
    {
        icon: Building2,
        title: 'Book Hotels Easily',
        desc: 'Compare verified hotels, check room types, and book your stay — all in one seamless flow.',
        color: 'text-indigo-500',
    },
    {
        icon: CalendarCheck,
        title: 'Attend Local Events',
        desc: 'Never miss a festival, concert, or cultural experience. Discover events happening near you right now.',
        color: 'text-amber-500',
    },
    {
        icon: Compass,
        title: 'Real-time Navigation',
        desc: 'Get precise directions from your current location to any place, hotel, or event in the app.',
        color: 'text-emerald-500',
    },
    {
        icon: BadgeCheck,
        title: 'Personalized Travel',
        desc: 'Save favorites, rate places, write reviews, and get recommendations tailored to your interests.',
        color: 'text-rose-400',
    },
];

export default function WhyVayGo() {
    return (
        <section className="py-24 px-4 bg-[#0f2d3d] relative overflow-hidden">
            {/* Background decor */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-teal-400 blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-400 blur-3xl" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-14">
                    <p className="text-teal-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">Why VayGo</p>
                    <h2
                        className="text-4xl sm:text-5xl font-black text-white leading-tight"
                        style={{ fontFamily: "'Inter Tight', sans-serif" }}
                    >
                        Travel Smarter,
                        <br />
                        <span className="text-teal-400">Not Harder</span>
                    </h2>
                    <p className="text-white/50 mt-4 max-w-xl mx-auto text-base">
                        VayGo combines everything a modern traveller needs into one beautifully designed platform.
                    </p>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BENEFITS.map(({ icon: Icon, title, desc, color }) => (
                        <div
                            key={title}
                            className="flex gap-4 p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors duration-200"
                        >
                            <div className={`${color} shrink-0 mt-0.5`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm mb-1.5">{title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats bar */}
                <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Places Listed', value: '500+' },
                        { label: 'Hotels Available', value: '80+' },
                        { label: 'Events Monthly', value: '200+' },
                        { label: 'Active Users', value: '1K+' },
                    ].map(({ label, value }) => (
                        <div key={label} className="text-center p-5 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-3xl font-black text-teal-400 mb-1" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                                {value}
                            </p>
                            <p className="text-white/50 text-xs">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
