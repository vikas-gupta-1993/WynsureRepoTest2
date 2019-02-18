@echo off

@rem SET "TGVFolder=%1"
@rem SET "TGVFolderToCopy=%2"

@echo BEGIN STEP INSTALLATION THE CONFIGURATION FILE ON TEST ENV
del %TGVFolder%\Prevoyance.TGV
del %TGVFolder%\WydePolicyAdminSolution.TGV
robocopy %TGVFolderToCopy%  %TGVFolder%    *.TGV /NP /R:0

call "%TGVFolder%\eWAM Set Env.bat"

robocopy %BundleSourceFolder%  %BundleDestFolder% *.* /R:0 /S
@set Wyde-Bundle=%BundleDestFolder%
@set Wyde-err=%LogRepository%

del %LogRepository%\*.* /Q
echo.>%LogRepository%\ToPreventError.txt

echo %WYDE-ROOT%\bin\ewam.exe /SYSTEM /RUNASIDE /Run:xConfigDef.BatchInstallConfig "/CONFIG:%ConfigFile%" /IDENOPROMPT /NOERRORMESSAGE
%WYDE-ROOT%\bin\ewam.exe /SYSTEM /RUNASIDE /Run:xConfigDef.BatchInstallConfig "/CONFIG:%ConfigFile%" /IDENOPROMPT /NOERRORMESSAGE

type %LogRepository%\*.*
rem %WYDE-ROOT%\bin\ewam.exe /SYSTEM /RUNASIDE /Run:xConfigDef.BatchInstallConfig "/CONFIG:E:\eWAMForWF5400\Config\Wynsure 5.4.0.0\Wynsure 5.4.0.0.cfg"
@set errorlevel=0