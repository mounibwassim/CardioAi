import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Trash2, Key, Info, Moon, LogOut } from 'lucide-react';
import { resetSystem } from '../lib/api';

export default function Settings() {
    const navigate = useNavigate();
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

    // Handle Theme Toggle
    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // Handle Logout
    const handleLogout = () => {
        if (confirm('Are you sure you want to sign out?')) {
            localStorage.clear();
            navigate('/');
        }
    };


    const handleReset = async () => {
        setError('');
        setSuccess('');

        if (!confirmPassword) {
            setError('Please enter the admin password to confirm.');
            return;
        }

        if (!confirm('CRITICAL WARNING: This action is PERMANENT and will delete all patient records, assessment history, and doctor notes. Proceed with system reset?')) {
            return;
        }

        setLoading(true);
        try {
            await resetSystem(confirmPassword);
            setSuccess('System has been successfully reset. All records have been cleared.');
            setConfirmPassword('');
        } catch (err) {
            setError('Failed to reset system. Please check your connection or contact administrator.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage hospital configuration and system security</p>
            </div>

            {/* General Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center">
                        <Moon className="h-5 w-5 text-indigo-600 mr-2" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Appearance & Session</h2>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</h3>
                            <p className="text-xs text-slate-500 mt-1">Switch between light and dark clinical themes</p>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout of System
                        </button>
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center">
                    <Shield className="h-5 w-5 text-primary-600 mr-2" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">System Administration</h2>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-start space-x-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-bold text-red-900 dark:text-red-400 uppercase tracking-tight">Danger Zone</h3>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                The "Reset System" action will permanently delete all patient data and assessment history.
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="max-w-md">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                                <Key className="h-4 w-4 mr-1" />
                                Admin Confirmation Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter admin password to confirm"
                                className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="text-sm font-medium text-red-600 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="text-sm font-medium text-green-600 flex items-center">
                                <Info className="h-4 w-4 mr-1" />
                                {success}
                            </div>
                        )}

                        <button
                            onClick={handleReset}
                            disabled={loading || !confirmPassword}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {loading ? 'Processing Reset...' : 'Reset Entire System'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center space-x-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Hospital Node: CARDIO-AI-CNL-01</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">System Version 3.0.0 (Production Edition)</p>
                </div>
            </div>
        </div>
    );
}
