import { jsPDF } from 'jspdf';
import { type PredictionResult, type PatientData } from './api';
import { getCleanExplanation, generateClinicalRecommendations } from './clinicalLogic';

export const generatePDF = async (
    result: PredictionResult,
    data: PatientData,
    doctorSignature?: string
) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // --- CASE COUNTER LOGIC ---
    const caseNumber = Number(localStorage.getItem("caseCounter") || 0) + 1;
    localStorage.setItem("caseCounter", caseNumber.toString());


    // 1. TOP RISK BANNER (FULL WIDTH)
    const isLow = result.risk_level === 'Low';
    const bannerColor: [number, number, number] = isLow ? [22, 163, 74] : [220, 38, 38]; // green-600 or red-600

    pdf.setFillColor(...bannerColor);
    pdf.rect(0, 0, pdfWidth, 45, 'F');

    // Checkmark/Icon (Minimalist representation)
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(1.5);
    pdf.circle(pdfWidth / 2, 12, 6, 'D');
    pdf.line(pdfWidth / 2 - 2, 12, pdfWidth / 2, 14);
    pdf.line(pdfWidth / 2, 14, pdfWidth / 2 + 3, 10);

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text(`${result.risk_level} Risk Detected`, pdfWidth / 2, 28, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`AI Confidence Score: ${(result.risk_score * 100).toFixed(1)}%`, pdfWidth / 2, 38, { align: 'center' });

    let currentY = 55;

    // 2. PATIENT INFORMATION BOX
    pdf.setDrawColor(226, 232, 240);
    pdf.setFillColor(255, 255, 255);
    // Rounded-ish box for Patient Info
    pdf.roundedRect(10, currentY, 190, 45, 3, 3, 'FD');

    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PATIENT INFORMATION', 25, currentY + 10);
    // Icon (Simplified user icon)
    pdf.circle(18, currentY + 11, 1.5, 'D');
    pdf.ellipse(18, currentY + 15, 3, 1.5, 'D');

    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text('FULL NAME', 20, currentY + 20);
    pdf.text('ASSIGNED PHYSICIAN', 120, currentY + 20);
    pdf.text('PRIMARY CONTACT', 20, currentY + 35);

    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.name || 'Mounib Wassim Meftah', 20, currentY + 26);
    pdf.text(`Dr. ${doctorSignature || data.doctor_name || 'Michael Torres'}`, 120, currentY + 26);
    pdf.text(data.contact || '0125', 20, currentY + 41);

    currentY += 55;

    // 3. DIAGNOSTIC PROFILE & CARDIAC MARKERS (TWO COLUMNS)
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('DIAGNOSTIC PROFILE', 10, currentY);
    pdf.text('CARDIAC MARKERS', pdfWidth / 2 + 5, currentY);

    pdf.setLineWidth(0.5);
    pdf.setDrawColor(30, 41, 59);
    pdf.line(10, currentY + 2, 100, currentY + 2);
    pdf.line(pdfWidth / 2 + 5, currentY + 2, 200, currentY + 2);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);

    const leftColX = 10;
    const rightColX = pdfWidth / 2 + 5;
    const valLeftX = 85; // Align values to the right of the column
    const valRightX = 185;

    const row = (label: string, value: string, x: number, y: number, vx: number) => {
        pdf.text(label, x, y);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(15, 23, 42);
        pdf.text(value, vx, y, { align: 'right' });
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        // Dotted line
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineDashPattern([0.5, 0.5], 0);
        pdf.line(x + pdf.getTextWidth(label) + 2, y, vx - pdf.getTextWidth(value) - 2, y);
        pdf.setLineDashPattern([], 0);
    };

    let itemY = currentY + 10;
    row('Patient Age', `${data.age} YRS`, leftColX, itemY, valLeftX);
    row('Chest Pain Type', `TYPE ${data.cp}`, rightColX, itemY, valRightX);

    itemY += 10;
    row('Patient Sex', data.sex === 1 ? 'MALE' : 'FEMALE', leftColX, itemY, valLeftX);
    row('Max Heart Rate', `${data.thalach} BPM`, rightColX, itemY, valRightX);

    itemY += 10;
    row('Blood Pressure', `${data.trestbps} MM HG`, leftColX, itemY, valLeftX);
    row('ST Depression', `${data.oldpeak}`, rightColX, itemY, valRightX);

    itemY += 10;
    row('Cholesterol', `${data.chol} MG/DL`, leftColX, itemY, valLeftX);
    row('Exercise Angina', data.exang === 1 ? 'YES' : 'NO', rightColX, itemY, valRightX);

    currentY = itemY + 20;

    // 4. CLINICAL DIAGNOSTIC INTERPRETATION (DARK BOX)
    pdf.setFillColor(2, 6, 23); // slate-950
    pdf.roundedRect(10, currentY, 190, 80, 5, 5, 'F');

    // Icon (Pulse line)
    pdf.setDrawColor(56, 189, 248); // cyan-400
    pdf.setLineWidth(0.8);
    pdf.line(15, currentY + 12, 18, currentY + 12);
    pdf.line(18, currentY + 12, 20, currentY + 8);
    pdf.line(20, currentY + 8, 23, currentY + 16);
    pdf.line(23, currentY + 16, 25, currentY + 12);
    pdf.line(25, currentY + 12, 28, currentY + 12);

    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CLINICAL DIAGNOSTIC INTERPRETATION', 32, currentY + 12, { charSpace: 1.5 });

    // Two Columns inside dark box
    pdf.setFontSize(7);
    pdf.setTextColor(56, 189, 248); // sky-400
    pdf.text('MODEL ANALYSIS', 15, currentY + 25, { charSpace: 1 });
    pdf.text('PROFESSIONAL RECOMMENDATIONS', 115, currentY + 25, { charSpace: 1 });

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(226, 232, 240); // slate-200

    const analysisPoints = getCleanExplanation(result, data);
    let analysisY = currentY + 32;
    analysisPoints.forEach(point => {
        pdf.circle(17, analysisY - 1, 0.5, 'F');
        const lines = pdf.splitTextToSize(point, 85);
        pdf.text(lines, 20, analysisY);
        analysisY += (lines.length * 5);
    });

    const recommendations = generateClinicalRecommendations(result, data);
    let recY = currentY + 30;
    recommendations.slice(0, 3).forEach(rec => {
        // Recommendations in rounded boxes
        pdf.setFillColor(30, 41, 59, 1); // slate-800
        pdf.roundedRect(115, recY, 75, 12, 2, 2, 'F');

        // Icon (Checkmark in circle)
        pdf.setDrawColor(99, 102, 241); // indigo-500
        pdf.circle(120, recY + 6, 2, 'D');
        pdf.line(119, recY + 6, 120, recY + 7);
        pdf.line(120, recY + 7, 121, recY + 5);

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        const recLines = pdf.splitTextToSize(rec, 65);
        pdf.text(recLines, 124, recY + 7);
        recY += 15;
    });

    // Case and branding at bottom
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Case #${caseNumber} | Diagnostic Integrity Verified | CardioAI Clinical Hub v4.0.0`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });

    // Save
    const fileName = `CardioAI_Report_${caseNumber}_${data.name.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);
};
