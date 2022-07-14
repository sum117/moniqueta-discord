
@echo off
rem I made this file so I could run the program from my command line. I recommend you using the regular npm run methods we have in the package.json file, because they are more reliable, and don't need a PATH to be added to this directory, it would render this batch useless without it. If you still want to use this, so you can run the bot with "moniqueta --code, or moniqueta --start" just go ahead and add the path to this directory to your PATH environment variable.

rem set a variable called param to the value of the first parameter. It just accepts one parameter anyways.
set param=%1

rem check if the variable param is empty
if "%param%" == "" (
    rem if it is empty, show the usage
    echo "Usage: moniqueta.bat --code or --start"
    exit /b 1
) else (
    rem First, I'd like to declare that I'm not a batch nerd, so I don't exactly know how to check for parameter tailing. If you want to change this file, just make a new pull request and I'll add the code for you.

    rem check if the parameter is equal to "--start" or "--code"
    if "%param%" == "--start" (
        rem if it is equal to "--start", start the bot
        goto :start_moniqueta
    ) else if "%param%" == "--code" (
        rem if it is equal to "--code", execute VSCODE
        goto :code_moniqueta
    ) else (
        rem if it is not equal to "--start" or "-s", or "--code" or "-c", show the usage
        echo "Usage: moniqueta.bat --code or --start"
        exit /b 1
    )
)

rem Starts the bot
:start_moniqueta
cd C:\Users\jvcal\Documents\Personal Codes\discord.js\Moniqueta-Discord.js
npm run moniqueta
echo "Iniciando Moniqueta..."
EXIT /B 0

rem Executes vscode in the bot directory.
:code_moniqueta
cd C:\Users\jvcal\Documents\Personal Codes\discord.js\Moniqueta-Discord.js
code .
EXIT /B 0

