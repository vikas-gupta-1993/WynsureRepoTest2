@set NINJAOriginFile=%1
@set MINIFMinifyFile=%2
uglifyjs -o %MINIFYPATH%\%MINIFMinifyFile% %NINJAPATH%\%NINJAOriginFile%
PAUSE