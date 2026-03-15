param(
  [Parameter(Mandatory = $true)][string]$Agent,
  [int]$IntervalSeconds = 60
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$todoFile = Join-Path $repoRoot "TODO.md"
$eventsFile = Join-Path $repoRoot "coordination\agent-events.jsonl"
$lastTodoWrite = if (Test-Path $todoFile) { (Get-Item $todoFile).LastWriteTimeUtc } else { Get-Date "2000-01-01" }
$lastEventCount = if (Test-Path $eventsFile) { (Get-Content $eventsFile).Count } else { 0 }

Write-Host "Watching TODO.md and inbox for $Agent every $IntervalSeconds seconds..." -ForegroundColor Green

while ($true) {
  if (Test-Path $todoFile) {
    $todoInfo = Get-Item $todoFile
    if ($todoInfo.LastWriteTimeUtc -gt $lastTodoWrite) {
      $lastTodoWrite = $todoInfo.LastWriteTimeUtc
      Write-Host ""
      Write-Host "TODO.md updated at $($todoInfo.LastWriteTime)" -ForegroundColor Yellow
      Get-Content $todoFile | Select-Object -First 30
    }
  }

  if (Test-Path $eventsFile) {
    $lines = Get-Content $eventsFile -Encoding UTF8
    if ($lines.Count -gt $lastEventCount) {
      $newLines = $lines[$lastEventCount..($lines.Count - 1)]
      foreach ($line in $newLines) {
        try {
          $event = $line | ConvertFrom-Json
          if ($event -and $event.PSObject.Properties.Name -contains "to" -and $event.to -eq $Agent) {
            Write-Host ""
            Write-Host "Wake-up event for $Agent" -ForegroundColor Magenta
            Write-Host "$($event.from) -> $($event.type) -> $($event.task)"
            Write-Host $event.message
            if ($event.commit) {
              Write-Host "Commit: $($event.commit)"
            }
          }
        } catch {
          # Ignore malformed lines
        }
      }
      $lastEventCount = $lines.Count
    }
  }

  Start-Sleep -Seconds $IntervalSeconds
}
