@echo off
setlocal
::Add your git.exe path here (e.g. d:\developpement\tools\git\bin), OR put git.exe path to your PATH
set GITPATH=
CALL :CALLEWAMSETENV

if "%~1"=="/nopause" (
   shift 
   set NoPause=1
)
if "%~1"=="/nopauseonnoerror" (
   shift 
   set NoPauseOnNoError=1
)
if "%~2"=="/nopause" (
   set NoPause=1
)
if "%~2"=="/nopauseonnoerror" (
   set NoPauseOnNoError=1
)
SET ACTION=%~1
if "%ACTION%"=="" GOTO quickall
if "%ACTION%"=="/all" GOTO all
if "%ACTION%"=="/quickall" GOTO quickall
if "%ACTION%"=="/quicktgv" GOTO quicktgv
if "%ACTION%"=="/tgv" GOTO tgv
if "%ACTION%"=="/git" GOTO git

echo Possible arguments:
echo.   /all         Sync GIT and TGV from shared repository 
echo.   /quickall    Sync GIT and TGV from local copy
echo.   /quicktgv    Sync TGV only from local copy
echo.   /tgv         Sync TGV only from shared repository
echo.   /git         Sync GIT only
echo No argument defaults to /quickall.
echo Local copy is put in WF-tmp i.e. %WF-tmp%.
echo "git.exe" should be in your PATH or GITPATH should be set in this script.
echo Use additional parameter /nopause to prevent the script from pausing when 
echo done.
echo Use additional parameter /nopauseonnoerror to prevent the script from pausing when 
echo done without any errors.
GOTO errorexit

:all
echo **GIT and TGV from repository**
echo.
call :gitsync
call :tgvsync
GOTO endofscript

:quickall
echo **GIT and TGV from local copy**
echo.
call :gitsync
call :tgvcopy
call :tgvsync
call :tgvclean
GOTO endofscript

:quicktgv
echo **TGV only from local copy**
echo.
call :tgvcopy
call :tgvsync
call :tgvclean
GOTO endofscript

:tgv
echo **TGV only from repository**
echo.
call :tgvsync
GOTO endofscript

:git
echo **GIT only**
echo.
call :gitsync
GOTO endofscript

::Git synchronization
:gitsync
:: Note you need to have git.exe in you PATH in order to allow git pull from this script.
ECHO --------------------------------
ECHO #INFO# GIT Sync Started...
set PATH=%PATH%;%GITPATH%
echo Retrieving git.exe path...
@FOR /F "tokens=*" %%F IN ('where git.exe') do set GITCMD=%%F
IF "%GITCMD%"=="" CALL :GITFILENOTFOUNDERROR
IF "%GITCMD%"=="" GOTO :EOF
:GITSYNCWYNSURE
echo.
echo Retrieving Wynsure git changes...
cd /d %~dp0
"%GITCMD%" pull
if ERRORLEVEL 1 echo Git sync of Wynsure failed. See log above.
:GITSYNCDEV
echo.
echo Retrieving Dev git changes...
cd /d %ENV-ROOT%/Dev
"%GITCMD%" pull
if ERRORLEVEL 1 echo Git sync of Dev failed. See log above.
:GITSYNCWYNSUREFULLWEB
IF NOT EXIST %FULLWEB_ROOT% GOTO :GITSYNCDESIGNWORKSHOP
echo.
echo Retrieving Wynsure FullWeb git changes...
cd /d %ROOTFOLDER%/wynsure-fullweb
"%GITCMD%" pull
if ERRORLEVEL 1 echo Git sync of Wynsure-FullWeb failed. See log above.
:GITSYNCDESIGNWORKSHOP
IF NOT EXIST %DESIGNWORKSHOP_ROOT% GOTO :ENDGITSYNC
echo.
echo Retrieving Design Workshop git changes...
cd /d %ROOTFOLDER%/design-workshop-packages
"%GITCMD%" pull
if ERRORLEVEL 1 echo Git sync of Design Workshop failed. See log above.
:ENDGITSYNC
ECHO #INFO# GIT Sync finished
ECHO --------------------------------
GOTO :EOF

:GITFILENOTFOUNDERROR
echo #ERROR# Couldn't find git.exe. Either set the GITPATH variable in this script,
echo #ERROR# or add git.exe directory to your to your PATH. 
echo #ERROR# Skipping git sync.
echo.
GOTO :EOF

::Make local copy of TGVs
:tgvcopy
ECHO --------------------------------
ECHO #INFO# Copying ref base locally...
echo Checking if for "%wyde-refdevtgv%"\#####*.log, see if base4 is available for copy...
@FOR /F "tokens=*" %%F IN ('dir /B "%wyde-refdevtgv%"\#####*.log') do set LOCKFILES=%%F

if "%LOCKFILES%"=="" echo ... Good. All systems are GO.
if NOT "%LOCKFILES%"=="" echo ... Nope. DB is locked for now: file "%wyde-refdevtgv%"\%LOCKFILES% found. Try again later.
if NOT "%LOCKFILES%"=="" GOTO :EOF

echo Copying shared TGV to "%WF-tmp%"\
xcopy /Y "%WYDE-REFDEVTGV%"\W004001.TGV "%WF-tmp%"\
if ERRORLEVEL 1 (
   echo Couldn't copy "%WYDE-REFDEVTGV%"\W004001.TGV. Aborting.
   goto :errorexit
)

xcopy /Y "%WYDE-REFDEVTGV%"\#####AntiSharedFile.tmp "%WF-tmp%"\
if ERRORLEVEL 1 (
   echo Couldn't copy "%WYDE-REFDEVTGV%"\#####AntiSharedFile.tmp. Aborting.
   goto :errorexit
)

set WYDE-REFDEVTGV=%WF-tmp%
ECHO #INFO# End of copying ref base locally
ECHO --------------------------------
echo.
GOTO :EOF

::TGV Sync
:tgvsync
ECHO --------------------------------
ECHO #INFO# Starting synchronization of TGV with ref base...
echo Synchronizing with local shared TGV...
%WYDE-ROOT%\Bin\ewam.exe /SYNCHRONIZEALL %*
ECHO #INFO# End of synchronization of TGV with ref base
ECHO --------------------------------
echo.
GOTO :EOF

::Clean local copy of TGVs
:tgvclean
ECHO --------------------------------
ECHO #INFO# Cleaning local copy ref base...
echo Cleaning "%WF-tmp%"\
del "%WF-tmp%"\W004001.TGV "%WF-tmp%"\#####AntiSharedFile.tmp
ECHO #INFO# Cleaning local copy ref base finished
ECHO --------------------------------
echo.
GOTO :EOF

:CALLEWAMSETENV
IF EXIST "%~dp0ewam set env.bat" CALL "%~dp0ewam set env.bat"
IF NOT EXIST "%~dp0ewam set env.bat" IF EXIST "%ENV-ROOT%\ewam set env.bat" CALL "%ENV-ROOT%\ewam set env.bat"
GOTO :EOF

::An error occured
:errorexit
endlocal
set errorCode=1
setlocal

::Exit cleanly
:endofscript
echo Exiting ...
if not defined NoPause (
   if not defined NoPauseOnNoError (
      pause
   ) else (
      if defined errorCode (
	     pause
	  ) else (
	     echo Synchronization successfull
		 TIMEOUT 5
	  )
   )
) else (
   TIMEOUT 5 /NOBREAK
)
endlocal

:END
exit %errorCode%