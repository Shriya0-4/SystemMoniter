@echo off
:: Called by Inno Setup during uninstall.
:: Stops and removes the SysMon Pro Windows Service.

SET INSTALL_DIR=%~dp0
SET NODE_EXE=%INSTALL_DIR%runtime\node.exe
SET SCRIPT=%INSTALL_DIR%server\src\service\uninstall.js

echo [SysMon Pro] Removing Windows Service...

"%NODE_EXE%" "%SCRIPT%"

:: Also stop via sc in case node-windows had issues
sc stop "SysMon Pro" >nul 2>&1
sc delete "SysMon Pro" >nul 2>&1

echo [SysMon Pro] Service removed.
exit /b 0
