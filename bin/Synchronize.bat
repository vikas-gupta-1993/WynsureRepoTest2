@echo off

ECHO -----------------------------------------------------------
SET SYNCHRONIZE=%0
SET errorCode=0
ECHO #INFO# %date% %time% Start of %SYNCHRONIZE%

setlocal

:::::::::::::::
:: Workaround : synchronize.bat file is called from eWAM on some cases using path %WYDE-ROOT%\Bin : this has to be changed
:: to be able synchronize waiting for this change :
IF "%WF-tmp%"=="" SET WF-tmp=%WYDE-ROOT%\tmp
::Add your git.exe path here (e.g. d:\developpement\tools\git\bin), OR put git.exe path to your PATH
IF "%GITPATH%"=="" set "GITPATH=C:\Program Files (x86)\Git\bin;C:\Program Files\Git\bin"
:::::::::::::::

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

if "%~1"=="" (
   call:quickall
) else (
if "%~1"=="/all" (
   call:all
) else (
if "%~1"=="/quickall" (
   call:quickall
) else (
if "%~1"=="/quicktgv" (
   call:quicktgv
) else (
if "%~1"=="/tgv" (
   call:tgv
) else (
if "%~1"=="/git" (
   call:git
) else (
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
))))))
goto :endofscript

:all
echo **GIT and TGV from repository**
echo.
call:gitsync
call:tgvsync
GOTO:EOF

:quickall
echo **GIT and TGV from local copy**
echo.
call:gitsync
call:tgvcopy
call:tgvsync
call:tgvclean
GOTO:EOF

:quicktgv
echo **TGV only from local copy**
echo.
call:tgvcopy
call:tgvsync
call:tgvclean
GOTO:EOF

:tgv
echo **TGV only from repository**
echo.
call:tgvsync
GOTO:EOF

:git
echo **GIT only**
echo.
call:gitsync
GOTO:EOF

::Git synchronization
:gitsync
:: Note you need to have git.exe in you PATH in order to allow git pull from this script.
set PATH=%PATH%;%GITPATH%

echo #INFO# Retrieving git.exe path...
@FOR /F "tokens=*" %%F IN ('where git.exe') do set GITCMD=%%F
if "%GITCMD%"=="" (
   echo #ERROR# Couldn't find git.exe. Either set the GITPATH variable in this script,
   echo #ERROR# or add git.exe directory to your PATH. 
   echo #ERROR# Skipping git sync.
   echo.
   goto :errorexit
) else (
   echo #INFO# Retrieving git changes...
   rem cd /d %~p0
   cd /d %~dp0
   echo #INFO# Command : "%GITCMD%" pull
   "%GITCMD%" pull
   if ERRORLEVEL 1 (
      echo Git sync failed. See log above.
      goto :errorexit
   ) else (
      echo. 
   )
)
GOTO:EOF

::Make local copy of TGVs
:tgvcopy
echo Checking if for "%wyde-refdevtgv%"\#####*.log, see if base4 is available for copy...
@FOR /F "tokens=*" %%F IN ('dir /B "%wyde-refdevtgv%"\#####*.log') do set LOCKFILES=%%F

if "%LOCKFILES%"=="" (
   echo ... Good. All systems are GO.
   echo.
) else (
   echo ... Nope. DB is locked for now: file "%wyde-refdevtgv%"\%LOCKFILES% found. Try again later.
   echo.
   goto :errorexit
)

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
echo.
GOTO:EOF

::TGV Sync
:tgvsync
echo Synchronizing with local shared TGV...
%WYDE-ROOT%\Bin\ewam.exe /SYNCHRONIZEALL %*
echo.
GOTO:EOF

::Clean local copy of TGVs
:tgvclean
echo Cleaning "%WF-tmp%"\
del "%WF-tmp%"\W004001.TGV "%WF-tmp%"\#####AntiSharedFile.tmp
echo.
GOTO:EOF

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

ECHO #INFO# %date% %time% End of %SYNCHRONIZE%
ECHO -----------------------------------------------------------
exit %errorCode%