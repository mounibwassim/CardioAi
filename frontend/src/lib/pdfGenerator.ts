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

    // 0. BRANDING LOGO & HEADER (Top Section)
    try {
        // Simple Medical Plus logo
        pdf.setDrawColor(220, 38, 38); // red-600
        pdf.setLineWidth(1.5);
        pdf.line(25, 12, 25, 22); // Vertical
        pdf.line(20, 17, 30, 17); // Horizontal

        // Circular Enclosure
        pdf.circle(25, 17, 7, 'D');

        pdf.setFillColor(2, 6, 23); // slate-950
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CardioAI Clinical', 35, 18);

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        pdf.text('Advanced Cardiovascular Intelligence System', 35, 23);
    } catch (e) {
        console.warn("Logo rendering skipped");
    }

    // --- CASE COUNTER LOGIC ---
    const caseNumber = Number(localStorage.getItem("caseCounter") || 0) + 1;
    localStorage.setItem("caseCounter", caseNumber.toString());

    // Clean up doctor name (Remove duplicate Dr. prefix)
    const rawDoctorName = data.doctor_name || 'Michael Torres';
    const cleanDoctorName = rawDoctorName.replace(/^(dr\.?\s*)+/i, '');

    // 1. TOP RISK BANNER (FULL WIDTH)
    const isLow = result.risk_level === 'Low';
    const bannerColor: [number, number, number] = isLow ? [22, 163, 74] : [220, 38, 38]; // green-600 or red-600

    pdf.setFillColor(...bannerColor);
    pdf.rect(0, 35, pdfWidth, 40, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text(`${result.risk_level} Risk Detected`, pdfWidth / 2, 55, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`AI Confidence Score: ${(result.risk_score * 100).toFixed(1)}%`, pdfWidth / 2, 65, { align: 'center' });

    let currentY = 85;

    // 2. PATIENT INFORMATION BOX
    pdf.setDrawColor(226, 232, 240);
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(10, currentY, 190, 45, 3, 3, 'FD');

    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PATIENT INFORMATION', 20, currentY + 10);

    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text('FULL NAME', 20, currentY + 20);
    pdf.text('ASSIGNED PHYSICIAN', 120, currentY + 20);
    pdf.text('PRIMARY CONTACT', 20, currentY + 35);

    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.name || 'Mounib Wassim Meftah', 20, currentY + 26);
    pdf.text(`Dr. ${cleanDoctorName}`, 120, currentY + 26);
    pdf.text(data.contact || 'N/A', 20, currentY + 41);

    currentY += 55;

    // 3. DIAGNOSTIC PROFILE & CARDIAC MARKERS
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('DIAGNOSTIC PROFILE', 10, currentY);
    pdf.text('CARDIAC MARKERS', pdfWidth / 2 + 5, currentY);

    pdf.setLineWidth(0.5);
    pdf.setDrawColor(30, 41, 59);
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
    row('Patient Age', `${data.age} YRS`, 10, itemY, 95);
    row('Chest Pain Type', `TYPE ${data.cp}`, pdfWidth / 2 + 5, itemY, 195);
    itemY += 8;
    row('Patient Sex', data.sex === 1 ? 'MALE' : 'FEMALE', 10, itemY, 95);
    row('Max Heart Rate', `${data.thalach} BPM`, pdfWidth / 2 + 5, itemY, 195);
    itemY += 8;
    row('Blood Pressure', `${data.trestbps} MM HG`, 10, itemY, 95);
    row('ST Depression', `${data.oldpeak}`, pdfWidth / 2 + 5, itemY, 195);
    itemY += 8;
    row('Cholesterol', `${data.chol} MG/DL`, 10, itemY, 95);
    row('Exercise Angina', data.exang === 1 ? 'YES' : 'NO', pdfWidth / 2 + 5, itemY, 195);

    currentY = itemY + 15;

    // 4. CLINICAL DIAGNOSTIC INTERPRETATION (PROFESSIONAL BULLETS)
    pdf.setFillColor(2, 6, 23); // slate-950
    pdf.roundedRect(10, currentY, 190, 75, 5, 5, 'F');

    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CLINICAL DIAGNOSTIC INTERPRETATION', 15, currentY + 10);

    pdf.setFontSize(9);
    pdf.setTextColor(226, 232, 240);
    const analysisPoints = getCleanExplanation(result, data);
    let analysisY = currentY + 20;
    analysisPoints.slice(0, 4).forEach(point => {
        pdf.setFont('helvetica', 'bold');
        pdf.text('•', 15, analysisY);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(point.replace(/[#*\[\]{}&]/g, ''), 85);
        pdf.text(lines, 20, analysisY);
        analysisY += (lines.length * 5);
    });

    const recommendations = generateClinicalRecommendations(result, data);
    let recY = currentY + 20;
    pdf.setTextColor(56, 189, 248); // sky-400
    pdf.setFont('helvetica', 'bold');
    pdf.text('ACTIONABLE RECOMMENDATIONS:', 110, recY - 2);
    pdf.setTextColor(226, 232, 240);
    recommendations.slice(0, 4).forEach(rec => {
        pdf.text('•', 110, recY);
        const lines = pdf.splitTextToSize(rec, 85);
        pdf.text(lines, 115, recY);
        recY += (lines.length * 7);
    });

    currentY += 85;

    // 5. CLINICAL NOTES SECTION (IF PROVIDED)
    if (clinicalNotes) {
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(10, currentY, 190, 30, 2, 2, 'D');
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text("PHYSICIAN'S CLINICAL NOTES", 15, currentY + 8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        const noteLines = pdf.splitTextToSize(clinicalNotes, 180);
        pdf.text(noteLines, 15, currentY + 15);
        currentY += 35;
    } else {
        currentY += 10;
    }

    // 6. SIGNATURE SECTION (FIXED POSITION TO AVOID CLASH)
    const sigY = pdfHeight - 65;
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.5);
    pdf.line(120, sigY + 25, 190, sigY + 25);

    // If we have a digital signature image
    if (signatureImage && signatureImage.startsWith('data:image')) {
        try {
            pdf.addImage(signatureImage, 'PNG', 135, sigY + 5, 40, 18);
        } catch (e) {
            console.error("Signature image error", e);
        }
    }

    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('PHYSICIAN SIGNATURE (VERIFIED)', 120, sigY + 30);

    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`DR. ${cleanDoctorName.toUpperCase()}`, 120, sigY + 37);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`ISSUED: ${new Date().toLocaleDateString()}`, 120, sigY + 43);

    // 7. FOOTER BAR
    pdf.setFillColor(2, 6, 23);
    pdf.rect(0, pdfHeight - 15, pdfWidth, 15, 'F');
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(7);
    pdf.text(`Case ID: AI-${caseNumber.toString().padStart(6, '0')} | CardioAI Clinical Hub v4.1.0 | Diagnostic Integrity Verified`, pdfWidth / 2, pdfHeight - 7, { align: 'center' });

    // Save
    const fileName = `CardioAI_Report_${caseNumber}_${data.name.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);
};
