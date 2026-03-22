import LoginForm from '@/components/auth/LoginForm';

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
            style={{ fontFamily: "'Inter Tight', sans-serif" }}>
            <div className="w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">VayGo</h1>
                    <p className="text-gray-500">Plan your next trip with confidence</p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
