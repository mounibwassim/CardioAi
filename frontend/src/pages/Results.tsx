import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, RefreshCw, Download, XCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { type PredictionResult, type PatientData } from '../lib/api';

export default function Results() {
    const location = useLocation();
    const state = location.state as { result: PredictionResult; data: PatientData } | null;

    if (!state) {
        return <Navigate to="/predict" />;
    }

    const { result, data } = state;





    // Determine risk styling and icon for the header
    let riskColor = "bg-slate-700"; // Default
    let RiskIcon = Activity; // Default icon

    if (result.risk_level === "Low") {
        riskColor = "bg-green-600";
        RiskIcon = CheckCircle;
    } else if (result.risk_level === "Moderate") {
        riskColor = "bg-yellow-600";
        RiskIcon = AlertTriangle;
    } else if (result.risk_level === "High") {
        riskColor = "bg-red-600";
        RiskIcon = XCircle;
    }

    const handlePrint = async () => {
        const element = document.getElementById('report-content');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Header
            pdf.setFillColor(15, 76, 129); // Primary Color
            pdf.rect(0, 0, pdfWidth, 20, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(16);
            pdf.setFontSize(16);
            pdf.text("CardioAI Clinical Report", 10, 13);

            // Add Logo (Assuming static path or base64)
            try {
                const logoImg = new Image();
                logoImg.src = "/assets/images/logo.png";
                // We await simple loading using a promise wrapper if strictness required, but 
                // for synchronous jspdf in a browser, we usually need it preloaded. 
                // However, adding it to the PDF from an image element or path:
                pdf.addImage(logoImg, 'PNG', 160, 2, 40, 16);
            } catch (e) {
                console.warn("Logo add failed", e);
            }

            // Content
            pdf.addImage(imgData, 'PNG', 0, 25, pdfWidth, pdfHeight);

            // Footer
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text(`Generated on: ${new Date().toLocaleString()}`, 10, pdf.internal.pageSize.getHeight() - 10);

            pdf.save(`CardioAI_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            console.error("PDF Generation failed", err);
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
                <div className={`p-8 ${riskColor} text-white text-center`}>
                    <div className="mx-auto bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <RiskIcon className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{result.risk_level} Risk Detected</h2>
                    <p className="text-white/90 text-lg">AI Confidence Score: {(result.risk_score * 100).toFixed(1)}%</p>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Patient Profile</h3>
                            <dl className="space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Age</dt>
                                    <dd className="font-medium text-slate-900">{data.age} years</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Sex</dt>
                                    <dd className="font-medium text-slate-900">{data.sex === 1 ? 'Male' : 'Female'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Blood Pressure</dt>
                                    <dd className="font-medium text-slate-900">{data.trestbps} mm Hg</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Cholesterol</dt>
                                    <dd className="font-medium text-slate-900">{data.chol} mg/dl</dd>
                                </div>
                            </dl>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Clinical Indicators</h3>
                            <dl className="space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Chest Pain Type</dt>
                                    <dd className="font-medium text-slate-900">Type {data.cp}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Max Heart Rate</dt>
                                    <dd className="font-medium text-slate-900">{data.thalach} bpm</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">ST Depression</dt>
                                    <dd className="font-medium text-slate-900">{data.oldpeak}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Exercise Angina</dt>
                                    <dd className="font-medium text-slate-900">{data.exang === 1 ? 'Yes' : 'No'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">AI Analysis Summary</h3>
                        <p className="text-slate-600 leading-relaxed">
                            The patient exhibits <strong>{result.risk_level.toLowerCase()} risk</strong> markers based on the provided clinical data.
                            {result.risk_score > 0.5
                                ? " Immediate consultation with a cardiologist is recommended to verify these findings and discuss potential intervention strategies."
                                : " Routine monitoring and lifestyle maintenance are advised. No immediate alarming indicators were detected."
                            }
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="mt-12 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
                <button
                    onClick={handlePrint}
                    className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <Download className="mr-2 h-5 w-5" />
                    Download Report
                </button>
                <Link
                    to="/predict" // Changed from /doctor/predict to /predict based on original context
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
                >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Assess New Patient
                </Link>
            </div>
        </div>
    );
}
