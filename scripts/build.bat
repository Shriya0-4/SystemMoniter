@echo off
setlocal

set ROOT=%~dp0..

echo.
echo  =========================================
echo   SysMon Pro Build Script
echo  =========================================
echo.

echo [1/5] Installing server dependencies...
cd /d "%ROOT%\packages\server"
call npm install --omit=dev
if %ERRORLEVEL% NEQ 0 ( echo FAILED: npm install (server) && exit /b 1 )

echo [2/5] Installing dashboard dependencies...
cd /d "%ROOT%\packages\dashboard"
call npm install
if %ERRORLEVEL% NEQ 0 ( echo FAILED: npm install (dashboard) && exit /b 1 )

echo [3/5] Building React dashboard...
call npm run build
if %ERRORLEVEL% NEQ 0 ( echo FAILED: dashboard build && exit /b 1 )

echo [4/5] Checking portable Node.js runtime...
if not exist "%ROOT%\installer\node\node.exe" (
  echo.
  echo  ERROR: installer\node\node.exe not found.
  echo  Download from https://nodejs.org/en/download
  echo  Extract node.exe into installer\node\
  echo.
  exit /b 1
)

echo [5/5] Compiling Inno Setup installer...
set ISCC="C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if not exist %ISCC% set ISCC="C:\Program Files\Inno Setup 6\ISCC.exe"
if not exist %ISCC% set ISCC="C:\Users\%USERNAME%\AppData\Local\Programs\Inno Setup 6\ISCC.exe"
cd /d "%ROOT%"
%ISCC% installer\setup.iss
if %ERRORLEVEL% NEQ 0 ( echo FAILED: Inno Setup compilation && exit /b 1 )

echo.
echo  =========================================
echo   Build complete!
echo   Output: installer\dist\SysMonPro-Setup.exe
echo  =========================================
echo.