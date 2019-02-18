@echo off &setlocal
set search=%2
set replace=%3
set textfile=%1
set newfile=temp

if EXIST %textfile% (
	(for /f "delims=" %%i in ('type "%textfile%"') do (
		set "line=%%i"
		setlocal enabledelayedexpansion
		set "line=!line:%search%=%replace%!"
		echo(!line!
		endlocal
	))>"%newfile%"
	move /Y "%newfile%" "%textfile%" > NUL 2>&1
)
