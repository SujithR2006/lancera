@echo off
cd /d "%~dp0"

echo ==============================================
echo       Lancera Project Setup ^& Run Script
echo ==============================================

echo [1/5] Checking backend .env file...
if not exist "backend" mkdir backend
if exist "backend\.env" goto SKIPENV

echo Creating backend .env file...
echo PORT=5000> backend\.env
echo MONGO_URI=mongodb+srv://lancera:Lancera123@cluster0.3wggvry.mongodb.net/lancera?retryWrites=true^&w=majority>> backend\.env
echo JWT_SECRET=lancera_secret_key_2025>> backend\.env
echo ANTHROPIC_API_KEY=your_key_here>> backend\.env

:SKIPENV
echo backend\.env is resolved.

echo [2/5] Installing backend dependencies...
cd backend
call npm install
cd ..

echo [3/5] Installing frontend dependencies...
if not exist "frontend" mkdir frontend
cd frontend
call npm install
cd ..

echo [4/5] Starting backend server in a new window...
start "Lancera Backend" cmd /k "cd backend && node server.js"

echo [5/5] Starting frontend server in a new window...
start "Lancera Frontend" cmd /k "cd frontend && npm run dev"

echo ==============================================
echo Setup and Initialization Complete! You can close this window.
echo ==============================================
pause
