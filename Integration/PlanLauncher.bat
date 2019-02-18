@echo off
set PLAN=%1
if "%2"=="/DEBUGPLAN" goto debug
call "%~dp0\..\bin\eWAM Set Env.bat"
goto run

:debug
call "%~dp0\..\bin\DEBUG eWAM Set Env.bat"

:run
%WYDE-ROOT%\bin\ewamconsole /ERRORMESSAGE:FALSE /DEBUGTRAP:FALSE /SYSTEM /RUNASIDE /run:aWEXIntegrationLauncher.ExecutePlan(%PLAN%,true)
echo niveau de l'erreur : %errorlevel%

