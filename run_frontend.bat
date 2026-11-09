@echo off
title AISYS Library Frontend (React + Vite)
echo ===================================================
echo Starting AISYS RFID Library Frontend on http://localhost:5173
echo Reverse Proxy: http://localhost:5173/api -^> http://127.0.0.1:8000
echo ===================================================
cd frontend
npm run dev
pause
