param(
  [Parameter(Mandatory = $true)][string]$Agent,
  [int]$IntervalSeconds = 60,
  [int]$TodoPreviewLines = 30
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$todoFile = Join-Path $repoRoot "TODO.md"
$inboxScript = Join-Path $repoRoot "scripts\agent-inbox.ps1"

function Show-Info {
  param([string]$AgentName, [int]$PreviewLines)

  Write-Host ""
  Write-Host "==> 获取信息" -ForegroundColor Cyan

  if (Test-Path $todoFile) {
    Write-Host "[TODO.md]" -ForegroundColor Yellow
    Get-Content $todoFile | Select-Object -First $PreviewLines
  }

  Write-Host ""
  Write-Host "[Inbox: $AgentName]" -ForegroundColor Yellow
  powershell -ExecutionPolicy Bypass -File $inboxScript -Agent $AgentName -Last 10
}

Write-Host "Agent loop started for $Agent. Last step will always be: 获取信息，等待." -ForegroundColor Green

while ($true) {
  Show-Info -AgentName $Agent -PreviewLines $TodoPreviewLines
  Write-Host ""
  Write-Host "==> 等待 $IntervalSeconds 秒" -ForegroundColor Cyan
  Start-Sleep -Seconds $IntervalSeconds
}
