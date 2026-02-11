# 🔐 CardioAI Admin & Doctor Access

## ⚠️ RESTRICTED ACCESS
This document contains sensitive access information used for the Doctor Portal. Do not share this file publicly.

### 🏥 Secure Doctor Portal
**Hidden URL:** `https://your-vercel-domain.app/doctor-secure-access-portal`
*(Local: `http://localhost:5173/doctor-secure-access-portal`)*

**Default Credentials:**
- **Username:** `admin`
- **Password:** `admin123` *(Automatically hashed on first startup)*

### 🛡️ Security Features
- **Hidden Route:** This page is NOT linked in the main navigation bar.
- **Footer Access:** Accessible via a subtle "Staff Access" link in the footer (bottom right).
- **Rate Limiting:** Login is locked for 1 minute after 3 failed attempts.
- **Role Validation:** Backend strictly enforces `user_role = 'doctor'` for all dashboard actions.

### ⚙️ Environment Variables (Backend)
Ensure these are set in your Render dashboard:

**Email Configuration (Crucial for Contact Form):**
- `EMAIL_USER`: Your Gmail Address (e.g. `mounibwassimm@gmail.com`)
- `EMAIL_PASS`: Your Google App Password (16-char code)
    - *Note*: Generate this in Google Account > Security > App Passwords. Do NOT use your main password.

**Other Variables:**
- `SECRET_KEY`: (Optional) A long random string for JWT signing.
- `origins`: Handled automatically in code (Vercel domains allowed).
