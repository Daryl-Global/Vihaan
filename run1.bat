@echo off
setlocal

set "REPO_URL=https://github.com/Daryl-Global/Vihaan.git"
set "REPO_DIR=Vihaan"
set "BRANCH_NAME=main"

if exist "%REPO_DIR%" (
    echo Found existing local repository "%REPO_DIR%".
    pushd "%REPO_DIR%"
    
    echo Fetching latest changes from remote...
    git fetch origin
    
    echo Checking status...
    git status

    echo Pulling latest changes from the %BRANCH_NAME% branch...
    git checkout %BRANCH_NAME%
    git pull origin %BRANCH_NAME%
    if errorlevel 1 (
        echo Pull failed due to local changes. Stashing and retrying...
        REM Stash all changes, including untracked files
        git stash push --include-untracked -m "Auto-stash by script"
        if errorlevel 1 (
            echo Failed to stash changes. Please resolve manually.
            popd
            goto :EOF
        )
        
        echo Retrying pull after stash...
        git pull origin %BRANCH_NAME%
        if errorlevel 1 (
            echo Pull still failed even after stashing. Please resolve manually.
        ) else (
            echo Pull succeeded. Now reapplying stashed changes...
            git stash pop
            if errorlevel 1 (
                echo Failed to reapply stashed changes. You may need to resolve conflicts.
            ) else (
                echo Successfully reapplied stashed changes.
            )
        )
    )

    popd
) else (
    echo Local repository not found. Cloning from %REPO_URL%...
    git clone -b %BRANCH_NAME% %REPO_URL% "%REPO_DIR%"
    if errorlevel 1 (
        echo Failed to clone repository. Check your credentials and URL.
        exit /b 1
    )
    echo Repository cloned successfully.
    echo If prompted, sign in to authenticate with GitHub.
)

echo Done.
endlocal
Pause
