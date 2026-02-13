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

    // Base recommendations by risk level
    if (result.risk_level === 'High' || result.risk_level === 'Critical') {
        recommendations.push("Schedule follow-up lipid profile and cardiovascular diagnostic assessment within 1-2 weeks");
        recommendations.push("Immediate clinical review of current blood pressure and cholesterol medication");
        recommendations.push("Daily blood pressure and symptomatic monitoring required");
    } else if (result.risk_level === 'Medium') {
        recommendations.push("Schedule follow-up lipid profile and baseline ECG within 4-6 weeks");
        recommendations.push("Implement heart-healthy dietary modifications (low sodium, reduced saturated fats)");
        recommendations.push("Weekly blood pressure monitoring is recommended");
    } else {
        recommendations.push("Maintain current healthy lifestyle and exercise regimen");
        recommendations.push("Annual cardiovascular screening recommended");
        recommendations.push("Monitor dietary sodium intake and maintain balanced nutritional profile");
    }

    // Dynamic factor-based recommendations
    if (data.trestbps > 140) {
        recommendations.push(`Monitor persistent hypertension indicator (${data.trestbps} mm Hg)`);
    }

    if (data.chol > 240) {
        recommendations.push("Discuss clinical management for hyperlipidemia indicator");
    }

    if (data.oldpeak > 2.0) {
        recommendations.push("Investigate ST-segment depression in subsequent stress testing");
    }

    return recommendations;
};

export const getCleanExplanation = (result: ClinicalResult, data: PredictionData): string => {
    return `The patient (age: ${data.age}) presents a cardiovascular risk probability of ${(result.risk_score * 100).toFixed(1)}%. This assessment is derived from multi-vector analysis including hemodynamic markers and clinical diagnostic indicators. Current stratification: ${result.risk_level.toUpperCase()}.`;
};
