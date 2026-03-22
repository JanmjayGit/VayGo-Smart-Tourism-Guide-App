import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Bell, Send, Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import PageHeader from '@/components/admin/PageHeader';

const TYPES = [
    { value: 'INFO', label: 'Information', icon: Info, color: 'text-blue-500' },
    { value: 'ALERT', label: 'Alert', icon: AlertTriangle, color: 'text-amber-500' },
    { value: 'EMERGENCY', label: 'Emergency', icon: AlertTriangle, color: 'text-red-500' },
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function AdminNotifications() {
    const [form, setForm] = useState({
        type: 'INFO',
        title: '',
        message: '',
        priority: 'MEDIUM',
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const handleSend = async () => {
        if (!form.title || !form.message) {
            toast.error('Title and message are required');
            return;
        }
        try {
            setSending(true);
            await axios.post(apiEndpoints.NOTIFICATION_BROADCAST, form, { headers });
            toast.success('Notification broadcast sent!');
            setSent(true);
            setTimeout(() => setSent(false), 3000);
            setForm({ type: 'INFO', title: '', message: '', priority: 'MEDIUM' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send notification');
        } finally {
            setSending(false);
        }
    };

    const selectedType = TYPES.find(t => t.value === form.type);

    return (
        <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <PageHeader title="Broadcast Notifications" subtitle="Send notifications to all users" />

            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="w-5 h-5 text-green-500" />
                        New Broadcast
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Type Selection */}
                    <div>
                        <Label className="mb-3 block">Notification Type</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {TYPES.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.value}
                                        onClick={() => setForm({ ...form, type: type.value })}
                                        className={`p-4 rounded-lg border-2 text-center transition-all cursor-pointer ${form.type === type.value
                                                ? 'border-slate-900 bg-slate-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 mx-auto mb-2 ${type.color}`} />
                                        <span className="text-sm font-medium">{type.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <Label>Priority</Label>
                        <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Title & Message */}
                    <div>
                        <Label>Title *</Label>
                        <Input
                            className="mt-1"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="Notification title..."
                        />
                    </div>
                    <div>
                        <Label>Message *</Label>
                        <Textarea
                            className="mt-1"
                            rows={4}
                            value={form.message}
                            onChange={e => setForm({ ...form, message: e.target.value })}
                            placeholder="Write your notification message..."
                        />
                    </div>

                    {/* Preview */}
                    {form.title && (
                        <div className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-200">
                            <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Preview</p>
                            <div className="flex items-start gap-3">
                                {selectedType && <selectedType.icon className={`w-5 h-5 mt-0.5 ${selectedType.color}`} />}
                                <div>
                                    <p className="font-semibold text-sm">{form.title}</p>
                                    <p className="text-sm text-slate-600 mt-1">{form.message}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Send Button */}
                    <Button
                        onClick={handleSend}
                        disabled={sending}
                        className="w-full bg-green-600 hover:bg-green-700 h-12"
                    >
                        {sending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                        ) : sent ? (
                            <><CheckCircle className="w-4 h-4 mr-2" /> Sent!</>
                        ) : (
                            <><Send className="w-4 h-4 mr-2" /> Send Broadcast</>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
