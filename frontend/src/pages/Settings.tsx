import { useState } from 'react';
import { Shield, AlertTriangle, Trash2, Key, Info } from 'lucide-react';
import { resetSystem } from '../lib/api';

export default function Settings() {
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Mock admin password for now - in production this would be checked on the backend
    const ADMIN_PASSWORD = 'admin';

    const handleReset = async () => {
        setError('');
        setSuccess('');

        if (confirmPassword !== ADMIN_PASSWORD) {
            setError('Incorrect admin password. Action denied.');
            return;
        }

        if (!confirm('CRITICAL WARNING: This action is PERMANENT and will delete all patient records, assessment history, and doctor notes. Proceed with system reset?')) {
            return;
        }

        setLoading(true);
        try {
            await resetSystem();
            setSuccess('System has been successfully reset. All records have been cleared.');
            setConfirmPassword('');
        } catch (err) {
            setError('Failed to reset system. Please check your connection or contact administrator.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
                <p className="text-slate-500">Manage hospital configuration and system security</p>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center">
                    <Shield className="h-5 w-5 text-primary-600 mr-2" />
                    <h2 className="text-lg font-semibold text-slate-900">System Administration</h2>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg border border-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-bold text-red-900 uppercase tracking-tight">Danger Zone</h3>
                            <p className="text-sm text-red-700 mt-1">
                                The "Reset System" action will permanently delete all patient data and assessment history from the database.
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="max-w-md">
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                                <Key className="h-4 w-4 mr-1" />
                                Admin Confirmation Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter admin password to confirm"
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-full">
                    <Info className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">Hospital Node: CARDIO-AI-CNL-01</h3>
                    <p className="text-xs text-slate-500">System Version 2.4.0 (Professional Edition)</p>
                </div>
            </div>
        </div>
    );
}
