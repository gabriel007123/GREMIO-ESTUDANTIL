@echo off
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado.
  echo Instale o Node.js LTS em https://nodejs.org/ e tente novamente.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando dependencias pela primeira vez...
  call npm install
)
echo Iniciando o site...
call npm run dev
pause
