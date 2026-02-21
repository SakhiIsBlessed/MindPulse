@echo off
echo Starting MindPulse AI Chatbot Backend...
cd ai_service

rem always use the workspace root virtualenv (one level up from ai_service)
if exist "..\.venv\Scripts\activate.bat" (
    echo Activating existing virtual environment...
    call "..\.venv\Scripts\activate.bat"
) else (
    echo Creating virtual environment in workspace root...
    python -m venv "..\.venv"
    call "..\.venv\Scripts\activate.bat"
)

echo Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo Launching application...
python app.py

