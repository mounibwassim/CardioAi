from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import pickle
import numpy as np
import os
import json
import logging
from typing import List, Optional
from database import init_db, wipe_data, get_db_connection

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize App
app = FastAPI(title="CardioAI API", version="2.0", description="Clinical Heart Disease Prediction System")

# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://cardio-ai-frontend.vercel.app", # Add Vercel domain
    "https://cardio-ai.vercel.app",
    "*" # Temporary for debugging if needed, but specific is better
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for now to rule out CORS issues
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model and Scaler (Absolute Paths)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, '..', 'models')
MODEL_PATH = os.path.join(MODELS_DIR, "heart_model.pkl")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.pkl")

model = None
scaler = None

@app.on_event("startup")
async def startup_event():
    global model, scaler
    init_db()
    try:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
            logger.error(f"Model files not found at {MODELS_DIR}")
        else:
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            with open(SCALER_PATH, "rb") as f:
                scaler = pickle.load(f)
            logger.info(f"Model loaded successfully from {MODEL_PATH}")
    except Exception as e:
        logger.error(f"CRITICAL ERROR loading model: {e}")

# Pydantic Models
class PatientData(BaseModel):
    age: int
    sex: int
    cp: int
    trestbps: int
    chol: int
    fbs: int
    restecg: int
    thalach: int
    exang: int
    oldpeak: float
    slope: int
    ca: int
    thal: int

class PredictionResult(BaseModel):
    prediction: int
    risk_score: float
    risk_level: str

class PatientCreate(BaseModel):
    name: str
    age: int
    sex: int
    contact: Optional[str] = None

class FeedbackCreate(BaseModel):
    name: str
    rating: int
    comment: str
    patient_id: Optional[int] = None

@app.post("/feedbacks")
def create_feedback(feedback: FeedbackCreate):
    conn = get_db_connection()
    c = conn.cursor()
    # Ensure table has name column if it was created before
    try:
        c.execute("ALTER TABLE feedbacks ADD COLUMN name TEXT")
    except:
        pass # Column likely exists
        
    c.execute("INSERT INTO feedbacks (patient_id, name, rating, comment) VALUES (?, ?, ?, ?)",
              (feedback.patient_id, feedback.name, feedback.rating, feedback.comment))
    conn.commit()
    conn.close()
    return {"message": "Feedback submitted successfully"}

class ContactRequest(BaseModel):
    name: str
    email: str # Relaxed from EmailStr to prevent validation errors if package missing
    message: str

# Endpoints
@app.get("/")
def read_root():
    return {"message": "CardioAI Clinical API v2.0 is running"}

@app.post("/predict", response_model=PredictionResult)
def predict_heart_disease(data: PatientData):
    logger.info(f"Prediction requested for: {data.dict()}")
    
    if model is None or scaler is None:
        logger.error("Model or Scaler not loaded.")
        raise HTTPException(status_code=500, detail="Model service unavailable")

    try:
        # Preprocess
        input_data = np.array([[ 
            data.age, data.sex, data.cp, data.trestbps, data.chol, 
            data.fbs, data.restecg, data.thalach, data.exang, 
            data.oldpeak, data.slope, data.ca, data.thal 
        ]])
        
        scaled_data = scaler.transform(input_data)
        
        # Predict
        prediction = model.predict(scaled_data)[0]
        probabilities = model.predict_proba(scaled_data)[0]
        risk_score = probabilities[1]  # Probability of class 1 (Heart Disease)

        risk_level = "Low"
        if risk_score > 0.7:
            risk_level = "High"
        elif risk_score > 0.3:
            risk_level = "Medium"

        # Log Result
        logger.info(f"Prediction success. Risk: {risk_score:.2f} ({risk_level})")
        
        # TODO: Save to 'records' table here if patient_id was provided
        
        return {
            "prediction": int(prediction),
            "risk_score": float(risk_score),
            "risk_level": risk_level
        }
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/patients")
def create_patient(patient: PatientCreate):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("INSERT INTO patients (name, age, sex, contact) VALUES (?, ?, ?, ?)",
              (patient.name, patient.age, patient.sex, patient.contact))
    conn.commit()
    patient_id = c.lastrowid
    conn.close()
    return {"id": patient_id, "message": "Patient created successfully"}

@app.get("/patients")
def get_patients():
    conn = get_db_connection()
    patients = conn.execute("SELECT * FROM patients ORDER BY created_at DESC").fetchall()
    conn.close()
    return {"patients": [dict(p) for p in patients]}



@app.get("/feedbacks")
def get_feedbacks():
    conn = get_db_connection()
    feedbacks = conn.execute("SELECT * FROM feedbacks ORDER BY created_at DESC").fetchall()
    conn.close()
    return {"feedbacks": [dict(p) for p in feedbacks]}

@app.post("/reset")
def reset_database():
    wipe_data()
    return {"message": "System reset complete. All data wiped."}

@app.post("/contact")
def send_contact_email(request: ContactRequest):
    sender_email = os.getenv("MAIL_USERNAME", "noreply@cardioai.com")
    sender_password = os.getenv("MAIL_PASSWORD", "")
    smtp_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("MAIL_PORT", "587"))
    
    receiver_email = "mounibwassimm@gmail.com" # Updated admin email

    message = f"""\
Subject: New Contact Request: {request.name}

Name: {request.name}
Email: {request.email}

Message:
{request.message}
"""

    try:
        # Log the attempt
        logger.info(f"Sending email from {sender_email} to {receiver_email}")
        
        # Only attempt actual send if password is set
        if sender_password:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = receiver_email
            msg['Subject'] = f"New Contact Request: {request.name}"
            msg.attach(MIMEText(message, 'plain'))

            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())
            server.quit()
            logger.info("Email sent successfully.")
        else:
            logger.warning("Email password not set. Skipping SMTP send.")

    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        # Don't fail the request, just log the error
    
    return {"message": "Message received. We will contact you shortly."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
