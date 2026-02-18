import RegisterForm from '@/components/auth/RegisterForm';

export default function Register() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
            <div className="w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        TravelBuddy
                    </h1>
                    <p className="text-gray-600">Start your journey today</p>
                </div>
                <RegisterForm />
            </div>
        </div>
    );
}
