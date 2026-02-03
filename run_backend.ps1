# Run DeepGuard AI backend from project root.
# Usage: .\run_backend.ps1   or   .\run_backend.ps1 -Port 8000
param([int]$Port = 8000)
$backend = Join-Path $PSScriptRoot "backend"
$env:PYTHONPATH = $backend
& python -m uvicorn app.main:app --host 0.0.0.0 --port $Port
