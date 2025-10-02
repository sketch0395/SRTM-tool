# Test: stigviewer.com Integration (v3.0.3)

**Version**: 3.0.3  
**Date**: October 2, 2025  
**Feature**: Primary STIG update source now uses stigviewer.com

## What Changed

✅ **Before (v3.0.2)**: DISA RSS feed (SSL certificate issues)  
✅ **After (v3.0.3)**: stigviewer.com (reliable, better SSL)

### Update Source Priority

1. **Primary**: stigviewer.com (reliable, parses HTML for versions)
2. **Fallback**: DISA RSS feed (if stigviewer fails)
3. **Final Fallback**: Date-based checking (if all sources fail)

## Quick Test

### Method 1: Browser Console (Fastest)

```javascript
fetch('/api/stig-updates?action=check')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Success!', data);
    console.log(`Found ${data.updates.length} updates`);
  })
  .catch(err => console.error('❌ Error:', err));
```

### Method 2: Direct URL

Navigate to: `http://localhost:3000/api/stig-updates?action=check`

### Method 3: PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/stig-updates?action=check" | ConvertTo-Json -Depth 10
```

## Expected Output

### Console Logs (Success)

```
🔍 Checking STIG sources for updates...
📚 Fetching from stigviewer.com...
  📖 Checking: application_security_and_development
  ✅ Update: V6 → V7
  📖 Checking: web_server
  ✓ Current: V4
  📖 Checking: apache_server_2.4_unix_server
  ✓ Current: V3
  📖 Checking: apache_tomcat_application_server_9
  ✓ Current: V3
  📖 Checking: microsoft_iis_10.0_server
  ✓ Current: V3
✅ Found 1 updates from stigviewer.com
```

### JSON Response

```json
{
  "success": true,
  "updates": [
    {
      "stigId": "application-security-dev",
      "currentVersion": "V6",
      "latestVersion": "V7",
      "currentReleaseDate": "2025-02-12",
      "latestReleaseDate": "2025-09-15",
      "updateAvailable": true,
      "severity": "high",
      "lastChecked": "2025-10-02",
      "source": "stigviewer.com",
      "updateNotes": "Found on stigviewer.com: V7",
      "actualRequirements": 170,
      "requirementCountChange": 5
    }
  ],
  "count": 1
}
```

## What Gets Checked

The system checks the **top 5 high-priority STIGs**:

1. Application Security and Development
2. Web Server Security Requirements Guide
3. Application Server Security Requirements Guide
4. Apache Server 2.4 UNIX Server
5. Apache Server 2.4 UNIX Site

### Why Only 5 STIGs?

- **Performance**: Checking all 20+ STIGs would take too long
- **Rate Limiting**: Being respectful to stigviewer.com
- **Priority**: High-priority STIGs are checked first
- **Scalability**: Can be increased if needed

## Features Tested

### ✅ HTML Parsing

Extracts from stigviewer.com:
- **Version**: `Version: V7R2` → `V7R2`
- **Release Date**: `Release Date: 15 September 2025` → `2025-09-15`
- **Requirements**: `165 rules / SV-222222r123456` → `165`

### ✅ Name Conversion

Converts STIG names to URLs:
- `Apache Server 2.4 UNIX Server STIG` → `apache_server_2.4_unix_server`
- `Microsoft IIS 10.0 Server STIG` → `microsoft_iis_10.0_server`
- `Application Security and Development` → `application_security_and_development`

### ✅ Rate Limiting

- 200ms delay between requests
- Prevents overwhelming stigviewer.com
- Good citizenship for public API usage

### ✅ Error Handling

- Skip individual STIGs if they fail
- Continue checking remaining STIGs
- Fall back to DISA RSS if stigviewer fails
- Final fallback to date-based checking

## Fallback Chain Test

### Test Full Fallback Chain

```javascript
// This will show the full fallback behavior
fetch('/api/stig-updates?action=check')
  .then(r => r.json())
  .then(data => {
    console.log('Source used:', data.updates[0]?.source);
    // Expected: "stigviewer.com" (primary)
    // Fallback: "DISA RSS" (if stigviewer fails)
    // Final: "Date Check" (if both fail)
  });
```

## Performance Benchmarks

### Expected Timing

- **stigviewer.com**: 1-2 seconds (5 STIGs × 200ms + network)
- **DISA RSS fallback**: 500-1000ms (single request)
- **Date-based fallback**: <100ms (local calculation)

### Monitor Performance

```javascript
console.time('STIG Update Check');
fetch('/api/stig-updates?action=check')
  .then(r => r.json())
  .then(data => {
    console.timeEnd('STIG Update Check');
    console.log(`Checked ${data.updates.length} updates`);
  });
```

## Troubleshooting

### Issue: No updates found

**Possible causes:**
1. All STIGs are already up to date
2. stigviewer.com is down (check fallback logs)
3. Network connectivity issue

**Solution:**
```javascript
// Check what source was used
fetch('/api/stig-updates?action=check')
  .then(r => r.json())
  .then(data => console.log('Sources:', 
    data.updates.map(u => u.source)
  ));
```

### Issue: stigviewer.com timeout

**Expected behavior:** Automatic fallback to DISA RSS

**Console output:**
```
⚠️ stigviewer.com unavailable, trying DISA RSS...
📡 Checking DISA RSS feed...
```

### Issue: All sources fail

**Expected behavior:** Date-based checking

**Console output:**
```
⚠️ All sources unavailable, using date-based checking
```

## Advanced Testing

### Test stigviewer.com Directly

```javascript
// Test individual STIG lookup
fetch('https://www.stigviewer.com/stig/application_security_and_development/')
  .then(r => r.text())
  .then(html => {
    const version = html.match(/Version[:\s]+([VRv\d.-]+)/i);
    console.log('Found version:', version?.[1]);
  });
```

### Test Rate Limiting

```javascript
// Should take ~1 second (5 × 200ms)
console.time('Rate Limiting');
// Run check
console.timeEnd('Rate Limiting');
```

### Test Error Recovery

```javascript
// Simulate stigviewer failure by checking logs
// Should automatically fall back to DISA RSS
```

## Configuration

### Adjust Number of STIGs Checked

Edit `stigFamilyRecommendations.ts`:

```typescript
// Change from 5 to desired number
const priorityStigs = STIG_FAMILIES
  .filter(f => f.priority === 'High')
  .slice(0, 10); // Check top 10 instead of 5
```

### Adjust Rate Limiting

```typescript
// Change from 200ms to desired delay
await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
```

### Disable stigviewer.com (Testing)

To test fallback behavior:

```typescript
// Comment out stigviewer check
// const stigViewerUpdates = await checkStigViewerSource();
```

## Success Criteria

✅ **API call returns 200 status**  
✅ **stigviewer.com is checked first**  
✅ **Console shows progress indicators**  
✅ **Updates are found (if available)**  
✅ **No SSL certificate errors**  
✅ **Graceful fallback if stigviewer fails**  
✅ **Rate limiting is respected**  
✅ **JSON response is well-formatted**  

## Comparison: v3.0.2 vs v3.0.3

| Feature | v3.0.2 (DISA) | v3.0.3 (stigviewer) |
|---------|---------------|---------------------|
| Primary Source | DISA RSS | stigviewer.com |
| SSL Issues | Yes (custom CA) | No (standard SSL) |
| Reliability | Medium | High |
| Data Quality | Limited | Excellent |
| Parse Method | RSS/XML | HTML regex |
| Requirement Count | No | Yes |
| Rate Limiting | No | Yes (200ms) |
| Fallback | Date-based | DISA → Date |

## Next Steps

1. ✅ Run quick test (browser console)
2. ✅ Verify console output shows stigviewer.com
3. ✅ Check for any SSL errors (should be none)
4. ✅ Verify fallback works if stigviewer fails
5. ✅ Test automatic update application (if enabled)

---

**Status**: ✅ Ready for testing  
**Impact**: High - Primary update source changed  
**Risk**: Low - Multiple fallback sources available  
**Performance**: Improved reliability, slightly slower (rate limiting)
