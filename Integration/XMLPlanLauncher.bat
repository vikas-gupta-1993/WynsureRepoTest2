@echo off
cd /d %~dp0
set PLAN=%1
if "%2"=="/DEBUGPLAN" goto debug
if "%3"=="/TESTINSTALL" goto runtestinstall
call "..\bin\eWAM Set Env.bat"
goto run


:debug
call "..\bin\DEBUG eWAM Set Env.bat"

:run
ewamconsole /ERRORMESSAGE:FALSE /DEBUGTRAP:FALSE /SYSTEM /RUNASIDE /INTEGRATION_XML_PLAN:%PLAN% /run:aWEXIntegrationLauncher.ExecutePlanFromXMLFile
goto end

:runtestinstall
call "%TGVFolder%\eWAM Set Env.bat"
ewamconsole /ERRORMESSAGE:FALSE /DEBUGTRAP:FALSE /SYSTEM /RUNASIDE /INTEGRATION_XML_PLAN:%PLAN% /run:aWEXIntegrationLauncher.ExecutePlanFromXMLFile /IDENOPROMPT

:end
echo ErrorLevel : %errorlevel%
set errorlevel=0
@echo on
