import { useState } from 'react';
import DoctorLoginModal from '../components/DoctorLoginModal';
import HealthTechBackground from '../components/HealthTechBackground';
import { Activity } from 'lucide-react';

export default function DoctorLoginPage() {
    const [isModalOpen, setIsModalOpen] = useState(true);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <HealthTechBackground />

            <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center space-x-3 mb-8">
                    <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                        <Activity className="h-10 w-10 text-primary-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">CardioAI</h1>
                        <p className="text-primary-500 font-bold uppercase tracking-[0.2em] text-[10px]">Clinical Intelligence</p>
                    </div>
                </div>

                <div className="text-center mb-12 max-w-md">
                    <h2 className="text-xl font-bold text-white mb-2">Restricted Clinical Access</h2>
                    <p className="text-slate-400 text-sm">Please provide clinical credentials to access the physician dashboard.</p>
                </div>

                {!isModalOpen && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-95"
                    >
                        Re-open Login Gate
                    </button>
                )}
            </div>

            <DoctorLoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <div className="fixed bottom-8 text-center opacity-30">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">
                    Medical Data Protection • HIPAA Compliant Engine • v4.0.0
                </p>
            </div>
        </div>
    );
}
