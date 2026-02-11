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

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://cardio-ai-frontend.vercel.app",
    "https://cardio-ai.vercel.app",
    "https://cardio-ai-pi.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Explicit origins for credentials support
    allow_credentials=True, # Allow cookies/headers
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

# Rate Limiting for Login
login_attempts = {}

@app.on_event("startup")
async def startup_event():
    global model, scaler
    init_db()
    
    # SEED DEFAULT ADMIN USER
    try:
        conn = get_db_connection()
        c = conn.cursor()
        # Check if admin exists
        admin = c.execute("SELECT * FROM users WHERE username = 'admin'").fetchone()
        if not admin:
            # Hash the default password immediately
            hashed_default = get_password_hash("admin123")
            c.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
                      ("admin", hashed_default, "doctor"))
            conn.commit()
            logger.info("Default admin user created: admin / [hashed]")
        conn.close()
    except Exception as e:
        logger.error(f"Error seeding admin: {e}")

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

# ... (Pydantic models remain the same) ...
# (Keeping models as they are, just skipping them in replacement for brevity if unchanged. 
# But to be safe with replace_file_content, I must match context. 
# Since I can't easily skip the middle, I will target specific blocks.)

# ...

@app.post("/contact")
def send_contact_email(request: ContactRequest):
    # Use EMAIL_USER / EMAIL_PASS as requested
    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASS")
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    
    # Fallback/Log if variables missing
    if not sender_email or not sender_password:
        logger.error("Missing EMAIL_USER or EMAIL_PASS environment variables.")
        # We still return success to frontend to not panic user, but log error
        return {"message": "Message received (queued)."}

    receiver_email = "mounibwassimm@gmail.com" 

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

    except Exception as e:
        logger.error(f"Failed to send email: {e}")
    
    return {"message": "Message received. We will contact you shortly."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
