@echo off

REM Get current date and time
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set year=%datetime:~0,4%
set month=%datetime:~4,2%
set day=%datetime:~6,2%
set hour=%datetime:~8,2%
set minute=%datetime:~10,2%
set second=%datetime:~12,2%

REM Define backup directory and file names for both databases
set backupDir=C:\Users\Dynamic\Desktop\aaa
set ticketDbName=ticket
set userDbName=user
set ticketBackupFileName=%year%-%month%-%day%%hour%-%minute%-%second%%ticketDbName%.bson
set userBackupFileName=%year%-%month%-%day%%hour%-%minute%-%second%%userDbName%.bson

REM Create a directory for the backup
mkdir "%backupDir%\%year%-%month%-%day%_%hour%-%minute%-%second%"

REM Run MongoDB backup commands for each database
"C:\Program Files\MongoDB\Server\7.0\bin\mongodump.exe" --db %test.tickets% --out "%backupDir%\%year%-%month%-%day%_%hour%-%minute%-%second%"
"C:\Program Files\MongoDB\Server\7.0\bin\mongodump.exe" --db %test.userdatas% --out "%backupDir%\%year%-%month%-%day%_%hour%-%minute%-%second%"

REM If you want to compress the backups, you can use mongodump with gzip:
REM "C:\Program Files\MongoDB\Server\{version}\bin\mongodump.exe" --db %ticketDbName% --archive="%backupDir%\%year%-%month%-%day%%hour%-%minute%-%second%%ticketDbName%.gz" --gzip
REM "C:\Program Files\MongoDB\Server\{version}\bin\mongodump.exe" --db %userDbName% --archive="%backupDir%\%year%-%month%-%day%%hour%-%minute%-%second%%userDbName%.gz" --gzip

REM Check if backups are successful
if %ERRORLEVEL% NEQ 0 (
    echo Backup failed!
) else (
    echo Backup successful!
)
pause