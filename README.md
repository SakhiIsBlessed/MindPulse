# MindPulse - AI-Powered Student Mental Health Platform

MindPulse is a privacy-focused web application for student mental health
monitoring, featuring daily journaling, mood tracking, and AI-powered sentiment
analysis.

## Features

- **User Authentication**: Secure JWT-based login and signup.
- **Daily Journaling**: Log entries with text and mood scale (1-5).
- **AI Sentiment Analysis**: NLP-based analysis of journal entries
  (Positive/Neutral/Negative).
- **Mood Trends**: Visual dashboard tracking mood over time.
- **Chatbot Assistant**: Basic mental wellness guidance.
- **Privacy**: Secure data handling and anonymized admin stats.

## Tech Stack

- **Frontend**: React, Vite, Recharts, CSS Modules (Glassmorphism UI).
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT.
- **AI Service**: Python, Flask, TextBlob.

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- MongoDB (running locally or cloud URI)

### 1. Backend Setup

```bash
cd backend
npm install
# Ensure MongoDB is running.
# Create a .env file if not exists (refer to provided .env)
npm run dev
```

Server runs on `http://localhost:5000`.

### 2. AI Service Setup

The AI service uses the OpenAI API. You must provide a key in the environment variables so the chatbot can connect.

1. **Add your key to the backend .env** (or set it before launching):
   ```dotenv
   OPENAI_API_KEY=sk-············
   ```
   You can append this to `backend/.env` alongside the other settings.

2. Start the AI service:
   ```bash
   cd ai_service
   # Create venv if you haven't already
   python -m venv venv
   # Activate venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   # source venv/bin/activate

   pip install -r requirements.txt # OR: pip install flask flask-cors textblob openai python-dotenv
   python -m textblob.download_corpora

   python app.py
   ```

The service will run on `http://localhost:5001`. If the key is missing you will see a warning on startup and the app will fall back to simple canned responses.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Running the Application

1. Start MongoDB.
2. Start Backend (`npm run dev` in `backend/`).
3. Start AI Service (`python app.py` in `ai_service/`).
4. Start Frontend (`npm run dev` in `frontend/`).
5. Open browser at `http://localhost:5173`.

## API Documentation

See [API.md](API.md) for detailed endpoint documentation.

## Verify Newsletter Email Delivery

To confirm subscription emails are actually sent:

1. Configure SMTP in `backend/.env`:
   - `EMAIL_USER=<your-email>`
   - `EMAIL_PASS=<your-app-password>`
   - (optional) `FRONTEND_URL=http://localhost:5173`
2. Start backend (`cd backend && npm run dev`).
3. Submit the footer form from the app **or** call:
   ```bash
   curl -X POST http://localhost:5000/api/subscribe \
     -H "Content-Type: application/json" \
     -d '{"email":"you@example.com"}'
   ```
4. Check API response:
   - `emailDelivery.accepted` contains your email => SMTP accepted it.
   - In non-production, `emailDelivery.previewUrl` appears when Ethereal test
     transport is used.
5. Check backend logs:
   - `✅ Email transporter verified (SMTP)` means real SMTP is connected.
   - `Subscription email preview URL: ...` means test email is generated (open
     URL to view email).
6. Confirm inbox delivery:
   - Check Inbox + Spam/Promotions.
   - If not delivered but accepted, check SMTP sender reputation / provider
     restrictions.

7. Gmail-specific checks (most common issue):
   - Turn on 2-Step Verification for the sender Gmail account.
   - Use a generated **App Password** in `EMAIL_PASS` (do not use normal Gmail
     password).
   - Keep `EMAIL_USER` exactly same as the sender Gmail.
8. If API returns HTTP `502` with
   `Subscription saved, but confirmation email delivery failed...`:
   - Subscription record is saved, but SMTP did not accept the recipient.
   - Check `emailDelivery.accepted` / `emailDelivery.rejected` in response and
     backend `[subscribe] confirmation mail delivery` logs.
