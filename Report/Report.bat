@rem example of command line to use eWAM directly
@rem %wyde-root%\bin\eWAMConsole.exe "/RUN:aWFReportRequestProcessLauncher.RunReportInAsynchronousProcessWithParam(give your application name, UserName, UserPassword)" %*

@rem example of command line to use WydeWeb
@rem %wyde-root%\bin\WydeWeb.exe "/RUN:aWFReportRequestProcessLauncher.RunReportInAsynchronousProcessWithParam(give your application name, UserName, UserPassword, Class_NSId, Class_Id)" %*

@%wyde-root%\bin\eWAM.exe "/RUN:aWFReportRequestProcessLauncher.RunReportInAsynchronousProcessWithParam(WynsureSolution_US,Report,,%1,%2)" /MULTISESSION:TRUE /runcontextname:MultiLanguageRunningContext %*