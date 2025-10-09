@echo off
echo Building project...
call npm run build

echo Copying assets...
copy dist\assets\* assets\

echo Copying public files...
xcopy public\* . /E /I /Y

echo Updating deployment HTML...
copy index-deploy.html index.html

echo Deployment ready! Upload all files to your server.
pause
