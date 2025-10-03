# STIG CSV Manual Upload Feature

## Overview
When stigviewer.com is unavailable (403 Forbidden errors), users can manually download and upload STIG CSV files from DISA Cyber Exchange.

## Supported File Formats
- **CSV** (.csv) - DISA STIG CSV format
- **XML** (.xml, .xccdf) - XCCDF STIG format

## How to Use

### Step 1: Download STIG CSV from DISA
1. Visit https://public.cyber.mil/stigs/downloads/
2. Find your desired STIG (e.g., "Application Security and Development")
3. Click the "View" or download button
4. Download the CSV format (e.g., `AppSecDev_Stig.csv`)

### Step 2: Upload to SRTM Tool
1. In the SRTM Tool, go to "STIG Requirements" tab
2. Click "Upload STIG" button (or similar manual upload option)
3. Select the downloaded CSV file
4. Click "Open" or "Upload"

### Step 3: View Imported Requirements
- The tool will parse the CSV and import all requirements
- You'll see a success message with the count of imported requirements
- All requirements will appear in the STIG Requirements tab

## CSV Format Support

The parser supports DISA's standard CSV format with these columns:

### Required Columns
- **STIG ID** / **Vuln ID** / **Group ID** - Unique identifier (e.g., `APSC-DV-000010`)
- **Severity** - CAT I, CAT II, CAT III, or High/Medium/Low
- **Rule Title** - Title of the requirement

### Optional Columns
- **Discussion** / **Description** - Detailed description
- **Check Content** / **Check Text** - Verification procedures
- **Fix Text** - Remediation procedures
- **CCIs** - Control Correlation Identifiers
- **Rule ID** - Additional identifier
- **Benchmark Name** - STIG name
- **Version** / **Release** - STIG version

### Example CSV Structure
```csv
"Benchmark Name","STIG ID","Severity","Rule Title","Discussion","Check Content","Fix Text","CCIs"
"Application Security and Development","APSC-DV-000010","medium","The application must...","Application management...","Review the application...","Design and configure...","CCI-000054"
```

## CSV Parsing Features

### Severity Normalization
- **CAT I** / **High** → High severity
- **CAT II** / **Medium** → Medium severity
- **CAT III** / **Low** → Low severity

### CCI Extraction
- Automatically extracts all CCI references (e.g., `CCI-000054`)
- Multiple CCIs are supported per requirement

### Quoted Field Handling
- Properly handles CSV fields with commas and quotes
- Preserves multi-line content in description/check/fix fields

### Flexible Column Matching
The parser is case-insensitive and matches common variations:
- "STIG ID", "stigid", "Vuln ID", "vulnid"
- "Check Content", "checkcontent", "Check Text"
- "Fix Text", "fixtext"
- etc.

## API Endpoint

### POST /api/import-stig
**Upload STIG File**

#### Request
```
Content-Type: multipart/form-data

Body:
  file: [CSV or XML file]
```

#### Response (Success)
```json
{
  "success": true,
  "stigId": "AppSecDev_Stig",
  "stigName": "Application Security and Development",
  "version": "6",
  "releaseDate": "2025-04-02",
  "requirements": [
    {
      "vulnId": "APSC-DV-000010",
      "ruleId": "SV-222387r960735",
      "severity": "medium",
      "title": "The application must provide a capability to limit the number of logon sessions per user.",
      "description": "Application management includes...",
      "checkText": "For production environments...",
      "fixText": "Design and configure the application...",
      "cci": ["CCI-000054"],
      "nistControls": []
    }
  ],
  "totalRequirements": 286,
  "source": "manual",
  "message": "Successfully imported 286 requirements from AppSecDev_Stig.csv"
}
```

#### Response (Error)
```json
{
  "success": false,
  "error": "Invalid file type. Please upload an XCCDF XML file or DISA CSV file.",
  "message": "Failed to parse STIG file..."
}
```

## Error Handling

### Common Errors

**Error:** "No file provided"
- **Cause:** File input is empty
- **Solution:** Select a valid file before uploading

**Error:** "Invalid file type"
- **Cause:** File is not .csv, .xml, or .xccdf
- **Solution:** Download the correct file format from DISA

**Error:** "No requirements found in CSV file"
- **Cause:** CSV is empty or improperly formatted
- **Solution:** Verify the CSV has headers and data rows

**Error:** "Failed to parse STIG file"
- **Cause:** File content is corrupted or not a valid STIG file
- **Solution:** Re-download the file from DISA

## Comparison: stigviewer.com vs Manual Upload

| Feature | stigviewer.com API | Manual CSV Upload |
|---------|-------------------|-------------------|
| **Availability** | Subject to rate limits/403 errors | Always available |
| **Speed** | Fast (when available) | Fast |
| **Data Completeness** | All fields populated | Depends on CSV content |
| **Automation** | Fully automated | Requires manual download |
| **Best Use Case** | Quick single STIG import | When API is blocked, bulk imports |

## Benefits of CSV Upload

1. **Reliability** - Works even when stigviewer.com is down
2. **Offline Support** - Can work with pre-downloaded files
3. **Audit Trail** - Downloaded files can be archived
4. **Customization** - Can modify CSV before upload if needed
5. **Compliance** - Use official DISA source directly

## Limitations

- Requires manual download step
- Depends on DISA file availability
- No automatic updates when STIG is revised

## Best Practices

1. **Keep Files Organized**
   - Create a folder for downloaded STIGs
   - Name files clearly (e.g., `AppSec_v6_2025.csv`)

2. **Version Tracking**
   - Note the release date when downloading
   - Re-download when new versions are published

3. **Verify Before Upload**
   - Open CSV in text editor to verify content
   - Check file size (should be >100KB for most STIGs)

4. **Backup**
   - Keep copies of uploaded CSV files
   - Document which STIGs were imported

## Troubleshooting

### CSV not parsing correctly?
1. Open the CSV in a text editor
2. Verify the first line has column headers
3. Check that data rows are properly quoted
4. Look for unusual characters or encoding issues

### Missing data in imported requirements?
- Some DISA CSV files may have incomplete data
- Check the original CSV file to verify data exists
- Consider downloading the XML format for more complete data

### Can't find the CSV on DISA?
- Some STIGs only provide XML format
- Look for "View" or "Download" buttons
- Try searching for the STIG by full name

## Example Files

The tool has been tested with these DISA CSV files:
- Application Security and Development STIG
- PostgreSQL 9.x STIG
- Windows Server 2019 STIG
- Red Hat Enterprise Linux 8 STIG

## Future Enhancements

Potential improvements:
- Drag-and-drop file upload
- Batch upload (multiple CSVs at once)
- CSV validation before upload
- Preview imported requirements before saving
- Export requirements back to CSV format
- Integration with DISA RSS feed for auto-download

## Related Documentation
- `STIGVIEWER_403_MITIGATION.md` - Handling API blocks
- `STIG_IMPORT_FEATURE.md` - Complete STIG import guide
- `STIG_ID_MAPPING.md` - STIG ID reference

## Support
For issues or questions:
1. Check the console for detailed error messages
2. Verify CSV file format matches DISA standard
3. Try XML format if CSV fails
4. Report issues with example CSV file attached
