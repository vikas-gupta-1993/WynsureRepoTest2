@echo off

SET INSTALLWPORTALRETURNCODE=0
SET PRODUCTNAME=ClickOnce
SET GSP_CONFIG_FILE=GSPNetConf.cfg
call %~dp0..\batch\config_env_ClickOnce.bat
IF NOT %ERRORLEVEL%==0 SET INSTALLWPORTALRETURNCODE=%ERRORLEVEL%
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::
set BINVER=%1
set PORT_FR=%2
set PORT_US=%3
set SERVER_PORT=%4
set PORTALDIRNAME=ClickOnce
set COPYMODE=%5
SET USERNAME=%6

echo PORT_FR: %PORT_FR%
echo PORT_US: %PORT_US%
echo SERVER_PORT: %SERVER_PORT%
echo USERNAME: %USERNAME%

IF "%PORT_FR%"=="" GOTO LAUNCHERROR
IF "%PORT_US%"=="" GOTO LAUNCHERROR
IF "%SERVER_PORT%"=="" GOTO LAUNCHERROR
IF "%USERNAME%"=="" GOTO LAUNCHERROR

set SITENAMEFR=%USERNAME%_%PRODUCTNAME%%PORT_FR%_FR
set SITENAMEUS=%USERNAME%_%PRODUCTNAME%%PORT_US%_US
set APPPOOL_FR=%USERNAME%_%PRODUCTNAME%AppPool%PORT_FR%
set APPPOOL_US=%USERNAME%_%PRODUCTNAME%AppPool%PORT_US%

::set VIRTUAL_DIR=%WF-ROOT%\inetpub\wwwroot
::set VIRTUAL_DIR=%SITEDIR%\%PORTALDIRNAME%

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
IF EXIST "%PORTALDIR%" (
	if /I "%COPYMODE%" EQU "override" (
		set COPYRESSOURCES=Y
	) ELSE (
		set COPYRESSOURCES=N
	)
) ELSE (
	set COPYRESSOURCES=Y
)
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

ECHO *********************************************
ECHO Main local variables :
ECHO PRODUCTNAME : %PRODUCTNAME%
ECHO USERNAME : %USERNAME%
ECHO BINVER : %BINVER%
ECHO PORT_FR : %PORT_FR%
ECHO PORT_US : %PORT_US%
ECHO SERVER_PORT : %SERVER_PORT%
::ECHO PORTALDIRNAME : %PORTALDIRNAME%
ECHO COPYMODE : %COPYMODE%
ECHO SITENAMEFR : %SITENAMEFR%
ECHO SITENAMEUS : %SITENAMEUS%
ECHO APPPOOL_FR : %APPPOOL_FR%
ECHO APPPOOL_US : %APPPOOL_US%
ECHO SERVER_PORT_STR : %SERVER_PORT_STR%
::ECHO INSTALLWPORTALROOTFOLDER : %INSTALLWPORTALROOTFOLDER%
ECHO ROOTWEBSITESFOLDER : %ROOTWEBSITESFOLDER%
ECHO GSPFOLDERSOURCE : %GSPFOLDERSOURCE%
ECHO GSPFOLDERTARGET : %GSPFOLDERTARGET%
ECHO GSPDLL : %GSPDLL%
::ECHO WWEBRESOURCES : %WWEBRESOURCES%
ECHO SITEDIRFR : %SITEDIRFR%
ECHO SITEDIRUS : %SITEDIRUS%
::ECHO VIRTUAL_DIR_LIST : %VIRTUAL_DIR_LIST%
ECHO BATCH : %BATCH%
::ECHO GSP_HANDLER_EXT : %GSP_HANDLER_EXT%
::ECHO GSP_HANDLER_NAME : %GSP_HANDLER_NAME%
::ECHO GSP_CONFIG_FILE : %GSP_CONFIG_FILE%
ECHO *********************************************

call %BATCH%\create_log.bat
IF NOT %ERRORLEVEL%==0 SET INSTALLWPORTALRETURNCODE=%ERRORLEVEL%
call %BATCH%\check_env.bat
IF NOT %ERRORLEVEL%==0 SET INSTALLWPORTALRETURNCODE=%ERRORLEVEL%
IF NOT %INSTALLWPORTALRETURNCODE%==0 GOTO ERRORINSTALL
call %BATCH%\copy_resources_ClickOnce.bat
IF NOT %ERRORLEVEL%==0 SET INSTALLWPORTALRETURNCODE=%ERRORLEVEL%
call %BATCH%\launch_install_ClickOnce.bat
IF NOT %ERRORLEVEL%==0 SET INSTALLWPORTALRETURNCODE=%ERRORLEVEL%
call %BATCH%\create_launchers_ClickOnce.bat
IF NOT %ERRORLEVEL%==0 SET INSTALLWPORTALRETURNCODE=%ERRORLEVEL%
start %ENV-ROOT%\bin\%PRODUCTNAME%
IF NOT %INSTALLWPORTALRETURNCODE%==0 GOTO ERRORINSTALL
GOTO END

:ERRORINSTALL
echo #ERROR# Installation failed
GOTO END

:LAUNCHERROR
SET INSTALLWPORTALRETURNCODE=1
echo #ERROR# Launch error : install_wWeb [BINVER] [PORT] [SERVER_PORT] [PORTALDIRNAME] [COPYMODE] [USERNAME]
echo #ERROR# Please choose IIS Port, WSM Port, portal directory name, user name
GOTO END

:END
exit /B %INSTALLWPORTALRETURNCODE%

