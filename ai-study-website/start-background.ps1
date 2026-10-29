param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$address = 'http://127.0.0.1:5278/'
function Test-StudyServer {
    try {
        $reply = Invoke-RestMethod -Uri ($address + 'health') -TimeoutSec 2
        return $reply.project -eq 'ai-study-website' -and $reply.status -eq 'ready'
    } catch { return $false }
}
try {
    if (!(Test-StudyServer)) {
        $candidates = @(
            (Join-Path $PSScriptRoot '.runtime/python/pythonw.exe'),
            (Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/pythonw.exe')
        )
        $candidates += @(Get-ChildItem -Path "$env:LOCALAPPDATA/Programs/Python/Python*/pythonw.exe" -ErrorAction SilentlyContinue | ForEach-Object FullName)
        $python = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
        if (!$python) { throw 'Python runtime is missing. Open this project in Codex to repair the installation.' }
        $logDir = Join-Path $PSScriptRoot '.logs'
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        $serverFile = '"' + (Join-Path $PSScriptRoot 'server.py') + '"'
        $process = Start-Process -FilePath $python -ArgumentList @($serverFile, '--no-browser') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDir ('server-' + [guid]::NewGuid().ToString('N') + '.log')) -RedirectStandardError (Join-Path $logDir ('error-' + [guid]::NewGuid().ToString('N') + '.log')) -PassThru
        $ready = $false
        for ($attempt = 0; $attempt -lt 30; $attempt++) {
            if (Test-StudyServer) { $ready = $true; break }
            if ($process.HasExited) { break }
            Start-Sleep -Milliseconds 300
        }
        if (!$ready) { throw 'The learning website did not start. Port 5278 may be occupied. Check the project .logs directory.' }
    }
    if (!$NoBrowser) { Start-Process $address -WindowStyle Hidden }
    exit 0
} catch {
    if (!$NoBrowser) {
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'AI Study - Startup failed') | Out-Null
    }
    Write-Error $_.Exception.Message -ErrorAction Continue
    exit 1
}
