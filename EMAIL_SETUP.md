# 📧 CardioAI Email Setup Guide

To receive messages from the Contact Form, you must configure your backend with **Gmail SMTP**.
This method is free, reliable, and does **not** require Firebase.

## Step 1: Get a Google App Password
1.  Go to your [Google Account Security Page](https://myaccount.google.com/security).
2.  Enable **2-Step Verification** if it is not already on.
3.  Search for **"App passwords"** in the top search bar.
4.  Create a new App Password:
    *   **App name**: `CardioAI`
    *   Click **Create**.
5.  **COPY the 16-character code** (e.g., `abcd efgh ijkl mnop`).

## Step 2: Configure Render
1.  Go to your **[Render Dashboard](https://dashboard.render.com/)**.
2.  Select your **Backend Service**.
3.  Click on **Environment** (or "Env Vars") in the side menu.
4.  Add the following variables:

| Key | Value |
| :--- | :--- |
| `EMAIL_USER` | `mounibwassimm@gmail.com` |
| `EMAIL_PASSWORD` | `jshj enoz zesm wbse` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |

5.  Click **Save Changes**.

## Step 3: Test It
1.  Wait for Render to redeploy/restart (usually 1-2 minutes).
2.  Go to your website's **Contact Page**.
3.  Send a test message.
4.  Check your inbox (`mounibwassimm@gmail.com`). You should see the email immediately!

---
**Troubleshooting:**
*   If you don't receive emails, check the Render **Logs**.
*   If you see `Username and Password not accepted`, verify you copied the App Password correctly (no extra spaces).
