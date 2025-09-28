# PowerShell Deployment Script for SRTM Tool
# Usage: .\deploy.ps1

Write-Host "🚀 Starting SRTM Tool Deployment..." -ForegroundColor Green

# Configuration
$SERVER_IP = "10.5.1.17"
$SERVER_USER = "dialtone"
$APP_NAME = "srtm-tool"
$REMOTE_PATH = "/home/dialtone/srtm-tool"
$PORT = "4000"

try {
    Write-Host "📦 Building Docker image locally..." -ForegroundColor Blue
    docker build -t "${APP_NAME}:latest" .
    if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }

    Write-Host "💾 Saving Docker image to tar file..." -ForegroundColor Blue
    docker save "${APP_NAME}:latest" -o "${APP_NAME}.tar"
    if ($LASTEXITCODE -ne 0) { throw "Docker save failed" }

    Write-Host "📤 Copying files to server ${SERVER_IP}..." -ForegroundColor Blue
    scp "${APP_NAME}.tar" "${SERVER_USER}@${SERVER_IP}:/tmp/"
    scp "docker-compose.yml" "${SERVER_USER}@${SERVER_IP}:/tmp/"
    
    # Copy cloudflare directory if it exists
    if (Test-Path "cloudflare") {
        ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p /tmp/cloudflare"
        scp -r "cloudflare/*" "${SERVER_USER}@${SERVER_IP}:/tmp/cloudflare/" 2>$null
    }

    Write-Host "🚀 Deploying on server..." -ForegroundColor Blue
    
    # Create a properly formatted Unix script
    $unixScript = @"
# Create application directory
mkdir -p ${REMOTE_PATH}
cd ${REMOTE_PATH}

# Stop existing containers
docker compose down 2>/dev/null || true

# Load new image
docker load < /tmp/${APP_NAME}.tar

# Copy compose file
cp /tmp/docker-compose.yml .

# Start services
docker compose up -d

# Clean up
rm /tmp/${APP_NAME}.tar
rm /tmp/docker-compose.yml

echo "✅ SRTM Tool deployed successfully!"
echo "🌐 Application running on port ${PORT}"
docker ps | grep ${APP_NAME}
"@

    # Save script to temp file with Unix line endings
    $tempScript = "$env:TEMP\deploy_script.sh"
    $unixScript -replace "`r`n", "`n" | Out-File -FilePath $tempScript -Encoding ASCII -NoNewline
    
    # Copy and execute the script
    scp $tempScript "${SERVER_USER}@${SERVER_IP}:/tmp/deploy_script.sh"
    ssh "${SERVER_USER}@${SERVER_IP}" "chmod +x /tmp/deploy_script.sh && /tmp/deploy_script.sh && rm /tmp/deploy_script.sh"
    if ($LASTEXITCODE -ne 0) { throw "SSH deployment failed" }

    Write-Host "🧹 Cleaning up local files..." -ForegroundColor Blue
    Remove-Item "${APP_NAME}.tar" -Force -ErrorAction SilentlyContinue
    Remove-Item "$env:TEMP\deploy_script.sh" -Force -ErrorAction SilentlyContinue

    Write-Host "✅ Deployment completed!" -ForegroundColor Green
    Write-Host "🌐 Your SRTM Tool is now running at http://${SERVER_IP}:${PORT}" -ForegroundColor Cyan
    Write-Host "🔗 Don't forget to set up your Cloudflare tunnel!" -ForegroundColor Yellow

} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}