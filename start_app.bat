@echo off
echo Starting MindPulse Components...

start cmd /k "cd backend && npm run dev"
start cmd /k "cd ai_service && python app.py"
start cmd /k "cd frontend && npm run dev"

echo All services started!
echo Backend: http://localhost:5000
echo AI Service: http://localhost:5001
echo Frontend: http://localhost:5173
pause
