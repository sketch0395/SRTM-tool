# SRTM Tool - Docker Deployment with Cloudflare Tunnel

## Quick Start

### 1. Deploy to Server
From your local machine (Windows PowerShell):
```powershell
# Build and deploy to 10.5.1.17:4000
.\deploy.ps1
```

Or on Linux/Mac:
```bash
# Make script executable and run
chmod +x deploy.sh
./deploy.sh
```

### 2. Set up Cloudflare Tunnel
On the server (10.5.1.17):
```bash
# Make script executable and run
chmod +x /tmp/cloudflare/setup-tunnel.sh
sudo /tmp/cloudflare/setup-tunnel.sh
```

## Manual Deployment Steps

### Local Build & Push
```bash
# Build the Docker image
docker build -t srtm-tool:latest .

# Test locally (optional)
docker run -p 4000:4000 srtm-tool:latest

# Save image for transfer
docker save srtm-tool:latest > srtm-tool.tar

# Copy to server
scp srtm-tool.tar dialtone@10.5.1.17:/tmp/
scp docker-compose.yml dialtone@10.5.1.17:/tmp/
```

### Server Deployment
```bash
# On server (10.5.1.17)
mkdir -p /opt/srtm-tool
cd /opt/srtm-tool

# Load image
docker load < /tmp/srtm-tool.tar

# Copy compose file
cp /tmp/docker-compose.yml .

# Start application
docker-compose up -d

# Verify
docker ps | grep srtm-tool
curl http://localhost:4000
```

### Cloudflare Tunnel Setup
```bash
# Install cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Authenticate (opens browser)
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create srtm-tool

# Configure DNS (in Cloudflare dashboard)
# Add CNAME: srtm -> <TUNNEL-ID>.cfargotunnel.com

# Create config file
sudo mkdir -p /root/.cloudflared
sudo tee /root/.cloudflared/config.yml << EOF
tunnel: <TUNNEL-ID>
credentials-file: /root/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: srtm.yourdomain.com
    service: http://localhost:4000
  - service: http_status:404
EOF

# Install as service
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## Access Points
- Direct: `http://10.5.1.17:4000`
- Cloudflare: `https://srtm.yourdomain.com`

## Troubleshooting
```bash
# Check application
docker logs srtm-tool_app_1
docker ps

# Check tunnel
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -f

# Restart services
docker-compose restart
sudo systemctl restart cloudflared
```

## Features
- ✅ STIG CSV upload by family
- ✅ Requirements traceability matrix
- ✅ System categorization (NIST 800-60)
- ✅ Test case management
- ✅ Design element tracking
- ✅ Export capabilities