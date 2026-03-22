import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) { setError('Please enter your email address'); return; }
        const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRx.test(email.trim())) { setError('Please enter a valid email address'); return; }

        setLoading(true);
        try {
            await axios.post(apiEndpoints.FORGOT_PASSWORD, { email: email.trim() });
            setSuccess(true);
        } catch (err) {
            const status = err.response?.status;
            if (status === 404 || status === 405) {
                // Backend endpoint not yet implemented
                setError(
                    'Password reset is not available yet. Please contact support at support@vaygo.in to reset your password.'
                );
            } else {
                setError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
            style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
            <div className="w-full max-w-md">
                {/* Back to login */}
                <Link
                    to="/login"
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>

                <Card className="shadow-lg border border-gray-100 rounded-2xl">
                    <CardHeader className="text-center pb-2">
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
                            <Mail className="w-6 h-6 text-teal-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
                        <CardDescription className="text-gray-500 text-sm">
                            Enter your registered email and we'll send you a reset link.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4">
                        {success ? (
                            /* ── Success state ───────────────────────── */
                            <div className="text-center py-4 space-y-3">
                                <CheckCircle className="w-12 h-12 text-teal-500 mx-auto" />
                                <p className="font-semibold text-gray-800">Check your inbox!</p>
                                <p className="text-sm text-gray-500">
                                    We've sent a password reset link to{' '}
                                    <span className="font-medium text-gray-700">{email}</span>.
                                    It may take a few minutes to arrive.
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-block mt-2 text-sm text-teal-600 hover:underline font-medium"
                                >
                                    Return to Login
                                </Link>
                            </div>
                        ) : (
                            /* ── Form ─────────────────────────────────── */
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="fp-email">Email Address</Label>
                                    <Input
                                        id="fp-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        autoComplete="email"
                                        className="h-10"
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                        {error}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10"
                                >
                                    {loading
                                        ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending…</>
                                        : 'Send Reset Link'
                                    }
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
