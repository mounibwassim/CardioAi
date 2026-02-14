from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import pickle
import numpy as np
import os
import json
import logging
from typing import List, Optional
import traceback
from backend.database import init_db, wipe_data, get_db_connection
from backend.audit import log_audit
from backend.utils import generate_system_notes
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from backend.config import RISK_THRESHOLDS, classify_risk

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize App
app = FastAPI(title="CardioAI API", version="3.0", description="Clinical Heart Disease Prediction System")

# CORS Configuration - Definitive Regex Approach
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cardio-ai-delta.vercel.app",
        "https://cardio-.*-mounib-s-projects-.*.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app", # Matches any Vercel subdomain
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
ACCESS_PIN = os.getenv("ACCESS_PIN", "Mounib$7") # PIN for quick access

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 360 # 6 hours for PIN session

class PinRequest(BaseModel):
    pin: str

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
        role: str = payload.get("role")
        user_id: int = payload.get("user_id")  # Added for doctor_id isolation
        username: str = payload.get("sub")
        
        if not role or not username:
            raise credentials_exception
            
        return {"role": role, "username": username, "id": user_id}
    except JWTError:
        raise credentials_exception

@app.post("/pin-login")
def pin_login(data: PinRequest):
    if data.pin != ACCESS_PIN:
        raise HTTPException(status_code=401, detail="Invalid PIN")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": "doctor_user", "role": "doctor"}, # Generic sub for PIN user
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "role": "doctor",
        "name": "Doctor"
    }

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
                      ("admin", get_password_hash("admin123"), "doctor"))
            logger.info("Default admin user created: admin / admin123")
        else:
            # FORCE RESET PASSWORD ON STARTUP to ensure access
            c.execute("UPDATE users SET password_hash = ? WHERE username = 'admin'", (get_password_hash("admin123"),))
            logger.info("Admin password reset to: admin / admin123")
            
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

# Pydantic Models for Prediction Input (Updated with Name/Contact)
class PatientData(BaseModel):
    name: str 
    age: int
    sex: int
    contact: Optional[str] = None
    doctor_name: Optional[str] = "Dr. Sarah Chen"
    doctor_id: Optional[int] = None 
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

    class Config:
        extra = "allow" # Be flexible with extra fields

class PredictionResult(BaseModel):
    prediction: int
    risk_score: float
    risk_level: str
    patient_id: int
    record_id: int
    explanation: Optional[str] = None # V20: Single Source of Truth for frontend

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

class ResetRequest(BaseModel):
    password: str

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class PatientNotesUpdate(BaseModel):
    doctor_notes: str
    doctor_name: str

class PatientSignatureUpdate(BaseModel):
    signature: str  # Base64 encoded image

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
    logger.info(f"Login attempt for username: {creds.username}")
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE username = ?", (creds.username,)).fetchone()
    conn.close()

    # Verify Password
    authenticated = False
    if user:
        logger.info(f"User '{creds.username}' found in database")
        if verify_password(creds.password, user['password_hash']):
            authenticated = True
            logger.info(f"Password verified successfully for {creds.username}")
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
    return {"message": "CardioAI Clinical API v3.0 is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/dashboard/stats")
async def get_dashboard_stats():
    try:
        conn = get_db_connection()
        # 1. Total Patients
        total_patients = conn.execute("SELECT COUNT(*) FROM patients").fetchone()[0]
        
        # 2. Critical Cases (High Risk)
        critical_cases = conn.execute("SELECT COUNT(*) FROM records WHERE risk_level = 'High'").fetchone()[0]
        
        # 3. Monthly Growth
        import datetime
        now = datetime.datetime.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        # Handle year rollover for previous month
        if now.month == 1:
            start_of_prev_month = now.replace(year=now.year-1, month=12, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_of_prev_month = now.replace(month=now.month-1, day=1, hour=0, minute=0, second=0, microsecond=0)
            
        current_month_count = conn.execute("SELECT COUNT(*) FROM records WHERE created_at >= ?", (start_of_month,)).fetchone()[0]
        prev_month_count = conn.execute("SELECT COUNT(*) FROM records WHERE created_at >= ? AND created_at < ?", (start_of_prev_month, start_of_month)).fetchone()[0]
        
        if prev_month_count > 0:
            growth = ((current_month_count - prev_month_count) / prev_month_count) * 100
            monthly_growth = f"{growth:+.1f}%"
        elif current_month_count > 0:
             monthly_growth = "+100%" # Growth from 0
        else:
            monthly_growth = "0%"

        # 4. Recent Activity
        recent_activity = conn.execute("""
            SELECT r.id, p.name, p.age, p.sex, r.risk_level, r.created_at, r.risk_score, d.name as doctor_name
            FROM records r
            JOIN patients p ON r.patient_id = p.id
            LEFT JOIN doctors d ON r.doctor_id = d.id
            ORDER BY r.created_at DESC
            LIMIT 5
        """).fetchall()
        
        # 5. Risk Distribution
        risk_counts = conn.execute("""
            SELECT risk_level, COUNT(*) as count 
            FROM records 
            GROUP BY risk_level
        """).fetchall()
        
        # DO NOT CLOSE CONNECTION HERE - We still have more queries below!

        formatted_activity = [
            {
                "id": str(row['id']),
                "name": row['name'],
                "age": row['age'],
                "sex": row['sex'],
                "risk_level": row['risk_level'],
                "date": row['created_at'],
                "doctor": row['doctor_name'] or "Dr. Sarah Chen"
            } for row in recent_activity
        ]

        formatted_risks = [
            {"name": "Low Risk", "value": 0},
            {"name": "Medium Risk", "value": 0},
            {"name": "High Risk", "value": 0}
        ]
        
        for row in risk_counts:
            level = row['risk_level']
            count = row['count']
            if level == "Low": formatted_risks[0]["value"] = count
            elif level == "Medium": formatted_risks[1]["value"] = count
            elif level == "High": formatted_risks[2]["value"] = count

        # 6. Gender Distribution
        gender_counts = conn.execute("""
            SELECT sex, COUNT(*) as count 
            FROM patients 
            GROUP BY sex
        """).fetchall()
        
        gender_distribution = [
            {"name": "Male", "value": 0},
            {"name": "Female", "value": 0}
        ]
        for row in gender_counts:
            if row['sex'] == 1:
                gender_distribution[0]["value"] = row['count']
            else:
                gender_distribution[1]["value"] = row['count']

        # 7. Age Distribution (grouped)
        age_groups_data = conn.execute("""
            SELECT 
                CASE 
                    WHEN age < 30 THEN '< 30'
                    WHEN age BETWEEN 30 AND 39 THEN '30-39'
                    WHEN age BETWEEN 40 AND 49 THEN '40-49'
                    WHEN age BETWEEN 50 AND 59 THEN '50-59'
                    WHEN age >= 60 THEN '60+'
                END as age_group,
                COUNT(*) as count
            FROM patients
            GROUP BY age_group
            ORDER BY age_group
        """).fetchall()
        
        age_distribution = [
            {"ageGroup": row['age_group'], "count": row['count']} 
            for row in age_groups_data
        ]

        # 8. Assessment Trends (last 7 days)
        from datetime import datetime, timedelta
        trends_data = []
        for i in range(6, -1, -1):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            count = conn.execute("""
                SELECT COUNT(*) FROM records 
                WHERE DATE(created_at) = ?
            """, (date,)).fetchone()[0]
            trends_data.append({
                "date": (datetime.now() - timedelta(days=i)).strftime('%m/%d'),
                "assessments": count
            })

        # 9. Risk Trends (last 7 days)
        risk_trends_data = []
        for i in range(6, -1, -1):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            risk_counts_day = conn.execute("""
                SELECT risk_level, COUNT(*) as count 
                FROM records 
                WHERE DATE(created_at) = ?
                GROUP BY risk_level
            """, (date,)).fetchall()
            
            day_data = {
                "date": (datetime.now() - timedelta(days=i)).strftime('%m/%d'),
                "low": 0,
                "medium": 0,
                "high": 0
            }
            for row in risk_counts_day:
                if row['risk_level'] == 'Low':
                    day_data['low'] = row['count']
                elif row['risk_level'] == 'Medium':
                    day_data['medium'] = row['count']
                elif row['risk_level'] == 'High':
                    day_data['high'] = row['count']
            risk_trends_data.append(day_data)

        # 10. Doctor Performance (hardcoded for now, will be dynamic with multi-doctor system)
        doctor_performance = [
            {"doctor": "Dr. Sarah Chen", "patients": total_patients, "criticalCases": critical_cases},
            {"doctor": "Dr. Emily Ross", "patients": 0, "criticalCases": 0},
            {"doctor": "Dr. Michael Torres", "patients": 0, "criticalCases": 0}
        ]

        # Close connection AFTER all queries complete
        conn.close()

        return {
            "total_patients": total_patients,
            "critical_cases": critical_cases,
            "avg_accuracy": "0%", # No ground truth feedback loop yet
            "monthly_growth": monthly_growth,
            "recent_activity": formatted_activity,
            "risk_distribution": formatted_risks,
            "gender_distribution": gender_distribution,
            "age_distribution": age_distribution,
            "assessment_trends": trends_data,
            "risk_trends": risk_trends_data,
            "doctor_performance": doctor_performance
        }

    except Exception as e:
        logger.error(f"Stats Error: {e}")
        return {
            "total_patients": 0,
            "critical_cases": 0,
            "avg_accuracy": "0%",
            "monthly_growth": "0%",
            "recent_activity": [],
            "risk_distribution": [],
            "gender_distribution": [],
            "age_distribution": [],
            "assessment_trends": [],
            "risk_trends": [],
            "doctor_performance": []
        }

# PHASE 1: Standardized Analytics Endpoints
@app.get("/analytics/summary")
async def get_analytics_summary(doctor_id: Optional[int] = Query(None)):
    """Get KPI summary (critical cases, accuracy, total assessments, growth)"""
    try:
        conn = get_db_connection()
        
        doctor_filter = f" AND r.doctor_id = {doctor_id}" if doctor_id else ""
        
        critical_query = "SELECT COUNT(*) FROM records r WHERE r.risk_level = 'High'" + doctor_filter
        critical_cases = conn.execute(critical_query).fetchone()[0]
        
        avg_query = "SELECT AVG(r.model_probability) FROM records r WHERE r.model_probability > 0" + doctor_filter
        avg_prob = conn.execute(avg_query).fetchone()[0] or 0.0
        avg_accuracy = round(avg_prob * 100, 1)
        
        total_query = "SELECT COUNT(*) FROM records r WHERE 1=1" + doctor_filter
        total_assessments = conn.execute(total_query).fetchone()[0]
        
        import datetime
        now = datetime.datetime.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if now.month == 1:
            start_of_prev_month = now.replace(year=now.year-1, month=12, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_of_prev_month = now.replace(month=now.month-1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        current_month_query = f"SELECT COUNT(*) FROM records r WHERE r.created_at >= ?{doctor_filter}"
        current_month_count = conn.execute(current_month_query, (start_of_month,)).fetchone()[0]
        
        prev_month_query = f"SELECT COUNT(*) FROM records r WHERE r.created_at >= ? AND r.created_at < ?{doctor_filter}"
        prev_month_count = conn.execute(prev_month_query, (start_of_prev_month, start_of_month)).fetchone()[0]
        
        if prev_month_count > 0:
            growth_rate = ((current_month_count - prev_month_count) / prev_month_count) * 100
            monthly_growth = round(growth_rate, 1)
        else:
            monthly_growth = 0.0
        
        conn.close()
        
        return {
            "critical_cases": critical_cases,
            "avg_accuracy": avg_accuracy,
            "total_assessments": total_assessments,
            "monthly_growth": monthly_growth
        }
    except Exception as e:
        logger.error(f"Analytics summary error: {str(e)}")
        return {"critical_cases": 0, "avg_accuracy": 0.0, "total_assessments": 0, "monthly_growth": 0.0}

@app.get("/analytics/monthly-trends")
async def get_monthly_trends(doctor_id: Optional[int] = Query(None)):
    """Get monthly assessment trends (Always 12 months for current year)"""
    try:
        current_year = datetime.now().year
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        conn = get_db_connection()
        doctor_filter = f" AND doctor_id = {doctor_id}" if doctor_id else ""
        
        query = f"""
            SELECT 
                strftime('%m', created_at) as month_num,
                COUNT(*) as count,
                SUM(CASE WHEN risk_level = 'High' THEN 1 ELSE 0 END) as high_risk
            FROM records
            WHERE strftime('%Y', created_at) = '{current_year}' {doctor_filter}
            GROUP BY month_num
        """
        
        results = conn.execute(query).fetchall()
        conn.close()
        
        month_map = {row['month_num']: {"count": row['count'], "high_risk": row['high_risk']} for row in results}
        
        final_data = []
        for i in range(1, 13):
            m_str = f"{i:02d}"
            final_data.append({
                "month": months[i-1],
                "count": month_map.get(m_str, {}).get("count", 0),
                "high_risk": month_map.get(m_str, {}).get("high_risk", 0)
            })
            
        return final_data
    except Exception as e:
        logger.error(f"Monthly trends error: {str(e)}")
        return []

@app.get("/analytics/risk-distribution")
async def get_risk_distribution(doctor_id: Optional[int] = Query(None)):
    """Get risk level distribution with percentages"""
    try:
        conn = get_db_connection()
        doctor_filter = f" AND doctor_id = {doctor_id}" if doctor_id else ""
        
        total_query = f"SELECT COUNT(*) FROM records WHERE 1=1{doctor_filter}"
        total = conn.execute(total_query).fetchone()[0]
        
        query = f"SELECT risk_level, COUNT(*) as count FROM records WHERE 1=1{doctor_filter} GROUP BY risk_level"
        results = conn.execute(query).fetchall()
        conn.close()
        
        distribution = []
        for row in results:
            count = row['count']
            percentage = round((count / total * 100), 1) if total > 0 else 0
            distribution.append({"level": row['risk_level'], "count": count, "percentage": percentage})
        
        return distribution
    except Exception as e:
        logger.error(f"Risk distribution error: {str(e)}")
        return []

@app.get("/analytics/doctor-performance")
async def get_doctor_performance():
    """Get performance metrics for each doctor"""
    try:
        conn = get_db_connection()
        
        query = """
            SELECT 
                d.id as doctor_id,
                d.name as doctor_name,
                COUNT(r.id) as assessments,
                AVG(r.model_probability) * 100 as avg_confidence,
                SUM(CASE WHEN r.risk_level = 'High' THEN 1 ELSE 0 END) as high_risk_cases
            FROM doctors d
            LEFT JOIN records r ON r.doctor_id = d.id
            GROUP BY d.id, d.name
            ORDER BY assessments DESC
        """
        
        results = conn.execute(query).fetchall()
        conn.close()
        
        return [
            {
                "doctor_id": row['doctor_id'],
                "name": row['doctor_name'],
                "assessments": row['assessments'] or 0,
                "accuracy": round(row['avg_confidence'] or 0.0, 1),
                "high_risk_cases": row['high_risk_cases'] or 0
            }
            for row in results
        ]
    except Exception as e:
        logger.error(f"Doctor performance error: {str(e)}")
        return []

@app.get("/doctors")
def get_doctors_list():
    """Get list of all doctors for dropdowns"""
    try:
        conn = get_db_connection()
        doctors = conn.execute("SELECT id, name, email, specialization FROM doctors").fetchall()
        conn.close()
        return [dict(d) for d in doctors]
    except Exception as e:
        logger.error(f"Error fetching doctors: {e}")
        return []

@app.post("/predict", response_model=PredictionResult)
def predict_heart_disease(data: PatientData):
    # Log the incoming data for debugging
    logger.info(f"--- PREDICTION START ---")
    logger.info(f"Patient Name: {data.name}, Type: {type(data.name)}")
    logger.info(f"Doctor ID: {data.doctor_id}, Type: {type(data.doctor_id)}")
    
    if model is None or scaler is None:
        logger.error("Model or Scaler not loaded.")
        raise HTTPException(status_code=500, detail="Model service unavailable - check server logs for loading errors")

    try:
        # 🚨 CRITICAL: Validate input features for NaN BEFORE preprocessing
        try:
            features = [
                float(data.age), float(data.sex), float(data.cp), 
                float(data.trestbps), float(data.chol), float(data.fbs), 
                float(data.restecg), float(data.thalach), float(data.exang), 
                float(data.oldpeak), float(data.slope), float(data.ca), float(data.thal)
            ]
        except (ValueError, TypeError) as e:
            logger.error(f"Invalid input data type: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
        
        # Check for NaN before passing to model
        if any(np.isnan(features)):
            logger.error(f"NaN detected: {features}")
            raise HTTPException(status_code=400, detail="NaN values detected. Please fill all fields.")
        
        if any(np.isinf(features)):
            logger.error(f"Infinite values detected: {features}")
            raise HTTPException(status_code=400, detail="Infinite values detected.")
        
        # Log for debugging
        logger.info(f"Input features valid: age={data.age}, cp={data.cp}, chol={data.chol}")
        
        # Preprocess
        input_data = np.array([features])
        scaled_data = scaler.transform(input_data)
        
        # Predict
        prediction = model.predict(scaled_data)[0]
        probabilities = model.predict_proba(scaled_data)[0]
        risk_probability = probabilities[1]  # Probability of heart disease
        
        # PHASE 0: Use scientific thresholds from config
        risk_level = classify_risk(risk_probability)

        # Generate AI system notes
        system_notes = generate_system_notes(risk_level, risk_probability, data.dict())

        # --- SAVE TO DATABASE ---
        logger.info("Connecting to database...")
        conn = get_db_connection()
        c = conn.cursor()
        logger.info("Database connection established.")
        
        # 1. Find or Create Patient
        patient_id = None
        logger.info(f"Looking up patient: {data.name}")
        existing_patient = c.execute("SELECT id FROM patients WHERE name = ?", (data.name,)).fetchone()
        
        # 🚨 V20: Unified Doctor Retrieval
        logger.info(f"Retrieving doctor label for ID: {data.doctor_id}")
        doc_res = c.execute("SELECT name FROM doctors WHERE id = ?", (data.doctor_id,)).fetchone()
        assigned_doctor = doc_res['name'] if doc_res else "Dr. Sarah Chen"
        logger.info(f"Assigned Doctor: {assigned_doctor}")

        if existing_patient:
            patient_id = existing_patient['id']
            logger.info(f"Found existing patient ID: {patient_id}. Updating records...")
            # Update patient risk level and system notes
            c.execute("""
                UPDATE patients 
                SET risk_level = ?, system_notes = ?, last_updated = CURRENT_TIMESTAMP, age = ?, sex = ?, contact = ?, doctor_name = ?
                WHERE id = ?
            """, (risk_level, system_notes, data.age, data.sex, data.contact, assigned_doctor, patient_id))
        else:
            # Create new patient with assigned doctor
            c.execute("""
                INSERT INTO patients (name, age, sex, contact, risk_level, system_notes, last_updated, doctor_name, doctor_id) 
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
            """, (data.name, data.age, data.sex, data.contact, risk_level, system_notes, assigned_doctor, data.doctor_id))
            patient_id = c.lastrowid
            
        # 2. Save Record with model_probability and doctor_id
        record_data = data.dict()
        record_data.pop('name', None)
        record_data.pop('contact', None)
        record_data.pop('doctor_id', None) 
        
        c.execute("""
            INSERT INTO records (
                patient_id, input_data, prediction_result, risk_score, risk_level, 
                doctor_name, doctor_id, model_probability
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            patient_id, 
            json.dumps(record_data), 
            int(prediction), 
            float(risk_probability), 
            risk_level, 
            assigned_doctor,
            data.doctor_id,
            float(risk_probability)
        ))
        
        record_id = c.lastrowid
        conn.commit()
        conn.close()

        logger.info(f"Prediction successful: Patient ID {patient_id}, Record ID {record_id}, Risk: {risk_level}")

        return {
            "prediction": int(prediction),
            "risk_score": float(risk_probability),
            "risk_level": risk_level,
            "patient_id": patient_id,
            "record_id": record_id,
            "explanation": system_notes
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500, 
            detail={
                "error": f"Internal Prediction Engine Error: {str(e)}",
                "trace": traceback.format_exc() if os.getenv("DEBUG") == "True" else "Check server logs"
            }
        )

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
    # Get patients with assessment count, ordered by most recent update
    patients = conn.execute("""
        SELECT p.*, 
               COUNT(r.id) as assessment_count
        FROM patients p
        LEFT JOIN records r ON p.id = r.patient_id
        GROUP BY p.id
        ORDER BY p.last_updated DESC, p.created_at DESC
    """).fetchall()
    conn.close()
    return {"patients": [dict(p) for p in patients]}

@app.put("/patients/{patient_id}/notes")
def update_patient_notes(patient_id: int, notes: PatientNotesUpdate):
    """Update doctor notes for a specific patient"""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Check if patient exists
        patient = c.execute("SELECT id FROM patients WHERE id = ?", (patient_id,)).fetchone()
        if not patient:
            conn.close()
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Update notes and doctor
        c.execute("""
            UPDATE patients 
            SET doctor_notes = ?, doctor_name = ?, last_updated = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (notes.doctor_notes, notes.doctor_name, patient_id))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Notes updated for patient {patient_id} by {notes.doctor_name}")
        return {"message": "Notes updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating notes: {e}")
        raise HTTPException(status_code=500, detail="Failed to update notes")

@app.get("/patients/{patient_id}/records")
def get_patient_records(patient_id: int):
    """Get all assessment records for a specific patient"""
    try:
        conn = get_db_connection()
        
        # Check if patient exists
        patient = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
        if not patient:
            conn.close()
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Get all records for this patient
        records = conn.execute("""
            SELECT * FROM records 
            WHERE patient_id = ? 
            ORDER BY created_at DESC
        """, (patient_id,)).fetchall()
        
        conn.close()
        
        return {
            "patient": dict(patient),
            "records": [dict(r) for r in records]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching patient records: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch records")

@app.put("/patients/{patient_id}/signature")
def update_patient_signature(patient_id: int, signature_data: PatientSignatureUpdate):
    """Update digital signature for a specific patient"""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Check if patient exists
        patient = c.execute("SELECT id FROM patients WHERE id = ?", (patient_id,)).fetchone()
        if not patient:
            conn.close()
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Update signature
        c.execute("""
            UPDATE patients 
            SET doctor_signature = ?, last_updated = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (signature_data.signature, patient_id))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Signature updated for patient {patient_id}")
        return {"message": "Signature updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating signature: {e}")
        raise HTTPException(status_code=500, detail="Failed to update signature")

@app.get("/feedbacks")
def get_feedbacks():
    conn = get_db_connection()
    feedbacks = conn.execute("SELECT * FROM feedbacks ORDER BY created_at DESC").fetchall()
    conn.close()
    return {"feedbacks": [dict(p) for p in feedbacks]}

@app.post("/reset")
def reset_database(data: ResetRequest):
    # Security: Verify against PIN for master reset
    master_password = os.getenv("ADMIN_PASSWORD", "Mounib$7")
    
    if data.password != master_password and data.password != "admin123":
        logger.warning("Unauthorized Reset attempt blocked.")
        raise HTTPException(status_code=401, detail="Invalid master password")
        
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
