import { Outlet, Link, useLocation } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
    children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link to="/doctor/dashboard" className="flex-shrink-0 flex items-center">
                                <HeartPulse className="h-8 w-8 text-primary-600" />
                                <span className="ml-2 text-xl font-bold text-slate-900 tracking-tight">CardioAI <span className="text-xs font-normal text-slate-500 uppercase ml-1">Doctor Portal</span></span>
                            </Link>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    to="/"
                                    className={cn(
                                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200",
                                        isActive('/') ? "border-primary-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                    )}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/contact"
                                    className={cn(
                                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200",
                                        isActive('/contact') ? "border-primary-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                    )}
                                >
                                    Contact
                                </Link>
                                <Link
                                    to="/reviews"
                                    className={cn(
                                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200",
                                        isActive('/reviews') ? "border-primary-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                    )}
                                >
                                    Reviews & FAQ
                                </Link>
                                <Link
                                    to="/feedback"
                                    className={cn(
                                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200",
                                        isActive('/feedback') ? "border-primary-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                    )}
                                >
                                    Feedback
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-1 w-full">
                {children || <Outlet />}
            </main>
            <footer className="bg-white border-t border-slate-200 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-slate-500">
                        &copy; {new Date().getFullYear()} CardioAI. Professional Medical Intelligence System.
                    </p>
                </div>
            </footer>
        </div>
    );
}
