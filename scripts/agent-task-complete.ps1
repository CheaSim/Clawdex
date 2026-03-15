param(
  [Parameter(Mandatory = $true)][string]$Task,
  [Parameter(Mandatory = $true)][string]$Message,
  [string]$From = "impl-agent",
  [string]$To = "pm-agent",
  [string]$Type = "task_completed"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$notifyScript = Join-Path $repoRoot "scripts\agent-notify.ps1"
$commit = (git -C $repoRoot rev-parse --short HEAD).Trim()

if (-not $commit) {
  throw "Could not resolve current git commit."
}

powershell -ExecutionPolicy Bypass -File $notifyScript `
  -From $From `
  -To $To `
  -Type $Type `
  -Task $Task `
  -Message $Message `
  -Commit $commit
