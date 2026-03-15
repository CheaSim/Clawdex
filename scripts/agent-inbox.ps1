param(
  [Parameter(Mandatory = $true)][string]$Agent,
  [int]$Last = 10
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$eventsFile = Join-Path $repoRoot "coordination\agent-events.jsonl"

if (-not (Test-Path $eventsFile)) {
  Write-Host "No coordination log found." -ForegroundColor Yellow
  exit 0
}

$events = Get-Content $eventsFile -Encoding UTF8 |
  Where-Object { $_.Trim() } |
  ForEach-Object {
    try { $_ | ConvertFrom-Json } catch { $null }
  } |
  Where-Object { $_ -and $_.PSObject.Properties.Name -contains "to" -and $_.to -eq $Agent } |
  Select-Object -Last $Last

if (-not $events) {
  Write-Host "Inbox is empty for $Agent." -ForegroundColor Yellow
  exit 0
}

$events | ForEach-Object {
  Write-Host ""
  Write-Host "[$($_.timestamp)] $($_.type)" -ForegroundColor Cyan
  Write-Host "From   : $($_.from)"
  Write-Host "Task   : $($_.task)"
  Write-Host "Message: $($_.message)"
  if ($_.commit) {
    Write-Host "Commit : $($_.commit)"
  }
}
