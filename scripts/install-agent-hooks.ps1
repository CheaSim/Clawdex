Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$hooksPath = Join-Path $repoRoot ".githooks"

git -C $repoRoot config core.hooksPath $hooksPath

Write-Host "Installed git hooks from .githooks" -ForegroundColor Green
git -C $repoRoot config --get core.hooksPath
