@echo off

setlocal

set ROOTDIR=%CD%

for /f "delims=" %%i in ('type .nvmrc') do (
    call nvm install %%i
    call nvm use %%i
    call refreshenv
    call corepack enable
    call yarn --yes
    call yarn build
)

endlocal