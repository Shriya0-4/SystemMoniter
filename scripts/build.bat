@echo off
:: ============================================================
::  SysMon Pro — Full Build Script
::  Run from the repo root. Produces installer\dist\SysMonPro-Setup.exe
::  Requirements: Node.js, Inno Setup 6 installed
:: ============================================================

echo.
echo  =========================================
echo   SysMon Pro Build Script
echo  =========================================
echo.

:: Step 1 — Install server dependencies
echo [1/5] Installing server dependencies...
cd packages\server
call npm install --production
if %ERRORLEVEL% NEQ 0 ( echo FAILED: npm install (server) && exit /b 1 )
cd ..\..

:: Step 2 — Install dashboard dependencies
echo [2/5] Installing dashboard dependencies...
cd packages\dashboard
call npm install
if %ERRORLEVEL% NEQ 0 ( echo FAILED: npm install (dashboard) && exit /b 1 )

:: Step 3 — Build dashboard
echo [3/5] Building React dashboard...
call npm run build
if %ERRORLEVEL% NEQ 0 ( echo FAILED: dashboard build && exit /b 1 )
cd ..\..

:: Step 4 — Check Node portable runtime exists
echo [4/5] Checking portable Node.js runtime...
if not exist "installer\node\node.exe" (
  echo.
  echo  ERROR: installer\node\node.exe not found.
  echo  Download the Windows portable binary from https://nodejs.org/en/download
  echo  Extract node.exe into installer\node\
  echo.
  exit /b 1
)

:: Step 5 — Compile Inno Setup
echo [5/5] Compiling Inno Setup installer...
set ISCC="C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if not exist %ISCC% (
  set ISCC="C:\Program Files\Inno Setup 6\ISCC.exe"
)
%ISCC% installer\setup.iss
if %ERRORLEVEL% NEQ 0 ( echo FAILED: Inno Setup compilation && exit /b 1 )

echo.
echo  =========================================
echo   Build complete!
echo   Output: installer\dist\SysMonPro-Setup.exe
echo  =========================================
echo.
