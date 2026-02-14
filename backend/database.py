import sqlite3
import os
import json
import logging
import psycopg2
from psycopg2.extras import RealDictCursor

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "cardioai.db")

# --- PostgreSQL Adapter Classes ---
class PostgresCursor:
    def __init__(self, cursor):
        self.cursor = cursor

    def execute(self, sql, params=None):
        # Convert SQLite ? placeholder to PostgreSQL %s
        sql = sql.replace('?', '%s')
        
        # Handle simple SQLite to Postgres syntax replacements if needed
        # (Most ANSI SQL is compatible, simple substitutions here)
        sql = sql.replace('INTEGER PRIMARY KEY AUTOINCREMENT', 'SERIAL PRIMARY KEY')
        
        try:
            self.cursor.execute(sql, params)
            return self
        except Exception as e:
            logger.error(f"Postgres Query Error: {e} | SQL: {sql}")
            raise

    def fetchone(self):
        return self.cursor.fetchone()

    def fetchall(self):
        return self.cursor.fetchall()
    
    def close(self):
        self.cursor.close()

class PostgresConnection:
    def __init__(self, dsn):
        try:
            self.conn = psycopg2.connect(dsn, cursor_factory=RealDictCursor)
            self.row_factory = None # Compatibility marker
            logger.info("Connected to PostgreSQL successfully.")
        except Exception as e:
            logger.error(f"Failed to connect to PostgreSQL: {e}")
            raise

    def cursor(self):
        return PostgresCursor(self.conn.cursor())

    def commit(self):
        self.conn.commit()

    def close(self):
        self.conn.close()

    def execute(self, sql, params=None):
        # Helper to match sqlite3.connect().execute() shortcut
        cursor = self.cursor()
        cursor.execute(sql, params)
        return cursor

# --- Main Connection Factory ---
def get_db_connection():
    # Check for Render/Production Database URL
    database_url = os.getenv("DATABASE_URL")
    
    if database_url:
        try:
            return PostgresConnection(database_url)
        except Exception:
            logger.warning("PostgreSQL connection failed, attempting fallback (or raising error if critical)...")
            raise 

    # SQLite Fallback (Local)
    conn = sqlite3.connect(DB_NAME, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn

# --- Initialization Logic ---
def init_db():
    conn = get_db_connection()
    
    # Check if we are using our Postgres Adapter
    is_postgres = isinstance(conn, PostgresConnection)
    
    if is_postgres:
        init_postgres_db(conn)
    else:
        init_sqlite_db(conn)

def init_postgres_db(conn):
    logger.info("Initializing PostgreSQL Schema...")
    c = conn.cursor()
    
    # 1. Users
    c.execute('''CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'doctor',
                    email VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )''')

    # 2. Doctors
    c.execute('''CREATE TABLE IF NOT EXISTS doctors (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE,
                    specialization VARCHAR(255) DEFAULT 'Cardiology',
                    signature_path TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )''')

    # 3. Patients (Note: Foreign Key syntax)
    c.execute('''CREATE TABLE IF NOT EXISTS patients (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    age INTEGER,
                    sex INTEGER,
                    contact VARCHAR(255),
                    status VARCHAR(50) DEFAULT 'Active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    doctor_name VARCHAR(255) DEFAULT 'Dr. Sarah Chen',
                    doctor_notes TEXT,
                    system_notes TEXT,
                    risk_level VARCHAR(50) DEFAULT 'Unknown',
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    doctor_signature TEXT,
                    doctor_id INTEGER REFERENCES users(id),
                    is_deleted BOOLEAN DEFAULT FALSE
                )''')

    # 4. Records
    c.execute('''CREATE TABLE IF NOT EXISTS records (
                    id SERIAL PRIMARY KEY,
                    patient_id INTEGER REFERENCES patients(id),
                    input_data TEXT,
                    prediction_result INTEGER,
                    risk_score REAL,
                    risk_level VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    doctor_name VARCHAR(255) DEFAULT 'Dr. Sarah Chen',
                    doctor_id INTEGER REFERENCES users(id),
                    is_deleted BOOLEAN DEFAULT FALSE,
                    model_probability REAL DEFAULT 0.0
                )''')

    # 5. Feedbacks
    c.execute('''CREATE TABLE IF NOT EXISTS feedbacks (
                    id SERIAL PRIMARY KEY,
                    patient_id INTEGER REFERENCES patients(id),
                    name VARCHAR(255),
                    rating INTEGER,
                    comment TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )''')

    # 6. Audit Logs
    c.execute('''CREATE TABLE IF NOT EXISTS audit_logs (
                    id SERIAL PRIMARY KEY,
                    doctor_id INTEGER REFERENCES users(id),
                    action VARCHAR(255) NOT NULL,
                    entity VARCHAR(255) NOT NULL,
                    entity_id INTEGER,
                    details TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )''')

    # Indexes
    c.execute("CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_records_patient_id ON records(patient_id)")
    
    # Seeding Logic (Check if empty then insert)
    # Using specific count query to avoid errors
    c.execute("SELECT COUNT(*) as count FROM doctors")
    result = c.fetchone()
    if result['count'] == 0:
        logger.info("Seeding default doctors...")
        c.execute("INSERT INTO doctors (name, email, specialization) VALUES (?, ?, ?)", 
                  ('Dr. Sarah Chen', 'sarah.chen@cardioai.com', 'Cardiology'))
        c.execute("INSERT INTO doctors (name, email, specialization) VALUES (?, ?, ?)", 
                  ('Dr. Emily Ross', 'emily.ross@cardioai.com', 'Internal Medicine'))
        c.execute("INSERT INTO doctors (name, email, specialization) VALUES (?, ?, ?)", 
                  ('Dr. Michael Torres', 'michael.torres@cardioai.com', 'Cardiology'))
                  
    # Seed Admin User if not exists
    c.execute("SELECT COUNT(*) as count FROM users")
    if c.fetchone()['count'] == 0:
         logger.info("Seeding default admin user...")
         # Assuming a hashed password or placeholder logic exists elsewhere, inserting dummy for now or skipping
         # Skipping user seed to rely on registration or manual setup, or inserting placeholders if strictly needed.
         pass

    conn.commit()
    conn.close()
    logger.info("PostgreSQL Initialization Complete.")

def init_sqlite_db(conn):
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
    
    # Apply Updates/Migrations manually for SQLite (as per original file)
    migrations = [
        ("ALTER TABLE patients ADD COLUMN doctor_name TEXT DEFAULT 'Dr. Sarah Chen'", "doctor_name"),
        ("ALTER TABLE patients ADD COLUMN doctor_notes TEXT", "doctor_notes"),
        ("ALTER TABLE patients ADD COLUMN system_notes TEXT", "system_notes"),
        ("ALTER TABLE patients ADD COLUMN risk_level TEXT DEFAULT 'Unknown'", "risk_level"),
        ("ALTER TABLE patients ADD COLUMN last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP", "last_updated"),
        ("ALTER TABLE patients ADD COLUMN doctor_signature TEXT", "doctor_signature"),
        ("ALTER TABLE patients ADD COLUMN doctor_id INTEGER REFERENCES users(id)", "doctor_id"),
        ("ALTER TABLE patients ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE", "is_deleted"),
    ]
    
    for sql, col_check in migrations:
        try:
            c.execute(f"SELECT {col_check} FROM patients LIMIT 1")
        except sqlite3.OperationalError:
            c.execute(sql)

    # Records Table
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

    record_migrations = [
        ("ALTER TABLE records ADD COLUMN doctor_name TEXT DEFAULT 'Dr. Sarah Chen'", "doctor_name"),
        ("ALTER TABLE records ADD COLUMN doctor_id INTEGER REFERENCES users(id)", "doctor_id"),
        ("ALTER TABLE records ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE", "is_deleted"),
        ("ALTER TABLE records ADD COLUMN model_probability REAL DEFAULT 0.0", "model_probability"),
    ]
    
    for sql, col_check in record_migrations:
        try:
            c.execute(f"SELECT {col_check} FROM records LIMIT 1")
        except sqlite3.OperationalError:
            c.execute(sql)

    # Feedbacks Table
    c.execute('''CREATE TABLE IF NOT EXISTS feedbacks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id INTEGER,
                    name TEXT,
                    rating INTEGER,
                    comment TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )''')

    # Users Table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'doctor',
                    email TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )''')
    
    # Doctors Table
    c.execute('''CREATE TABLE IF NOT EXISTS doctors (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE,
                    specialization TEXT DEFAULT 'Cardiology',
                    signature_path TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )''')
    
    # Seeding Doctors
    existing_docs = c.execute("SELECT COUNT(*) FROM doctors").fetchone()[0]
    if existing_docs == 0:
        c.execute("INSERT INTO doctors (name, email, specialization) VALUES (?, ?, ?)", ('Dr. Sarah Chen', 'sarah.chen@cardioai.com', 'Cardiology'))
        c.execute("INSERT INTO doctors (name, email, specialization) VALUES (?, ?, ?)", ('Dr. Emily Ross', 'emily.ross@cardioai.com', 'Internal Medicine'))
        c.execute("INSERT INTO doctors (name, email, specialization) VALUES (?, ?, ?)", ('Dr. Michael Torres', 'michael.torres@cardioai.com', 'Cardiology'))

    # Audit Logs
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

    conn.commit()
    conn.close()
    logger.info("SQLite Database Initialized.")

def wipe_data():
    conn = get_db_connection()
    is_postgres = isinstance(conn, PostgresConnection)
    
    if is_postgres:
         with conn.conn.cursor() as c:
            c.execute("TRUNCATE TABLE patients, records, feedbacks RESTART IDENTITY CASCADE")
    else:
        c = conn.cursor()
        tables = ['patients', 'records', 'feedbacks']
        for table in tables:
            c.execute(f"DELETE FROM {table}")
            c.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}'")
    
    conn.commit()
    conn.close()
    print("All data wiped and counters reset.")
