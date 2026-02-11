# 🔐 CardioAI Admin & Doctor Access

## ⚠️ RESTRICTED ACCESS
This document contains sensitive access information used for the Doctor Portal. Do not share this file publicly.

### 🏥 Secure Doctor Portal
**Hidden URL:** `http://localhost:5173/doctor-secure-access-portal`
*(Or `https://your-vercel-domain.app/doctor-secure-access-portal` in production)*

**Default Credentials:**
- **Username:** `admin`
- **Password:** `admin123`

### 🛡️ Security Features
- **Hidden Route:** This page is NOT linked in the main navigation bar.
- **Rate Limiting:** Login is locked for 1 minute after 3 failed attempts.
- **Role Validation:** Backend strictly enforces `user_role = 'doctor'` for all dashboard actions.

### ⚙️ Environment Variables (Backend)
Ensure these are set in your Render/Vercel dashboard:
- `MAIL_USERNAME`: (Your Gmail)
- `MAIL_PASSWORD`: (Your App Password)
- `MAIL_SERVER`: `smtp.gmail.com`
- `MAIL_PORT`: `587`
