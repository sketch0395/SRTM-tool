#!/bin/bash

# Cloudflare Tunnel Setup Script for SRTM Tool
# Run this script on the server (10.5.1.17)

set -e

echo "🔗 Setting up Cloudflare Tunnel for SRTM Tool..."

# Configuration
TUNNEL_NAME="srtm-tool"
SERVICE_URL="http://localhost:4000"
CONFIG_DIR="/home/dialtone/.cloudflared"

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "📥 Installing cloudflared..."
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared.deb
    rm cloudflared.deb
    echo "✅ cloudflared installed"
else
    echo "✅ cloudflared already installed"
fi

# Check if already authenticated
if [ ! -d "$CONFIG_DIR" ] || [ ! -f "$CONFIG_DIR/cert.pem" ]; then
    echo "🔐 Please authenticate with Cloudflare..."
    echo "Run: cloudflared tunnel login"
    echo "This will open a browser - select your domain and return here"
    read -p "Press Enter after completing authentication..."
fi

# Check if tunnel already exists
if cloudflared tunnel info $TUNNEL_NAME &> /dev/null; then
    echo "✅ Tunnel '$TUNNEL_NAME' already exists"
    TUNNEL_ID=$(cloudflared tunnel info $TUNNEL_NAME | grep -o '[a-f0-9\-]\{36\}' | head -1)
else
    echo "🔗 Creating tunnel '$TUNNEL_NAME'..."
    TUNNEL_OUTPUT=$(cloudflared tunnel create $TUNNEL_NAME)
    TUNNEL_ID=$(echo "$TUNNEL_OUTPUT" | grep -o '[a-f0-9\-]\{36\}' | head -1)
    echo "✅ Tunnel created with ID: $TUNNEL_ID"
fi

# Create config directory if it doesn't exist
mkdir -p $CONFIG_DIR

# Create tunnel configuration
echo "📝 Creating tunnel configuration..."
cat > $CONFIG_DIR/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: $CONFIG_DIR/$TUNNEL_ID.json

ingress:
  - hostname: srtm.yourdomain.com
    service: $SERVICE_URL
  - service: http_status:404
EOF

echo "✅ Configuration created at $CONFIG_DIR/config.yml"

echo "📋 Next Steps:"
echo "1. Update the hostname in $CONFIG_DIR/config.yml with your actual domain"
echo "2. Add a CNAME record in Cloudflare DNS:"
echo "   Name: srtm (or your preferred subdomain)"
echo "   Target: $TUNNEL_ID.cfargotunnel.com"
echo "   Proxy: Enabled (orange cloud)"
echo ""
echo "3. Test the tunnel:"
echo "   cloudflared tunnel run $TUNNEL_NAME"
echo ""
echo "4. Install as a service:"
echo "   sudo cloudflared service install"
echo "   sudo systemctl enable cloudflared"
echo "   sudo systemctl start cloudflared"
echo ""
echo "🌐 Your SRTM Tool will be accessible at https://srtm.yourdomain.com"