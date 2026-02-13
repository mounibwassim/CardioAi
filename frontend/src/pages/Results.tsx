import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, RefreshCw, Download, XCircle, Calendar, User } from 'lucide-react';
import { type PredictionResult, type PatientData } from '../lib/api';
import { generatePDF } from '../lib/pdfGenerator';
import { useState } from 'react';
import { safeToFixed } from '../lib/utils';
import { getCleanExplanation, generateClinicalRecommendations } from '../lib/clinicalLogic';

export default function Results() {
    const location = useLocation();
    const state = location.state as { result: PredictionResult; data: PatientData; doctorName?: string } | null;

    const [isDownloading, setIsDownloading] = useState(false);

    if (!state) {
        return <Navigate to="/predict" />;
    }

    const { result, data } = state;
    const assessmentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Determine risk styling and icon for the header
    let riskColor = "bg-slate-700"; // Default
    let RiskIcon = Activity; // Default icon

    if (result.risk_level === "Low") {
        riskColor = "bg-green-600";
        RiskIcon = CheckCircle;
    } else if (result.risk_level === "Medium") {
        riskColor = "bg-yellow-600";
        RiskIcon = AlertTriangle;
    } else if (result.risk_level === "High") {
        riskColor = "bg-red-600";
        RiskIcon = XCircle;
    }

    const handlePrint = async () => {
        try {
            setIsDownloading(true);
            console.log('Starting PDF generation...');

            await generatePDF(result, data);

            console.log('PDF downloaded successfully');
            alert('Report downloaded successfully!');
        } catch (err) {
            console.error("PDF Generation failed:", err);
            alert(`Failed to generate PDF: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again or contact support.`);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                id="report-content"
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
            >
                {/* Logo and Header */}
                <div className="bg-white px-8 pt-6 pb-4 border-b border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <img
                                src="/assets/images/logo.png"
                                alt="CardioAI Logo"
                                className="h-16 mb-2"
                            />
                            <h1 className="text-2xl font-bold text-slate-900">Clinical Assessment Report</h1>
                        </div>
                        <div className="text-right text-sm text-slate-600">
                            <div className="flex items-center justify-end mb-1">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{assessmentDate}</span>
                            </div>
                            <div className="text-xs text-slate-500">Report ID: {result.record_id}</div>
                        </div>
                    </div>
                </div>

                {/* Risk Banner */}
                <div className={`p-8 ${riskColor} text-white text-center`}>
                    <div className="mx-auto bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <RiskIcon className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{result.risk_level} Risk Detected</h2>
                    <p className="text-white/90 text-lg">AI Confidence Score: {safeToFixed(result.risk_score * 100, 1)}%</p>
                </div>

                <div className="p-8 font-serif" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                    {/* Patient Information */}
                    <div className="mb-8 bg-slate-50 rounded-xl p-6 border-l-4 border-slate-900 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center uppercase tracking-tight">
                            <User className="h-5 w-5 mr-2 text-slate-900" aria-hidden="true" />
                            Patient Information
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Full Name</span>
                                <p className="text-lg font-bold text-slate-900 leading-tight">{data.name}</p>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Assigned Physician</span>
                                <p className="text-lg font-bold text-slate-900 leading-tight">{state.doctorName || 'Dr. Sarah Chen'}</p>
                            </div>
                            {data.contact && (
                                <div className="col-span-2">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Primary Contact</span>
                                    <p className="text-base font-bold text-slate-900">{data.contact}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Clinical Data Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-4 border-b-2 border-slate-900 pb-1 uppercase tracking-widest">Diagnostic Profile</h3>
                            <dl className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <dt className="text-slate-600 text-sm">Patient Age</dt>
                                    <dd className="font-bold text-slate-900 border-b border-dotted border-slate-300 flex-1 mx-2"></dd>
                                    <dd className="font-bold text-slate-900">{data.age} YRS</dd>
                                </div>
                                <div className="flex justify-between items-end">
                                    <dt className="text-slate-600 text-sm">Patient Sex</dt>
                                    <dd className="font-bold text-slate-900 border-b border-dotted border-slate-300 flex-1 mx-2"></dd>
                                    <dd className="font-bold text-slate-900">{data.sex === 1 ? 'MALE' : 'FEMALE'}</dd>
                                </div>
                                <div className="flex justify-between items-end">
                                    <dt className="text-slate-600 text-sm">Blood Pressure</dt>
                                    <dd className="font-bold text-slate-900 border-b border-dotted border-slate-300 flex-1 mx-2"></dd>
                                    <dd className="font-bold text-slate-900">{data.trestbps} MM HG</dd>
                                </div>
                                <div className="flex justify-between items-end">
                                    <dt className="text-slate-600 text-sm">Cholesterol</dt>
                                    <dd className="font-bold text-slate-900 border-b border-dotted border-slate-300 flex-1 mx-2"></dd>
                                    <dd className="font-bold text-slate-900">{data.chol} MG/DL</dd>
                                </div>
                            </dl>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-4 border-b-2 border-slate-900 pb-1 uppercase tracking-widest">Cardiac Markers</h3>
                            <dl className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <dt className="text-slate-600 text-sm">Chest Pain Type</dt>
                                    <dd className="font-bold text-slate-900 border-b border-dotted border-slate-300 flex-1 mx-2"></dd>
                                    <dd className="font-bold text-slate-900">TYPE {data.cp}</dd>
                                </div>
                                <div className="flex justify-between items-end">
                                    <dt className="text-slate-600 text-sm">Max Heart Rate</dt>
                                    <dd className="font-bold text-slate-900 border-b border-dotted border-slate-300 flex-1 mx-2"></dd>
                                    <dd className="font-bold text-slate-900">{data.thalach} BPM</dd>
                                </div>
                                <div className="flex justify-between items-end">
                                    <dt className="text-slate-600 text-sm">ST Depression</dt>
                                    <dd className="font-bold text-slate-900 border-b border-dotted border-slate-300 flex-1 mx-2"></dd>
                                    <dd className="font-bold text-slate-900">{data.oldpeak}</dd>
                                </div>
                                <div className="flex justify-between items-end">
                                    <dt className="text-slate-600 text-sm">Exercise Angina</dt>
                                    <dd className="font-bold text-slate-900 border-b border-dotted border-slate-300 flex-1 mx-2"></dd>
                                    <dd className="font-bold text-slate-900">{data.exang === 1 ? 'YES' : 'NO'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* AI Analysis Summary - Professional Multi-Section Layout */}
                    <div className="space-y-6 mb-8">
                        <div className="bg-slate-950 text-white rounded-2xl p-8 shadow-2xl border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="h-5 w-5 text-primary-400" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Clinical Diagnostic Interpretation</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div>
                                    <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-3">Model Analysis</h4>
                                    <div className="space-y-3">
                                        {getCleanExplanation(result, data).map((point, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                                                <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                                                    {point.replace(/[#*\[\]{}&]/g, '')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Professional Recommendations</h4>
                                    <div className="space-y-3">
                                        {generateClinicalRecommendations(result, data).map((rec, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                                <div className="bg-indigo-500/20 p-1.5 rounded-lg">
                                                    <CheckCircle className="h-3.5 w-3.5 text-indigo-400" />
                                                </div>
                                                <p className="text-xs text-slate-200 font-bold tracking-tight">
                                                    {rec}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Doctor Information */}
                    <div className="border-t border-slate-200 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Reviewing Physician
                                </label>
                                <div className="text-lg font-bold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    {state.doctorName || 'Dr. Sarah Chen'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Physician Signature
                                </label>
                                <div className="border-b-2 border-slate-300 pb-1 text-slate-400 italic">
                                    {state.doctorName || 'Dr. Sarah Chen'}
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Digitally signed on {assessmentDate}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="mt-12 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
                <button
                    onClick={handlePrint}
                    disabled={isDownloading}
                    className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className={`mr-2 h-5 w-5 ${isDownloading ? 'animate-bounce' : ''}`} />
                    {isDownloading ? 'Generating PDF...' : 'Download Report'}
                </button>
                <Link
                    to="/doctor/new-assessment"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
                >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Assess New Patient
                </Link>
            </div>
        </div>
    );
}
