@echo off
setlocal
set "PROJECT_ROOT=%~dp0"
set "PORTABLE_NODE=%PROJECT_ROOT%node-v22.20.0-win-x64\node.exe"

if not exist "%PORTABLE_NODE%" (
  echo No se encontro la copia portatil de Node.js:
  echo %PORTABLE_NODE%
  pause
  exit /b 1
)

"%PORTABLE_NODE%" "%PROJECT_ROOT%scripts\preview-portable.mjs"

if errorlevel 1 (
  echo.
  echo No fue posible iniciar el proyecto.
  pause
)
