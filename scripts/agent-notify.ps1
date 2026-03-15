param(
  [Parameter(Mandatory = $true)][string]$From,
  [Parameter(Mandatory = $true)][string]$To,
  [Parameter(Mandatory = $true)][string]$Type,
  [Parameter(Mandatory = $true)][string]$Task,
  [Parameter(Mandatory = $true)][string]$Message,
  [string]$Commit = "",
  [string]$TodoVersion = "",
  [string]$MetaJson = "{}"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$coordinationDir = Join-Path $repoRoot "coordination"
$eventsFile = Join-Path $coordinationDir "agent-events.jsonl"

if (-not (Test-Path $coordinationDir)) {
  New-Item -ItemType Directory -Path $coordinationDir | Out-Null
}

if (-not (Test-Path $eventsFile)) {
  New-Item -ItemType File -Path $eventsFile | Out-Null
}

$meta = $null
try {
  $meta = $MetaJson | ConvertFrom-Json
} catch {
  throw "MetaJson must be valid JSON."
}

$event = [ordered]@{
  timestamp   = (Get-Date).ToString("o")
  from        = $From
  to          = $To
  type        = $Type
  task        = $Task
  message     = $Message
  commit      = $Commit
  todo_version = $TodoVersion
  meta        = $meta
}

($event | ConvertTo-Json -Compress -Depth 8) | Add-Content -Path $eventsFile -Encoding UTF8

Write-Host "Notification written to coordination/agent-events.jsonl" -ForegroundColor Green
Write-Host ($event | ConvertTo-Json -Depth 8)
