if "%HEALTHOUT%"=="" set "D:/noemie2"

%~d0
cd %~dp0
java -Xms256M -Xmx1024M -cp .;../lib/routines.jar;../lib/commons-collections-3.2.1.jar;../lib/commons-collections-3.2.jar;../lib/commons-lang-2.6.jar;../lib/commons-logging-1.1.1.jar;../lib/log4j-1.2.15.jar;../lib/log4j-1.2.16.jar;../lib/dom4j-1.6.1.jar;../lib/jaxen-1.1.1.jar;../lib/activemq-all-5.10.0.jar;../lib/commons-beanutils-1.8.3.jar;../lib/staxon-1.2.jar;../lib/advancedPersistentLookupLib-1.0.jar;../lib/json-lib-2.4-jdk15.jar;../lib/jboss-serialization.jar;../lib/thashfile.jar;../lib/trove.jar;../lib/talend_file_enhanced_20070724.jar;../lib/xom-1.2.7.jar;../lib/ezmorph-1.0.6.jar;viamedis_tp_rights_0_1.jar; local_project.viamedis_tp_rights_0_1.Viamedis_tp_rights  %* 