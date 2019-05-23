@ECHO OFF

SET CREATEUSERSRETURNCODE=0
SET ACTIVEDIRECTORYPARAMETERS=ActiveDirectoryMainInformations.txt
SET CREATEUSERSLOGFILE=CreateUsers.log
SET CREATEUSERSIMPORTFILE=CreateUsers.csv

ECHO #INFO# Starting %~nx0 > %CREATEUSERSLOGFILE%
IF NOT EXIST "%CREATEUSERSIMPORTFILE%" CALL :FILENOTFOUNDERROR "%CREATEUSERSIMPORTFILE%"
IF NOT EXIST "%ACTIVEDIRECTORYPARAMETERS%" CALL :FILENOTFOUNDERROR "%ACTIVEDIRECTORYPARAMETERS%"
CALL :READMAINPARAMETERS
CALL :CHECKPARAMETERS
IF NOT %CREATEUSERSRETURNCODE%==0 GOTO ENDINERROR

FOR /F "tokens=1,2,3 delims=;" %%I IN (%CREATEUSERSIMPORTFILE%) DO CALL :DSADDCMD "%%I" "%%J" "%%K"
IF NOT %CREATEUSERSRETURNCODE%==0 GOTO ENDINERROR
GOTO END

:READMAINPARAMETERS
FOR /F "tokens=1,2" %%I IN (%ACTIVEDIRECTORYPARAMETERS%) DO SET %%I=%%J
GOTO :EOF

:CHECKPARAMETERS
IF "%AD_WYNSUREDOMAIN%"=="" ECHO #ERROR# Parameter AD_WYNSUREDOMAIN needed and does not exist
IF "%AD_WYNUSER%"=="" ECHO #ERROR# Parameter AD_WYNUSER needed and does not exist
IF "%AD_WYNDOMAIN%"=="" ECHO #ERROR# Parameter AD_WYNDOMAIN needed and does not exist
IF "%AD_WYNSUREDOMAIN%"=="" SET CREATEUSERSRETURNCODE=1
IF "%AD_WYNUSER%"=="" SET CREATEUSERSRETURNCODE=1
IF "%AD_WYNDOMAIN%"=="" SET CREATEUSERSRETURNCODE=1
GOTO :EOF

:DSADDCMD
SET USERNAME=%~1
SET USERMAIL=%~2
SET PASSWORD=%~3
SET USERNAME=%USERNAME%%AD_GROUPPOSTFIX%
ECHO #INFO# Adding user %USERNAME%
ECHO #INFO# Adding user %USERNAME%>> %CREATEUSERSLOGFILE% 2>&1
SET UPN=%USERNAME%%AD_WYNDOMAIN%
dsadd user "cn=%USERNAME%,%AD_WYNUSER%,%AD_WYNSUREDOMAIN%" -upn "%UPN%" -samid "%USERNAME%" -fn "%USERNAME%" -mi Z  -ln "%USERNAME%" -office R -email %USERMAIL% -pwd %PASSWORD%>> %CREATEUSERSLOGFILE% 2>&1
IF NOT %ERRORLEVEL%==0 SET CREATEUSERSRETURNCODE=%ERRORLEVEL%
GOTO :EOF

:FILENOTFOUNDERROR
ECHO #ERROR# File not found : %1. Please check and retry.
SET CREATEUSERSRETURNCODE=1
GOTO END

:ENDINERROR
ECHO ============= LOG CONTENT : ===================
TYPE %CREATEUSERSLOGFILE%
ECHO .
ECHO ===============================================
ECHO #ERROR# %~nx0 ended in failure with return code %CREATEUSERSRETURNCODE%. Please check the log %CREATEUSERSLOGFILE%.
GOTO END

:END
ECHO End of %~nx0. Return code : %CREATEUSERSRETURNCODE%
PAUSE
EXIT /B %CREATEUSERSRETURNCODE%