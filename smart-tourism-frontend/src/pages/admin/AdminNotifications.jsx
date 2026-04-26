import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send, Loader2, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import PageHeader from '@/components/admin/PageHeader';



const TYPES = [
    {
        value: 'EVENT_ALERT',
        label: 'Event Alert',
        icon: Info,
        color: 'text-blue-500',
    },
    {
        value: 'WEATHER_ALERT',
        label: 'Weather Alert',
        icon: AlertTriangle,
        color: 'text-amber-500',
    },
    {
        value: 'EMERGENCY_ALERT',
        label: 'Emergency',
        icon: AlertTriangle,
        color: 'text-red-500',
    },
    {
        value: 'RECOMMENDATION',
        label: 'Recommendation',
        icon: Zap,
        color: 'text-purple-500',
    },
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function AdminNotifications() {
    const [form, setForm] = useState({
        type: 'EVENT_ALERT',
        title: '',
        message: '',
        priority: 'MEDIUM',
    });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const handleSend = async () => {
        if (!form.title.trim() || !form.message.trim()) {
            toast.error('Title and message are required');
            return;
        }
        try {
            setSending(true);
            await axios.post(apiEndpoints.NOTIFICATION_BROADCAST, form, { headers });
            toast.success('Notification broadcast sent!');
            setSent(true);
            setTimeout(() => setSent(false), 3000);
            setForm({ type: 'EVENT_ALERT', title: '', message: '', priority: 'MEDIUM' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send notification');
        } finally {
            setSending(false);
        }
    };

    const selectedType = TYPES.find(t => t.value === form.type);

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            <PageHeader title="Broadcast Notifications" subtitle="Send notifications to all users" />

            <Card className="border border-gray-200 shadow-sm bg-white/70 backdrop-blur-xl">

                {/* Header */}
                <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                        <Bell className="w-5 h-5 text-teal-600" />
                        New Broadcast
                    </CardTitle>
                    <p className="text-xs text-gray-400 mt-1">
                        Send real-time notifications to all users
                    </p>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">

                    {/*  Type Selection  */}
                    <div>
                        <Label className="text-xs uppercase text-gray-400 mb-3 block">
                            Notification Type
                        </Label>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {TYPES.map((type) => {
                                const Icon = type.icon;
                                const isActive = form.type === type.value;

                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, type: type.value })}
                                        className={`
                group p-4 rounded-xl border text-center transition-all
                ${isActive
                                                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }
              `}
                                    >
                                        <Icon className={`w-5 h-5 mx-auto mb-2 ${type.color}`} />
                                        <span className="text-xs font-medium text-gray-700">
                                            {type.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/*  Priority   */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <Label className="text-xs uppercase text-gray-400">
                                Priority
                            </Label>

                            <Select
                                value={form.priority}
                                onValueChange={(v) => setForm({ ...form, priority: v })}
                            >
                                <SelectTrigger className="mt-1 h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORITIES.map((p) => (
                                        <SelectItem key={p} value={p}>
                                            {p}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Live indicator */}
                        <div className="flex items-end">
                            <div className="text-xs text-gray-400">
                                This notification will be sent instantly
                            </div>
                        </div>

                    </div>

                    {/* Title */}
                    <div>
                        <Label className="text-xs uppercase text-gray-400">
                            Title *
                        </Label>

                        <Input
                            className="mt-1 h-10"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Enter notification title"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <Label className="text-xs uppercase text-gray-400">
                            Message *
                        </Label>

                        <Textarea
                            className="mt-1 h-30 resize-none"
                            rows={4}
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            placeholder="Write a clear and concise message..."
                        />
                    </div>

                    {/* Preview */}
                    {form.title && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">
                                Live Preview
                            </p>

                            <div className="flex items-start gap-3">
                                {selectedType && (
                                    <selectedType.icon
                                        className={`w-5 h-5 mt-0.5 ${selectedType.color}`}
                                    />
                                )}

                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {form.title}
                                    </p>

                                    <p className="text-sm text-gray-600 mt-1">
                                        {form.message}
                                    </p>

                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] text-gray-400 uppercase">
                                            {selectedType?.label}
                                        </span>

                                        <span className="text-[10px] text-gray-300">•</span>

                                        <span className="text-[10px] text-gray-400 uppercase">
                                            {form.priority}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleSend}
                        disabled={sending}
                        className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                    >
                        {sending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : sent ? (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Sent Successfully
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Broadcast
                            </>
                        )}
                    </Button>

                </CardContent>
            </Card>
        </div>
    );
}