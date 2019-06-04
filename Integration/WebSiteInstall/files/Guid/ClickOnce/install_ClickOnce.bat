@echo off

SET INSTALLCLICKONCERETURNCODE=0

set BINVER=%1
set PORT=%2
set SERVER_PORT=%3
SET USERNAME=%4
SET PRODUCTNAME=ClickOnce

SET CLICKONCERESOURCES=%WF-ROOT%\Integration\WebSiteInstall\files\resources\ClickOnce
SET CLICKONCECONFIGTEMPLATES=%WF-ROOT%\Integration\WebSiteInstall\files\ConfigFiles\ClickOnce
IF NOT EXIST %CLICKONCERESOURCES% CALL :PATHNOTFOUND %CLICKONCERESOURCES%
IF NOT EXIST %CLICKONCECONFIGTEMPLATES% CALL :PATHNOTFOUND %CLICKONCECONFIGTEMPLATES%


set GSP_HANDLER_EXT=*.gold
set GSP_HANDLER_NAME=GOLD_WS
SET GSP_CONFIG_FILE=SoapAPIConf.cfg

:: Those parameters are for another web site : here we should have the 2 config files of ClickOnce under CLICKONCECONFIGTEMPLATES


IF %INSTALLCLICKONCERETURNCODE%==0 GOTO ENDINERROR

:: Path to be reviewed, or if it is simple you can simply add your script.
CALL %~dp0..\Install_.bat %PRODUCTNAME%


:PATHNOTFOUND
ECHO #ERROR# Installation is not possible, path not found : %1
SET INSTALLCLICKONCERETURNCODE=1
GOTO :EOF

:ENDINERROR
ECHO #ERROR# %~nx0 ended in error, please check the console output and the log file %LOG%
GOTO :END

:END
EXIT /B %INSTALLCLICKONCERETURNCODE%
