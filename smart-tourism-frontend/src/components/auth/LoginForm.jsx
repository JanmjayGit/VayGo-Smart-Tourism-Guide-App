import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card, CardHeader, CardTitle, CardDescription,
    CardContent, CardFooter,
} from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // The backend /api/auth/signin accepts { username, password }.
    // Spring Security's UserDetailsService checks both username and email,
    // so we just pass whatever the user typed as the "username" field.
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    // Success message from reset-password redirect
    const successMsg = location.state?.message ?? '';

    const validate = () => {
        const errs = {};
        if (!identifier.trim()) {
            errs.identifier = 'Username or email is required';
        }
        if (!password) {
            errs.password = 'Password is required';
        } else if (password.length < 6) {
            errs.password = 'Password must be at least 6 characters';
        }
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        // Pass identifier as the username field — backend handles email lookup internally
        const result = await login(identifier.trim(), password);
        setLoading(false);

        if (result.success) {
            const { user } = result;
            const isAdmin = user?.role === 'ROLE_ADMIN' || user?.roles?.includes('ROLE_ADMIN');
            navigate(isAdmin ? '/admin' : '/dashboard');
        } else {
            setApiError(result.message);
        }
    };

    const setField = (field, val) => {
        if (field === 'identifier') setIdentifier(val);
        else setPassword(val);
        setErrors((p) => ({ ...p, [field]: '' }));
        setApiError('');
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-100 rounded-2xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-3xl font-bold text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center text-gray-500">
                    Sign in to your VayGo account
                </CardDescription>
            </CardHeader>

            <CardContent className={"-mb-2"}>
                {/* Success banner */}
                {successMsg && (
                    <div className="mb-4 px-3 py-2.5 bg-teal-50 border border-teal-100 rounded-lg text-sm text-teal-700 font-medium">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username or Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="identifier">Username or Email</Label>
                        <Input
                            id="identifier"
                            name="identifier"
                            type="text"
                            placeholder="Enter your username or email"
                            value={identifier}
                            onChange={(e) => setField('identifier', e.target.value)}
                            className={errors.identifier ? 'border-red-400' : ''}
                            autoComplete="username"
                        />
                        {errors.identifier && (
                            <p className="text-xs text-red-500">{errors.identifier}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                to="/forgot-password"
                                className="text-xs text-teal-600 hover:underline font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPwd ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setField('password', e.target.value)}
                                className={errors.password ? 'border-red-400 pr-10' : 'pr-10'}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label={showPwd ? 'Hide password' : 'Show password'}
                            >
                                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500">{errors.password}</p>
                        )}
                    </div>

                    {/* API Error */}
                    {apiError && (
                        <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{apiError}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10"
                    >
                        {loading
                            ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Signing in…</>
                            : 'Sign In'
                        }
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t pt-4 mb-1 ">
                <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-teal-600 hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
