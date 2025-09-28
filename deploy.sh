#!/bin/bash

# SRTM Tool Deployment Script for Docker
# Usage: ./deploy.sh

set -e

echo "🚀 Starting SRTM Tool Deployment..."

# Configuration
SERVER_IP="10.5.1.17"
SERVER_USER="dialtone"
APP_NAME="srtm-tool"
REMOTE_PATH="/opt/srtm-tool"
PORT="4000"

echo "📦 Building Docker image locally..."
docker build -t ${APP_NAME}:latest .

echo "💾 Saving Docker image to tar file..."
docker save ${APP_NAME}:latest > ${APP_NAME}.tar

echo "📤 Copying files to server ${SERVER_IP}..."
scp ${APP_NAME}.tar ${SERVER_USER}@${SERVER_IP}:/tmp/
scp docker-compose.yml ${SERVER_USER}@${SERVER_IP}:/tmp/
scp -r cloudflare/ ${SERVER_USER}@${SERVER_IP}:/tmp/ 2>/dev/null || echo "No cloudflare directory found, skipping..."

echo "🚀 Deploying on server..."
ssh ${SERVER_USER}@${SERVER_IP} << EOF
    # Create application directory
    mkdir -p ${REMOTE_PATH}
    cd ${REMOTE_PATH}

    # Stop existing containers
    docker-compose down 2>/dev/null || true

    # Load new image
    docker load < /tmp/${APP_NAME}.tar

    # Copy compose file
    cp /tmp/docker-compose.yml .

    # Start services
    docker-compose up -d

    # Clean up
    rm /tmp/${APP_NAME}.tar
    rm /tmp/docker-compose.yml

    echo "✅ SRTM Tool deployed successfully!"
    echo "🌐 Application running on port ${PORT}"
    docker ps | grep ${APP_NAME}
EOF

echo "🧹 Cleaning up local files..."
rm ${APP_NAME}.tar

echo "✅ Deployment completed!"
echo "🌐 Your SRTM Tool is now running at http://${SERVER_IP}:${PORT}"
echo "🔗 Don't forget to set up your Cloudflare tunnel!"