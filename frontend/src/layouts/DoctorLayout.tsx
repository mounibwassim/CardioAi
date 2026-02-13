import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

export default function DoctorLayout() {
    const location = useLocation();
    const { doctorTheme, setDoctorTheme } = useTheme();
    const isActive = (path: string) => location.pathname === path;

    const toggleTheme = () => {
        setDoctorTheme(doctorTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className={cn("min-h-screen flex flex-col transition-colors duration-300", doctorTheme)}>
            <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                <header className="relative w-full bg-slate-900/80 backdrop-blur-md border-b border-white/5">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-20">
                            <div className="flex items-center">
                                <Link to="/doctor" className="flex-shrink-0 flex items-center group" aria-label="CardioAI Clinical">
                                    <img
                                        src="/assets/images/logo.png"
                                        alt=""
                                        aria-hidden="true"
                                        className="h-14 w-auto mr-3 transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div>
                                        <span className="text-2xl font-bold text-white tracking-tight">CardioAI</span>
                                        <span className="block text-[10px] font-bold text-primary-500 uppercase tracking-[0.2em] opacity-80">Clinical Dashboard</span>
                                    </div>
                                </Link>
                            </div>

                            <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Doctor Navigation">
                                <Link to="/doctor" className={cn("text-sm font-semibold transition-colors hover:text-primary-400", isActive('/doctor') ? "text-primary-400" : "text-slate-400")}>Dashboard</Link>
                                <Link to="/doctor/patients" className={cn("text-sm font-semibold transition-colors hover:text-primary-400", isActive('/doctor/patients') ? "text-primary-400" : "text-slate-400")}>Patients</Link>
                                <Link to="/doctor/new-assessment" className={cn("text-sm font-semibold transition-colors hover:text-primary-400", isActive('/doctor/new-assessment') ? "text-primary-400" : "text-slate-400")}>New Assessment</Link>
                                <Link to="/doctor/settings" className={cn("text-sm font-semibold transition-colors hover:text-primary-400", isActive('/doctor/settings') ? "text-primary-400" : "text-slate-400")}>Settings</Link>

                                <button
                                    onClick={toggleTheme}
                                    className="ml-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-95"
                                    aria-label={doctorTheme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                                >
                                    {doctorTheme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-300" />}
                                </button>
                            </nav>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-0">
                    <Outlet />
                </main>

                <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 mt-auto">
                    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-xs text-slate-500">
                            <p>
                                &copy; {new Date().getFullYear()} CardioAI. Clinical Intelligence Hub. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
