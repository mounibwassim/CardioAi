import sqlite3
import os

DB_NAME = "cardio.db"

if not os.path.exists(DB_NAME):
    print(f"Database {DB_NAME} not found.")
else:
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    print("--- Feedbacks Table Schema ---")
    try:
        c.execute("PRAGMA table_info(feedbacks)")
        columns = c.fetchall()
        for col in columns:
            print(col)
            
        # Check if 'name' is in columns
        col_names = [col[1] for col in columns]
        if 'name' in col_names:
            print("\nSUCCESS: 'name' column exists.")
        else:
            print("\nFAILURE: 'name' column MISSING.")
            
    except Exception as e:
        print(f"Error reading table: {e}")
        
    conn.close()
