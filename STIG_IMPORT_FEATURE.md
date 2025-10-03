# STIG Import Feature

## Overview

The STIG Import feature allows users to import STIG (Security Technical Implementation Guide) requirements into the SRTM tool. It supports two methods:

1. **Automatic Fetch from stigviewer.com** - Downloads STIG requirements directly from the web
2. **Manual Upload** - Allows users to upload XCCDF XML files when automatic fetch fails

---

## Features

### ✅ Automatic Fetch from STIGViewer
- Fetches STIG requirements directly from stigviewer.com
- Quick selection of popular STIGs
- Manual STIG ID input for custom STIGs
- 15-second timeout with error handling
- Fallback to manual upload on failure

### ✅ Manual STIG Upload
- Accepts XCCDF XML files (.xml, .xccdf)
- Parses vulnerability IDs, rules, and requirements
- Extracts CCI references and NIST controls
- Drag-and-drop file selection
- Comprehensive XML parsing

### ✅ Requirements Preview
- Shows first 5 requirements before import
- Displays severity levels (High, Medium, Low)
- Shows NIST control mappings
- Full requirement count

### ✅ Local Storage
- Imported STIGs saved in localStorage
- Persistent across sessions
- Available for requirement mapping

---

## API Endpoints

### GET `/api/import-stig`

Fetches STIG from stigviewer.com

**Query Parameters:**
```
stigId: string (required) - STIG identifier (e.g., 'apache_server_2.4_unix')
```

**Response (Success):**
```json
{
  "success": true,
  "stigId": "apache_server_2.4_unix",
  "stigName": "Apache Server 2.4 Unix STIG",
  "version": "V2R5",
  "releaseDate": "2024-07-15",
  "requirements": [
    {
      "vulnId": "V-214242",
      "ruleId": "SV-214242r881413_rule",
      "severity": "high",
      "title": "Apache web server application directories...",
      "description": "...",
      "checkText": "...",
      "fixText": "...",
      "cci": ["CCI-000366"],
      "nistControls": ["CM-6"]
    }
  ],
  "totalRequirements": 42,
  "source": "stigviewer",
  "message": "Successfully imported 42 requirements from stigviewer.com"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "stigId": "apache_server_2.4_unix",
  "error": "HTTP 503: Service Unavailable",
  "message": "Failed to fetch from stigviewer.com. Please upload STIG manually.",
  "instructions": {
    "step1": "Download STIG XML from DISA Cyber Exchange...",
    "step2": "Or download from STIGViewer...",
    "step3": "Upload the XCCDF XML file..."
  }
}
```

### POST `/api/import-stig`

Uploads and parses XCCDF XML file

**Body:**
```
Content-Type: multipart/form-data
file: File (XCCDF XML)
```

**Response:**
```json
{
  "success": true,
  "stigId": "apache_server_unix",
  "stigName": "Apache Server 2.4 Unix STIG",
  "version": "V2R5",
  "releaseDate": "2024-07-15",
  "requirements": [...],
  "totalRequirements": 42,
  "source": "manual",
  "message": "Successfully imported 42 requirements from apache_server.xml"
}
```

---

## Usage

### 1. Import Component

Add to your page:

```tsx
import StigImport from '@/components/StigImport';

export default function Page() {
  return (
    <div>
      <StigImport />
    </div>
  );
}
```

### 2. Fetch from STIGViewer

```typescript
// Quick select popular STIG
const stigId = 'apache_server_2.4_unix';

// Or enter custom STIG ID
const stigId = 'custom_stig_id';

// Fetch
const response = await fetch(`/api/import-stig?stigId=${stigId}`);
const data = await response.json();

if (data.success) {
  console.log(`Imported ${data.totalRequirements} requirements`);
  // Save to state or localStorage
  localStorage.setItem('importedStigs', JSON.stringify(data));
}
```

### 3. Manual Upload

```typescript
const formData = new FormData();
formData.append('file', xmlFile);

const response = await fetch('/api/import-stig', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
if (data.success) {
  console.log(`Imported ${data.totalRequirements} requirements`);
}
```

---

## Popular STIGs

The component includes quick select for these popular STIGs:

1. **Apache Server 2.4 Unix** - `apache_server_2.4_unix`
2. **Microsoft IIS 10.0 Server** - `microsoft_iis_10-0_server`
3. **MS SQL Server 2016 Instance** - `ms_sql_server_2016_instance`
4. **PostgreSQL 9.x** - `postgresql_9-x`
5. **Red Hat Enterprise Linux 8** - `red_hat_enterprise_linux_8`
6. **Windows Server 2019** - `windows_server_2019`
7. **Application Security and Development** - `application_security_and_development`
8. **NGINX** - `nginx`

---

## XCCDF XML Parsing

The system parses XCCDF XML files and extracts:

### Metadata
- **Benchmark Title** - STIG name
- **Version** - STIG version (e.g., V2R5)
- **Release Date** - Publication date

### Requirements (from `<Group>` elements)
- **Vuln ID** - Vulnerability identifier (e.g., V-214242)
- **Rule ID** - Rule identifier (e.g., SV-214242r881413_rule)
- **Severity** - High, Medium, or Low
- **Title** - Requirement title
- **Description** - Detailed description
- **Check Text** - Verification procedure
- **Fix Text** - Remediation steps
- **CCI References** - Control Correlation Identifiers
- **NIST Controls** - Mapped NIST 800-53 controls

### XML Structure Expected

```xml
<?xml version="1.0" encoding="utf-8"?>
<Benchmark xmlns="http://checklists.nist.gov/xccdf/1.1">
  <title>Apache Server 2.4 Unix STIG</title>
  <version>V2R5</version>
  
  <Group id="V-214242">
    <Rule id="SV-214242r881413_rule" severity="high">
      <title>Apache web server application directories...</title>
      <description>...</description>
      <check>
        <check-content>...</check-content>
      </check>
      <fixtext>...</fixtext>
      <ident system="http://cyber.mil/legacy/cci">CCI-000366</ident>
      <reference>NIST 800-53 :: CM-6</reference>
    </Rule>
  </Group>
  
  <!-- More groups... -->
</Benchmark>
```

---

## Error Handling

### Network Errors
```
Error: Failed to fetch from stigviewer.com
→ Fallback: Switch to manual upload mode
→ Instructions provided for downloading XCCDF XML
```

### Invalid File Format
```
Error: Invalid file type. Please upload an XCCDF XML file.
→ Only .xml and .xccdf extensions accepted
```

### Parse Errors
```
Error: No requirements found in XML file
→ File may not be valid XCCDF format
→ Verify file is from DISA or STIGViewer
```

### Timeout
```
Error: Request timeout after 15 seconds
→ stigviewer.com may be unavailable
→ Try manual upload instead
```

---

## Data Flow

```
User Action
    │
    ├─→ Select "Fetch from STIGViewer"
    │   │
    │   ├─→ Choose popular STIG or enter ID
    │   │
    │   ├─→ GET /api/import-stig?stigId=xxx
    │   │
    │   ├─→ Fetch from stigviewer.com
    │   │   │
    │   │   ├─→ Success: Parse HTML
    │   │   │   └─→ Return requirements
    │   │   │
    │   │   └─→ Failure: Return error + instructions
    │   │       └─→ User switches to manual upload
    │   │
    │   └─→ Display results
    │
    └─→ Select "Manual Upload"
        │
        ├─→ Choose XCCDF XML file
        │
        ├─→ POST /api/import-stig (multipart/form-data)
        │
        ├─→ Parse XCCDF XML
        │   │
        │   ├─→ Extract metadata
        │   ├─→ Extract requirements
        │   └─→ Map CCI/NIST controls
        │
        └─→ Display results

Results Preview
    │
    ├─→ Show STIG metadata
    ├─→ Show first 5 requirements
    └─→ User clicks "Apply"
        │
        └─→ Save to localStorage
            └─→ Available for requirement mapping
```

---

## Local Storage Schema

```json
{
  "importedStigs": [
    {
      "stigId": "apache_server_2.4_unix",
      "stigName": "Apache Server 2.4 Unix STIG",
      "version": "V2R5",
      "releaseDate": "2024-07-15",
      "requirements": [
        {
          "vulnId": "V-214242",
          "ruleId": "SV-214242r881413_rule",
          "severity": "high",
          "title": "...",
          "description": "...",
          "checkText": "...",
          "fixText": "...",
          "cci": ["CCI-000366"],
          "nistControls": ["CM-6"]
        }
      ],
      "totalRequirements": 42,
      "source": "stigviewer",
      "importDate": "2025-10-02T12:00:00Z"
    }
  ]
}
```

---

## Testing

### Test Fetch
```bash
curl "http://localhost:3000/api/import-stig?stigId=apache_server_2.4_unix"
```

### Test Upload
```bash
curl -X POST http://localhost:3000/api/import-stig \
  -F "file=@/path/to/stig.xml"
```

---

## Troubleshooting

### Issue: "Failed to fetch from stigviewer.com"
**Cause**: Network error, stigviewer.com down, or CORS issue  
**Solution**: Use manual upload with XCCDF XML from DISA

### Issue: "No requirements found in XML"
**Cause**: Invalid XCCDF format or corrupted file  
**Solution**: Re-download from official source, verify XML structure

### Issue: "Request timeout"
**Cause**: Slow network or large STIG file  
**Solution**: Increase timeout in route.ts or use manual upload

### Issue: "Invalid file type"
**Cause**: Wrong file extension  
**Solution**: Ensure file ends with .xml or .xccdf

---

## Security Considerations

1. **File Size Limits**: Consider adding max file size validation
2. **XML Injection**: stripHtml() function sanitizes content
3. **Timeout**: 15-second timeout prevents hanging requests
4. **CORS**: Server-side fetching avoids browser CORS issues
5. **Validation**: File extension and content validation

---

## Future Enhancements

- [ ] Add STIG search/filter
- [ ] Support compressed STIG files (.zip)
- [ ] Cache fetched STIGs
- [ ] Batch import multiple STIGs
- [ ] Export imported STIGs
- [ ] STIG version comparison
- [ ] Requirement status tracking
- [ ] Integration with requirement mapping

---

## Resources

- **DISA Cyber Exchange**: https://public.cyber.mil/stigs/downloads/
- **STIGViewer.com**: https://stigviewer.com/stigs
- **XCCDF Specification**: https://csrc.nist.gov/projects/security-content-automation-protocol/specifications/xccdf

---

**Status**: ✅ Production Ready  
**Last Updated**: October 2, 2025  
**Version**: 1.0.0
