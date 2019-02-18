
SET INSTALLIISRETURNCODE=0
SET bSITEALREADYEXIST=FALSE
SET bAPPPOOLALREADYEXIST=FALSE

IF "%GSP_HANDLER_VERBS%"=="" SET GSP_HANDLER_VERBS=GET,HEAD,POST

ECHO #INFO# %~0 starting...
SET TMPSITEINFOFILE=%WF-Tmp%\siteinfo.xml

:: removing web site and apppool if exist
%APPCMD% list site %SITENAME% > %TMPSITEINFOFILE%
SET ERRORLEVEL=0
FOR /F %%I IN (%TMPSITEINFOFILE%) DO IF NOT "%%I"=="" SET bSITEALREADYEXIST=TRUE
%APPCMD% list apppool %APPPOOL% > %TMPSITEINFOFILE%
SET ERRORLEVEL=0
FOR /F %%I IN (%TMPSITEINFOFILE%) DO IF NOT "%%I"=="" SET bAPPPOOLALREADYEXIST=TRUE
IF %bSITEALREADYEXIST%==TRUE CALL :REMOVEWEBSITE
IF %bAPPPOOLALREADYEXIST%==TRUE CALL :REMOVEAPPPOOL
IF NOT EXIST "%SITEDIR%" MKDIR "%SITEDIR%"
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%
IF NOT %INSTALLIISRETURNCODE%==0 GOTO ENDINERROR

echo #INFO# Configuring IIS
call %BATCH%\repl_in_file.bat "%GSPFOLDERTARGET%\WNETCONF.INI" {GSP_ALIAS} %GSP_ALIAS%
call %BATCH%\repl_in_file.bat "%GSPFOLDERTARGET%\WNETCONF.INI" {SERVER_PORT_GSP} %SERVER_PORT%
call %BATCH%\repl_in_file.bat "%GSPFOLDERTARGET%\WNETCONF.INI" {SERVER_PORT_WS} %SERVER_PORT%
call %BATCH%\repl_in_file.bat "%GSPFOLDERTARGET%\WNETCONF.INI" {WYDE_ROOT} %WYDE-ROOT%

echo #INFO# Create and configure AppPool %APPPOOL%
CALL :ADDAPPPOOL %APPPOOL%
IF NOT %INSTALLIISRETURNCODE%==0 GOTO ENDINERROR

echo #INFO# Create and configure site %SITENAME%
CALL :ADDSITE %SITENAME% %APPPOOL%
IF NOT %INSTALLIISRETURNCODE%==0 GOTO ENDINERROR
GOTO CLEANBEFOREEXIT

:REMOVEWEBSITE
ECHO #INFO# Removing existing site %SITENAME% and delete file %SITEDIR%\web.config
%APPCMD% delete site "%SITENAME%/"
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%
IF EXIST %SITEDIR%\web.config del /Q /F %SITEDIR%\web.config
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%
GOTO :EOF

:REMOVEAPPPOOL
ECHO #INFO# Removing existing AppPool %APPPOOL%
%APPCMD% delete apppool "%APPPOOL%"
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%
GOTO :EOF

:ADDSITE
echo #INFO# Create site %1
%APPCMD% add site /name:"%1" /physicalPath:%SITEDIR%
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%

echo #INFO# Add AppPool %2 to site %1
%APPCMD% set app /app.name:"%1/" /applicationPool:"%2"
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%

echo #INFO# Add Port number %PORT% to site %1
%APPCMD% set site /site.name:"%1" /+bindings.[protocol='http',bindingInformation='*:%PORT%:']
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%

echo #INFO# Add handler %GSP_HANDLER_NAME%_%SITENAME% to site %1
IF "%BINVER%"=="Win32" SET ADDHANDLE32PRECONDITION=,preCondition='bitness32'
%APPCMD% set config "%1/" /section:handlers /+[name='%GSP_HANDLER_NAME%_%SITENAME%',path='%GSP_HANDLER_EXT%',verb='%GSP_HANDLER_VERBS%',modules='IsapiModule',scriptProcessor='%GSPDLL%',resourceType='Unspecified',requireAccess='Script'%ADDHANDLE32PRECONDITION%] /commit:site
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%

echo #INFO# Remove if exist handler %GSP_HANDLER_NAME%_%SITENAME% from isapiCgiRestriction
ECHO %APPCMD% set config "/" /section:isapiCgiRestriction "/-[description='%GSP_HANDLER_NAME%_%SITENAME%']"
%APPCMD% set config "/" /section:isapiCgiRestriction "/-[description='%GSP_HANDLER_NAME%_%SITENAME%']"
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%

echo #INFO# Add handler %GSP_HANDLER_NAME% to isapiCgiRestriction
%APPCMD% set config "/" /section:isapiCgiRestriction /+[path='%GSPDLL%',description='%GSP_HANDLER_NAME%_%SITENAME%',allowed='True']
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%

echo #INFO# Add index.html file on default web.config
%APPCMD% set config "%1/" /section:defaultDocument "/-files.[value='index.html']"
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%
%APPCMD% set config "%1/" /section:defaultDocument "/+files.[value='index.html']"
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%
%APPCMD% set config "%1/" /section:defaultDocument "/-files.[value='default.aspx']"                
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%

echo #INFO# Adding virtual directories (%VIRTUAL_DIR_LIST%) to web site %1
for %%P in (%VIRTUAL_DIR_LIST%) do %APPCMD% add vdir /app.name:"%1/" /path:"/%%P" /physicalPath:"%VIRTUAL_DIR%"
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%
GOTO :EOF

:ADDAPPPOOL
ECHO #INFO# Add AppPool %1
%APPCMD% add apppool /name:%1
ECHO #INFO# Set AppPool autostart
%APPCMD% set config -section:applicationPools -[name='%1'].autoStart:true
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%
call %BATCH%\get_arch.bat
IF "%ARCH%"=="AMD64" IF "%BINVER%"=="Win32" ECHO #INFO# Set AppPool enable32BitAppOnWin64
IF "%ARCH%"=="AMD64" IF "%BINVER%"=="Win32" %APPCMD% set config -section:applicationPools -[name='%1'].enable32BitAppOnWin64:true
IF NOT %ERRORLEVEL%==0 SET INSTALLIISRETURNCODE=%ERRORLEVEL%
GOTO :EOF

:ENDINERROR
ECHO #ERROR# %~0 ended in error with return code %INSTALLIISRETURNCODE%. Please check log file %LOG% and retry.
GOTO CLEANBEFOREEXIT

:CLEANBEFOREEXIT
IF EXIST "%TMPSITEINFOFILE%" DEL /Q /F "%TMPSITEINFOFILE%"
GOTO END

:END
ECHO #INFO# End of %~n0 with return code %INSTALLIISRETURNCODE%
EXIT /B %INSTALLIISRETURNCODE%