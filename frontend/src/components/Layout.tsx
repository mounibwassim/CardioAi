import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

interface LayoutProps {
    children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    // Direct Access: Portal UI is shown by default
    const isDoctor = true;

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
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
                                    <span className="text-2xl font-bold text-slate-900 tracking-tight">CardioAI</span>
                                    {isDoctor && <span className="block text-xs font-semibold text-primary-600 uppercase tracking-wider">Clinical Portal</span>}
                                </div>
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main Navigation">
                            <Link to="/" aria-current={isActive('/') ? 'page' : undefined} className={cn("text-sm font-medium transition-colors hover:text-primary-600", isActive('/') ? "text-primary-600" : "text-slate-600")}>Dashboard</Link>
                            <Link to="/patients" aria-current={isActive('/patients') ? 'page' : undefined} className={cn("text-sm font-medium transition-colors hover:text-primary-600", isActive('/patients') ? "text-primary-600" : "text-slate-600")}>Patients</Link>
                            <Link to="/predict" aria-current={isActive('/predict') ? 'page' : undefined} className={cn("text-sm font-medium transition-colors hover:text-primary-600", isActive('/predict') ? "text-primary-600" : "text-slate-600")}>New Assessment</Link>
                            <Link to="/settings" aria-current={isActive('/settings') ? 'page' : undefined} className={cn("text-sm font-medium transition-colors hover:text-primary-600", isActive('/settings') ? "text-primary-600" : "text-slate-600")}>Settings</Link>
                            <button
                                onClick={handleLogout}
                                aria-label="Reset application state"
                                className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                Reset UX
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-1 w-full">
                {children || <Outlet />}
            </main>
            <footer className="bg-white border-t border-slate-200 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-sm text-slate-500">
                        <p>
                            &copy; {new Date().getFullYear()} CardioAI. Professional Medical Intelligence System. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
