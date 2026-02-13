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

```bash
cd ai_service
# Create venv
python -m venv venv
# Activate venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt # OR: pip install flask flask-cors textblob
python -m textblob.download_corpora

python app.py
```

AI Service runs on `http://localhost:5001`.

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
