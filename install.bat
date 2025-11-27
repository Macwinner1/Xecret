@echo off
echo ========================================
echo Anonymous Content Platform - Installer
echo ========================================
echo.

echo [1/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo To start the platform:
echo.
echo 1. Open a terminal and run:
echo    cd backend
echo    npm start
echo.
echo 2. Open another terminal and run:
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open http://localhost:5173 in your browser
echo.
echo See QUICKSTART.md for detailed instructions
echo.
pause
