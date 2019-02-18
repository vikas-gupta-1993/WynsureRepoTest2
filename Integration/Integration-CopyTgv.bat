set CurDir=%~dp0
robocopy %CurDir%\..\TGV_Public %CudDir%\..\TGV *.tgv
set errorlevel=0