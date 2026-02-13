/**
 * Unified Clinical Recommendations Engine
 * Single Source of Truth for both UI display and PDF generation.
 */

export interface ClinicalResult {
    risk_level: string;
    risk_score: number;
}

export interface PredictionData {
    trestbps: number;
    chol: number;
    oldpeak: number;
    thalach: number;
    age: number;
    [key: string]: any;
}

export const generateClinicalRecommendations = (result: ClinicalResult, data: PredictionData): string[] => {
    const recommendations: string[] = [];

    // Risk-based lifestyle/routine advice
    if (result.risk_level === 'High' || result.risk_level === 'Critical') {
        recommendations.push("Immediate clinical consultation with a cardiologist is mandatory.");
        recommendations.push("Implement a strict low-sodium (DASH) diet immediately; avoid processed meats and high-sugar beverages.");
        recommendations.push("Increase water intake (2-3L daily) and completely eliminate alcohol and tobacco.");
        recommendations.push("Limit strenuous physical activity until cleared by a specialist; prioritize rest.");
        recommendations.push("Monitor blood pressure and heart rate twice daily and maintain a log.");
    } else if (result.risk_level === 'Medium') {
        recommendations.push("Schedule a follow-up assessment and baseline ECG within 14 days.");
        recommendations.push("Transition to a Mediterranean-style diet (rich in olive oil, nuts, and leafy greens).");
        recommendations.push("Engage in light aerobic activity (brisk walking) for 30 minutes, 5 days a week.");
        recommendations.push("Replace caffeinated beverages with herbal teas or mineral water.");
        recommendations.push("Monitor stress levels and prioritize 7-8 hours of quality sleep.");
    } else {
        recommendations.push("Maintain current healthy lifestyle and continue regular aerobic exercise.");
        recommendations.push("Continue focus on whole foods and lean proteins; maintain hydration.");
        recommendations.push("Annual cardiovascular screening is recommended for proactive health management.");
        recommendations.push("Ensure adequate intake of Omega-3 fatty acids and antioxidants.");
    }

    // Dynamic factor-based professional notes
    if (data.trestbps > 140) {
        recommendations.push(`Persistent hypertension management required for reading of ${data.trestbps} mm Hg.`);
    }

    if (data.chol > 240) {
        recommendations.push("Consider clinical management for severe hyperlipidemia markers.");
    }

    return recommendations;
};

export const getCleanExplanation = (result: ClinicalResult, data: PredictionData): string[] => {
    const points = [
        `Patient (Age ${data.age}) stratified into ${result.risk_level.toUpperCase()} risk category.`,
        `AI Analysis indicates a cardiovascular risk probability of ${(result.risk_score * 100).toFixed(1)}%.`,
        "Primary indicators analyzed: hemodynamic markers, lipid profile, and metabolic factors.",
        "Diagnostic logic derived from multi-vector clinical pattern recognition."
    ];

    if (data.trestbps > 130) points.push("Elevated resting blood pressure detected; significant risk multiplier.");
    if (data.thalach < 120 && data.age < 60) points.push("Sub-optimal peak heart rate observed relative to age group.");
    if (data.oldpeak > 1.5) points.push("ST-segment depression indicates potential myocardial ischemia during exertion.");

    return points;
};
