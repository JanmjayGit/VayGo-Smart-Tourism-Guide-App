function SunArc({ sunrise, sunset }) {
    const now = Date.now() / 1000;
    const total = sunrise && sunset ? (sunset + 86400 - sunrise) % 86400 : 1;
    const elapsed = sunrise ? Math.max(0, Math.min(1, (now - sunrise) / total)) : 0.4;
    const angle = elapsed * 180;
    const rad = (angle * Math.PI) / 180;
    const cx = 130, cy = 120, r = 90;
    const dotX = cx + r * Math.cos(Math.PI - rad);
    const dotY = cy - r * Math.sin(Math.PI - rad);

    const fmt = (epoch) => {
        if (!epoch) return '—';
        return new Date(epoch * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true,
        });
    };

    return (
        <div className="flex flex-col items-center">
            <svg width="260" height="130" viewBox="0 0 260 130">
                {/* Full dashed arc (background) */}
                <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                    fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 5"
                />
                {/* Filled progress arc (orange) */}
                <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${dotX} ${dotY}`}
                    fill="none" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round"
                />
                {/* Sun dot */}
                <circle cx={dotX} cy={dotY} r="7" fill="#FF8C00" />
                <circle cx={dotX} cy={dotY} r="3" fill="white" />
                {/* Baseline */}
                <line x1={cx - r - 10} y1={cy} x2={cx + r + 10} y2={cy} stroke="#94a3b8" strokeWidth="1.5" />
                {/* End dots */}
                <circle cx={cx - r} cy={cy} r="4" fill="#FF8C00" />
                <circle cx={cx + r} cy={cy} r="4" fill="#1B2A4A" />
            </svg>

            {/* Sunset / Sunrise labels */}
            <div className="flex justify-between w-full px-2 -mt-2 text-xs text-slate-600">
                <div className="text-right">
                    <p className="font-semibold text-slate-800">Sunrise</p>
                    <p>{fmt(sunrise)}</p>
                </div>
                <div>
                    <p className="font-semibold text-slate-800">Sunset</p>
                    <p>{fmt(sunset)}</p>
                </div>
            </div>
        </div>
    );
}

export default function SunArcCard({ sunrise, sunset }) {
    return (
        <div className="bg-slate-200 rounded-2xl p-5">
            <SunArc sunrise={sunrise} sunset={sunset} />
        </div>
    );
}
