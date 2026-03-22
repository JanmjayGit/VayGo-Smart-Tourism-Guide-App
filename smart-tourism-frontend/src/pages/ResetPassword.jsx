import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import apiEndpoints from '@/util/apiEndpoints';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') ?? '';

    const [fields, setFields] = useState({ password: '', confirm: '' });
    const [show, setShow] = useState({ password: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tokenMissing, setMissing] = useState(false);

    useEffect(() => {
        if (!token) setMissing(true);
    }, [token]);

    const set = (f, v) => { setFields((s) => ({ ...s, [f]: v })); setError(''); };
    const toggleShow = (f) => setShow((s) => ({ ...s, [f]: !s[f] }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!fields.password || fields.password.length < 8) {
            setError('Password must be at least 8 characters'); return;
        }
        if (fields.password !== fields.confirm) {
            setError('Passwords do not match'); return;
        }

        setLoading(true);
        try {
            await axios.post(apiEndpoints.RESET_PASSWORD, {
                token,
                newPassword: fields.password,
            });
            navigate('/login', { state: { message: 'Password reset successfully! Please sign in.' } });
        } catch (err) {
            setError(err.response?.data?.message ?? 'Reset link may have expired. Please request a new one.');
        } finally {
            setLoading(false);
        }
    };

    const PasswordInput = ({ field, label, placeholder }) => (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            <div className="relative">
                <Input
                    type={show[field] ? 'text' : 'password'}
                    value={fields[field]}
                    onChange={(e) => set(field, e.target.value)}
                    placeholder={placeholder}
                    className="pr-10 h-10"
                />
                <button
                    type="button"
                    onClick={() => toggleShow(field)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );

    if (tokenMissing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <Card className="max-w-md w-full text-center shadow-lg rounded-2xl border border-gray-100">
                    <CardContent className="pt-8 pb-6 space-y-3">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                        <p className="font-semibold text-gray-800">Invalid Reset Link</p>
                        <p className="text-sm text-gray-500">
                            This password reset link is invalid or has expired.
                        </p>
                        <Link
                            to="/forgot-password"
                            className="inline-block mt-2 text-sm text-teal-600 hover:underline font-medium"
                        >
                            Request a new link
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
            style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
            <div className="w-full max-w-md">
                <Card className="shadow-lg border border-gray-100 rounded-2xl">
                    <CardHeader className="text-center pb-2">
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
                            <Lock className="w-6 h-6 text-teal-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                        <CardDescription className="text-gray-500 text-sm">
                            Choose a strong new password for your account.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <PasswordInput field="password" label="New Password" placeholder="Min. 8 characters" />
                            <PasswordInput field="confirm" label="Confirm Password" placeholder="Repeat your password" />

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
                                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Resetting…</>
                                    : 'Reset Password'
                                }
                            </Button>

                            <p className="text-center text-sm text-gray-500">
                                Remembered it?{' '}
                                <Link to="/login" className="text-teal-600 hover:underline font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
