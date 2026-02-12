import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useState } from 'react';
import DoctorLoginModal from './DoctorLoginModal';

interface LayoutProps {
    children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const userRole = localStorage.getItem('user_role');
    const isDoctorAuth = userRole === 'doctor'; // Renamed for clarity
    const isDoctorSection = location.pathname.startsWith('/doctor'); // Check if looking at doctor pages

    const isDoctor = isDoctorAuth && isDoctorSection; // Only show doctor UI if auth AND in doctor section

    // Modal State
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('user_role');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_name');
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <DoctorLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />

            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <Link to={isDoctor ? "/doctor/dashboard" : "/"} className="flex-shrink-0 flex items-center group">
                                <img
                                    src="/assets/images/logo.png"
                                    alt="CardioAI Logo"
                                    className="h-14 w-auto mr-3 transition-transform duration-300 group-hover:scale-105"
                                />
                                <div>
                                    <span className="text-2xl font-bold text-slate-900 tracking-tight">CardioAI</span>
                                    {isDoctor && <span className="block text-xs font-semibold text-primary-600 uppercase tracking-wider">Doctor Portal</span>}
                                </div>
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            {!isDoctor ? (
                                <>
                                    <Link to="/" className={cn("text-sm font-medium transition-colors hover:text-primary-600", isActive('/') ? "text-primary-600" : "text-slate-600")}>Home</Link>
                                    <a href="/#services" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">Services</a>
                                    <Link to="/reviews" className={cn("text-sm font-medium transition-colors hover:text-primary-600", isActive('/reviews') ? "text-primary-600" : "text-slate-600")}>Reviews</Link>
                                    <Link to="/contact" className={cn("text-sm font-medium transition-colors hover:text-primary-600", isActive('/contact') ? "text-primary-600" : "text-slate-600")}>Contact</Link>

                                    <Link
                                        to="/feedback"
                                        className={cn(
                                            "inline-flex items-center px-4 py-2 border border-primary-200 rounded-full text-sm font-medium transition-all hover:bg-primary-50 hover:border-primary-300",
                                            isActive('/feedback') ? "text-primary-700 bg-primary-50 border-primary-300" : "text-primary-600"
                                        )}
                                    >
                                        Share Feedback
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/doctor/dashboard" className={cn("text-sm font-medium transition-colors hover:text-primary-600", isActive('/doctor/dashboard') ? "text-primary-600" : "text-slate-600")}>Dashboard</Link>
                                    <Link to="/doctor/patients" className={cn("text-sm font-medium transition-colors hover:text-primary-600", isActive('/doctor/patients') ? "text-primary-600" : "text-slate-600")}>Patients</Link>
                                    <Link to="/doctor/predict" className={cn("text-sm font-medium transition-colors hover:text-primary-600", isActive('/doctor/predict') ? "text-primary-600" : "text-slate-600")}>New Assessment</Link>
                                    <Link to="/doctor/settings" className={cn("text-sm font-medium transition-colors hover:text-primary-600", isActive('/doctor/settings') ? "text-primary-600" : "text-slate-600")}>Settings</Link>
                                    <button
                                        onClick={handleLogout}
                                        className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
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
                        {!isDoctor && (
                            <button
                                onClick={() => setIsLoginModalOpen(true)}
                                className="text-xs text-slate-300 hover:text-slate-500 transition-colors ml-4 cursor-pointer focus:outline-none"
                            >
                                Doctor Access
                            </button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}
