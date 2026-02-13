import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

export default function PatientLayout() {
    const location = useLocation();
    const { patientTheme, setPatientTheme } = useTheme();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className={cn("min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 uppercase-none", patientTheme)}>
            <header className="relative w-full bg-slate-900/80 backdrop-blur-md border-b border-white/5 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center group" aria-label="CardioAI Home">
                                <img
                                    src="/assets/images/logo.png"
                                    alt=""
                                    aria-hidden="true"
                                    className="h-14 w-auto mr-3 transition-transform duration-300 group-hover:scale-105"
                                />
                                <div>
                                    <span className="text-2xl font-bold text-white tracking-tight">CardioAI</span>
                                    <span className="block text-[10px] font-bold text-primary-500 uppercase tracking-[0.2em] opacity-80">Health Intelligence</span>
                                </div>
                            </Link>
                        </div>

                        <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Patient Navigation">
                            <Link to="/" className={cn("text-sm font-semibold transition-colors hover:text-primary-400", isActive('/') ? "text-primary-400" : "text-slate-400")}>Patient Hub</Link>
                            <Link to="/faq" className={cn("text-sm font-semibold transition-colors hover:text-primary-400", isActive('/faq') ? "text-primary-400" : "text-slate-400")}>FAQ</Link>
                            <Link to="/contact" className={cn("text-sm font-semibold transition-colors hover:text-primary-400", isActive('/contact') ? "text-primary-400" : "text-slate-400")}>Support Center</Link>
                            <Link to="/feedback" className={cn("text-sm font-semibold transition-colors hover:text-primary-400", isActive('/feedback') ? "text-primary-400" : "text-slate-400")}>Feedback</Link>

                            <button
                                onClick={() => setPatientTheme(patientTheme === 'dark' ? 'light' : 'dark')}
                                className="ml-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-95"
                                aria-label={patientTheme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                {patientTheme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-300" />}
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-0 relative">
                <Outlet />
            </main>

            <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                        <p>&copy; {new Date().getFullYear()} CardioAI. AI-Driven Cardiovascular Risk Assessment.</p>
                        <div className="flex space-x-6">
                            <Link to="/faq" className="hover:text-primary-500 transition-colors">Privacy Policy</Link>
                            <Link to="/faq" className="hover:text-primary-500 transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
