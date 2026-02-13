import { useState } from "react";

interface Props {
    onSuccess: () => void;
}

export default function DoctorPassword({ onSuccess }: Props) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "admin123") {
            onSuccess(); // unlock dashboard or reset
        } else {
            setError("Incorrect password");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999]">
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 transform transition-all animate-in fade-in zoom-in duration-300"
            >
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Staff Access
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">
                        Clinical Dashboard strictly for authorized personnel
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <input
                            type="password"
                            autoFocus
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError("");
                            }}
                            placeholder="Enter Access Key"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        />
                        {error && (
                            <p className="text-red-500 text-xs font-medium mt-2 animate-in slide-in-from-top-1">
                                {error}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/20 active:scale-[0.98] transition-all"
                    >
                        Authenticate
                    </button>
                </div>
            </form>
        </div>
    );
}
