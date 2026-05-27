@echo off
setlocal enabledelayedexpansion

IF EXIST ".env" (
    echo .env file exists. [OK]
) ELSE (
    echo .env file does not exist.
    IF EXIST ".env.example" (
        copy .env.example .env
    ) ELSE (
        echo Warning: .env.example not found!
    )
)

for /d %%D in (apps\* packages\*) do (
    if not exist "%%D\.env" (
        mklink /H "%%D\.env" ".env" >nul 2>&1
        if errorlevel 1 (
            echo Failed to create hardlink for %%D\.env. Trying copy instead...
            copy .env "%%D\.env" >nul
        ) else (
            echo Linked .env to %%D\.env
        )
    )
)
echo Setup complete!
pause
