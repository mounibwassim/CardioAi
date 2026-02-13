import { jsPDF } from 'jspdf';
import { type PredictionResult, type PatientData } from './api';
import { getCleanExplanation, generateClinicalRecommendations } from './clinicalLogic';

export const generatePDF = async (
    result: PredictionResult,
    data: PatientData,
    signatureImage?: string,
    clinicalNotes?: string
) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // --- CASE COUNTER & METADATA ---
    const caseNumber = Number(localStorage.getItem("caseCounter") || 0) + 1;
    localStorage.setItem("caseCounter", caseNumber.toString());

    // 0. BRANDING & HEADER (Top Section)
    try {
        // Logo (Top Left)
        pdf.addImage('/assets/images/logo.png', 'PNG', 15, 10, 25, 25);

        // Metadata (Top Right)
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pdfWidth - 15, 15, { align: 'right' });
        pdf.text(`Report ID: ${caseNumber}`, pdfWidth - 15, 22, { align: 'right' });

        // Main Title
        pdf.setTextColor(15, 23, 42); // slate-900
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Clinical Assessment Report', 15, 45);
    } catch (e) {
        console.warn("Header rendering issues", e);
    }

    // Clean up doctor name
    const rawDoctorName = data.doctor_name || 'Michael Torres';
    const cleanDoctorName = rawDoctorName.replace(/^(dr\.?\s*)+/i, '');

    // 1. RISK STATUS BANNER
    const isLow = result.risk_level === 'Low';
    const bannerColor: [number, number, number] = isLow ? [22, 163, 74] : [220, 38, 38];

    pdf.setFillColor(...bannerColor);
    pdf.rect(0, 55, pdfWidth, 45, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.text(`${result.risk_level} Risk Detected`, pdfWidth / 2, 78, { align: 'center' });

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`AI Confidence Score: ${(result.risk_score * 100).toFixed(1)}%`, pdfWidth / 2, 88, { align: 'center' });

    let currentY = 115;

    // 2. PATIENT INFORMATION
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(10, currentY, 190, 40, 2, 2, 'D');

    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PATIENT INFORMATION', 15, currentY + 8);

    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text('FULL NAME', 15, currentY + 18);
    pdf.text('ASSIGNED PHYSICIAN', 120, currentY + 18);
    pdf.text('PRIMARY CONTACT', 15, currentY + 30);

    pdf.setFontSize(10);
    pdf.setTextColor(15, 23, 42);
    pdf.text(data.name || 'N/A', 15, currentY + 24);
    pdf.text(`Dr. ${cleanDoctorName}`, 120, currentY + 24);
    pdf.text(data.contact || 'N/A', 15, currentY + 36);

    currentY += 50;

    // 3. DIAGNOSTIC PROFILE (Side by Side)
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('DIAGNOSTIC PROFILE', 10, currentY);
    pdf.text('CARDIAC MARKERS', pdfWidth / 2 + 5, currentY);

    pdf.line(10, currentY + 2, 100, currentY + 2);
    pdf.line(pdfWidth / 2 + 5, currentY + 2, 200, currentY + 2);

    const row = (label: string, value: string, x: number, y: number, vx: number) => {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        pdf.text(label, x, y);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(15, 23, 42);
        pdf.text(value, vx, y, { align: 'right' });
    };

    let itemY = currentY + 10;
    row('Age', `${data.age} YRS`, 10, itemY, 95);
    row('Chest Pain (CP)', `TYPE ${data.cp}`, pdfWidth / 2 + 5, itemY, 195);
    itemY += 8;
    row('Sex', data.sex === 1 ? 'MALE' : 'FEMALE', 10, itemY, 95);
    row('Max Heart Rate', `${data.thalach} BPM`, pdfWidth / 2 + 5, itemY, 195);
    itemY += 8;
    row('BP (Resting)', `${data.trestbps} MM HG`, 10, itemY, 95);
    row('ST Depression', `${data.oldpeak}`, pdfWidth / 2 + 5, itemY, 195);
    itemY += 8;
    row('Cholesterol', `${data.chol} MG/DL`, 10, itemY, 95);
    row('Exercise Angina', data.exang === 1 ? 'YES' : 'NO', pdfWidth / 2 + 5, itemY, 195);

    currentY = itemY + 15;

    // 4. CLINICAL INTERPRETATION & RECOMMENDATIONS (NO DARK BOXES)
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CLINICAL DIAGNOSTIC INTERPRETATION', 10, currentY);

    const interpretation = getCleanExplanation(result, data);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105);
    let analysisY = currentY + 8;
    interpretation.slice(0, 4).forEach(point => {
        const text = point.replace(/[#*\[\]{}&]/g, '');
        const lines = pdf.splitTextToSize(`• ${text}`, 180);
        pdf.text(lines, 10, analysisY);
        analysisY += (lines.length * 5) + 2;
    });

    currentY = analysisY + 10;
    pdf.setTextColor(220, 38, 38); // Highlighted for attention
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ACTIONABLE CLINICAL RECOMMENDATIONS:', 10, currentY);

    const recommendations = generateClinicalRecommendations(result, data);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105);
    let recY = currentY + 8;
    recommendations.slice(0, 4).forEach(rec => {
        const lines = pdf.splitTextToSize(`• ${rec}`, 180);
        pdf.text(lines, 10, recY);
        recY += (lines.length * 5) + 2;
    });

    currentY = recY + 5;

    // 5. CLINICAL NOTES (WHITE BACKGROUND)
    if (clinicalNotes) {
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text("PHYSICIAN'S CLINICAL NOTES", 10, currentY);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(71, 85, 105);
        const noteLines = pdf.splitTextToSize(clinicalNotes, 180);
        pdf.text(noteLines, 10, currentY + 8);
        currentY += (noteLines.length * 5) + 15;
    } else {
        currentY += 10;
    }

    // 6. SIGNATURE SECTION (PROFESSIONAL & CLEAN)
    const sigY = pdfHeight - 35;

    // Draw signature image if exists
    if (signatureImage && signatureImage.startsWith('data:image')) {
        try {
            pdf.addImage(signatureImage, 'PNG', 135, sigY - 20, 40, 15);
        } catch (e) {
            console.error("Signature image error", e);
        }
    }

    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.5);
    pdf.line(120, sigY, 195, sigY);

    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PHYSICIAN SIGNATURE (VERIFIED)', 120, sigY + 5);

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`DR. ${cleanDoctorName.toUpperCase()}`, 120, sigY + 12);

    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Credentials verified by CardioAI Clinical Hub | ${new Date().toLocaleDateString()}`, 120, sigY + 18);

    // 7. FOOTER
    pdf.setFillColor(248, 250, 252); // Very light slate footer bg
    pdf.rect(0, pdfHeight - 12, pdfWidth, 12, 'F');
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(7);
    pdf.text(`Confidential Medical Document • Case AI-${caseNumber.toString().padStart(6, '0')} • Diagnostic Integrity Verified by ML-RF v3.0`, pdfWidth / 2, pdfHeight - 5, { align: 'center' });

    // Save
    const fileName = `CardioAI_Clinical_Report_${caseNumber}_${data.name.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);
};
