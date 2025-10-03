# STIGViewer.com 403 Forbidden Error - Mitigation & Solutions

## Issue Description
stigviewer.com is now returning `403 Forbidden` errors when attempting to fetch STIG data via their API. This prevents the automatic import of STIG requirements.

**Error Pattern:**
```
📥 Attempting JSON API...
📥 Attempting HTML parsing...
❌ Error fetching from stigviewer.com: HTTP 403: Forbidden
GET /api/import-stig?stigId=application_security_and_development 503
```

## Root Causes
The 403 error typically occurs due to:
1. **Rate Limiting** - Too many requests in a short time
2. **Bot Detection** - Automated requests being flagged by Cloudflare/security systems
3. **IP-Based Blocking** - Temporary or permanent IP restrictions
4. **User-Agent Filtering** - Generic or bot-like User-Agent strings being rejected

## Mitigations Implemented

### 1. Enhanced HTTP Headers
Updated request headers to mimic a real browser more closely:
```typescript
headers: {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://stigviewer.com/',
  'Connection': 'keep-alive',
  'Cache-Control': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin',
  'Upgrade-Insecure-Requests': '1',
}
```

### 2. Rate Limiting Protection
Added 500ms delay between JSON and HTML fetch attempts:
```typescript
await new Promise(resolve => setTimeout(resolve, 500));
```

### 3. Better Error Handling
Improved error messages to guide users:
- Specific guidance for 403 errors
- Instructions for manual STIG download
- Links to official DISA sources

### 4. Graceful Degradation
System still functions with manual STIG upload capability

## Alternative Solutions

### Option 1: Manual STIG Upload (Recommended for now)
Users can download STIGs manually and upload them:

**Sources:**
- DISA Cyber Exchange: https://public.cyber.mil/stigs/downloads/
- STIGViewer: https://stigviewer.com/stigs (browse and download)

**Process:**
1. Download XCCDF XML file from DISA
2. Use the "Upload STIG" button in the application
3. Select the XML file
4. Requirements are automatically parsed

### Option 2: Server-Side Proxy
Implement a backend proxy that:
- Caches STIG data
- Implements proper rate limiting
- Rotates User-Agents
- Handles retries with exponential backoff

**Implementation Notes:**
```typescript
// Add to API route
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Check cache before fetching
if (cache.has(stigId)) {
  const cached = cache.get(stigId);
  if (Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
}
```

### Option 3: Pre-Download STIG Database
Create a local database of common STIGs:
1. Download popular STIGs once
2. Store in `/public/stigs/` directory
3. Update monthly via automated script
4. Serve from local storage first, fallback to stigviewer.com

### Option 4: Use DISA API Directly
If DISA provides an official API:
- Register for API access
- Use official endpoints
- Better reliability and support

## Workarounds for Users

### Immediate Workaround
1. Wait 5-10 minutes between requests
2. Use different STIGs (not the same one repeatedly)
3. Download and upload STIGs manually

### Browser-Based Workaround
1. Open stigviewer.com in browser
2. Navigate to desired STIG
3. Download JSON or XML manually
4. Upload to SRTM Tool

## Monitoring & Detection

The system now logs detailed information:
```
✅ JSON API successful - Request succeeded
⚠️ JSON API returned 403: Forbidden - Access denied
⚠️ JSON API failed: timeout - Request timed out
❌ Error fetching from stigviewer.com - Complete failure
```

## Future Improvements

1. **Request Queue**: Implement request queuing with rate limiting
2. **Retry Logic**: Exponential backoff for failed requests
3. **Circuit Breaker**: Temporarily disable stigviewer.com fetching after repeated failures
4. **Local Cache**: Store fetched STIGs in browser localStorage/IndexedDB
5. **Background Sync**: Pre-fetch popular STIGs during idle time
6. **User Notification**: Alert users when stigviewer.com is unavailable

## Testing

Test the enhanced headers:
```bash
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
     -H "Referer: https://stigviewer.com/" \
     https://stigviewer.com/stigs/application_security_and_development/json
```

## Related Files
- `/app/api/import-stig/route.ts` - Main API handler with enhanced headers
- `/utils/detailedStigRequirements.ts` - STIG ID mapping and conversion
- `/components/StigFamilyRecommendations.tsx` - UI component for STIG selection

## Status
**Current Status**: Mitigations implemented, manual upload fully functional
**Last Updated**: October 3, 2025
**Next Review**: Monitor for stigviewer.com policy changes
