SET PRODUCTNAME=wWeb
SET WWEBRESOURCES=%WF-ROOT%\inetpub\wwwroot
set GSP_HANDLER_EXT=*.html
set GSP_HANDLER_NAME=HTML_GSP

SET CONFIGENVWPORTALRETURNCODE=0
cd %~dp0..\..\..\..
SET WYNSURERESOURCESFOLDER=%CD%
cd ..
IF NOT %ERRORLEVEL%==0 SET CONFIGENVWPORTALRETURNCODE=%ERRORLEVEL%

IF EXIST "Dev\bin\eWam Set Env.bat" CALL "Dev\bin\eWam Set Env.bat"
IF NOT %ERRORLEVEL%==0 SET CONFIGENVWPORTALRETURNCODE=%ERRORLEVEL%
IF NOT EXIST "Dev\bin\eWam Set Env.bat" IF EXIST "%WYNSURERESOURCESFOLDER%\bin\eWam Set Env.bat" CALL "%WYNSURERESOURCESFOLDER%\bin\eWam Set Env.bat"
IF NOT %ERRORLEVEL%==0 SET CONFIGENVWPORTALRETURNCODE=%ERRORLEVEL%
IF NOT EXIST "Dev\bin\eWam Set Env.bat" IF NOT EXIST "%WYNSURERESOURCESFOLDER%\bin\eWam Set Env.bat" CALL EWAMSETENVNOTFOUND

IF NOT %CONFIGENVWPORTALRETURNCODE%==0 GOTO ENDINERROR

::set SERVER_PORT_STR={SERVER_PORT_GSP}
set GSP_SUFFIX=_%PRODUCTNAME%
set APPCMD=%windir%\system32\inetsrv\appcmd.exe
SET INSTALLWPORTALROOTFOLDER=%WF-ROOT%\integration\WebSiteInstall
SET CONFIGGSPSOURCE=%INSTALLWPORTALROOTFOLDER%\files\ConfigFiles\GSP
SET CONFIGWSMFRSOURCE=%INSTALLWPORTALROOTFOLDER%\files\ConfigFiles\WSM\FR
SET CONFIGWSMENSOURCE=%INSTALLWPORTALROOTFOLDER%\files\ConfigFiles\WSM\EN
SET ROOTWEBSITESFOLDER=%ENV-ROOT%\inetpub
set SITEDIR=%ROOTWEBSITESFOLDER%\wwwroot_wWeb
set GSPFOLDERSOURCE=%WYDE-ROOT%\Dll
set GSPFOLDERTARGET=%SITEDIR%\GSP%GSP_SUFFIX%
set GSPDLL=%GSPFOLDERTARGET%\GSP.dll
set VIRTUAL_DIR_LIST=client groupadmin broker wynsure demo
set BATCH=%INSTALLWPORTALROOTFOLDER%\files\batch
GOTO END

:EWAMSETENVNOTFOUND
ECHO #ERROR# File "eWam Set Env.bat" not found, please check and retry (not found nor on Dev\bin\ neither on "%WYNSURERESOURCESFOLDER%\bin")
SET CONFIGENVWPORTALRETURNCODE=1
GOTO :EOF

:ENDINERROR
ECHO #ERROR# Error level %CONFIGENVWPORTALRETURNCODE%, please check and retry
GOTO END

:END
EXIT /B %CONFIGENVWPORTALRETURNCODE%