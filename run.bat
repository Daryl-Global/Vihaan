@echo off
setlocal

set "REPO_URL=https://github.com/Daryl-Global/Vihaan.git"
set "REPO_DIR=Vihaan"
set "BRANCH_NAME=main"

if exist "%REPO_DIR%" (
    echo Found existing local repository "%REPO_DIR%".
    pushd "%REPO_DIR%"
    
    git fetch origin
    git status

    echo Pulling latest changes from the %BRANCH_NAME% branch...
    git checkout %BRANCH_NAME%
    git pull origin %BRANCH_NAME%
    if errorlevel 1 (
        echo.
        echo Your local changes conflict with the pull.
        echo Please commit, stash, or revert your local changes before pulling.
        echo This is the same behavior you'd see in Visual Studio Code.
    )
    
    popd
) else (
    echo Cloning from %REPO_URL%...
    git clone -b %BRANCH_NAME% %REPO_URL% "%REPO_DIR%"
    if errorlevel 1 (
        echo Failed to clone repository. Check credentials and URL.
        exit /b 1
    )
)

echo Done.
endlocal
Pause
