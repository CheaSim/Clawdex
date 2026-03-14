$proxy = "http://127.0.0.1:7899"
$env:HTTP_PROXY = $proxy
$env:HTTPS_PROXY = $proxy
$env:ALL_PROXY = $proxy
$env:NO_PROXY = "localhost,127.0.0.1"

Write-Host "HTTP_PROXY=$env:HTTP_PROXY"
Write-Host "HTTPS_PROXY=$env:HTTPS_PROXY"
Write-Host "ALL_PROXY=$env:ALL_PROXY"
Write-Host "NO_PROXY=$env:NO_PROXY"
Write-Host "Proxy environment loaded for current PowerShell session."
