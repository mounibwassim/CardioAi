import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { loginDoctor } from '../lib/api';

interface DoctorLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DoctorLoginModal({ isOpen, onClose }: DoctorLoginModalProps) {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Defaulting to 'admin' as a single-password system was requested
            const data = await loginDoctor('admin', password);

            // Store auth data
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_role', data.role);
            localStorage.setItem('user_name', data.name);

            // Redirect
            navigate('/doctor/dashboard');
            onClose();
        } catch (err: any) {
            console.error("Login failed", err);
            if (err.response && err.response.status === 429) {
                setError("Too many attempts. Try again later.");
            } else {
                setError("Incorrect password");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100">
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-center">
                    <div className="mx-auto bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-3 backdrop-blur-md border border-white/30">
                        <Lock className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-white text-lg font-semibold tracking-wide">Doctor Access</h2>
                    <p className="text-blue-100 text-xs mt-1">Authorized personnel only</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter secure password"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="flex items-center text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-pulse">
                                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !password}
                                className="flex-1 px-4 py-2.5 text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg hover:from-cyan-700 hover:to-blue-700 font-medium shadow-md shadow-blue-500/20 transition-all flex items-center justify-center text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Security Note */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        System Secured via 256-bit Encryption
                    </p>
                </div>
            </div>
        </div>
    );
}
