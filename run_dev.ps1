# AgriVision AI — Root Development Launcher
# Delegates to Project/run_dev.ps1
$ScriptPath = Join-Path $PSScriptRoot "Project\run_dev.ps1"
if (Test-Path $ScriptPath) {
    & $ScriptPath
} else {
    Write-Error "Launcher not found at $ScriptPath"
}
