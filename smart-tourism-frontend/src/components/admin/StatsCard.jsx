import { Card, CardContent } from '@/components/ui/card';

export default function StatsCard({ icon: Icon, label, value, color = 'text-slate-900', bgColor = 'bg-slate-100', loading = false }) {
    if (loading) {
        return (
            <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                    <div className="animate-pulse flex items-start justify-between">
                        <div className="space-y-3">
                            <div className="h-3 w-20 bg-slate-200 rounded" />
                            <div className="h-8 w-16 bg-slate-200 rounded" />
                        </div>
                        <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
                        <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
