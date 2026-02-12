"""
Utility functions for generating AI-powered system notes based on patient risk analysis.
"""

def generate_system_notes(risk_level: str, risk_score: float, patient_data: dict) -> str:
    """
    Generate AI-powered system notes based on risk analysis.
    
    Args:
        risk_level: Risk level (Low, Medium, High)
        risk_score: Risk score (0-1)
        patient_data: Dictionary containing patient clinical data
    
    Returns:
        Formatted system notes string
    """
    notes = []
    
    # Risk-based primary message
    if risk_level == "High":
        notes.append("⚠️ **High cardiovascular risk detected.** Immediate consultation with a cardiologist is strongly recommended.")
        notes.append(f"AI Confidence: {risk_score * 100:.1f}%")
    elif risk_level == "Medium":
        notes.append("⚡ **Moderate risk indicators present.** Follow-up assessment recommended within 2-4 weeks.")
        notes.append(f"AI Confidence: {risk_score * 100:.1f}%")
    else:
        notes.append("✅ **Low cardiovascular risk.** No immediate alarming indicators detected.")
        notes.append(f"AI Confidence: {risk_score * 100:.1f}%")
    
    # Analyze specific risk factors
    concerns = []
    
    # Blood Pressure
    if patient_data.get('trestbps', 0) > 140:
        concerns.append(f"Elevated blood pressure ({patient_data['trestbps']} mm Hg)")
    
    # Cholesterol
    if patient_data.get('chol', 0) > 240:
        concerns.append(f"High cholesterol ({patient_data['chol']} mg/dl)")
    elif patient_data.get('chol', 0) > 200:
        concerns.append(f"Borderline high cholesterol ({patient_data['chol']} mg/dl)")
    
    # Exercise Angina
    if patient_data.get('exang', 0) == 1:
        concerns.append("Exercise-induced angina detected")
    
    # Heart Rate
    max_hr = patient_data.get('thalach', 0)
    age = patient_data.get('age', 50)
    expected_max_hr = 220 - age
    if max_hr < expected_max_hr * 0.7:
        concerns.append(f"Lower than expected max heart rate ({max_hr} bpm)")
    
    # ST Depression
    if patient_data.get('oldpeak', 0) > 2:
        concerns.append(f"Significant ST depression ({patient_data['oldpeak']})")
    
    if concerns:
        notes.append("\n**Key Concerns:**")
        for concern in concerns:
            notes.append(f"• {concern}")
    
    # Recommendations
    notes.append("\n**Recommendations:**")
    if risk_level == "High":
        notes.append("• Schedule immediate cardiology consultation")
        notes.append("• Consider stress test and echocardiogram")
        notes.append("• Monitor blood pressure and cholesterol levels closely")
    elif risk_level == "Medium":
        notes.append("• Schedule follow-up assessment in 2-4 weeks")
        notes.append("• Monitor blood pressure and lifestyle factors")
        notes.append("• Consider lifestyle modifications (diet, exercise)")
    else:
        notes.append("• Continue routine health monitoring")
        notes.append("• Maintain healthy lifestyle practices")
        notes.append("• Annual cardiovascular screening recommended")
    
    return "\n".join(notes)
