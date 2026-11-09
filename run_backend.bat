@echo off
title AISYS Library Backend (FastAPI)
echo ===================================================
echo Starting AISYS RFID Library Backend on http://127.0.0.1:8000
echo API Documentation (Swagger): http://127.0.0.1:8000/docs
echo ===================================================
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
