// PDF Generation Utility - Matches Results Page Format Exactly
import jsPDF from 'jspdf';
import { type PredictionResult, type PatientData } from './api';

export const generatePDF = async (
    result: PredictionResult,
    data: PatientData,
    doctorNotes?: string,
    doctorSignature?: string
) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
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
        const logoWidth = 30;
        const logoHeight = 15;
        pdf.addImage(logoImg, 'PNG', 10, 10, logoWidth, logoHeight);
    } catch (error) {
        console.warn('Logo not loaded, continuing without it');
    }

    // Header - Clinical Assessment Report
    pdf.setFontSize(22);
    pdf.setFont('Times-Roman', 'bold');
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.text('Cardiovascular Risk Assessment Report', 10, 32);

    // Date and Report ID (top right)
    pdf.setFontSize(10);
    pdf.setFont('Times-Roman', 'normal');
    pdf.setTextColor(100, 116, 139); // slate-500
    const assessmentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    pdf.text(assessmentDate, pdfWidth - 10, 15, { align: 'right' });
    pdf.setFontSize(8);
    pdf.text(`Report ID: ${result.record_id}`, pdfWidth - 10, 20, { align: 'right' });

    currentY = 40;

    // Risk Banner
    const riskColors: { [key: string]: [number, number, number] } = {
        'Low': [22, 163, 74],    // green-600
        'Medium': [202, 138, 4], // yellow-600
        'High': [220, 38, 38]    // red-600
    };
    const riskColor = riskColors[result.risk_level] || [71, 85, 105]; // slate-600

    pdf.setFillColor(...riskColor);
    pdf.rect(0, currentY, pdfWidth, 40, 'F');

    // Risk text
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('Times-Roman', 'bold');
    pdf.text(`${result.risk_level} Risk Detected`, pdfWidth / 2, currentY + 20, { align: 'center' });

    pdf.setFontSize(14);
    pdf.setFont('Times-Roman', 'normal');
    pdf.text(`AI Confidence Probability: ${(result.risk_score * 100).toFixed(1)}%`, pdfWidth / 2, currentY + 30, { align: 'center' });

    currentY += 50;

    // Patient Information Section
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(10, currentY, pdfWidth - 20, 25, 'F');

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(12);
    pdf.setFont('Times-Roman', 'bold');
    pdf.text('Patient Information', 15, currentY + 8);

    pdf.setFontSize(10);
    pdf.setFont('Times-Roman', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text('Full Name', 15, currentY + 15);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('Times-Roman', 'bold');
    pdf.text(data.name, 15, currentY + 20);

    if (data.contact) {
        pdf.setFont('Times-Roman', 'normal');
        pdf.setTextColor(100, 116, 139);
        pdf.text('Contact Detail', pdfWidth / 2 + 5, currentY + 15);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('Times-Roman', 'bold');
        pdf.text(data.contact, pdfWidth / 2 + 5, currentY + 20);
    }

    currentY += 35;

    // Clinical Data - Two Columns
    const leftColX = 15;
    const rightColX = pdfWidth / 2 + 5;

    // Patient Profile (Left Column)
    pdf.setFontSize(12);
    pdf.setFont('Times-Roman', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('Clinical Profile', leftColX, currentY);
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(226, 232, 240);
    pdf.line(leftColX, currentY + 1, leftColX + 80, currentY + 1);

    currentY += 8;

    const profileData = [
        ['Patient Age', `${data.age} years`],
        ['Patient Sex', data.sex === 1 ? 'Male' : 'Female'],
        ['Blood Pressure', `${data.trestbps} mm Hg`],
        ['Serum Chol.', `${data.chol} mg/dl`]
    ];

    profileData.forEach(([label, value]) => {
        pdf.setFontSize(9);
        pdf.setFont('Times-Roman', 'normal');
        pdf.setTextColor(100, 116, 139);
        pdf.text(label, leftColX, currentY);
        pdf.setFont('Times-Roman', 'bold');
        pdf.setTextColor(15, 23, 42);
        pdf.text(value, leftColX + 70, currentY, { align: 'right' });
        currentY += 6;
    });

    // Clinical Indicators (Right Column)
    currentY -= (profileData.length * 6 + 8); // Reset to top for right column

    pdf.setFontSize(12);
    pdf.setFont('Times-Roman', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('Diagnostic Indicators', rightColX, currentY);
    pdf.line(rightColX, currentY + 1, rightColX + 80, currentY + 1);


    currentY += 8;

    const clinicalData = [
        ['Chest Pain Type', `Type ${data.cp}`],
        ['Max Heart Rate', `${data.thalach} bpm`],
        ['ST Depression', `${data.oldpeak}`],
        ['Exercise Angina', data.exang === 1 ? 'Yes' : 'No']
    ];

    clinicalData.forEach(([label, value]) => {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        pdf.text(label, rightColX, currentY);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(15, 23, 42);
        pdf.text(value, rightColX + 70, currentY, { align: 'right' });
        currentY += 6;
    });

    currentY += 10;

    // AI Analysis Summary - Clean bullet point format
    pdf.setFillColor(241, 245, 249); // slate-100
    pdf.rect(10, currentY, pdfWidth - 20, 45, 'F');

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42); // Dark text for clarity
    pdf.text('AI Analysis Summary', 15, currentY + 8);

    currentY += 14;

    // Parse explanation into bullet points
    pdf.setFontSize(9.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(30, 41, 59); // Darker slate for better readability

    const analysisText = result.explanation || `The patient exhibits ${result.risk_level.toLowerCase()} risk markers based on provided clinical data. Professional review recommended.`;

    // Split by bullet characters or newlines
    const bullets = analysisText.split(/[•\n]/).filter(item => item.trim().length > 0);

    bullets.forEach((bullet) => {
        const cleanBullet = bullet.trim();
        if (cleanBullet) {
            // Add bullet point symbol
            pdf.setFont('helvetica', 'bold');
            pdf.text('•', 17, currentY);

            // Add bullet text
            pdf.setFont('helvetica', 'normal');
            const wrappedBullet = pdf.splitTextToSize(cleanBullet, pdfWidth - 35);
            pdf.text(wrappedBullet, 23, currentY);
            currentY += wrappedBullet.length * 4.2 + 1;
        }
    });

    currentY += 8;

    // Clinical Recommendations
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('Clinical Recommendations', 15, currentY);

    currentY += 6;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    const recommendations = [
        "- Schedule follow-up lipid profile in 3 months",
        "- Monitor daily blood pressure readings",
        "- Discuss low-sodium dietary adjustments"
    ];
    recommendations.forEach(rec => {
        pdf.text(rec, 15, currentY);
        currentY += 5;
    });

    currentY += 10;

    // Doctor Notes (if provided)
    if (doctorNotes && doctorNotes.trim()) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(15, 23, 42);
        pdf.text('Doctor Notes', 15, currentY);

        currentY += 6;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(51, 65, 85);
        const notesSplit = pdf.splitTextToSize(doctorNotes, pdfWidth - 30);
        pdf.text(notesSplit, 15, currentY);
        currentY += (notesSplit.length * 5) + 10;
    }

    // Signature (if provided)
    if (doctorSignature) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(15, 23, 42);
        pdf.text('Signature', 15, currentY);

        currentY += 6;
        try {
            pdf.addImage(doctorSignature, 'PNG', 15, currentY, 60, 20);
            currentY += 25;
        } catch (error) {
            console.warn('Failed to add signature to PDF');
        }
    }

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
    pdf.text('CardioAI - Clinical Heart Disease Prediction System', pdfWidth / 2, pdfHeight - 6, { align: 'center' });

    // Save PDF
    const fileName = `CardioAI_Report_${data.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
};
