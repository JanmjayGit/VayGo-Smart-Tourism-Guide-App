import { useState } from 'react';
import { Thermometer, Droplets, Wind } from 'lucide-react';
import { conditionEmoji } from '@/hooks/useWeather';


function TempWave({ hourly, metric }) {
    if (!hourly.length) {
        return <div className="h-40 animate-pulse bg-slate-100 rounded-xl" />;
    }

    // Pick values based on active metric
    const values = hourly.map(h => {
        if (metric === 'humidity') return h.humidity ?? 0;
        if (metric === 'windSpeed') return h.windSpeed ?? 0;
        return h.temp;
    });

    const unit = metric === 'humidity' ? '%' : metric === 'windSpeed' ? 'm/s' : '°';

    const min = Math.min(...values) - 4;
    const max = Math.max(...values) + 4;
    const range = max - min || 1;

    const W = 340, H = 100;
    const xs = hourly.map((_, i) => 30 + (i / (hourly.length - 1)) * (W - 60));
    const ys = values.map(v => H - ((v - min) / range) * (H - 20));

    // Smooth C-bezier path
    let d = `M ${xs[0]} ${ys[0]}`;
    for (let i = 0; i < xs.length - 1; i++) {
        const mx = (xs[i] + xs[i + 1]) / 2;
        d += ` C ${mx} ${ys[i]}, ${mx} ${ys[i + 1]}, ${xs[i + 1]} ${ys[i + 1]}`;
    }

    return (
        <svg width="100%" viewBox={`0 0 ${W} ${H + 30}`} className="overflow-visible">
            <defs>
                <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF8C00" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#FF8C00" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Gradient fill */}
            <path
                d={`${d} L ${xs[xs.length - 1]} ${H + 10} L ${xs[0]} ${H + 10} Z`}
                fill="url(#waveGrad)"
            />
            {/* Curve */}
            <path d={d} fill="none" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round" />

            {xs.map((x, i) => (
                <g key={i}>
                    {/* Condition emoji above the peak */}
                    <text x={x} y={ys[i] - 14} textAnchor="middle" fontSize="16">
                        {conditionEmoji(hourly[i].condition)}
                    </text>
                    {/* Orange dot marker */}
                    <circle cx={x} cy={ys[i]} r="5" fill="#FF8C00" />
                    <circle cx={x} cy={ys[i]} r="2.5" fill="white" />
                    {/* Metric value label */}
                    <text x={x} y={H + 20} textAnchor="middle" fontSize="12" fontWeight="700" fill="#1B2A4A">
                        {values[i]}{unit}
                    </text>
                    {/* Time label */}
                    <text x={x} y={H + 30} textAnchor="middle" fontSize="10" fill="#94a3b8">
                        {hourly[i].label}
                    </text>
                </g>
            ))}
        </svg>
    );
}

export default function TemperatureTimeline({ hourly }) {
    const [metric, setMetric] = useState('temp');

    const toggles = [
        {
            id: 'temp',
            icon: <Thermometer className="w-4 h-4" />,
            title: 'Temperature',
        },
        {
            id: 'humidity',
            icon: <Droplets className="w-4 h-4" />,
            title: 'Humidity',
        },
        {
            id: 'windSpeed',
            icon: <Wind className="w-4 h-4" />,
            title: 'Wind Speed',
        },
    ];

    const label = toggles.find(t => t.id === metric)?.title ?? 'Temperature';

    return (
        <div className="bg-white rounded-3xl shadow-lg p-5 hover:shadow-xl transition-all duration-300">
            {/* Header + metric toggles */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 leading-tight">
                        How's the<br />{label.toLowerCase()} today?
                    </h2>
                </div>
                <div className="flex gap-2">
                    {toggles.map(btn => (
                        <button
                            key={btn.id}
                            title={btn.title}
                            onClick={() => setMetric(btn.id)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${metric === btn.id
                                ? 'bg-[#FF8C00] text-white shadow-md'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                        >
                            {btn.icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* Wave chart */}
            <TempWave hourly={hourly} metric={metric} />
        </div>
    );
}
