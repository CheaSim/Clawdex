# Local proxy setup

This project assumes the local HTTP proxy is:

- `http://127.0.0.1:7899`

## PowerShell session

Enable proxy for the current PowerShell session:

```powershell
.\scripts\use-proxy.ps1
```

Clear it later:

```powershell
.\scripts\clear-proxy.ps1
```

## Git

Set Git global proxy:

```powershell
git config --global http.proxy http://127.0.0.1:7899
git config --global https.proxy http://127.0.0.1:7899
```

Clear Git proxy:

```powershell
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## Docker Desktop

For Docker image pulls on Windows, shell env vars alone are often not enough.

Set Docker Desktop proxy to:

- `http://127.0.0.1:7899`

Typical path:

- Docker Desktop → Settings → Resources → Proxies

Then restart Docker Desktop.

## Notes

- GitHub and `git` commands can use the Git global proxy config.
- `docker build` and image pulls may still depend on Docker Desktop proxy settings even when shell env vars are set.
- Keep `NO_PROXY=localhost,127.0.0.1` so local container-to-container and host-local access are not accidentally proxied.
