# Cloudflare Tunnel Configuration for SRTM Tool

## Prerequisites
1. Cloudflare account with a domain
2. `cloudflared` binary installed on the server (10.5.1.17)
3. Domain DNS pointing to Cloudflare

## Step 1: Install cloudflared on server
```bash
# On the server (10.5.1.17)
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
```

## Step 2: Authenticate with Cloudflare
```bash
cloudflared tunnel login
```
This will open a browser - select your domain.

## Step 3: Create tunnel
```bash
# Create a new tunnel named "srtm-tool"
cloudflared tunnel create srtm-tool

# Note the tunnel ID that gets created
```

## Step 4: Configure DNS
Add a CNAME record in Cloudflare DNS:
- Name: `srtm` (or your preferred subdomain)
- Target: `<TUNNEL-ID>.cfargotunnel.com`
- Proxy status: Proxied (orange cloud)

## Step 5: Create tunnel configuration
Create `/home/dialtone/.cloudflared/config.yml`:

```yaml
tunnel: <TUNNEL-ID>
credentials-file: /home/dialtone/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: srtm.yourdomain.com
    service: http://localhost:4000
  - service: http_status:404
```

Replace:
- `<TUNNEL-ID>` with your actual tunnel ID
- `srtm.yourdomain.com` with your actual domain

## Step 6: Test the tunnel
```bash
cloudflared tunnel run srtm-tool
```

## Step 7: Install as a service
```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## Verification
Your SRTM tool should now be accessible at:
- Direct: `http://10.5.1.17:4000`
- Via Cloudflare: `https://srtm.yourdomain.com`

## Troubleshooting
- Check tunnel status: `cloudflared tunnel info srtm-tool`
- Check service logs: `sudo journalctl -u cloudflared -f`
- Verify Docker container: `docker ps | grep srtm-tool`