import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import * as api from '../lib/api';

export default function DoctorLogin() {
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await api.verifyPin(pin);
            // Store token as 'auth_token' to match existing dashboard logic
            localStorage.setItem('auth_token', data.access_token);
            localStorage.setItem('user_role', data.role);
            localStorage.setItem('doctor_name', data.name);
            navigate('/doctor/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid PIN. Access Denied.');
            setPin(''); // Clear PIN on error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="h-24 w-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-lg border border-slate-700">
                        <Lock className="h-10 w-10 text-primary-400" />
                    </div>
                    <img
                        src="/assets/images/logo.png"
                        alt="CardioAI"
                        className="h-12 w-auto mb-8 opacity-90"
                    />
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        Secure Access
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Enter your medical access PIN
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="pin" className="sr-only">PIN Code</label>
                            <input
                                id="pin"
                                name="pin"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-lg relative block w-full px-4 py-4 border border-slate-700 placeholder-slate-500 text-white bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-2xl tracking-[0.5em] font-mono"
                                placeholder="••••••••"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                maxLength={20}
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-900/50 border border-red-800 p-4 animate-shake">
                            <div className="flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                <span className="text-sm font-medium text-red-200">{error}</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || pin.length < 4}
                            className={`group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${isLoading || pin.length < 4
                                    ? 'bg-slate-700 cursor-not-allowed'
                                    : 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-900/20'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-primary-500 transition-all duration-200`}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : (
                                <span className="flex items-center text-lg">
                                    Unlock Dashboard
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </span>
                            )}
                        </button>
                    </div>
                </form>

                <p className="text-center text-xs text-slate-500 mt-8">
                    Authorized personnel only. All access is logged.
                </p>
            </div>
        </div>
    );
}
