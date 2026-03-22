import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Construction } from 'lucide-react';
import PageHeader from '@/components/admin/PageHeader';

export default function AdminUsers() {
    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <PageHeader title="User Management" subtitle="View and manage platform users" />

            <Card className="border-0 shadow-sm">
                <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Construction className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Coming Soon</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
                        User management requires a backend endpoint (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">/api/admin/users</code>) that is not yet implemented.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" /> Backend dependency
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
