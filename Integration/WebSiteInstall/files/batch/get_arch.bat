
FOR /F "tokens=3" %%i in ('reg query "HKLM\System\CurrentControlSet\Control\Session Manager\Environment" /v PROCESSOR_ARCHITECTURE') do (
	set ARCH=%%i
)