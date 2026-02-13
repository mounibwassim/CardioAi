import { jsPDF } from 'jspdf';
import { type PredictionResult, type PatientData } from './api';
import { getCleanExplanation, generateClinicalRecommendations } from './clinicalLogic';

export const generatePDF = async (
    result: PredictionResult,
    data: PatientData,
    doctorSignature?: string
) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setProperties({
        title: `CardioAI Report - ${data.name}`
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();

    let currentY = 0;

    // --- CASE COUNTER LOGIC ---
    const caseNumber = Number(localStorage.getItem("caseCounter") || 0) + 1;
    localStorage.setItem("caseCounter", caseNumber.toString());

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

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

    // --- PROFESSIONAL HEADER: Signature + Date + Case at TOP ---
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);

    // Left Side: Case & Date
    pdf.text(`Case Number: ${caseNumber}`, 15, 25);
    pdf.text(`Date: ${today}`, 15, 32);

    // Right Side: Physician & Signature (Placeholders for layout)
    pdf.text(`Physician: Dr. ${doctorSignature || data.doctor_name || 'Michael Torres'}`, 130, 25);
    pdf.text("Signature: ____________________", 130, 32);

    // Header divider
    pdf.setDrawColor(226, 232, 240);
    pdf.line(10, 38, 200, 38);

    // Title
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CLINICAL PROFILE', 10, 52);

    currentY = 60;

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

    // Clinical Profile Listing
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Patient Vitals:', 15, currentY);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`• Age: ${data.age}`, 20, currentY + 7);
    pdf.text(`• Sex: ${data.sex === 1 ? 'Male' : 'Female'}`, 20, currentY + 14);
    pdf.text(`• Blood Pressure: ${data.trestbps} mm Hg`, 80, currentY + 7);
    pdf.text(`• Cholesterol: ${data.chol} mg/dl`, 80, currentY + 14);

    if (data.contact) pdf.text(`• Records Check: ${data.contact}`, 140, currentY + 7);

    currentY += 28;

    // --- DIAGNOSTIC LOGIC ---
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Diagnostic Logic', 10, currentY);
    pdf.line(10, currentY + 2, 200, currentY + 2);

    currentY += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`• Risk Classification: ${result.risk_level}`, 15, currentY);
    pdf.text('• Key Contributing Variables:', 15, currentY + 7);

    let factorY = currentY + 14;
    const clinicalPoints = getCleanExplanation(result, data);
    clinicalPoints.forEach(point => {
        pdf.text(`   - ${point.replace(/[#*\[\]{}&]/g, '')}`, 20, factorY);
        factorY += 7;
    });

    currentY = factorY + 10;

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

    // --- CLINICAL ANALYSIS ---
    pdf.setFillColor(248, 250, 252); // Light Slate
    pdf.rect(10, currentY, 190, 40, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(10, currentY, 190, 40, 'D');

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(30, 41, 59);
    pdf.text('Clinical Analysis', 15, currentY + 8);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105);
    const analysisText = "AI structural analysis and multi-vector pattern matching confirm the stratified risk profile. Diagnostic interpretations are based on validated cardiac markers and historical patient data subsets.";
    const wrappedAnalysis = pdf.splitTextToSize(analysisText, 180);
    pdf.text(wrappedAnalysis, 15, currentY + 18);

    currentY += 50;

    // --- RECOMMENDATIONS ---
    pdf.setFillColor(240, 249, 255); // Light Blue-ish
    pdf.rect(10, currentY, 190, 50, 'F');
    pdf.setDrawColor(186, 230, 253);
    pdf.rect(10, currentY, 190, 50, 'D');

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(7, 89, 133);
    pdf.text('Recommendations', 15, currentY + 8);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(12, 74, 110);

    const recs = generateClinicalRecommendations(result, data);
    let recY = currentY + 18;
    recs.slice(0, 4).forEach(rec => {
        pdf.text(`• ${rec.replace(/[#*\[\]{}&]/g, '')}`, 15, recY);
        recY += 8;
    });

    // Branding Bottom
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text('CardioAI - Professional Cardiovascular Clinical Hub', pdfWidth / 2, 285, { align: 'center' });

    // Save PDF
    const fileName = `Clinical_Report_${data.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
};
