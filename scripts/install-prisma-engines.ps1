# Instala os engines do Prisma manualmente quando binaries.prisma.sh falha (rede/firewall).
# Uso: npm run prisma:engines

$ErrorActionPreference = "Stop"

$commit = "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
$projectRoot = (Join-Path $PSScriptRoot "..") | Resolve-Path
$enginesDir = Join-Path $projectRoot "node_modules\@prisma\engines"

$mirrors = @(
  "https://registry.npmmirror.com/-/binary/prisma",
  "https://binaries.prisma.sh"
)

$files = @(
  @{
    Remote = "windows/query_engine.dll.node.gz"
    Local  = "query_engine-windows.dll.node"
  },
  @{
    Remote = "windows/schema-engine.exe.gz"
    Local  = "schema-engine-windows.exe"
  }
)

function Expand-GzipFile {
  param([string]$Source, [string]$Destination)
  $input = [System.IO.File]::OpenRead($Source)
  $gzip = New-Object System.IO.Compression.GzipStream($input, [System.IO.Compression.CompressionMode]::Decompress)
  $output = [System.IO.File]::Create($Destination)
  $gzip.CopyTo($output)
  $output.Close()
  $gzip.Close()
  $input.Close()
}

function Download-EngineFile {
  param([string]$RemotePath, [string]$LocalPath)

  foreach ($mirror in $mirrors) {
    $url = "$mirror/all_commits/$commit/$RemotePath"
    $tempGz = Join-Path $env:TEMP ("prisma-" + [IO.Path]::GetFileName($RemotePath))

    Write-Host "Baixando: $url"

    try {
      Invoke-WebRequest -Uri $url -OutFile $tempGz -TimeoutSec 300 -UseBasicParsing
      Expand-GzipFile -Source $tempGz -Destination $LocalPath
      Remove-Item $tempGz -Force -ErrorAction SilentlyContinue
      Write-Host "OK -> $LocalPath"
      return $true
    } catch {
      Write-Warning "Falhou em $mirror : $($_.Exception.Message)"
    }
  }

  return $false
}

Write-Host "Pasta dos engines: $enginesDir"

foreach ($file in $files) {
  $dest = Join-Path $enginesDir $file.Local
  if (Test-Path $dest) {
    Write-Host "Ja existe: $($file.Local)"
    continue
  }

  $ok = Download-EngineFile -RemotePath $file.Remote -LocalPath $dest
  if (-not $ok) {
    Write-Error "Nao foi possivel baixar $($file.Remote). Teste outra rede (hotspot) ou desative VPN/firewall."
    exit 1
  }
}

$queryEngine = Join-Path $enginesDir "query_engine-windows.dll.node"
$schemaEngine = Join-Path $enginesDir "schema-engine-windows.exe"

Write-Host ""
Write-Host "Gerando Prisma Client..."

Set-Location $projectRoot
$env:PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = "1"
$env:PRISMA_QUERY_ENGINE_LIBRARY = $queryEngine
$env:PRISMA_SCHEMA_ENGINE_BINARY = $schemaEngine

npx prisma generate

if ($LASTEXITCODE -ne 0) {
  Write-Error "prisma generate falhou."
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Prisma instalado com sucesso. Agora rode: npm run dev"
