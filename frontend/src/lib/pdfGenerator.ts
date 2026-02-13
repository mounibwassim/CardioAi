import { jsPDF } from 'jspdf';
import { type PredictionResult, type PatientData } from './api';
import { getCleanExplanation, generateClinicalRecommendations } from './clinicalLogic';

export const generatePDF = async (
    result: PredictionResult,
    data: PatientData,
    doctorNotes?: string,
    doctorSignature?: string
) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setProperties({
        title: `CardioAI Report - ${data.name}`
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    let currentY = 0;

    // Load and add logo
    try {
        const logoImg = new Image();
        logoImg.src = '/assets/images/logo.png';
        await new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
        });

        // Add logo (top left)
        const logoWidth = 25;
        const logoHeight = 12;
        pdf.addImage(logoImg, 'PNG', 10, 10, logoWidth, logoHeight);
    } catch (error) {
        console.warn('Logo not loaded, continuing without it');
    }

    // Header Right - Date & ID
    pdf.setFontSize(8);
    pdf.setFont('Times-Roman', 'normal');
    pdf.setTextColor(100, 116, 139);

    const assessmentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    pdf.text(assessmentDate, pdfWidth - 10, 15, { align: 'right' });
    pdf.text(`Report ID: ${result.record_id}`, pdfWidth - 10, 19, { align: 'right' });

    // Header - Clinical Assessment Report
    pdf.setFontSize(20);
    pdf.setFont('Times-Roman', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('Clinical Assessment Report', 10, 30);

    currentY = 35;

    // Risk Banner
    const riskColors: { [key: string]: [number, number, number] } = {
        'Low': [22, 163, 74],    // green-600
        'Medium': [202, 138, 4], // yellow-600
        'High': [220, 38, 38],   // red-600
        'Critical': [153, 27, 27] // red-900
    };
    const riskColor = riskColors[result.risk_level] || [71, 85, 105];

    pdf.setFillColor(...riskColor);
    pdf.rect(0, currentY, pdfWidth, 18, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${result.risk_level.toUpperCase()} RISK CHARACTERIZATION`, pdfWidth / 2, currentY + 8, { align: 'center' });

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`AI Diagnostic Confidence: ${(result.risk_score * 100).toFixed(1)}%`, pdfWidth / 2, currentY + 14, { align: 'center' });

    currentY += 25;

    // Patient Information Section (Condensed)
    pdf.setFillColor(248, 250, 252);
    pdf.rect(10, currentY, pdfWidth - 20, 20, 'F');

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(11);
    pdf.setFont('Times-Roman', 'bold');
    pdf.text('Patient Profile', 15, currentY + 7);

    pdf.setFontSize(9);
    pdf.setFont('Times-Roman', 'normal');
    pdf.text(`Name: ${data.name}`, 15, currentY + 14);
    pdf.text(`Age: ${data.age}`, 60, currentY + 14);
    pdf.text(`Sex: ${data.sex === 1 ? 'Male' : 'Female'}`, 80, currentY + 14);
    if (data.contact) pdf.text(`Contact: ${data.contact}`, 110, currentY + 14);

    currentY += 28;

    // Two Columns for Clinical Indicators
    const leftColX = 15;
    const rightColX = pdfWidth / 2 + 5;

    pdf.setFontSize(11);
    pdf.setFont('Times-Roman', 'bold');
    pdf.text('Diagnostic Indicators', 10, currentY);
    pdf.setLineWidth(0.3);
    pdf.setDrawColor(226, 232, 240);
    pdf.line(10, currentY + 1, pdfWidth - 10, currentY + 1);

    currentY += 8;
    pdf.setFontSize(9);
    pdf.setFont('Times-Roman', 'normal');
    pdf.setTextColor(51, 65, 85);

    pdf.text(`Blood Pressure: ${data.trestbps} mm Hg`, leftColX, currentY);
    pdf.text(`Serum Chol.: ${data.chol} mg/dl`, leftColX, currentY + 5);
    pdf.text(`Chest Pain: Type ${data.cp}`, leftColX, currentY + 10);

    pdf.text(`Max Heart Rate: ${data.thalach} bpm`, rightColX, currentY);
    pdf.text(`ST Depression: ${data.oldpeak}`, rightColX, currentY + 5);
    pdf.text(`Exercise Angina: ${data.exang === 1 ? 'Yes' : 'No'}`, rightColX, currentY + 10);

    currentY += 22;

    // --- CLINICAL ANALYSIS SECTION ---
    currentY += 10;

    // Section Background (Subtle 3D Effect)
    pdf.setFillColor(248, 250, 252); // Light Slate
    pdf.rect(10, currentY - 5, 190, 45, 'F');
    // Border bottom for depth
    pdf.setDrawColor(226, 232, 240);
    pdf.line(10, currentY + 40, 200, currentY + 40);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(30, 41, 59);
    pdf.text('Clinical Analysis', 15, currentY + 2);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105);

    const clinicalPoints = getCleanExplanation(result, data); // Adapted from record.risk_level
    let analysisY = currentY + 10;
    clinicalPoints.forEach(point => {
        const wrapped = pdf.splitTextToSize(`• ${point}`, pdfWidth - 25);
        pdf.text(wrapped, 15, analysisY);
        analysisY += (wrapped.length * 5); // Adjusted for multi-line text
    });

    // --- CORE RECOMMENDATIONS SECTION ---
    currentY = analysisY + 15; // Space between sections (Increased)

    // Section Background (Subtle 3D Effect)
    pdf.setFillColor(240, 249, 255); // Light Blue-ish
    pdf.rect(10, currentY - 5, 190, 45, 'F');
    // Border bottom for depth
    pdf.setDrawColor(186, 230, 253);
    pdf.line(10, currentY + 40, 200, currentY + 40);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(7, 89, 133);
    pdf.text('Core Recommendations', 15, currentY + 2);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(12, 74, 110);

    const recs = generateClinicalRecommendations(result, data); // Adapted from record.risk_level, record.input_data
    let recY = currentY + 10;
    recs.forEach(rec => {
        const wrapped = pdf.splitTextToSize(`• ${rec}`, pdfWidth - 25);
        pdf.text(wrapped, 15, recY);
        recY += (wrapped.length * 5); // Adjusted for multi-line text
    });

    currentY = recY + 5; // Update currentY after recommendations

    // Physician's Notes (if any)
    if (doctorNotes) {
        currentY += 8;
        pdf.setFontSize(11);
        pdf.setFont('Times-Roman', 'bold');
        pdf.text('Physician\'s Observation Notes', 10, currentY);
        pdf.line(10, currentY + 1, pdfWidth - 10, currentY + 1);

        currentY += 8;
        pdf.setFontSize(9);
        pdf.setFont('Times-Roman', 'italic');
        const wrappedNotes = pdf.splitTextToSize(doctorNotes, pdfWidth - 25);
        pdf.text(wrappedNotes, 15, currentY);
        currentY += (wrappedNotes.length * 5);
    }

    // Footer - Signature Area (Absolute Bottom)
    const footerY = pdfHeight - 45;
    pdf.setDrawColor(203, 213, 225);
    pdf.line(pdfWidth - 90, footerY, pdfWidth - 10, footerY);

    pdf.setFontSize(10);
    pdf.setFont('Times-Roman', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('Attending Physician Clinical Signature', pdfWidth - 90, footerY + 5);

    pdf.setFontSize(9);
    pdf.setFont('Times-Roman', 'italic');
    pdf.text(`${doctorSignature || data.doctor_name || 'CardioAI Clinical System'}`, pdfWidth - 90, footerY + 10);

    pdf.setFontSize(8);
    pdf.setFont('Times-Roman', 'normal');
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Date of Verification: ${new Date().toLocaleString()}`, pdfWidth - 90, footerY + 15);

    // Bottom Branding
    pdf.setFontSize(8);
    pdf.text('CardioAI - Professional Cardiovascular Clinical Hub', pdfWidth / 2, pdfHeight - 10, { align: 'center' });

    // Save PDF
    const fileName = `Clinical_Report_${data.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
};
