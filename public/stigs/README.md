# Local STIG Library

This directory contains STIG XML/CSV files that can be imported directly without fetching from stigviewer.com.

## Directory Structure

```
public/stigs/
├── application_security_and_development/
│   ├── U_Application_Security_and_Development_STIG_V6R3_Manual-xccdf.xml
│   └── metadata.json
├── postgresql-9x/
│   ├── U_PostgreSQL_9-x_STIG_V2R5_Manual-xccdf.xml
│   └── metadata.json
└── ...
```

## Adding STIG Files

1. **Create a directory** for each STIG using the STIG ID (lowercase, underscores for spaces)
   - Example: `application_security_and_development`

2. **Add the XCCDF XML file** to the directory
   - Use the official filename from DISA Cyber Exchange

3. **Create a metadata.json** file with basic info:
   ```json
   {
     "stigId": "application_security_and_development",
     "name": "Application Security and Development STIG",
     "version": "V6R3",
     "releaseDate": "2025-04-02",
     "filename": "U_Application_Security_and_Development_STIG_V6R3_Manual-xccdf.xml"
   }
   ```

## Supported Formats

- **XCCDF XML** (.xml, .xccdf) - Preferred format with complete data
- **DISA CSV** (.csv) - Alternative format from STIGViewer exports

## Benefits of Local STIG Library

✅ **No network dependency** - Works offline
✅ **Faster loading** - No external API calls
✅ **More reliable** - Avoids 403 errors and rate limiting
✅ **Version control** - Track specific STIG versions used
✅ **Consistent data** - Same data across all environments

## Extracting from STIG Library ZIP

If you have the complete STIG Library ZIP from DISA:

1. Extract the ZIP file
2. Copy STIG folders to this directory
3. Each STIG folder should contain the XCCDF XML file
4. Create metadata.json for each STIG (or use the batch script below)

### Batch Metadata Generator (PowerShell)

```powershell
# Run in public/stigs/ directory
Get-ChildItem -Directory | ForEach-Object {
    $stigId = $_.Name
    $xmlFile = Get-ChildItem -Path $_.FullName -Filter "*.xml" | Select-Object -First 1
    
    if ($xmlFile) {
        $metadata = @{
            stigId = $stigId
            name = $stigId -replace '_', ' ' | ForEach-Object { $_.ToTitleCase() }
            filename = $xmlFile.Name
            version = "Unknown"
            releaseDate = (Get-Date).ToString("yyyy-MM-dd")
        } | ConvertTo-Json
        
        $metadata | Out-File -FilePath (Join-Path $_.FullName "metadata.json")
        Write-Host "Created metadata for $stigId"
    }
}
```

## Usage in Application

The application will:
1. Check for local STIG files first
2. Fall back to stigviewer.com if not found locally
3. Display available local STIGs in the STIG selection interface

## Maintenance

- Update STIG files quarterly when new releases are published
- Remove old versions to save space
- Keep metadata.json files up to date
