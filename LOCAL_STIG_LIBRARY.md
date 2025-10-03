# Local STIG Library Setup Guide

## Overview

The SRTM Tool now supports a **local STIG library** that allows you to:
- ✅ Import STIGs **without internet access** (fully offline)
- ⚡ **Faster imports** (no network latency or API delays)
- 🛡️ **Avoid 403 Forbidden errors** from stigviewer.com
- 📦 **Version control** your STIG files
- 🔄 **Consistent results** across environments

The tool checks your local library **first**, then falls back to stigviewer.com only if needed.

---

## Quick Start

### 1. Extract STIG Library

Download the DISA STIG Library ZIP file from [public.cyber.mil](https://public.cyber.mil/stigs/downloads/), then run:

```powershell
.\extract-stigs.ps1 -ZipPath "C:\Downloads\U_STIG_Library_2024_12.zip"
```

This will:
- Extract all STIG XML files
- Organize them into `public/stigs/[stigId]/`
- Auto-generate metadata.json for each STIG
- Display a summary of extracted STIGs

### 2. Use Local STIGs

1. Start your dev server: `npm run dev`
2. Go to the **STIG Requirements** tab
3. Click the **Local Library** button
4. Browse available STIGs and click **Import**

---

## Directory Structure

```
public/stigs/
├── windows_server_2022/
│   ├── U_MS_Windows_Server_2022_V1R4_STIG.xml
│   └── metadata.json
├── apache_server_2.4_unix/
│   ├── U_Apache_2-4_UNIX_V2R5_STIG.xml
│   └── metadata.json
└── rhel_8/
    ├── U_RHEL_8_V2R1_STIG.xml
    └── metadata.json
```

### Metadata Format

Each STIG directory should contain a `metadata.json` file:

```json
{
  "stigId": "windows_server_2022",
  "name": "MS Windows Server 2022",
  "version": "V1R4",
  "releaseDate": "2024-10-25",
  "filename": "U_MS_Windows_Server_2022_V1R4_STIG.xml",
  "format": "xml"
}
```

---

## Manual Setup (Without Script)

If you prefer to set up STIGs manually:

### 1. Create Directory Structure

```powershell
# Create a directory for your STIG
New-Item -ItemType Directory -Path "public\stigs\your_stig_id" -Force
```

### 2. Copy STIG File

```powershell
# Copy your XCCDF XML or DISA CSV file
Copy-Item "path\to\your-stig.xml" -Destination "public\stigs\your_stig_id\"
```

### 3. Create Metadata

Create `public/stigs/your_stig_id/metadata.json`:

```json
{
  "stigId": "your_stig_id",
  "name": "Your STIG Name",
  "version": "V1R1",
  "releaseDate": "2024-01-15",
  "filename": "your-stig.xml",
  "format": "xml"
}
```

---

## STIG ID Naming Convention

The STIG ID should be:
- **Lowercase**
- **Alphanumeric with underscores** (no spaces or special chars)
- **Descriptive** of the technology

### Examples:

| STIG Name | STIG ID |
|-----------|---------|
| MS Windows Server 2022 | `windows_server_2022` |
| Apache Server 2.4 Unix | `apache_server_2.4_unix` |
| Red Hat Enterprise Linux 8 | `rhel_8` |
| PostgreSQL 9.x | `postgresql_9` |
| Docker Enterprise 2.x | `docker_enterprise_2` |

---

## Import Priority

The tool checks sources in this order:

1. **🗄️ Local Library** (`public/stigs/`)
   - Instant, offline access
   - No rate limiting
   
2. **🌐 stigviewer.com API**
   - Falls back if STIG not found locally
   - May encounter 403 Forbidden errors
   
3. **📤 Manual Upload**
   - Upload button for one-off imports

---

## Supported File Formats

### XCCDF XML (Recommended)
- **Pros**: Complete data, official format, most reliable
- **Cons**: Larger file size
- **Example**: `U_MS_Windows_Server_2022_V1R4_STIG.xml`

### DISA CSV
- **Pros**: Human-readable, smaller size
- **Cons**: May have parsing issues with multi-line fields
- **Example**: Exported from STIG Viewer

---

## Troubleshooting

### STIGs Not Showing in Local Library

1. **Check directory structure**:
   ```powershell
   Get-ChildItem -Path "public\stigs" -Recurse
   ```

2. **Verify metadata.json exists**:
   ```powershell
   Get-Content "public\stigs\your_stig_id\metadata.json"
   ```

3. **Restart dev server**:
   ```powershell
   # Ctrl+C to stop, then:
   npm run dev
   ```

### Parsing Errors

If you encounter errors during import:

1. **Check file format**: Ensure it's valid XCCDF XML
2. **Check encoding**: Files should be UTF-8
3. **Check for corruption**: Re-extract from ZIP
4. **Try manual upload**: Use the Upload button as fallback

### Extract Script Issues

If `extract-stigs.ps1` fails:

1. **Check PowerShell version**: Requires PowerShell 5.1+
   ```powershell
   $PSVersionTable.PSVersion
   ```

2. **Check ZIP path**: Ensure full path is correct
   ```powershell
   Test-Path "C:\path\to\STIG_Library.zip"
   ```

3. **Check permissions**: Run as Administrator if needed

---

## Adding New STIGs

When new STIG versions are released:

### Option 1: Re-run Extract Script

```powershell
.\extract-stigs.ps1 -ZipPath "path\to\new_STIG_Library.zip"
```

This will add new STIGs and update existing ones.

### Option 2: Add Individual STIG

1. Download specific STIG from [cyber.mil](https://public.cyber.mil/stigs/)
2. Create directory in `public/stigs/`
3. Copy XML file
4. Create metadata.json
5. Refresh local library in UI

---

## Performance Tips

### For Large Libraries (100+ STIGs)

The tool reads metadata on-demand, so performance stays good even with many STIGs.

### For Production Deployments

1. **Pre-extract STIGs** during build:
   ```json
   "scripts": {
     "prebuild": "pwsh -File extract-stigs.ps1 -ZipPath stigs.zip"
   }
   ```

2. **Commit STIGs to git** (if repo is private):
   - Ensures consistent versions across team
   - No extraction needed on new checkouts
   - Note: This will increase repo size

3. **Use Docker volume** for STIG storage:
   ```yaml
   volumes:
     - ./stigs:/app/public/stigs:ro
   ```

---

## API Endpoints

### List Local STIGs
```http
GET /api/local-stigs
```

Returns:
```json
{
  "success": true,
  "count": 150,
  "stigs": [
    {
      "stigId": "windows_server_2022",
      "name": "MS Windows Server 2022",
      "version": "V1R4",
      "releaseDate": "2024-10-25",
      "filename": "U_MS_Windows_Server_2022_V1R4_STIG.xml",
      "format": "xml"
    }
  ]
}
```

### Get Statistics
```http
GET /api/local-stigs?format=stats
```

Returns:
```json
{
  "success": true,
  "stats": {
    "total": 150,
    "byFormat": {
      "xml": 148,
      "csv": 2
    }
  }
}
```

### Import STIG
```http
GET /api/import-stig?stigId=windows_server_2022
```

The API automatically checks local library first, then falls back to stigviewer.com.

---

## Benefits Summary

| Feature | stigviewer.com | Local Library |
|---------|----------------|---------------|
| Speed | Slow (network) | ⚡ Instant |
| Availability | ⚠️ Sometimes blocked | ✅ Always available |
| Offline | ❌ No | ✅ Yes |
| Rate Limits | ⚠️ Yes | ✅ No |
| Version Control | ❌ No | ✅ Yes |
| Consistency | ⚠️ May change | ✅ Guaranteed |

---

## Next Steps

1. ✅ Download DISA STIG Library
2. ✅ Run `extract-stigs.ps1`
3. ✅ Click "Local Library" in the UI
4. ✅ Import your first local STIG
5. 🎉 Enjoy fast, offline STIG imports!

---

## Need Help?

- Check the `public/stigs/README.md` for additional details
- Review console logs during import for debugging
- Try manual upload as a fallback option
- Ensure you're using the latest STIG library from cyber.mil
