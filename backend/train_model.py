import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Ensure models directory exists
# Use absolute path relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, '..', 'models')

if not os.path.exists(MODELS_DIR):
    os.makedirs(MODELS_DIR)

# Data URL
DATA_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"
COLUMN_NAMES = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", 
    "thalach", "exang", "oldpeak", "slope", "ca", "thal", "target"
]

print("Downloading dataset...")
# Load data, handling missing values represented by '?'
df = pd.read_csv(DATA_URL, names=COLUMN_NAMES, na_values="?")

print("Preprocessing data...")
# Drop rows with missing values (small dataset, simple imputation by dropping)
df = df.dropna()

# Convert target to binary (0 = no disease, 1-4 = disease)
df['target'] = df['target'].apply(lambda x: 1 if x > 0 else 0)

# Features and Target
X = df.drop('target', axis=1)
y = df['target']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scaling
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Model
print("Training RandomForest Classifier...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# Evaluate
y_pred = model.predict(X_test_scaled)
acc = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {acc:.4f}")
print("Classification Report:")
print(classification_report(y_test, y_pred))

# Save Artifacts
print("Saving model and scaler...")
with open(os.path.join(MODELS_DIR, 'heart_model.pkl'), 'wb') as f:
    pickle.dump(model, f)

with open(os.path.join(MODELS_DIR, 'scaler.pkl'), 'wb') as f:
    pickle.dump(scaler, f)

print(f"Done! Artifacts saved to '{MODELS_DIR}'")
