SET COMMANDFILENAME=%1
echo @echo off> %COMMANDFILENAME%
echo call "..\WySeMan.bat" >> %COMMANDFILENAME%
echo start /abovenormal http://localhost:%PORT%/%2 >> %COMMANDFILENAME%