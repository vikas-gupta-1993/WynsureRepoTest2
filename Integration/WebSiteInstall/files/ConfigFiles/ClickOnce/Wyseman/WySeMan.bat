@echo off
set SERVERPORT={SERVER_PORT_CLICKONCE}
SET CURDIR=%~dp0
CD %CURDIR%
call "..\..\eWAM Set Env.bat"
echo WYDE-ROOT: %WYDE-ROOT%
SET WYDESERVER-ROOT=%WYDE-ROOT%\WydeServer
set WYDE-NETCONF=%CURDIR%WNETCONF.ini
start %WYDESERVER-ROOT%\wsmServer\Wyseman.exe /PORT:%SERVERPORT% %* /AUTHENTIFIEDADMIN:FALSE
start /abovenormal http://localhost:{IIS_Port}