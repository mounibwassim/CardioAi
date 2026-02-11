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
    
    # Feedbacks Table
    c.execute('''CREATE TABLE IF NOT EXISTS feedbacks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    patient_id INTEGER,
                    rating INTEGER,
                    comment TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )''')
    
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
