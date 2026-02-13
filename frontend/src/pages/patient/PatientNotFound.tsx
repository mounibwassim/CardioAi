import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function PatientNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <AlertCircle className="h-16 w-16 text-slate-700 mb-6" />
            <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">404 - LOST IN TRANSIT</h1>
            <p className="text-slate-400 max-w-md mb-8">
                The cardiovascular pathway you are looking for does not exist in our public portal.
            </p>
            <Link
                to="/"
                className="px-8 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl text-white font-bold transition-all"
            >
                Return to Patient Hub
            </Link>
        </div>
    );
}
