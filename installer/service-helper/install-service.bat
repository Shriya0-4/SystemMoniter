@echo off
SET APP_DIR=%~1
SET NODE_EXE=%APP_DIR%\runtime\node.exe
SET SCRIPT=%APP_DIR%\server\src\service\install.js

echo Running SysMon Pro service installer...
"%NODE_EXE%" "%SCRIPT%"