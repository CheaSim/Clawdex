param(
  [Parameter(Mandatory = $true)][string]$Task,
  [Parameter(Mandatory = $true)][string]$Message,
  [string]$From = "pm-agent",
  [string]$To = "impl-agent",
  [string]$Type = "review_feedback"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$notifyScript = Join-Path $repoRoot "scripts\agent-notify.ps1"

powershell -ExecutionPolicy Bypass -File $notifyScript `
  -From $From `
  -To $To `
  -Type $Type `
  -Task $Task `
  -Message $Message
