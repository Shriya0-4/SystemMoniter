@echo off
:: Called by Inno Setup after files are copied.
:: Registers SysMon Pro as a Windows Service using node-windows.
::
:: %1 = install directory (passed from setup.iss)

SET INSTALL_DIR=%~1
SET NODE_EXE=%INSTALL_DIR%\runtime\node.exe
SET SCRIPT=%INSTALL_DIR%\server\src\service\install.js

echo [SysMon Pro] Registering Windows Service...
echo Install dir: %INSTALL_DIR%

:: Set PORT env for the service
SET PORT=3001

"%NODE_EXE%" "%SCRIPT%"

IF %ERRORLEVEL% NEQ 0 (
  echo [SysMon Pro] Service registration failed. You may need to run as Administrator.
  exit /b 1
)

echo [SysMon Pro] Service registered and started successfully.
exit /b 0
