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

export const generateClinicalRecommendations = (result: ClinicalResult, _data: PredictionData): string[] => {
    const risk = result.risk_level;

    if (risk === "Low") {
        return [
            "Maintain regular annual cardiovascular screening.",
            "Continue balanced diet and moderate exercise (30 min daily).",
            "Avoid tobacco and limit alcohol intake.",
        ];
    }

    if (risk === "Medium") {
        return [
            "Schedule lipid profile reassessment within 3 months.",
            "Adopt structured low-sodium and low-saturated-fat diet.",
            "Monitor blood pressure daily and log readings.",
            "Initiate moderate cardiovascular training under supervision.",
        ];
    }

    if (risk === "High" || risk === "Critical") {
        return [
            "Immediate cardiology consultation recommended.",
            "Begin strict antihypertensive monitoring routine.",
            "Implement medically supervised dietary modification.",
            "Avoid strenuous physical exertion until cleared.",
            "Daily symptom tracking required.",
        ];
    }

    return ["Professional clinical review recommended."];
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

    return points.map(p => p.replace(/[#*\[\]{}&]/g, ''));
};
