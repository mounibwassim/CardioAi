"""
Utility functions for generating AI-powered system notes based on patient risk analysis.
"""

def generate_system_notes(risk_level: str, risk_score: float, patient_data: dict) -> str:
    """
    Generate professional medical AI analysis summary.
    """
    prob_percent = risk_score * 100
    
    # Professional Medical Format
    summary = [
        f"AI Analysis Summary",
        f"The patient presents a calculated cardiovascular risk probability of {prob_percent:.1f}%. "
        f"Clinical indicators including specific cardiac markers significantly contribute to the overall risk profile. "
        f"The model classifies this case as {risk_level} Risk based on a threshold ≥{'70%' if risk_level == 'High' else '40%' if risk_level == 'Medium' else 'standard clinical bounds'}."
    ]
    
    # Specific Indications
    concerns = []
    if patient_data.get('trestbps', 0) > 140:
        concerns.append(f"Elevated systolic blood pressure ({patient_data['trestbps']} mm Hg)")
    if patient_data.get('chol', 0) > 200:
        concerns.append(f"Elevated cholesterol levels ({patient_data['chol']} mg/dl)")
    if patient_data.get('oldpeak', 0) > 2.0:
        concerns.append(f"Significant ST depression ({patient_data['oldpeak']})")
        
    if concerns:
        summary.append("\nContributing Factors:")
        for c in concerns:
            summary.append(f"- {c}")

    # Recommendations
    summary.append("\nClinical Recommendations:")
    if risk_level == "High":
        summary.append("- Schedule immediate cardiology consultation")
        summary.append("- Stress test and echocardiogram recommended")
    elif risk_level == "Medium":
        summary.append("- Follow-up lipid profile in 3-6 months")
        summary.append("- Monitor daily blood pressure readings")
    else:
        summary.append("- Continue routine health monitoring")
        summary.append("- Annual cardiovascular screening recommended")
        
    final_text = "\n".join(summary)
    
    # Remove markdown stars for production stability
    return final_text.replace("**", "")
