"""
Utility functions for generating AI-powered system notes based on patient risk analysis.
"""

def generate_system_notes(risk_level: str, risk_score: float, patient_data: dict) -> str:
    """
    Generate professional medical AI analysis summary.
    """
    prob_percent = risk_score * 100
    
    # Clinical Analysis Table
    summary = [
        "### [AI Analysis Summary]",
        f"The patient presents a cardiovascular risk probability of {prob_percent:.1f}%.",
        f"This classification is derived from a multi-vector Random Forest model baseline.",
        "",
        "### [Contributing Factors]"
    ]
    
    concerns = []
    if patient_data.get('trestbps', 0) > 140:
        concerns.append(f"Hypertension indicator ({patient_data['trestbps']} mm Hg)")
    if patient_data.get('chol', 0) > 200:
        concerns.append(f"Hyperlipidemia indicator ({patient_data['chol']} mg/dl)")
    if patient_data.get('oldpeak', 0) > 2.0:
        concerns.append(f"ST-segment depression ({patient_data['oldpeak']})")
    if patient_data.get('thalach', 0) < 60:
         concerns.append(f"Bradycardia risk ({patient_data['thalach']} bpm)")
        
    if concerns:
        for c in concerns:
            summary.append(f"- {c}")
    else:
        summary.append("- No acute pathological markers detected in vitals.")

    # Standardized Clinical Recommendations (V20)
    summary.append("")
    summary.append("### [Clinical Recommendations]")
    if risk_level == "High":
        summary.append("- [URGENT] 12-lead ECG and cardiac enzyme profiling.")
        summary.append("- [URGENT] Immediate cardiology consultation for diagnostic confirmation.")
        summary.append("- Initiate aggressive lifestyle intervention and pharmacological review.")
    elif risk_level == "Medium":
        summary.append("- Schedule follow-up lipid profile and stress testing (4-6 weeks).")
        summary.append("- Implement dietary modifications (low sodium, heart-healthy).")
        summary.append("- Daily blood pressure and symptom monitoring required.")
    else:
        summary.append("- Maintain regular annual cardiovascular screenings.")
        summary.append("- Continue standard preventative health measures and exercise.")
        summary.append("- Re-assess risk if new clinical symptoms emerge.")
        
    return "\n".join(summary)
