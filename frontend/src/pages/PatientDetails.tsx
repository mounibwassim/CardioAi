import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, User, Calendar, Activity, FileText,
    Save, AlertCircle, TrendingUp, PenTool, Download, Shield
} from 'lucide-react';
import { getPatientRecords, updatePatientNotes, updatePatientSignature, type Patient, type Record } from '../lib/api';
import SignatureCanvas from '../components/SignatureCanvas';
import { generatePDF } from '../lib/pdfGenerator';

export default function PatientDetails() {
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

            // Mock PatientData for PDF generation (simplified - needs actual clinical data)
            const patientData: any = {
                name: patient.name,
                age: patient.age,
                sex: patient.sex,
                contact: patient.contact || '',
                // Clinical data would need to be stored in records or fetched separately
                cp: 0,
                trestbps: 0,
                chol: 0,
                fbs: 0,
                restecg: 0,
                thalach: 0,
                exang: 0,
                oldpeak: 0,
                slope: 0,
                ca: 0,
                thal: 0
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
                patient.doctor_notes || '',
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
            <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">Patient not found</h3>
                <button
                    onClick={() => navigate('/doctor/patients')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                    Back to Patients
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/doctor/patients')}
                    className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Patients
                </button>
            </div>

            {/* Patient Header Card */}
            <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-8 w-8 text-primary-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                                <span>Patient ID: #{patient.id}</span>
                                <span>•</span>
                                <span>{patient.age} years old</span>
                                <span>•</span>
                                <span>{patient.sex === 1 ? 'Male' : 'Female'}</span>
                                {patient.contact && (
                                    <>
                                        <span>•</span>
                                        <span>{patient.contact}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border-2 ${getRiskColor(patient.risk_level)}`}>
                        <div className="text-xs font-medium uppercase">Risk Level</div>
                        <div className="text-lg font-bold">{patient.risk_level || 'Unknown'}</div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
                    <div>
                        <div className="text-xs text-slate-500 uppercase">Total Assessments</div>
                        <div className="text-2xl font-bold text-slate-900">{patient.assessment_count || 0}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase">Last Assessment</div>
                        <div className="text-2xl font-bold text-slate-900">
                            {new Date(patient.last_updated || patient.created_at).toLocaleDateString()}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase">Assigned Doctor</div>
                        <div className="text-lg font-semibold text-slate-900">{patient.doctor_name || 'Not Assigned'}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`${activeTab === 'overview'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <Activity className="h-4 w-4 mr-2" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`${activeTab === 'history'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        Assessment History
                    </button>
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`${activeTab === 'notes'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Notes
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div id="overview-full-report" className="space-y-6 bg-white p-8 rounded-xl border border-transparent">
                    {/* Header for PDF report */}
                    <div className="flex justify-between items-center pb-6 border-b border-slate-100 mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-primary-600 p-2 rounded-lg">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-slate-900 tracking-tight">CardioAI <span className="text-primary-600">Professional</span></div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Clinical Diagnostic Report</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-400">REPORT ID</div>
                            <div className="text-sm font-mono text-slate-900 font-bold">#{patient.id.toString().padStart(6, '0')}</div>
                        </div>
                    </div>

                    {/* Download Overview PDF Button - Only visible on screen */}
                    <div className="flex justify-end print:hidden no-report-export">
                        <button
                            onClick={handleDownloadOverviewPDF}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download Full Report
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* System Notes / AI Analysis */}
                        <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                <Shield className="h-5 w-5 mr-2 text-primary-600" />
                                AI Analysis Summary
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Assessment</div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm italic text-slate-700 leading-relaxed font-medium">
                                        "{patient.system_notes || 'Patient demonstrates typical cardiovascular patterns for specified demographic. Professional review recommended.'}"
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex-1">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI Confidence</div>
                                        <div className="flex items-center">
                                            <div className="flex-1 bg-slate-100 rounded-full h-2 mr-2">
                                                <div
                                                    className="bg-primary-500 h-2 rounded-full"
                                                    style={{ width: `${records[0]?.risk_score ? (records[0].risk_score * 100).toFixed(0) : 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-900">
                                                {records[0]?.risk_score ? (records[0].risk_score * 100).toFixed(1) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinical Recommendations</div>
                                    <ul className="space-y-2 mt-2">
                                        {[
                                            "Schedule follow-up lipid profile in 3 months",
                                            "Monitor daily blood pressure readings",
                                            "Discuss low-sodium dietary adjustments"
                                        ].map((rec, i) => (
                                            <li key={i} className="flex items-start text-xs text-slate-600">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 mr-2 flex-shrink-0"></div>
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Latest Assessment */}
                        {records.length > 0 && (
                            <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                    <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
                                    Latest Assessment
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-500">Date:</span>
                                        <span className="text-sm font-medium text-slate-900">
                                            {new Date(records[0].created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-500">Risk Score:</span>
                                        <span className="text-sm font-medium text-slate-900">
                                            {(records[0].risk_score * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-500">Risk Level:</span>
                                        <span className={`text-sm font-bold ${getRiskColor(records[0].risk_level).split(' ')[0]}`}>
                                            {records[0].risk_level}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-500">Reviewed By:</span>
                                        <span className="text-sm font-medium text-slate-900">
                                            {records[0].doctor_name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Doctor Notes Section */}
                    {patient.doctor_notes && (
                        <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-primary-600" />
                                Doctor Notes
                            </h3>
                            <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-line">
                                {patient.doctor_notes}
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
                                By {patient.doctor_name || 'Physician'} • Last updated: {new Date(patient.last_updated).toLocaleString()}
                            </div>
                        </div>
                    )}

                    {/* Signature Display */}
                    {patient.doctor_signature && (
                        <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                <PenTool className="h-5 w-5 mr-2 text-primary-600" />
                                Signature
                            </h3>
                            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                <img
                                    src={patient.doctor_signature}
                                    alt="Doctor Signature"
                                    className="max-w-xs h-20 object-contain"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Assessment Timeline</h3>
                    {records.length > 0 ? (
                        <div className="space-y-4">
                            {records.map((record, index) => (
                                <div key={record.id} className="flex items-start space-x-4 pb-4 border-b border-slate-200 last:border-0">
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getRiskColor(record.risk_level)}`}>
                                        <span className="font-bold text-sm">{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-slate-900">
                                                Assessment #{record.id}
                                            </h4>
                                            <span className="text-xs text-slate-500">
                                                {new Date(record.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-slate-500">Risk Level:</span>
                                                <span className={`ml-2 font-semibold ${getRiskColor(record.risk_level).split(' ')[0]}`}>
                                                    {record.risk_level}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Risk Score:</span>
                                                <span className="ml-2 font-semibold text-slate-900">
                                                    {(record.risk_score * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Doctor:</span>
                                                <span className="ml-2 font-semibold text-slate-900">
                                                    {record.doctor_name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 py-8">No assessment history available.</p>
                    )}
                </div>
            )}

            {activeTab === 'notes' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Doctor Notes */}
                    <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Doctor Notes</h3>

                        {/* Doctor Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Assigned Doctor
                            </label>
                            <select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            >
                                {doctorList.map((doctor) => (
                                    <option key={doctor} value={doctor}>{doctor}</option>
                                ))}
                            </select>
                        </div>

                        {/* Notes Editor */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Clinical Notes
                            </label>
                            <textarea
                                value={doctorNotes}
                                onChange={(e) => setDoctorNotes(e.target.value)}
                                rows={10}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                placeholder="Enter clinical observations, recommendations, or follow-up notes..."
                            />
                        </div>

                        <button
                            onClick={handleSaveNotes}
                            disabled={saving}
                            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:opacity-50"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Notes'}
                        </button>
                    </div>

                    {/* System Notes (Read-only) */}
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">AI System Notes</h3>
                        <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-line">
                            {patient.system_notes || 'No AI-generated notes available.'}
                        </div>
                        <p className="mt-4 text-xs text-slate-500 italic">
                            * System notes are automatically generated based on AI analysis and cannot be edited.
                        </p>
                    </div>

                    {/* Digital Signature */}
                    <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Digital Signature</h3>
                            <button
                                onClick={() => setShowSignatureModal(true)}
                                className="inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                            >
                                <PenTool className="h-4 w-4 mr-1.5" />
                                {patient.doctor_signature ? 'Update Signature' : 'Add Signature'}
                            </button>
                        </div>

                        {patient.doctor_signature ? (
                            <div className="border-2 border-slate-200 rounded-lg p-4 bg-white">
                                <img
                                    src={patient.doctor_signature}
                                    alt="Doctor Signature"
                                    className="max-h-32 mx-auto"
                                />
                                <p className="text-center text-xs text-slate-500 mt-2">
                                    Signed by {patient.doctor_name}
                                </p>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                                <PenTool className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">No signature on file</p>
                                <p className="text-xs text-slate-400 mt-1">Click "Add Signature" to sign digitally</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
