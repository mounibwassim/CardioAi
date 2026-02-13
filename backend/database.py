import sqlite3
import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "cardioai.db")

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Patients Table
    c.execute('''CREATE TABLE IF NOT EXISTS patients (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    age INTEGER,
                    sex INTEGER,
                    contact TEXT,
                    status TEXT DEFAULT 'Active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )''')
    
    # Migration: Add new columns to patients table if they don't exist
    try:
        c.execute("SELECT doctor_name FROM patients LIMIT 1")
    except sqlite3.OperationalError:
        print("Migrating patients table: Adding doctor_name column")
        c.execute("ALTER TABLE patients ADD COLUMN doctor_name TEXT DEFAULT 'Dr. Sarah Chen'")
    
    try:
        c.execute("SELECT doctor_notes FROM patients LIMIT 1")
    except sqlite3.OperationalError:
        print("Migrating patients table: Adding doctor_notes column")
        c.execute("ALTER TABLE patients ADD COLUMN doctor_notes TEXT")
    
    try:
        c.execute("SELECT system_notes FROM patients LIMIT 1")
    except sqlite3.OperationalError:
        print("Migrating patients table: Adding system_notes column")
        c.execute("ALTER TABLE patients ADD COLUMN system_notes TEXT")
    
    try:
        c.execute("SELECT risk_level FROM patients LIMIT 1")
    except sqlite3.OperationalError:
        print("Migrating patients table: Adding risk_level column")
        c.execute("ALTER TABLE patients ADD COLUMN risk_level TEXT DEFAULT 'Unknown'")
    
    try:
        c.execute("SELECT last_updated FROM patients LIMIT 1")
    except sqlite3.OperationalError:
        print("Migrating patients table: Adding last_updated column")
        c.execute("ALTER TABLE patients ADD COLUMN last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    
    try:
        c.execute("SELECT doctor_signature FROM patients LIMIT 1")
    except sqlite3.OperationalError:
        print("Migrating patients table: Adding doctor_signature column")
        c.execute("ALTER TABLE patients ADD COLUMN doctor_signature TEXT")
    
    # Phase 4.4: Add doctor_id column for data isolation
    try:
        c.execute("SELECT doctor_id FROM patients LIMIT 1")
    except sqlite3.OperationalError:
        print("Phase 4.4: Adding doctor_id to patients table")
        c.execute("ALTER TABLE patients ADD COLUMN doctor_id INTEGER REFERENCES users(id)")
        c.execute("UPDATE patients SET doctor_id = 1 WHERE doctor_id IS NULL")  # Backfill to admin
    
    # Phase 4.6: Add is_deleted column for soft delete
    try:
        c.execute("SELECT is_deleted FROM patients LIMIT 1")
    except sqlite3.OperationalError:
        print("Phase 4.6: Adding is_deleted to patients table")
        c.execute("ALTER TABLE patients ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE")
    
    # Records/Assessments Table
    c.execute('''CREATE TABLE IF NOT EXISTS records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id INTEGER,
                    input_data TEXT,
                    prediction_result INTEGER,
                    risk_score REAL,
                    risk_level TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (patient_id) REFERENCES patients (id)
                )''')
    
    # Migration: Add doctor_name to records table
    try:
        c.execute("SELECT doctor_name FROM records LIMIT 1")
    except sqlite3.OperationalError:
        print("Migrating records table: Adding doctor_name column")
        c.execute("ALTER TABLE records ADD COLUMN doctor_name TEXT DEFAULT 'Dr. Sarah Chen'")
    
    # Phase 4.4: Add doctor_id column to records
    try:
        c.execute("SELECT doctor_id FROM records LIMIT 1")
    except sqlite3.OperationalError:
        print("Phase 4.4: Adding doctor_id to records table")
        c.execute("ALTER TABLE records ADD COLUMN doctor_id INTEGER REFERENCES users(id)")
        c.execute("UPDATE records SET doctor_id = 1 WHERE doctor_id IS NULL")  # Backfill to admin
    
    # Phase 4.6: Add is_deleted column to records
    try:
        c.execute("SELECT is_deleted FROM records LIMIT 1")
    except sqlite3.OperationalError:
        print("Phase 4.6: Adding is_deleted to records table")
        c.execute("ALTER TABLE records ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE")
    
    # PHASE 0 MIGRATION: Add model_probability for scientific justification
    try:
        c.execute("SELECT model_probability FROM records LIMIT 1")
    except sqlite3.OperationalError:
        print("Phase 0: Adding model_probability to records table")
        c.execute("ALTER TABLE records ADD COLUMN model_probability REAL DEFAULT 0.0")
        # Backfill: Estimate probabilities from risk_level for existing records
        c.execute("UPDATE records SET model_probability = 0.90 WHERE risk_level = 'High' AND model_probability = 0.0")
        c.execute("UPDATE records SET model_probability = 0.60 WHERE risk_level = 'Medium' AND model_probability = 0.0")
        c.execute("UPDATE records SET model_probability = 0.30 WHERE risk_level = 'Low' AND model_probability = 0.0")
    
    # Feedbacks Table
    c.execute('''CREATE TABLE IF NOT EXISTS feedbacks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id INTEGER,
                    name TEXT,
                    rating INTEGER,
                    comment TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )''')

    # Users / Auth Table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'doctor',
                    email TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )''')
    
    # PHASE 0 MIGRATION: Doctors Table (replaces hardcoded doctor names)
    c.execute('''CREATE TABLE IF NOT EXISTS doctors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE,
                    specialization TEXT DEFAULT 'Cardiology',
                    signature_path TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )''')
    
    # Insert default doctors if table is empty
    existing_doctors = c.execute("SELECT COUNT(*) FROM doctors").fetchone()[0]
    if existing_doctors == 0:
        print("Phase 0: Inserting default doctors")
        c.execute("INSERT INTO doctors (id, name, email, specialization) VALUES (?, ?, ?, ?)",
                  (1, 'Dr. Sarah Chen', 'sarah.chen@cardioai.com', 'Cardiology'))
        c.execute("INSERT INTO doctors (id, name, email, specialization) VALUES (?, ?, ?, ?)",
                  (2, 'Dr. Emily Ross', 'emily.ross@cardioai.com', 'Internal Medicine'))
        c.execute("INSERT INTO doctors (id, name, email, specialization) VALUES (?, ?, ?, ?)",
                  (3, 'Dr. Michael Torres', 'michael.torres@cardioai.com', 'Cardiology'))
    
    # Phase 4.5: Audit Logs Table
    c.execute('''CREATE TABLE IF NOT EXISTS audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    doctor_id INTEGER NOT NULL,
                    action TEXT NOT NULL,
                    entity TEXT NOT NULL,
                    entity_id INTEGER,
                    details TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (doctor_id) REFERENCES users(id)
                )''')
    
    # Phase 4.2: Create Performance Indexes
    try:
        c.execute("CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id)")
        c.execute("CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at)")
        c.execute("CREATE INDEX IF NOT EXISTS idx_records_doctor_id ON records(doctor_id)")
        c.execute("CREATE INDEX IF NOT EXISTS idx_records_patient_id ON records(patient_id)")
        c.execute("CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at)")
        c.execute("CREATE INDEX IF NOT EXISTS idx_records_risk_level ON records(risk_level)")
        c.execute("CREATE INDEX IF NOT EXISTS idx_audit_doctor_id ON audit_logs(doctor_id)")
        print("Phase 4.2: Database indexes created")
    except sqlite3.OperationalError as e:
        print(f"Index creation skipped: {e}")
    
    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_NAME}")

def wipe_data():
    conn = get_db_connection()
    c = conn.cursor()
    tables = ['patients', 'records', 'feedbacks']
    for table in tables:
        c.execute(f"DELETE FROM {table}")
        c.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}'")
    conn.commit()
    conn.close()
    print("All data wiped and counters reset.")
