import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function DoctorNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <ShieldAlert className="h-16 w-16 text-primary-500/20 mb-6" />
            <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">404 - CLINICAL OUTLIER</h1>
            <p className="text-slate-400 max-w-md mb-8">
                The clinical record or administrative module you requested is not indexed in the Doctor Hub.
            </p>
            <Link
                to="/doctor"
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-white font-bold transition-all"
            >
                Return to Patients List
            </Link>
        </div>
    );
}
