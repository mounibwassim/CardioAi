# CardioAI

CardioAI is a comprehensive clinical cardiovascular health system connecting patients with advanced AI diagnostics and expert cardiology care.

## Overview

- **Dual-Portal System**: 
  - **Patient Portal**: Marketing, Service Information, Risk Assessment Booking, Contact, and Feedback.
  - **Doctor Portal**: Protected dashboard for patient management, AI prediction analysis, and reporting.
- **AI-Powered**: Uses machine learning to predict heart disease risk based on clinical data.
- **Secure**: Role-based access control ensuring patient data privacy.
# CardioAI 🩺

**Production-Grade Clinical Heart Disease Prediction & Analytics System**

CardioAI is a state-of-the-art medical intelligence platform designed for cardiologists to assess patient cardiovascular health with high precision. Leveraging advanced machine learning models (70% high-risk sensitivity), the system provides instant risk stratification, professional medical summaries, and interactive 3D/2D analytics.

### Key Features
- **Precision ML Prediction**: Real-time risk assessment based on clinical markers.
- **Intelligent Reporting**: Automated AI analysis summaries with professional medical terminology.
- **Interactive Dashboards**: Full-year trends, doctor performance monitoring, and risk distribution visualizations.
- **Clinical Reporting**: Professional PDF export using standardized medical fonts (Times New Roman).
- **Enterprise UX**: Full dark mode support, secure session management, and responsive medical interface.

---
*Built for clinical excellence.*

## Features

- **For Patients**:
  - Educational Service Pages (Comprehensive Care, AI Risk Analysis, etc.)
  - Online Booking via WhatsApp integration.
  - AI Risk Assessment (Preliminary).
  - Feedback system with QR code support.

- **For Doctors**:
  - Secure Dashboard.
  - Patient Management System.
  - Advanced AI Prediction with risk probability.
  - Detailed PDF Report Generation.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v4, Framer Motion, Recharts, Three.js (React Three Fiber).
- **Backend**: Python, FastAPI, Scikit-learn, SQLite.

## Setup

1.  **Backend**:
    ```bash
    cd backend
    pip install -r requirements.txt
    python main.py
    ```
2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## Deployment

### Backend (Render)
1.  Connect your GitHub repository to Render.
2.  Render will automatically detect the `render.yaml` file and configure the service.
3.  Alternatively, create a new **Web Service**:
    - **Root Directory**: `backend`
    - **Environment**: Python 3
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
    - **Environment Variables**: Add `MAIL_USERNAME`, `MAIL_PASSWORD`, etc.

### Frontend (Vercel)
1.  Import the repository into Vercel.
2.  Set the **Root Directory** to `frontend`.
3.  Vercel should automatically detect Vite.
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
4.  Add Environment Variables:
    - **`VITE_API_URL`** (Required): URL of your deployed Render backend (e.g., `https://cardioai-backend.onrender.com`). **Do not add a trailing slash.**

## Contact

For support or inquiries, please contact the administration team.
