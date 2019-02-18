@echo off

SET PLAN=%1
SET INI_FOLDER=%2

robocopy "%~dp0\..\TGV"  "%INI_FOlDER%"    W001001.TGV W003001.TGV W004001.TGV /NP /R:0

call "%INI_FOlDER%\eWAM Set Env.bat"
set wyde-bundle=%wf-root%\Bundle_TestRelease
rd /s /q %wyde-bundle%

%WYDE-ROOT%\Bin\ewamconsole /AllowPrivate:TRUE /ERRORMESSAGE:FALSE /DEBUGTRAP:FALSE /SYSTEM /RUNASIDE /INTEGRATION_XML_PLAN:%PLAN% /run:aWEXIntegrationLauncher.ExecutePlanFromXMLFile
echo ErrorLevel : %errorlevel%
set errorlevel=0