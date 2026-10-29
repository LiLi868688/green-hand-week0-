param([switch]$NoBrowser)
& (Join-Path $PSScriptRoot 'start-background.ps1') -NoBrowser:$NoBrowser
exit $LASTEXITCODE
