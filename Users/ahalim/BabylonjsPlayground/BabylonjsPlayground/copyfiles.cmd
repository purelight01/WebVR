@echo off

if not exist "wwwroot\assets" mklink /d wwwroot\assets "..\assets"

xcopy /d /q /y index.html wwwroot\ 
xcopy /d /q /y "node_modules\requirejs\require.js" wwwroot\
xcopy /d /q /y "node_modules\babylonjs\dist\preview release\babylon.js" wwwroot\
xcopy /d /q /y "node_modules\babylonjs\dist\preview release\oimo.js" wwwroot\
xcopy /d /y "node_modules\babylonjs-gui\babylon.gui.js" wwwroot\
xcopy /d /y "node_modules\babylonjs-loaders\babylonjs.loaders.js" wwwroot\
xcopy /d /y "node_modules\cannon\src\cannon.js" wwwroot\

