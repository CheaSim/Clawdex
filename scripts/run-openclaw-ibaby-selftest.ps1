Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Read-DotEnvValue {
  param(
    [string]$Path,
    [string]$Key
  )

  if (-not (Test-Path $Path)) {
    return $null
  }

  $line = Get-Content $Path | Where-Object { $_ -match "^$Key=" } | Select-Object -First 1
  if (-not $line) {
    return $null
  }

  return ($line -replace "^$Key=", "").Trim()
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$pluginDir = Join-Path $repoRoot "clawdex-openclaw-channel"
$envFile = Join-Path $repoRoot ".env"
$controlPlaneBaseUrl = "http://127.0.0.1/api"
$pluginToken = Read-DotEnvValue -Path $envFile -Key "CLAWDEX_PLUGIN_TOKEN"

Write-Step "Checking Clawdex control plane"
$statusResponse = Invoke-RestMethod -Uri "$controlPlaneBaseUrl/openclaw/plugin/status" -Method Get
$statusResponse | ConvertTo-Json -Depth 6

Write-Step "Checking OpenClaw version"
openclaw --version

Write-Step "Checking loaded plugins"
$pluginList = openclaw plugins list | Out-String
$pluginList

if ($pluginList -notmatch "clawdex-channel") {
  throw "clawdex-channel is not loaded in OpenClaw."
}

Write-Step "Restarting OpenClaw gateway"
openclaw gateway stop
Start-Sleep -Seconds 2
openclaw gateway start
Start-Sleep -Seconds 5

Write-Step "Checking gateway health"
openclaw gateway health
openclaw gateway status

Write-Step "Running Clawdex HTTP self-test"
$env:CLAWDEX_CONTROL_PLANE_BASE_URL = $controlPlaneBaseUrl
if ($pluginToken) {
  $env:CLAWDEX_PLUGIN_TOKEN = $pluginToken
} else {
  Remove-Item Env:CLAWDEX_PLUGIN_TOKEN -ErrorAction SilentlyContinue
}

Push-Location $pluginDir
try {
  npm run selftest:http
} finally {
  Pop-Location
}

Write-Step "Done"
Write-Host "OpenClaw and Clawdex self-test finished." -ForegroundColor Green
