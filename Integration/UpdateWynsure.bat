@echo off
setlocal enabledelayedexpansion enableextensions

REM localisation fichier de configuration
SET INI_FILE=%1
SET SYNCHRO_DATE-TIME=%2
REM récupération time pour créature log jenkins.
SET INI_TIME=%3

SET BATCH_DIR=%ENVLOCATION%\Batch
SET JS_DIR=%ENVLOCATION%\JS

REM Read Wynsure Version in config file
CALL :GetParameterFromConfigFile %INI_FILE% [WYNSURE_VERSION] WYNSURE_VERSION
Title Update of Wynsure %WYNSURE_VERSION%

REM Prepare Output dir Report\WYNSURE_[WYNSURE_VERSION]\UPDATE__[date]__[time]
CALL :GetParameterFromConfigFile %INI_FILE% [WYNSURE_ENV] WYNSURE_ENV
SET WYNSURE_OUTPUT_DIR=%cd%\Report\WYNSURE_%WYNSURE_VERSION%_%WYNSURE_ENV%
if not exist %WYNSURE_OUTPUT_DIR% mkdir %WYNSURE_OUTPUT_DIR%
SET TIME1=%time::=-%
SET TIME1=%TIME1: =%
for /f  "tokens=1,2" %%a in ("%date%") do (
 set d=%%a
 set DATE2=%%b
)
SET DATE2=%DATE2: =%
SET DATE3=%DATE2:~6,4%-%DATE2:~3,2%-%DATE2:~0,2%
REM SET WYNSURE_OUTPUT_DIR_UPDATE=%WYNSURE_OUTPUT_DIR%\UPDATE__!DATE3:/=-!__%TIME1:,=-%
REM Choix de l'emplacement de la log pour la récupération pour Jenkins.
SET WYNSURE_OUTPUT_DIR_UPDATE=%WYNSURE_OUTPUT_DIR%\%INI_TIME%
if not exist %WYNSURE_OUTPUT_DIR_UPDATE% mkdir %WYNSURE_OUTPUT_DIR_UPDATE%

REM redirect current output output to log file
CALL :REDIRECT >%WYNSURE_OUTPUT_DIR_UPDATE%\GenerationReport.log 2>&1
exit %errorlevel% /b
:REDIRECT

REM Connect network drivers
call :ConnectNetworkDrivers %INI_FILE%

call :GetParameterFromConfigFile %INI_FILE% [NEW_FILES_PATH] NEW_DATA_DIR
call :GetParameterFromConfigFile %INI_FILE% [WYNSURE_ROOT] WYNSURE_ROOT

:STOP_SERVICES
echo:
echo =================================================================
echo  STOP SERVICES
for /f "delims=" %%a in (%INI_FILE%) do (
  set Line=%%a
  if "!Line:~0,1!"=="[" (
      set CUR_AREA=!Line!
  ) else (
    if !CUR_AREA!==[WYSEMAN_SERVICES] (
      if not "!Line:~0,1!"=="[;" (
        call :StopWysemanService %%a
      )
    )
  )
)
echo =================================================================

:COPY_EXECUTABLE
echo:
echo =================================================================
echo  COPY EXECUTABLE
call :CopyNewFile %NEW_DATA_DIR% %WYNSURE_ROOT%
echo =================================================================

:UPDATE_RESSOURCE
echo:
echo =================================================================
echo UPDATE OF WYNSURE RESSOURCES
call :UpdateWynsureRessources %WYNSURE_ROOT%
echo =================================================================

:START_SERVICES
echo:
echo =================================================================
echo  START SERVICES
for /f "delims=" %%a in (%INI_FILE%) do (
  set Line=%%a
  if "!Line:~0,1!"=="[" (
      set CUR_AREA=!Line!
  ) else (
    if !CUR_AREA!==[WYSEMAN_SERVICES] (
      if not "!Line:~0,1!"=="[;" (     
        call :StartWysemanService %%a
      )
    )
  )
)
echo =================================================================



:UPDATE_ORACLE_DBS
echo:
echo =================================================================
echo  UPDATE ORACLE DB
for /f "delims=" %%a in (%INI_FILE%) do (
  set Line=%%a
  if "!Line:~0,1!"=="[" (
      set CUR_AREA=!Line!
  ) else (
    if !CUR_AREA!==[ORACLE_DB] (
      if not "!Line:~0,1!"=="[;" (     
        echo !Line! >> tmp.txt
      )
    )
  )
)

for /f "delims=:: tokens=1,2,3" %%a in (tmp.txt) do (
  SET LOGIN=%%a
  SET PWD=%%b
  SET SERVICE=%%c

  FOR /F %%f IN ('DIR %NEW_DATA_DIR%\SQL_UPDATE\*.sql /B 2^>NUL') DO (
    set IS_ORACLE=NOK
	
    @echo %NEW_DATA_DIR%\SQL_UPDATE\%%f | find /I "ORACLE" > nul && set IS_ORACLE=OK
    If !IS_ORACLE!==OK (
      echo Update oracle db for %WYNSURE_VERSION% service !ORA_SERVICE! with file %%f
	  
	  echo exit | sqlplus !LOGIN!/!PWD!@!SERVICE!  @%NEW_DATA_DIR%\SQL_UPDATE\%%f
	  echo file %%f treated
    )
  )
)
del tmp.txt
echo Update done
echo =================================================================

:UPDATE_SQLSERVER_DBS
echo:
echo =================================================================
echo  UPDATE SQLSERVER DB
for /f "delims=" %%a in (%INI_FILE%) do (
  set Line=%%a
  if "!Line:~0,1!"=="[" (
      set CUR_AREA=!Line!
  ) else (
    if !CUR_AREA!==[SQLSERVER_DB] (
      if not "!Line:~0,1!"=="[;" (     
        echo !Line! >> tmp.txt
      )
    )
  )
)
for /f "delims=:: tokens=1,2,3,4" %%a in (tmp.txt) do (
  SET LOGIN=%%a
  SET PWD=%%b
  SET SERVER=%%c
  SET DB_NAME=%%d
  
  FOR /F %%f IN ('DIR %NEW_DATA_DIR%\SQL_UPDATE\*.sql /B 2^>NUL') DO (
    set IS_SQLSERVER=NOK
	
    @echo %NEW_DATA_DIR%\SQL_UPDATE\%%f | find /I "SQLSERVER" > nul && set IS_SQLSERVER=OK
    If !IS_SQLSERVER!==OK (
      echo Update sqlserver for %WYNSURE_VERSION% DB !DB_NAME! with file: %%f
      sqlcmd -U !LOGIN! -P !PWD! -S !SERVER! -d !DB_NAME! -i %NEW_DATA_DIR%\SQL_UPDATE\%%f
	  echo file %%f treated 
    )
  )
)
del tmp.txt
echo Update done
echo =================================================================

:UPDATE_PORTAL_RESSOURCES
echo:
echo =================================================================
echo  UPDATE PORTAL RESSOURCES
for /f "delims=" %%a in (%INI_FILE%) do (
  set Line=%%a
  if "!Line:~0,1!"=="[" (
      set CUR_AREA=!Line!
  ) else (
    if !CUR_AREA!==[PORTAL_RESSOURCES] (
      if not "!Line:~0,1!"=="[;" (     
        call :UpdateWebRessources !Line!
      )
    )
  )
)
echo Update done
echo =================================================================


:UPDATE_DEBUG_ENVS
echo:
echo =================================================================
echo  UPDATE DEBUG ENVS

for /f "delims=" %%a in (%INI_FILE%) do (
  set Line=%%a
  if "!Line:~0,1!"=="[" (
      set CUR_AREA=!Line!
  ) else (
    if !CUR_AREA!==[WYNSURE_DEBUG_ROOTS] (
      if not "!Line:~0,1!"=="[;" (
        call :CopyNewFile %NEW_DATA_DIR% !Line!
      )
    )
  )
)
echo Update done
echo =================================================================


:UPDATE_HOME_PAGE
echo:
echo =================================================================
echo  HOME PAGE OF WYNSURE ENV

call :GetParameterFromConfigFile %INI_FILE% [ENVIRONNEMENT_HOMEPAGE_PATH] ENVIRONNEMENT_HOMEPAGE_PATH
if defined SYNCHRO_DATE-TIME (
  call :UpdateEnvIndexFile %ENVIRONNEMENT_HOMEPAGE_PATH% %WYNSURE_VERSION% %SYNCHRO_DATE-TIME%"
)
echo Update done
echo =================================================================

:UPDATED_ENDED
echo:
echo =================================================================
echo UPDATE ENDED
echo =================================================================

goto :eof

:StopWysemanService
SET WYSEMAN_SERVICE=%~1
echo:
echo STOP WYSEMAN SERVICE "%WYSEMAN_SERVICE%"
NET stop "%WYSEMAN_SERVICE%"
echo:
goto :eof

:StartWysemanService
SET WYSEMAN_SERVICE=%~1
echo:
echo START WYSEMAN SERVICE "%WYSEMAN_SERVICE%"
NET start "%WYSEMAN_SERVICE%"
echo:
goto :eof

:CopyNewFile
SET SOURCE=%~1
SET CUR_WYNSURE_ROOT=%~2

echo UPDATE OF EXECUTABLE FILES IN %CUR_WYNSURE_ROOT%

robocopy %SOURCE%\Tgv    %CUR_WYNSURE_ROOT%\Tgv\ W001001.TGV W003001.TGV /NP /R:0 
robocopy %SOURCE%\CppDll %CUR_WYNSURE_ROOT%\CppDll                       /NP /R:0 *.* 
goto :eof

:GetParameterFromConfigFile
SET FILE=%~1
SET PARAMETER=%~2
SET CUR_AREA=
SET pRETURN_GPFCF=%~3

for /f "delims=" %%a in (!FILE!) do (
  set Line=%%a
  if "!Line:~0,1!"=="[" (
      set CUR_AREA=!Line!
  ) else (
    if !CUR_AREA!==!PARAMETER! (  
      if not "!Line:~0,1!"=="[;" (   
        CALL SET %pRETURN_GPFCF%=!Line!
        goto :EndGetParameterFromConfigFile
      )
    )
  )
)
:EndGetParameterFromConfigFile
goto :eof



:ConnectNetworkDrivers
SET FILE=%~1
SET CUR_AREA=

for /f "delims=" %%a in (!FILE!) do (
  set Line=%%a
  if "!Line:~0,1!"=="[" (
      set CUR_AREA=!Line!
  ) else (
    if !CUR_AREA!==[NETWORK_DRIVERS] (
      if not "!Line:~0,1!"=="[;" (     
        echo !Line! >> tmp.txt
      )
    )
  )
)
if exist tmp.txt (
  for /f "delims=:: tokens=1,2,3,4" %%a in (tmp.txt) do (
    echo Connecting a newtork driver %%a:%%b
    @NET USE %%a: %%b /user:%%c %%d /persistent:no
  )
  del tmp.txt
)
:EndConnectNetworkDrivers
goto :eof




:UpdateWynsureRessources
SET CUR_WYNSURE_ROOT=%~1
SET CURRENT_DIR=%ENVLOCATION%

CD %CUR_WYNSURE_ROOT%
PATH "C:\Program Files (x86)\Git\bin";%PATH%
call git pull
CD %CURRENT%
GOTO :eof

:UpdateWebRessources
SET RESOURCE_DIR=%1
SET RESOURCE_DISK=%RESOURCE_DIR:~0,2%

SET PATH="C:\Program Files\TortoiseHg";%PATH%

SET CURRENT_DIR=%ENVLOCATION%
SET CURRENT_DISK=%CURRENT_DIR:~0,2%

%RESOURCE_DISK%
CD %RESOURCE_DIR%

echo --- UPDATE OF WEB RESSOURCES %RESOURCE_DIR%
hg verify
hg pull
hg update

%CURRENT_DISK%
CD %CURRENT_DIR%
GOTO :eof


:UpdateEnvIndexFile
SET INDEX_FILE_PATH=%~1\index.xml
SET FOR_VERSION=%~2
SET LAST_SYNCHRO_DATE-TIME=%~3

cscript.exe //E:jscript %JS_DIR%\UpdateSynchroField.js /INDEX_FILE:%INDEX_FILE_PATH% /WYNSURE_VERSION:%FOR_VERSION% /DATE_TIME:%LAST_SYNCHRO_DATE-TIME:-= %
GOTO :eof