import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, RefreshCw, Download, XCircle, Calendar, User } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { type PredictionResult, type PatientData } from '../lib/api';
import { useState } from 'react';

export default function Results() {
    const location = useLocation();
    const state = location.state as { result: PredictionResult; data: PatientData } | null;

    // Doctor selection state
    const [selectedDoctor, setSelectedDoctor] = useState('Dr. Sarah Chen');
    const [isDownloading, setIsDownloading] = useState(false);
    const doctorList = ['Dr. Sarah Chen', 'Dr. Emily Ross', 'Dr. Michael Torres'];

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
        const element = document.getElementById('report-content');
        if (!element) {
            alert('Report content not found. Please refresh the page and try again.');
            return;
        }

        try {
            setIsDownloading(true);
            console.log('Starting PDF generation...');

            // Create a clean copy of the element for PDF generation
            const clonedElement = element.cloneNode(true) as HTMLElement;

            // Remove any oklch colors and replace with standard colors
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                const computedStyle = window.getComputedStyle(htmlEl);

                // Force standard color values
                if (computedStyle.color) {
                    htmlEl.style.color = computedStyle.color;
                }
                if (computedStyle.backgroundColor) {
                    htmlEl.style.backgroundColor = computedStyle.backgroundColor;
                }
            });

            // Capture the element as canvas
            const canvas = await html2canvas(clonedElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    // Ensure all colors are converted to RGB
                    const style = clonedDoc.createElement('style');
                    style.textContent = `
                        * {
                            color: rgb(0, 0, 0) !important;
                            background-color: rgb(255, 255, 255) !important;
                        }
                    `;
                    clonedDoc.head.appendChild(style);
                }
            });

            console.log('Canvas created successfully');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();

            let currentY = 0;

            // Header
            pdf.setFillColor(15, 76, 129);
            pdf.rect(0, 0, pdfWidth, 25, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CardioAI Clinical Report', pdfWidth / 2, 15, { align: 'center' });
            currentY = 30;

            // Patient Information
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Patient Information', 15, currentY);
            currentY += 7;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.text(`Name: ${data.name}`, 15, currentY);
            currentY += 5;
            pdf.text(`Age: ${data.age} years | Gender: ${data.sex === 1 ? 'Male' : 'Female'}`, 15, currentY);
            currentY += 5;
            pdf.text(`Assessment Date: ${new Date().toLocaleDateString()}`, 15, currentY);
            currentY += 5;
            pdf.text(`Doctor: ${selectedDoctor}`, 15, currentY);
            currentY += 10;

            // Risk Assessment
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text('Risk Assessment', 15, currentY);
            currentY += 7;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const riskColor: [number, number, number] = result.risk_level === 'High' ? [220, 38, 38] :
                result.risk_level === 'Medium' ? [234, 179, 8] : [34, 197, 94];
            pdf.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Risk Level: ${result.risk_level}`, 15, currentY);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'normal');
            currentY += 5;
            pdf.text(`Risk Score: ${(result.risk_score * 100).toFixed(1)}%`, 15, currentY);
            currentY += 10;

            // AI Analysis Summary
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text('AI Analysis Summary', 15, currentY);
            currentY += 7;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            const analysisText = `Based on the assessment, the patient shows a ${result.risk_level.toLowerCase()} risk level for cardiovascular disease with a risk score of ${(result.risk_score * 100).toFixed(1)}%.`;
            const analysisLines = pdf.splitTextToSize(analysisText, pdfWidth - 30);
            pdf.text(analysisLines, 15, currentY);
            currentY += analysisLines.length * 4 + 10;

            // Doctor Notes (if available - would need to be passed from patient record)
            // This would require fetching patient notes from the database
            // For now, we'll add a placeholder section
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text('Clinical Notes', 15, currentY);
            currentY += 7;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text('Notes will be added by the attending physician.', 15, currentY);
            currentY += 10;

            // Digital Signature (placeholder)
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text('Digital Signature', 15, currentY);
            currentY += 7;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text(`Signed by: ${selectedDoctor}`, 15, currentY);
            currentY += 5;
            pdf.text(`Date: ${new Date().toLocaleDateString()}`, 15, currentY);

            // Footer
            pdf.setFontSize(8);
            pdf.setTextColor(100);
            pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, pdf.internal.pageSize.getHeight() - 10);
            pdf.text('CardioAI - AI-Powered Heart Disease Prediction', pdfWidth - 15, pdf.internal.pageSize.getHeight() - 10, { align: 'right' });

            // Generate filename
            const fileName = `CardioAI_Report_${data.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

            console.log('Saving PDF:', fileName);
            pdf.save(fileName);

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
                    <p className="text-white/90 text-lg">AI Confidence Score: {(result.risk_score * 100).toFixed(1)}%</p>
                </div>

                <div className="p-8">
                    {/* Patient Information */}
                    <div className="mb-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                            <User className="h-5 w-5 mr-2 text-primary-600" />
                            Patient Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-slate-500">Full Name</span>
                                <p className="font-semibold text-slate-900">{data.name}</p>
                            </div>
                            {data.contact && (
                                <div>
                                    <span className="text-sm text-slate-500">Contact</span>
                                    <p className="font-semibold text-slate-900">{data.contact}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Clinical Data Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

                    {/* AI Analysis Summary */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mb-8">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">AI Analysis Summary</h3>
                        <p className="text-slate-600 leading-relaxed">
                            The patient exhibits <strong>{result.risk_level.toLowerCase()} risk</strong> markers based on the provided clinical data.
                            {result.risk_score > 0.5
                                ? " Immediate consultation with a cardiologist is recommended to verify these findings and discuss potential intervention strategies."
                                : " Routine monitoring and lifestyle maintenance are advised. No immediate alarming indicators were detected."
                            }
                        </p>
                    </div>

                    {/* Doctor Information */}
                    <div className="border-t border-slate-200 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Reviewing Physician
                                </label>
                                <select
                                    value={selectedDoctor}
                                    onChange={(e) => setSelectedDoctor(e.target.value)}
                                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"
                                >
                                    {doctorList.map((doc) => (
                                        <option key={doc} value={doc}>{doc}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Physician Signature
                                </label>
                                <div className="border-b-2 border-slate-300 pb-1 text-slate-400 italic">
                                    {selectedDoctor}
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
                    to="/doctor/predict"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm"
                >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Assess New Patient
                </Link>
            </div>
        </div>
    );
}
