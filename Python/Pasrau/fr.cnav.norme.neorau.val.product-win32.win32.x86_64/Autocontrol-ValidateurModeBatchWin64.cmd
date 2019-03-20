@echo off
setlocal

:: Change to the Dsn-Val directory
set ORIGINAL_DIR=%cd%
cd %~dp0

:: Set java exec
IF NOT DEFINED DSNVAL_JAVA (
	set DSNVAL_JAVA=java
)

:: Test java version
for /f "tokens=3" %%g in ('java -version 2^>^&1 ^| findstr /i "version"') do (
	set JAVAVER=%%g
)
If NOT %ERRORLEVEL% EQU 0 goto exitErrorJavaVersion
echo %JAVAVER% | findstr /C:"1.7." /C:"1.8." 1>null
if errorlevel 1 (
	goto exitErrorJavaVersion
)

:: Test java archi  32 or 64 bits (should be 64-bit)
%DSNVAL_JAVA% -version 2>&1 | find "64-Bit">NULL
IF NOT %ERRORLEVEL% EQU 0 goto exitErrorJavaArchi
:: Configure parameter
:: Dsn_Validator installation home

SET DSNVAL_HOME=.

:: Find Dsn-Val launcher
for /f "delims= tokens=1" %%c in ('dir /B /S /OD %DSNVAL_HOME%\plugins\org.eclipse.equinox.launcher_*.jar') do set LAUNCHER=%%c

:: Appli name
set APPLICATION=fr.cnav.autocontrole.headless.validate

:: Get java properties in .ini file
for /f %%i in ('type Autocontrol-Validateur.ini ^|find "fr.cnav.autocontrole.updatesite.loc"') do set UPDATE_PROP=%%i
for /f %%j in ('type Autocontrol-Validateur.ini ^|find "fr.cnav.autocontrole.defaultnorm.id"') do set USED_NORM=%%j
:: Not used - This 2 options is mapped in command options
:: for /f %%j in ('type Autocontrol-Validateur.ini ^|find "fr.cnav.norme.report.mutualisation.threshold"') do set THRESHOLD_PROP=%%j
:: for /f %%j in ('type Autocontrol-Validateur.ini ^|find "maximal.number.errors"') do set MAX_PROP=%%j
for /f %%j in ('type Autocontrol-Validateur.ini ^|find "convertedFiles.root.path"') do set ROOT_PATH_PROP=%%j
for /f %%j in ('type Autocontrol-Validateur.ini ^|find "fr.cnav.norme.val.originalValue"') do set ORIG_VAL_PROP=%%j
for /f %%j in ('type Autocontrol-Validateur.ini ^|find "stop.on.syntactic.error"') do set STOP_ON_SYN_PROP=%%j
for /f %%j in ('type Autocontrol-Validateur.ini ^|find "stop.on.conversion.error"') do set STOP_ON_CONV_PROP=%%j
for /f %%j in ('type Autocontrol-Validateur.ini ^|find "fr.cnav.norme.val.anomaliesInhibiting"') do set ANOMALIES_INHIBITING=%%j

:: Init default Log file
set LOG4J_PROP=-Dlog4j.configuration=log4j.properties

:: Launch validation
%DSNVAL_JAVA% %ANOMALIES_INHIBITING% %UPDATE_PROP% %USED_NORM% %ROOT_PATH_PROP% %ORIG_VAL_PROP% %STOP_ON_SYN_PROP% %STOP_ON_CONV_PROP% %LOG4J_PROP% -jar "%LAUNCHER%" -application %APPLICATION% %*

:: Keep result
set RESULT=%errorlevel%


:: change back to the original
:exitBackOrigine
cd %ORIGINAL_DIR%
EXIT /B %RESULT%


:exitErrorJavaVersion

@echo [ERROR] L'outil ne prend pas en charge la version de java (%JAVAVER%). Vous devez utiliser une version 1.7 ou 1.8 (configurez la variable DSNVAL_JAVA).
set RESULT=99
goto exitBackOrigine

:exitErrorJavaArchi
@echo TEST
echo [ERROR] La version de java est une version 32 bits. Vous devez utiliser une version 1.7 ou 1.8 - 64 bits  (configurez la variable DSNVAL_JAVA).
set RESULT=97
goto exitBackOrigine

endlocal