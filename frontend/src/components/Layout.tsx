import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

interface LayoutProps {
    children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
            {/* Hidden Portal Entry Dot */}
            <div className="fixed bottom-4 right-4 z-[9999]">
                <button
                    onClick={() => navigate("/doctor")}
                    className="w-3 h-3 rounded-full bg-slate-700 hover:bg-primary-500 transition-all duration-300 opacity-20 hover:opacity-100"
                    aria-label="Doctor Portal"
                />
            </div>

            <nav className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
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

                        <div className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Main Navigation">
                            <Link to="/" className={cn("text-sm font-semibold transition-colors hover:text-primary-400", isActive('/') ? "text-primary-400" : "text-slate-400")}>Patient Hub</Link>
                            <Link to="/contact" className={cn("text-sm font-semibold transition-colors hover:text-primary-400", isActive('/contact') ? "text-primary-400" : "text-slate-400")}>Assistance</Link>
                            <Link to="/feedback" className={cn("text-sm font-semibold transition-colors hover:text-primary-400", isActive('/feedback') ? "text-primary-400" : "text-slate-400")}>Feedback</Link>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-1 w-full">
                {children || <Outlet />}
            </main>
            <footer className="bg-slate-950 border-t border-white/5 mt-auto">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-xs text-slate-500">
                        <p>
                            &copy; {new Date().getFullYear()} CardioAI. AI-Driven Diagnostic Engine. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
