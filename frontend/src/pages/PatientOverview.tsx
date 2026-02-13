import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, User, Calendar, Activity, FileText,
    AlertCircle, TrendingUp, PenTool, Download, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { getPatientRecords, updatePatientNotes, updatePatientSignature, type Patient, type Record } from '../lib/api';
import SignatureCanvas from '../components/SignatureCanvas';
import { generatePDF } from '../lib/pdfGenerator';
import { generateClinicalRecommendations } from '../lib/clinicalLogic';

export default function PatientOverview() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

    // Notes state
    const [doctorNotes, setDoctorNotes] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('Dr. Sarah Chen');
    const [saving, setSaving] = useState(false);

    // Signature state
    const [showSignatureModal, setShowSignatureModal] = useState(false);

    const doctorList = ['Dr. Sarah Chen', 'Dr. Emily Ross', 'Dr. Michael Torres'];

    useEffect(() => {
        if (id) {
            fetchPatientData();
        }
    }, [id]);

    const fetchPatientData = async () => {
        try {
            setLoading(true);
            const data = await getPatientRecords(parseInt(id!));
            setPatient(data.patient);
            setRecords(data.records);
            setDoctorNotes(data.patient.doctor_notes || '');
            setSelectedDoctor(data.patient.doctor_name || 'Dr. Sarah Chen');
        } catch (error) {
            console.error('Failed to fetch patient data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!patient) return;

        try {
            setSaving(true);
            await updatePatientNotes(patient.id, doctorNotes, selectedDoctor);
            // Refresh patient data
            await fetchPatientData();
            alert('Notes saved successfully!');
        } catch (error) {
            console.error('Failed to save notes:', error);
            alert('Failed to save notes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSignature = async (signatureData: string) => {
        if (!patient) return;

        try {
            await updatePatientSignature(patient.id, signatureData);
            // Refresh patient data
            await fetchPatientData();
            setShowSignatureModal(false);
            alert('Signature saved successfully!');
        } catch (error) {
            console.error('Failed to save signature:', error);
            alert('Failed to save signature. Please try again.');
        }
    };

    const handleDownloadOverviewPDF = async () => {
        if (!patient || records.length === 0) {
            alert('No patient data available to generate PDF');
            return;
        }

        try {
            // Get latest record for assessment data
            const latestRecord = records[0];

            // Parse assessment data for PDF generation
            let assessmentData: any = {};
            try {
                assessmentData = JSON.parse(latestRecord.input_data);
            } catch (e) {
                console.error("Failed to parse record data", e);
            }

            const patientData: any = {
                name: patient.name,
                age: patient.age,
                sex: patient.sex,
                contact: patient.contact || '',
                cp: assessmentData.cp ?? 0,
                trestbps: assessmentData.trestbps ?? 0,
                chol: assessmentData.chol ?? 0,
                fbs: assessmentData.fbs ?? 0,
                restecg: assessmentData.restecg ?? 0,
                thalach: assessmentData.thalach ?? 0,
                exang: assessmentData.exang ?? 0,
                oldpeak: assessmentData.oldpeak ?? 0,
                slope: assessmentData.slope ?? 0,
                ca: assessmentData.ca ?? 0,
                thal: assessmentData.thal ?? 0,
                doctor_name: latestRecord.doctor_name
            };

            const resultData: any = {
                record_id: latestRecord.id,
                risk_level: latestRecord.risk_level,
                risk_score: latestRecord.risk_score,
                explanation: patient.system_notes || ''
            };

            // Generate PDF with notes and signature
            await generatePDF(
                resultData,
                patientData,
                patient.doctor_signature || ''
            );
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'High': return 'text-red-600 bg-red-50 border-red-200';
            case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'Low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading patient data...</p>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-20 bg-white dark:bg-slate-950 min-h-screen">
                <AlertCircle className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-800 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Patient Record Not Located</h3>
                <button
                    onClick={() => navigate('/doctor')}
                    className="mt-6 inline-flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl text-white font-bold transition-all"
                >
                    Return to Clinical Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 py-6 px-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/doctor')}
                    className="inline-flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-widest"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Hub
                </button>
            </div>

            {/* Patient Header Card */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-3xl border border-slate-200 dark:border-white/5 p-8 transition-all hover:border-slate-300 dark:hover:border-white/10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-center space-x-6">
                        <div className="h-20 w-20 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                            <User className="h-10 w-10 text-primary-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{patient.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400 font-medium">
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter">ID: #{patient.id}</span>
                                <span>•</span>
                                <span>{patient.age} YRS</span>
                                <span>•</span>
                                <span>{patient.sex === 1 ? 'MALE' : 'FEMALE'}</span>
                                {patient.contact && (
                                    <>
                                        <span>•</span>
                                        <span className="text-primary-400/80">{patient.contact}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={cn(
                        "px-6 py-4 rounded-2xl border backdrop-blur-md shadow-lg",
                        patient.risk_level === 'High' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                            patient.risk_level === 'Medium' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 opacity-60">Risk Profile</div>
                        <div className="text-2xl font-black">{patient.risk_level || 'UNKNOWN'}</div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-8 border-t border-white/5">
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Assessments</div>
                        <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white">{patient.assessment_count || 0}</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Diagnostic Sync</div>
                        <div className="text-2xl font-mono font-bold text-slate-700 dark:text-slate-200">
                            {new Date(patient.last_updated || patient.created_at).toLocaleDateString()}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Lead Physician</div>
                        <div className="text-xl font-bold text-primary-400">{patient.doctor_name || 'NOT ASSIGNED'}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/5">
                <nav className="-mb-px flex space-x-10">
                    {[
                        { id: 'overview', icon: Activity, label: 'CLINICAL OVERVIEW' },
                        { id: 'history', icon: Calendar, label: 'DIAGNOSTIC HISTORY' },
                        { id: 'notes', icon: FileText, label: 'PROFESSIONAL NOTES' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "whitespace-nowrap py-4 px-1 border-b-2 font-bold text-[11px] tracking-widest flex items-center transition-all duration-300",
                                activeTab === tab.id
                                    ? 'border-primary-500 text-primary-500'
                                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
                            )}
                        >
                            <tab.icon className="h-4 w-4 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-8">
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="overview-full-report"
                        className="space-y-6"
                    >
                        {/* Report Header (Glassmorphism) */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl gap-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-primary-600 p-3 rounded-2xl shadow-lg shadow-primary-600/20">
                                    <Activity className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">CardioAI <span className="text-primary-500">EXPERT</span></div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Professional Clinical Report</div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:items-end">
                                <button
                                    onClick={handleDownloadOverviewPDF}
                                    className="mb-4 inline-flex items-center px-6 py-3 bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold rounded-xl text-slate-900 dark:text-white transition-all active:scale-95 no-report-export"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    EXPORT AS PDF
                                </button>
                                <div className="flex flex-col items-end">
                                    <div className="text-[9px] font-black text-slate-600 tracking-widest uppercase">REPORT IDENTIFIER</div>
                                    <div className="text-lg font-mono text-slate-300 font-bold tracking-widest">#{patient.id.toString().padStart(8, '0')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* System Analysis (Primary Focus) */}
                            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/5 p-8">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <Shield className="h-6 w-6 text-primary-500" />
                                    NEURAL ANALYSIS SUMMARY
                                </h3>

                                <div className="space-y-8">
                                    <div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Diagnostic Logic</div>
                                        <div className="p-5 bg-black/30 rounded-2xl border border-white/5 text-sm italic text-slate-300 leading-relaxed font-medium">
                                            "{patient.system_notes || 'Patient demonstrates typical cardiovascular patterns for specified demographic. Professional review recommended.'}"
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-end mb-3">
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Model Confidence</div>
                                            <span className="text-lg font-mono font-black text-primary-400">
                                                {records[0]?.risk_score ? (records[0].risk_score * 100).toFixed(1) : 0}%
                                            </span>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-white/5 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${records[0]?.risk_score ? (records[0].risk_score * 100).toFixed(0) : 0}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="bg-primary-500 h-full rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Core Recommendations</div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {generateClinicalRecommendations({ risk_level: patient.risk_level, risk_score: records[0]?.risk_score || 0 } as any, records[0] ? JSON.parse(records[0].input_data) : {}).map((rec, i) => (
                                                <div key={i} className="flex items-center p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                    <Activity className="h-4 w-4 mr-3 text-primary-500" />
                                                    {rec}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Latest Clinical Parameters */}
                            {records.length > 0 && (
                                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/5 p-8">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                        <TrendingUp className="h-6 w-6 text-indigo-500" />
                                        LAST ASSESSMENT METRICS
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Sync Timestamp', value: new Date(records[0].created_at).toLocaleString(), font: 'font-sans' },
                                            { label: 'Risk Probability', value: `${(records[0].risk_score * 100).toFixed(1)}%`, font: 'font-mono' },
                                            { label: 'Profile Class', value: records[0].risk_level, font: 'font-black uppercase tracking-widest', color: getRiskColor(records[0].risk_level).split(' ')[0] },
                                            { label: 'Validator', value: records[0].doctor_name, font: 'font-bold' },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-white/5 last:border-0">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                                <span className={cn("text-sm text-slate-900 dark:text-white", item.font, item.color)}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Doctor Notes Display (Professional Card) */}
                        {patient.doctor_notes && (
                            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/5 p-8">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <FileText className="h-6 w-6 text-amber-500" />
                                    PHYSICIAN'S CLINICAL NOTES
                                </h3>
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed pb-6 border-b border-slate-100 dark:border-white/5">
                                    {patient.doctor_notes}
                                </div>
                                <div className="mt-4 flex justify-between items-center text-[10px] font-black tracking-widest text-slate-500">
                                    <span>AUTHORIZED BY {patient.doctor_name || 'REGISTERED PHYSICIAN'}</span>
                                    <span>UPDATED {new Date(patient.last_updated).toLocaleString().toUpperCase()}</span>
                                </div>
                            </div>
                        )}

                        {/* Signature Authentication */}
                        {patient.doctor_signature && (
                            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/5 p-8">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Digital Forensic Signature</h3>
                                <div className="inline-block p-6 bg-white rounded-2xl border border-white/10 shadow-inner">
                                    <img src={patient.doctor_signature} alt="Diagnostic Signature" className="h-16 object-contain" />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* diagnostic history & notes tabs omitted for brevity, assuming standard implementation or updated styles */}
                {activeTab === 'history' && (
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/5 p-8">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8">DIAGNOSTIC TIMELINE</h3>
                        <div className="space-y-6">
                            {records.map((record, index) => (
                                <div key={record.id} className="flex items-center p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-all">
                                    <div className={cn(
                                        "h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg mr-6",
                                        record.risk_level === 'High' ? "bg-red-500 text-white" : "bg-slate-800 text-slate-400"
                                    )}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
                                        <div>
                                            <div className="text-[9px] font-black text-slate-500 tracking-widest mb-1">RECORD</div>
                                            <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">#{record.id}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-black text-slate-500 tracking-widest mb-1">TIMESTAMP</div>
                                            <div className="text-xs font-bold text-slate-400">{new Date(record.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-black text-slate-500 tracking-widest mb-1">PROFILING</div>
                                            <div className={cn("text-xs font-black uppercase tracking-tighter", getRiskColor(record.risk_level).split(' ')[0])}>
                                                {record.risk_level} RISK
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] font-black text-slate-500 tracking-widest mb-1">PROBABILITY</div>
                                            <div className="text-sm font-mono font-black text-primary-400">{(record.risk_score * 100).toFixed(1)}%</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/5 p-8">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">PHYSICIAN CONSOLE</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Lead Investigator</label>
                                    <select
                                        value={selectedDoctor}
                                        onChange={(e) => setSelectedDoctor(e.target.value)}
                                        className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    >
                                        {doctorList.map((d) => <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Observations & Insights</label>
                                    <textarea
                                        value={doctorNotes}
                                        onChange={(e) => setDoctorNotes(e.target.value)}
                                        rows={8}
                                        className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-slate-700 dark:text-slate-300 font-medium outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="Enter clinical assessment..."
                                    />
                                </div>
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={saving}
                                    className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black tracking-widest transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {saving ? 'SYNCHRONIZING...' : 'COMMIT CLINICAL NOTES'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/5 p-8">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Neural Signature Index</h3>
                                <div className="p-6 bg-slate-100 dark:bg-black/40 rounded-3xl border border-slate-200 dark:border-white/5 min-h-[200px] flex items-center justify-center relative group">
                                    {patient.doctor_signature ? (
                                        <img src={patient.doctor_signature} alt="Doctor Signature" className="h-24 object-contain invert" />
                                    ) : (
                                        <div className="text-center">
                                            <PenTool className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                                            <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">No Physical Signature Matched</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setShowSignatureModal(true)}
                                        className="absolute inset-x-8 bottom-8 py-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black tracking-widest uppercase rounded-xl transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md"
                                    >
                                        Update Signature
                                    </button>
                                </div>
                            </div>

                            <div className="bg-primary-500/5 border border-primary-500/10 rounded-3xl p-8">
                                <Shield className="h-8 w-8 text-primary-500 mb-4" />
                                <h4 className="text-white font-black text-sm mb-2 uppercase tracking-widest">Verification Status</h4>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed"> All clinical notes and diagnostic signatures are cryptographically indexed to this patient record. Modifications are permanently logged in the secure audit trail.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Signature Modal */}
            {showSignatureModal && (
                <SignatureCanvas
                    onSave={handleSaveSignature}
                    onClose={() => setShowSignatureModal(false)}
                />
            )}
        </div>
    );
}
