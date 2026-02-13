# CardioAI 🩺

**Professional Clinical AI Platform for Cardiovascular Risk Stratification**

CardioAI is a state-of-the-art health intelligence system designed for modern cardiology clinics. It provides physicians with deep diagnostic insights using advanced machine learning, while offering patients a seamless portal for educational resources and feedback.

## 🚀 Key Architectural Strengths

- **Clinical Integrity Engine**: Single-source-of-truth recommendation logic used across the dashboard and PDF reporting.
- **Portal Isolation**: Strictly separate Doctor (`/doctor`) and Patient portals with independent theme engines and auth guards.
- **Intelligent Diagnostics**: Professional PDF generation with real-time clinical marker injection and digital verification.
- **Enterprise UI**: High-density calendar tracking, 3D heart visualizations, and premium glassmorphism aesthetics.

## 🛠️ Technical Stack

- **Framework**: React 18 + Vite (Frontend), FastAPI (Backend)
- **Styling**: Tailwind CSS v4 with Scoped Portal Theming
- **Visuals**: Framer Motion, Recharts, Three.js
- **Reporting**: jsPDF with Clinical Data Binding
- **Database**: SQLite with SQLAlchemy ORM

## 🔧 Installation & Setup

### 1. Backend Service
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Clinical Frontend
```bash
cd frontend
npm install
npm run dev
```

---
*Disclaimer: CardioAI is a clinical decision support tool. All AI assessments must be validated by a certified cardiologist before clinical application.*
