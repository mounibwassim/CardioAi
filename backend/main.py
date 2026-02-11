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
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize App
app = FastAPI(title="CardioAI API", version="2.0", description="Clinical Heart Disease Prediction System")

# CORS - Strict Allow List
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://cardio-ai-frontend.vercel.app",
    "https://cardio-ai.vercel.app",
    "https://cardio-ai-pi.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model and Scaler (Absolute Paths)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
MODEL_PATH = os.path.join(MODELS_DIR, "heart_model.pkl")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.pkl")

model = None
scaler = None

# Rate Limiting for Login
login_attempts = {}

# Auth Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey123") # Change in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # bcrypt has a 72-byte limit - truncate if needed to prevent crashes
    if len(password.encode("utf-8")) > 72:
        password = password.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    conn.close()
    
    if user is None:
        raise credentials_exception
    return user

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
        hashed_default = get_password_hash("admin123")
        
        if not admin:
            c.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
                      ("admin", hashed_default, "doctor"))
            logger.info("Default admin user created: admin / admin123")
        else:
            # FORCE RESET PASSWORD ON STARTUP to ensure access
            c.execute("UPDATE users SET password_hash = ? WHERE username = 'admin'", (hashed_default,))
            logger.info("Admin password reset to default: admin / admin123")
            
        conn.commit()
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

class LoginRequest(BaseModel):
    username: str
    password: str

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

# Endpoints

@app.post("/register")
def register_user(user: RegisterRequest):
    conn = get_db_connection()
    c = conn.cursor()
    
    # Check if user exists
    existing_user = c.execute("SELECT * FROM users WHERE username = ?", (user.username,)).fetchone()
    if existing_user:
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    c.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
              (user.username, hashed_password, "doctor"))
    conn.commit()
    conn.close()
    
    logger.info(f"New doctor registered: {user.username}")
    return {"message": "Registration successful. You can now login."}

@app.post("/doctor/login")
def doctor_login(creds: LoginRequest):
    # Rate Limiting
    import time
    user_ip = "127.0.0.1" 
    
    current_time = time.time()
    if user_ip in login_attempts:
        attempts, last_time = login_attempts[user_ip]
        if current_time - last_time < 60: 
            if attempts >= 3:
                logger.warning(f"Login lockout for {creds.username}")
                raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 1 minute.")
        else:
            login_attempts[user_ip] = (0, current_time)
    
    # DB Validation
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (creds.username,)).fetchone()
    conn.close()

    # Verify Password
    authenticated = False
    if user:
        if verify_password(creds.password, user['password_hash']):
            authenticated = True
        elif user['password_hash'] == creds.password:
            # Auto-upgrade to bcrypt
            logger.info(f"Upgrading password for {creds.username} to bcrypt")
            new_hash = get_password_hash(creds.password)
            conn = get_db_connection()
            conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user['id']))
            conn.commit()
            conn.close()
            authenticated = True
        else:
             logger.warning(f"Password mismatch for user: {creds.username}")
    else:
        logger.warning(f"User not found: {creds.username}")

    if authenticated:
        # Success
        if user_ip in login_attempts:
             del login_attempts[user_ip]
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user['username'], "role": user['role']},
            expires_delta=access_token_expires
        )
             
        return {
            "token": access_token, 
            "role": user['role'],
            "name": user['username'].capitalize()
        }
    
    # Failure
    attempts = login_attempts.get(user_ip, (0, current_time))[0]
    login_attempts[user_ip] = (attempts + 1, current_time)
    
    logger.warning(f"Failed login attempt for {creds.username}")
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.post("/feedbacks")
def create_feedback(feedback: FeedbackCreate):
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Ensure schema correctness dynamically
        try:
            c.execute("SELECT name FROM feedbacks LIMIT 1")
        except:
            logger.info("Migrating DB: Adding name column to feedbacks")
            c.execute("ALTER TABLE feedbacks ADD COLUMN name TEXT")
            
        c.execute("INSERT INTO feedbacks (patient_id, name, rating, comment) VALUES (?, ?, ?, ?)",
                  (feedback.patient_id, feedback.name, feedback.rating, feedback.comment))
        conn.commit()
        conn.close()
        logger.info(f"Feedback saved for {feedback.name}")
        return {"message": "Feedback submitted successfully"}
    except Exception as e:
        logger.error(f"Feedback Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save feedback")

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
        risk_score = probabilities[1]  
        
        risk_level = "Low"
        if risk_score > 0.7:
            risk_level = "High"
        elif risk_score > 0.3:
            risk_level = "Medium"

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

# --- Email Logic ---
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email_to_owner(name: str, email: str, message: str) -> bool:
    # Defaults for Gmail if not set
    smtp_server = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    smtp_port_str = os.getenv("EMAIL_PORT", "587")
    
    try:
        smtp_port = int(smtp_port_str)
    except ValueError:
        smtp_port = 587

    sender_email = os.getenv("EMAIL_USER")
    # Support both EMAIL_PASS (old) and EMAIL_PASSWORD (new request)
    sender_password = os.getenv("EMAIL_PASSWORD") or os.getenv("EMAIL_PASS")

    if not sender_email or not sender_password:
        logger.error("Email credentials missing (EMAIL_USER or EMAIL_PASSWORD)")
        return False

    receiver_email = "mounibwassimm@gmail.com"  # Hardcoded owner email or use sender_email

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"New Contact Message from {name} - CardioAI"
    msg["From"] = sender_email
    msg["To"] = receiver_email

    text = f"""
    New message received:

    Name: {name}
    Email: {email}
    Message:
    {message}
    """

    msg.attach(MIMEText(text, "plain"))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())
        logger.info(f"Email sent successfully from {sender_email} to {receiver_email}")
        return True
    except Exception as e:
        logger.error(f"Email error: {e}")
        return False

@app.post("/contact")
def send_contact_email(request: ContactRequest):
    success = send_email_to_owner(
        request.name,
        request.email,
        request.message
    )

    if not success:
        # 500 might be too harsh if we want frontend to just show "received" even if email fails?
        # But user requested raising 500 on failure in their snippet.
        logger.error("Failed to send contact email.")
        # raise HTTPException(status_code=500, detail="Email failed") 
        # Better UX: Return success but log error so user isn't discouraged, 
        # unless strictly required. User asked for:
        # if not success: raise HTTPException...
        # I will follow their request.
        raise HTTPException(status_code=500, detail="Failed to send email. Please try again later.")

    return {"message": "Message sent successfully"}

@app.get("/debug/users")
def get_all_users():
    """Temporary debug endpoint to verify seeded users."""
    conn = get_db_connection()
    users = conn.execute("SELECT id, username, role, created_at FROM users").fetchall()
    conn.close()
    return {"users": [dict(u) for u in users], "note": "Password hashes are hidden."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
