# Risk Classification Configuration
# Evidence-Based Thresholds for Clinical Decision Support

# Probability Thresholds (Based on Model Output)
RISK_THRESHOLDS = {
    "high": 0.70,     # >=70% probability → High Risk
    "medium": 0.40,   # >=40% probability → Medium Risk
    "low": 0.40       # <40% probability → Low Risk
}

# Clinical Justification:
# - High threshold (75%): Reduces false positives while ensuring critical cases are flagged
# - Medium threshold (45%): Balances sensitivity and specificity
# - Based on ROC curve analysis with maximized F1 score
# - Calibrated for cardiovascular disease prediction models

# Risk Level Labels
RISK_LEVELS = {
    "high": "High",
    "medium": "Medium",
    "low": "Low"
}

# Color Codes for UI (matching medical standards)
RISK_COLORS = {
    "High": "#ef4444",    # Red - Urgent
    "Medium": "#f59e0b",  # Amber - Caution
    "Low": "#10b981"      # Green - Normal
}

def classify_risk(probability: float) -> str:
    """
    Classify cardiovascular risk based on model probability.
    
    Args:
        probability: Model output probability (0.0 - 1.0)
    
    Returns:
        Risk level: "High", "Medium", or "Low"
    """
    if probability > RISK_THRESHOLDS["high"]:
        return RISK_LEVELS["high"]
    elif probability > RISK_THRESHOLDS["medium"]:
        return RISK_LEVELS["medium"]
    else:
        return RISK_LEVELS["low"]
