"""
Seed script to populate CardioAI database with sample data
"""
import sqlite3
import json
from datetime import datetime, timedelta
import random
from backend.database import get_db_connection

def seed_database():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Sample patient data
    sample_patients = [
        ("Ahmed Al-Mansoori", 45, 1, "+971501234567", "High"),
        ("Fatima Hassan", 52, 0, "+971509876543", "Medium"),
        ("Mohammed Khalid", 38, 1, "+971502223334", "Low"),
        ("Aisha Rahman", 61, 0, "+971503334445", "High"),
        ("Omar Abdullah", 55, 1, "+971504445556", "Medium"),
        ("Layla Saeed", 42, 0, "+971505556667", "Low"),
        ("Hassan Ibrahim", 67, 1, "+971506667778", "High"),
        ("Maryam Yousef", 49, 0, "+971507778889", "Medium"),
        ("Ali Mahmoud", 58, 1, "+971508889990", "Low"),
        ("Noor Ahmad", 44, 0, "+971509990001", "Low"),
    ]
    
    print("Inserting patients...")
    patient_ids = []
    for name, age, sex, contact, risk in sample_patients:
        c.execute("""
            INSERT INTO patients (name, age, sex, contact, status, risk_level, doctor_name)
            VALUES (?, ?, ?, ?, 'Active', ?, 'Dr. Sarah Chen')
        """, (name, age, sex, contact, risk))
        patient_ids.append(c.lastrowid)
    
    print(f"Inserted {len(patient_ids)} patients")
    
    # Generate assessment records with realistic cardio data
    print("Generating assessment records...")
    records_count = 0
    
    for patient_id in patient_ids:
        # Each patient gets 2-3 assessments
        num_assessments = random.randint(2, 3)
        
        for i in range(num_assessments):
            # Random cardiac indicators
            cp = random.randint(0, 3)
            trestbps = random.randint(110, 180)
            chol = random.randint(150, 350)
            fbs = random.randint(0, 1)
            restecg = random.randint(0, 2)
            thalach = random.randint(80, 200)
            exang = random.randint(0, 1)
            oldpeak = round(random.uniform(0, 6), 1)
            slope = random.randint(0, 2)
            ca = random.randint(0, 4)
            thal = random.randint(0, 3)
            
            # Risk calculation (simplified)
            risk_score = random.uniform(0.2, 0.9)
            if risk_score > 0.7:
                risk_level = "High"
                prediction = 1
            elif risk_score > 0.4:
                risk_level = "Medium"
                prediction = random.choice([0, 1])
            else:
                risk_level = "Low"
                prediction = 0
            
            input_data = {
                "age": sample_patients[patient_id - 1][1],
                "sex": sample_patients[patient_id - 1][2],
                "cp": cp,
                "trestbps": trestbps,
                "chol": chol,
                "fbs": fbs,
                "restecg": restecg,
                "thalach": thalach,
                "exang": exang,
                "oldpeak": oldpeak,
                "slope": slope,
                "ca": ca,
                "thal": thal
            }
            
            # Spread assessments over last 30 days
            created_at = datetime.now() - timedelta(days=random.randint(0, 30))
            
            c.execute("""
                INSERT INTO records (
                    patient_id, input_data, prediction_result, risk_score, 
                    risk_level, doctor_name, created_at
                )
                VALUES (?, ?, ?, ?, ?, 'Dr. Sarah Chen', ?)
            """, (
                patient_id,
                json.dumps(input_data),
                prediction,
                risk_score,
                risk_level,
                created_at.strftime('%Y-%m-%d %H:%M:%S')
            ))
            records_count += 1
    
    print(f"Inserted {records_count} assessment records")
    
    conn.commit()
    conn.close()
    
    print("\n✅ Database seeded successfully!")
    print(f"Total Patients: {len(patient_ids)}")
    print(f"Total Records: {records_count}")

if __name__ == "__main__":
    seed_database()
