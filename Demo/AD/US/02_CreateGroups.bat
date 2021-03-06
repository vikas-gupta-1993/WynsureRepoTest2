@ECHO OFF

SET CREATEGROUPSRETURNCODE=0
SET ACTIVEDIRECTORYPARAMETERS=ActiveDirectoryMainInformations.txt
SET CREATEGROUPSLOGFILE=CreateGroups.log
SET CREATEGROUPSIMPORTFILE=CreateGroups.csv

ECHO #INFO# Starting %~nx0 > %CREATEGROUPSLOGFILE%
IF NOT EXIST "%CREATEGROUPSIMPORTFILE%" CALL :FILENOTFOUNDERROR "%CREATEGROUPSIMPORTFILE%"
IF NOT EXIST "%ACTIVEDIRECTORYPARAMETERS%" CALL :FILENOTFOUNDERROR "%ACTIVEDIRECTORYPARAMETERS%"
CALL :READMAINPARAMETERS
CALL :CHECKPARAMETERS
IF NOT %CREATEGROUPSRETURNCODE%==0 GOTO ENDINERROR

FOR /F "tokens=1,2 delims=;" %%I IN (%CREATEGROUPSIMPORTFILE%) DO CALL :DSADDCMD "%%I" "%%J"
IF NOT %CREATEGROUPSRETURNCODE%==0 GOTO ENDINERROR
GOTO END

:READMAINPARAMETERS
FOR /F "tokens=1,2" %%I IN (%ACTIVEDIRECTORYPARAMETERS%) DO SET %%I=%%J
GOTO :EOF

:CHECKPARAMETERS
IF "%AD_WYNSUREDOMAIN%"=="" ECHO #ERROR# Parameter AD_WYNSUREDOMAIN needed and does not exist
IF "%AD_WYNGROUP%"=="" ECHO #ERROR# Parameter AD_WYNGROUP needed and does not exist
IF "%AD_GROUPPREFIX%"=="" ECHO #ERROR# Parameter AD_GROUPPREFIX needed and does not exist
IF "%AD_GROUPPOSTFIX%"=="" ECHO #ERROR# Parameter AD_GROUPPOSTFIX needed and does not exist
IF "%AD_WYNSUREDOMAIN%"=="" SET CREATEGROUPSRETURNCODE=1
IF "%AD_WYNGROUP%"=="" SET CREATEGROUPSRETURNCODE=1
IF "%AD_GROUPPREFIX%"=="" SET CREATEGROUPSRETURNCODE=1
IF "%AD_GROUPPOSTFIX%"=="" SET CREATEGROUPSRETURNCODE=1
GOTO :EOF

:DSADDCMD
SET AUTHORIZATIONPROFILECODE=%~1
ECHO %2
SET FULLDESC=%~2
SET ADGROUPCODE=%AD_GROUPPREFIX%%AUTHORIZATIONPROFILECODE%%AD_GROUPPOSTFIX%
ECHO #INFO# Adding group %FULLDESC:&=_%
ECHO #INFO# Adding group %FULLDESC:&=_% >> %CREATEGROUPSLOGFILE% 2>&1
dsadd group "cn=%ADGROUPCODE%,%AD_WYNGROUP%,%AD_WYNSUREDOMAIN%" -secgrp yes -scope g -samid "%ADGROUPCODE%" -desc "%FULLDESC%" >> %CREATEGROUPSLOGFILE% 2>&1
IF NOT %ERRORLEVEL%==0 SET CREATEGROUPSRETURNCODE=%ERRORLEVEL%
GOTO :EOF

:FILENOTFOUNDERROR
ECHO #ERROR# File not found : %1. Please check and retry.
SET CREATEGROUPSRETURNCODE=1
GOTO END

:ENDINERROR
ECHO ============= LOG CONTENT : ===================
TYPE %CREATEGROUPSLOGFILE%
ECHO .
ECHO ===============================================
ECHO #ERROR# %~nx0 ended in failure with return code %CREATEGROUPSRETURNCODE%. Please check the log %CREATEGROUPSLOGFILE%.
GOTO END

:END
ECHO End of %~nx0. Return code : %CREATEGROUPSRETURNCODE%
PAUSE
EXIT /B %CREATEGROUPSRETURNCODE%


