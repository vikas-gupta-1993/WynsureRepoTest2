@echo off
setlocal enabledelayedexpansion enableextensions

SET INI_FILE=%1
SET INI_TIME=%2

SET BATCH_DIR=%cd%\Batch
rem SET JS_DIR=%cd%\JS
SET JS_DIR=D:\Generate\JS

REM Read Wynsure Version in config file
CALL :GetParameterFromConfigFile %INI_FILE% [WYNSURE_VERSION] WYNSURE_VERSION
Title Generation of Wynsure %WYNSURE_VERSION%

REM Prepare Output dir Report\Wysure_[WYNSURE_VERSION]\UPDATE__[date]__[time]
SET WYNSURE_OUTPUT_DIR=%cd%\Report\Wynsure_%WYNSURE_VERSION%
if not exist %WYNSURE_OUTPUT_DIR% mkdir %WYNSURE_OUTPUT_DIR%
SET TIME1=%time::=-%
SET TIME1=%TIME1: =%
SET DATE2=%date: =%
SET DATE3=%DATE2:~6,4%-%DATE2:~3,2%-%DATE2:~0,2%
rem SET WYNSURE_OUTPUT_DIR_UPDATE=%WYNSURE_OUTPUT_DIR%\UPDATE__!DATE3:/=-!__%TIME1:,=-%
SET WYNSURE_OUTPUT_DIR_UPDATE=%WYNSURE_OUTPUT_DIR%\%INI_TIME%
if not exist %WYNSURE_OUTPUT_DIR_UPDATE% mkdir %WYNSURE_OUTPUT_DIR_UPDATE%

REM redirect current output output to log file
echo Update Log written into : %WYNSURE_OUTPUT_DIR_UPDATE%
CALL :REDIRECT >%WYNSURE_OUTPUT_DIR_UPDATE%\GenerationReport.log 2>&1
exit %errorlevel% /b
:REDIRECT

REM get Version
IF not defined WYNSURE_VERSION (
 echo Wynsure version not defined in config file
 goto :UPDATE_ERROR
)

REM Set WYNSURE root path
call :GetParameterFromConfigFile %INI_FILE% [WYNSURE_ROOT] WYNSURE_ROOT
IF not defined WYNSURE_ROOT (
 echo Wynsure root directory not defined in config file
 goto :UPDATE_ERROR
)

REM Connect network drivers
call :ConnectNetworkDrivers %INI_FILE%

cd %WYNSURE_ROOT%\Bin
call "eWAM Set Env.bat"

REM INTEGRATION STEP:
SET "SYNCHRO_PLAN=Integration-Synchronisation Base 4"
SET "SET_RUNNING_CONTEXT_PLAN=Integration-RunningContext"
SET "MAPPING_AUTOMATIC_UPDATE_PLAN=Integration-MappingUpdate"
SET "GENERATE_PRB_PLAN=Integration-GeneratePRB"
SET "COMPILATION_PLAN_GENERATION=Integration-CompilationGeneration"
SET "COMPILATION_PLAN_INCREMENT=Integration-CompilationIncrement"
SET "COMPILATION_PLAN=Integration-Compilation"


REM only a part of processing 
call :GetParameterFromConfigFile %INI_FILE% [ONLY_COMPILATION] ONLY_COMPILATION
IF %ONLY_COMPILATION%==YES GOTO :COMPILATION

call :GetParameterFromConfigFile %INI_FILE% [ONLY_EXPORT] ONLY_EXPORT
IF %ONLY_EXPORT%==YES GOTO :COPY_UDPATED_DATA

REM Execute Steps:
:SET_RUNNING_CONTEXT
call :GetParameterFromConfigFile %INI_FILE% [RUNNING_CONTEXT] RUNNING_CONTEXT
echo ===============================================================================
echo   SET RUNNING CONTEXT: %RUNNING_CONTEXT% AT %date% %time%

echo:
ewamconsole.exe /PASSWORD:wydecorp /ERRORMESSAGE:FALSE /RUNASIDE /RUN:aWEXIntegrationLauncher.ExecutePlanFromXMLFile /INTEGRATION_XML_PLAN:"%ENVLOCATION%\%SET_RUNNING_CONTEXT_PLAN%.xml" /RUNTCX:%RUNNING_CONTEXT% /System /NOTESTDB
echo:

if not ERRORLEVEL 0 GOTO :UPDATE_ERROR
echo   CHANGE RUNNING CONTEXT ENDED AT %date% %time%
echo ===============================================================================
echo:
echo:

:SYNCHRONIZATION
echo ===============================================================================
echo   TGV UPDATE: SYNCHR0, CONSISTENCY, BREAK POINTS AT %date% %time%
echo:
SET SYNCHRO_AT=%date% %time%
ewamconsole.exe  /ERRORMESSAGE:FALSE  /SYSTEM /RUNASIDE /RUN:aWEXIntegrationLauncher.ExecutePlanFromXMLFile /INTEGRATION_XML_PLAN:"%ENVLOCATION%\%SYNCHRO_PLAN%.xml"

call :ExtractSynchronizedClasses %WYNSURE_OUTPUT_DIR_UPDATE%\SYNCHRONIZED_ENTITIES IS_UPDATE_NEEDED

call :GetParameterFromConfigFile %INI_FILE% [PROCESS_IF_NO_CLASS_SYNCHRONIZED] PROCESS_IF_NO_CLASS_SYNCHRONIZED
IF %IS_UPDATE_NEEDED%==1 (
  echo   There is no new class synchronized. Wynsure does not need to be updated.
  if %PROCESS_IF_NO_CLASS_SYNCHRONIZED%==NO (
    GOTO :UPDATE_SUCCESSFUL
  ) else (
    echo  However processing is forced by *.ini file option PROCESS_IF_NO_CLASS_SYNCHRONIZED
  )
) else (
  IF %IS_UPDATE_NEEDED%==2 (
    echo Integration Report not found
	GOTO :UPDATE_ERROR
  ) else (
    echo One or several classes have been synchronized. Wynsure needs to be updated.
  )
)

echo:
echo   TGV UPDATE ENDED AT %date% %time%
echo ===============================================================================
echo:
echo:

:PROCESS_DBS
SET TMP_FILE=%cd%\tmp.txt
SET DB_DEF= 
SET PRB_PROJECT= 

REM Update DB MAPPING and associated PRB 
for /f "delims= tokens=1" %%a in (%INI_FILE%) do (
  set Line=%%a
  if "!Line:~0,1!"=="[" (
      set CUR_AREA=!Line!
  ) else (
    if !CUR_AREA!==[DB_DEF::PRB_PROJECT] (
      if not "!Line:~0,1!"=="[;" (  
        @echo !Line! >> %TMP_FILE%
      )
    )
  )
)  

for /f "delims=:: tokens=1,2" %%i in (%TMP_FILE%) do (
call :PROCESS_DB %%i %%j
)
if exist %TMP_FILE% del %TMP_FILE%
GOTO :COMPILATION

:PROCESS_DB 
SET DB_DEF=%~1
SET PRB_PROJECT=%~2

SET IS_PRB_UPDATE_REQUESTED=NO
SET IS_PRB_UPDATE_NEEDED=NO

call :GetParameterFromConfigFile %INI_FILE% [SKIP_MAPPING_UPDATE] SKIP_MAPPING_UPDATE
IF %SKIP_MAPPING_UPDATE%==NO (
echo ===============================================================================
echo   UPDATE MAPPING: !DB_DEF! STARTED AT %date% %time%
echo:
ewamconsole.exe /ERRORMESSAGE:FALSE /RUNASIDE /INTEGRATION_XML_PLAN:"%ENVLOCATION%\%MAPPING_AUTOMATIC_UPDATE_PLAN%.xml" /DB_DEF:!DB_DEF! /SYSTEM /NOTESTDB /RUN:aWEXIntegrationLauncher.ExecutePlanFromXMLFile 

echo:
if not ERRORLEVEL 0 GOTO :UPDATE_ERROR
call :ExtractSQL !DB_DEF! %WYNSURE_OUTPUT_DIR_UPDATE%\SQL_UPDATE IS_PRB_UPDATE_REQUESTED

if %IS_PRB_UPDATE_REQUESTED%==0 (
  echo    SQL request to Update Data Base extracted at %WYNSURE_OUTPUT_DIR_UPDATE%\SQL_UPDATE
  SET IS_PRB_UPDATE_REQUESTED=YES
)
echo   UPDATE MAPPING ENDED AT %date% %time%
echo ===============================================================================
echo:
echo:
)

call :GetParameterFromConfigFile %INI_FILE% [SKIP_PRB_UPDATE] SKIP_PRB_UPDATE
IF %SKIP_PRB_UPDATE%==NO (
echo ===============================================================================
echo   GENERATE PRB: !PRB_PROJECT! STARTED AT %date% %time%
echo:
call :GetParameterFromConfigFile %INI_FILE% [PROCESS_IF_NO_MAPPING_CHANGED] PROCESS_IF_NO_MAPPING_CHANGED
if %IS_PRB_UPDATE_REQUESTED%==YES  (
  echo     PRB Update is requested: Changes computed during DB mapping update.
  SET IS_PRB_UPDATE_NEEDED=YES
) else (
  IF !PROCESS_IF_NO_MAPPING_CHANGED!==YES (
    echo     PRB Update is not needed but forced by configuration parameter PROCESS_IF_NO_MAPPING_CHANGED
    SET IS_PRB_UPDATE_NEEDED=YES
  ) else (
    echo     PRB Update is not needed: No change computed during DB mapping update.
  )  
)

if %IS_PRB_UPDATE_NEEDED%==YES  (
  ewamconsole.exe /ERRORMESSAGE:FALSE /RUNASIDE /RUN:aWEXIntegrationLauncher.ExecutePlanFromXMLFile /INTEGRATION_XML_PLAN:"%ENVLOCATION%\%GENERATE_PRB_PLAN%.xml" /PRB_PROJECT:!PRB_PROJECT! /SYSTEM /NOTESTDB
  set ERRORLEVEL=0
)
echo:
if not ERRORLEVEL 0 GOTO :UPDATE_ERROR
echo   GENERATE PRB ENDED AT %date% %time%
echo ===============================================================================
echo:
echo:
)
GOTO :eof


:COMPILATION
call :GetParameterFromConfigFile %INI_FILE% [SKIP_COMPILATION] SKIP_COMPILATION
call :GetParameterFromConfigFile %INI_FILE% [VSVARS_PATH] VSVARS_PATH
call :GetParameterFromConfigFile %INI_FILE% [INCREMENTAL_COMPILATION] INCREMENTAL_COMPILATION

if %SKIP_COMPILATION%==NO (
echo ===============================================================================
echo   COMPILATION AND LINKING STARTED AT %date% %time%
echo:

call "%VSVARS_PATH%"
ewamconsole.exe  /ERRORMESSAGE:FALSE /RUNASIDE /run:aWEXIntegrationLauncher.ExecutePlanFromXMLFile /INTEGRATION_XML_PLAN:"%ENVLOCATION%\%COMPILATION_PLAN_GENERATION%.xml" /NOINTERACT /FORCECOMPILATIONFOR:AMD64
if %INCREMENTAL_COMPILATION%==YES (
ewamconsole.exe  /ERRORMESSAGE:FALSE /RUNASIDE /run:aWEXIntegrationLauncher.ExecutePlanFromXMLFile /INTEGRATION_XML_PLAN:"%ENVLOCATION%\%COMPILATION_PLAN_INCREMENT%.xml" /NOINTERACT /FORCECOMPILATIONFOR:AMD64
)
else (
ewamconsole.exe  /ERRORMESSAGE:FALSE /RUNASIDE /run:aWEXIntegrationLauncher.ExecutePlanFromXMLFile /INTEGRATION_XML_PLAN:"%ENVLOCATION%\%COMPILATION_PLAN%.xml" /NOINTERACT /FORCECOMPILATIONFOR:AMD64
)
set ERRORLEVEL=0
echo:
REM if not ERRORLEVEL 0 GOTO :UPDATE_ERROR
echo   COMPILATION AND LINKING ENDED AT %date% %time%
echo ===============================================================================
echo:
echo:
)

:COPY_UDPATED_DATA
call :GetParameterFromConfigFile %INI_FILE% [SKIP_EXPORT_FILES] SKIP_EXPORT_FILES
IF %SKIP_EXPORT_FILES%==YES goto :eof
echo ===============================================================================
echo   COPY TGV, DLL'S AND SOURCES TO TARGET DIRECTORY STARTED AT %date% %time%
echo:

call :GetParameterFromConfigFile %INI_FILE% [TARGET_DIR] DESTROOT

set DEST=%DESTROOT%\Wynsure_%WYNSURE_VERSION%
set Backup=%DESTROOT%\Backup_%WYNSURE_VERSION%
del %BACKUP%\* /Q
if EXIST %DEST% (
IF NOT EXIST %BACKUP% mkdir %BACKUP%
echo test
handle.exe |findstr %DEST%\TGV\W001001.TGV
robocopy %DEST% %BACKUP% /MOVE /E /R:0 
)

  REM del %DEST%\* /Q
  
IF NOT EXIST %DEST% mkdir %DEST%
IF NOT EXIST %DEST%\TGV mkdir %DEST%\TGV
IF NOT EXIST %DEST%\CppDll mkdir %DEST%\CppDll
IF NOT EXIST %DEST%\Cpp mkdir %DEST%\Cpp


handle.exe |findstr %WYNSURE_ROOT%\TGV\W001001.TGV
robocopy %WYNSURE_ROOT%\TGV            %DEST%\TGV    W001001.TGV W003001.TGV /NP    /R:0 
robocopy %WYNSURE_ROOT%\CppDll\Release %DEST%\CppDll *.*                     /NP /S /R:0

IF EXIST %DEST%\SQL_UPDATE del %DEST%\SQL_UPDATE\* /Q
IF EXIST %WYNSURE_OUTPUT_DIR_UPDATE%\SQL_UPDATE (
robocopy %WYNSURE_OUTPUT_DIR_UPDATE%\SQL_UPDATE  %DEST%\SQL_UPDATE  /S /R:0
)

REM Create Update Request File into Applicative server
call :CREATE_UPDATE_REQUEST_FILE
call :GetParameterFromConfigFile %INI_FILE% [SKIP_CPP_FILES] SKIP_CPP_FILES
IF %SKIP_CPP_FILES%==NO (
robocopy %WYNSURE_ROOT%\Cpp %DEST%\Cpp *.cpp  /NP /S /R:0
robocopy %WYNSURE_ROOT%\Cpp %DEST%\Cpp *.h    /NP /S /R:0
robocopy %WYNSURE_ROOT%\Cpp %DEST%\Cpp *.req  /NP /S /R:0
)

echo   COPY ENDED AT %date% %time%
echo ===============================================================================
echo:
echo:

:UPDATE_SUCCESSFUL
echo:
echo ===============================================================================
echo   UPDATE ENDED WITHOUT ERROR AT %date% %time%
echo ===============================================================================

EXIT 0


:UPDATE_ERROR
SET PREV_ERROR_LEVEL=%errorlevel%

if exist %TMP_FILE% del %TMP_FILE%

echo ===============================================================================
echo   UPDATE NOT SUCCESSFUL AT %date% %time%
echo Error code: %PREV_ERROR_LEVEL%
echo ===============================================================================

EXIT %PREV_ERROR_LEVEL%


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



:ExtractSQL
REM This code return 0 if PRB need to be updated.
REM It uses last Integration Log generated
REM and seek if sql request have been written in log for a specific DBDef

SET THE_DB_DEF=%~1
SET OUTPUT_DIR=%~2
SET pRETURN_ES=%~3

REM Get Last Integration Directory log having run the DB Integration plan updating mapping
call :GET_LAST_INTEGRATION_DIR_FOR_A_PLAN %WYNSURE_ROOT% "%MAPPING_AUTOMATIC_UPDATE_PLAN%" LAST_DB_INTEGRATION_PLAN
set INTEGRATION_FILE=%LAST_DB_INTEGRATION_PLAN%\Integration.txt

call :CONVERT_FILEPATH_TO_WEBFORMAT "%INTEGRATION_FILE%" INTEGRATON_FILE_WEB_FMT
call :CONVERT_FILEPATH_TO_WEBFORMAT "%OUTPUT_DIR%" OUTPUT_DIR_AT_WEB_FMT

REM Extract SQL File
cscript.exe //E:jscript %JS_DIR%\ExtractDataFromIntegrationReport.js /EXTRACT_KIND:SQL /REPORT:%INTEGRATON_FILE_WEB_FMT% /DB_DEF:%THE_DB_DEF% /OUTPUT_DIR:%OUTPUT_DIR_AT_WEB_FMT%
if ERRORLEVEL 2 echo File of DB Update Step not existing: %INTEGRATION_FILE%
CALL SET %pRETURN_ES%=%errorlevel%

GOTO :eof

:ExtractSynchronizedClasses
SET OUTPUT_DIR=%~1
SET pRETURN_ESC=%~2

REM Get Last Integration Directory log having run the DB Integration plan updating mapping
call :GET_LAST_INTEGRATION_DIR_FOR_A_PLAN %WYNSURE_ROOT% "%SYNCHRO_PLAN%" LAST_DB_INTEGRATION_PLAN
set INTEGRATION_FILE=%LAST_DB_INTEGRATION_PLAN%\Integration.txt

call :CONVERT_FILEPATH_TO_WEBFORMAT "%INTEGRATION_FILE%" INTEGRATON_FILE_WEB_FMT
call :CONVERT_FILEPATH_TO_WEBFORMAT "%OUTPUT_DIR%" OUTPUT_DIR_AT_WEB_FMT

REM Extract Synchronized Classes
cscript.exe //E:jscript %JS_DIR%\ExtractDataFromIntegrationReport.js /EXTRACT_KIND:SYNCHRO /REPORT:%INTEGRATON_FILE_WEB_FMT% /OUTPUT_DIR:%OUTPUT_DIR_AT_WEB_FMT%
if ERRORLEVEL 2 echo File of Synchro Step not existing: %INTEGRATION_FILE%
CALL SET %pRETURN_ESC%=%errorlevel%

GOTO :eof

:GET_LAST_INTEGRATION_DIR_FOR_A_PLAN
SET CUR_WYNSURE_ROOT=%~1
SET CUR_INTEGRATION_PLAN=%~2
SET pRETURN_GLIDFAP=%~3

REM Get Last Integration Directory log having run the Integration of a specfic plan name
REM FOR /F %%A IN (`DIR /B *.txt 2^>NUL`) DO SET /A count+=1
SET INTEGRATION_DIR_LOG=%CUR_WYNSURE_ROOT%\Log\IntegrationLogs
Dir "%INTEGRATION_DIR_LOG%\%CUR_INTEGRATION_PLAN%"* /o-d /A:D /B  > tmp.txt
SET /P LAST_INTEGRATION_PLAN=< tmp.txt
DEL tmp.txt

CALL SET %pRETURN_GLIDFAP%=%INTEGRATION_DIR_LOG%\%LAST_INTEGRATION_PLAN%
GOTO :eof

:CONVERT_FILEPATH_TO_WEBFORMAT
REM Change File path to have web format '\' -> '/' and remove disk name ('D:')
SET FILEPATH=%~1
SET pRETURN_CFTW=%~2

SET FILEPATH=%FILEPATH:\=/%
SET FILEPATH=%FILEPATH:~2%

CALL SET %%pRETURN_CFTW%%=%FILEPATH%
GOTO :eof

:CREATE_UPDATE_REQUEST_FILE
call :GetParameterFromConfigFile %INI_FILE% [UPDATE_REQUEST_DIR] REQ_DIR
if defined REQ_DIR (
  if exist %REQ_DIR%\REQUEST_TREATED_FOR_%WYNSURE_VERSION%.txt del %REQ_DIR%\REQUEST_TREATED_FOR_%WYNSURE_VERSION%.txt
  
  if defined SYNCHRO_AT (
    echo %SYNCHRO_AT%> %REQ_DIR%\REQUEST_SUBMITTED_FOR_%WYNSURE_VERSION%.txt
  ) else (
   REM. > %REQ_DIR%\REQUEST_SUBMITTED_FOR_%WYNSURE_VERSION%.txt
  )
)  
goto :eof