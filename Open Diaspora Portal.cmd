@echo off
cd /d "%~dp0"
echo MKUYU Diaspora Portal: http://localhost:5600  (the MKUYU system must be running)
start "" http://localhost:5600
node serve.mjs
