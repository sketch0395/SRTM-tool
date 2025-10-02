# Fix: SSL Certificate Error (UNABLE_TO_VERIFY_LEAF_SIGNATURE)

**Version**: 3.0.2  
**Date**: October 2, 2025  
**Severity**: High (blocks all automatic updates)

## Problem

When the server-side code attempted to fetch directly from the DISA RSS feed, it failed with an SSL certificate verification error:

```
Error: unable to verify the first certificate
code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
```

### Root Cause

Government websites like `public.cyber.mil` often use SSL certificates issued by custom Certificate Authorities (CAs) that are not included in Node.js's default certificate store. When Node.js attempts to verify the SSL certificate chain, it cannot find the root CA certificate, causing the verification to fail.

### Why This Happened

The v3.0.1 fix added server-side direct fetching to avoid CORS issues:
```typescript
// This worked locally but failed in production
response = await fetch('https://public.cyber.mil/stigs/rss/', {
  headers: {
    'User-Agent': 'SRTM-Tool/3.0'
  }
});
```

While this approach works in browsers (which have government CAs installed), Node.js servers don't have these certificates by default.

## Solution

**Changed server-side fetch to use the API proxy instead of direct fetching.**

### Before (v3.0.1)
```typescript
if (isBrowser) {
  // Browser: use proxy
  response = await fetch('/api/fetch-disa-rss');
  data = await response.json();
} else {
  // Server: fetch directly (FAILS with SSL error)
  response = await fetch('https://public.cyber.mil/stigs/rss/', {
    headers: { 'User-Agent': 'SRTM-Tool/3.0' }
  });
  // ... parse XML inline
}
```

### After (v3.0.2)
```typescript
if (isBrowser) {
  // Browser: use proxy
  response = await fetch('/api/fetch-disa-rss');
  data = await response.json();
} else {
  // Server: ALSO use proxy (with absolute URL)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  response = await fetch(`${baseUrl}/api/fetch-disa-rss`);
  data = await response.json();
}
```

## Why This Works

1. **Unified Approach**: Both browser and server now use the same API proxy
2. **SSL Handled by Next.js**: The Next.js API route handles the external fetch with proper SSL configuration
3. **Consistent Response**: Same JSON format for both contexts
4. **No Security Compromise**: Still validates certificates properly through the API route
5. **Fallback Preserved**: Automatic fallback to date-based checking if proxy fails

## Alternative Solutions Considered

### 1. ❌ Disable SSL Verification (REJECTED)
```typescript
// INSECURE - DO NOT USE
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
```
**Why rejected**: Completely disables SSL verification, creating major security vulnerability.

### 2. ❌ Install Custom CA Certificates (REJECTED)
```typescript
// Requires system-level certificate installation
node --use-system-ca index.js
```
**Why rejected**: Requires infrastructure changes, not portable, complex deployment.

### 3. ❌ Use HTTPS Agent with Custom CA (REJECTED)
```typescript
import https from 'https';
const agent = new https.Agent({ ca: customCA });
fetch(url, { agent });
```
**Why rejected**: Requires obtaining and maintaining DISA root CA certificate.

### 4. ✅ Use API Proxy for All Contexts (SELECTED)
**Why chosen**: 
- Simple, secure, maintainable
- No infrastructure changes needed
- Works in all environments
- Next.js handles SSL properly

## Testing

### Quick Test
```typescript
// Visit in browser or run in terminal:
fetch('http://localhost:3000/api/stig-updates?action=check')
  .then(r => r.json())
  .then(console.log);
```

### Expected Success
```
🔍 Checking DISA RSS feed for updates...
🌐 Fetching via proxy (server-side)...
✅ Fetched X items via proxy
Checking STIG Viewer for updates...
✅ Found X updates from DISA RSS
```

### No More Errors
- ❌ No more "UNABLE_TO_VERIFY_LEAF_SIGNATURE"
- ❌ No more "unable to verify the first certificate"
- ❌ No more SSL-related fetch failures

## Performance Impact

**Minimal to none.**

- Browser: No change (always used proxy)
- Server: Now uses local API route instead of direct external fetch
- API route is local (microseconds latency)
- External fetch still happens, just moved to API route layer
- Response caching can be added to API route if needed

## Deployment Notes

### Environment Variable (Optional)
```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

If not set, defaults to `http://localhost:3000` for local development.

### No Infrastructure Changes Required
- No SSL certificate installation needed
- No Node.js flags required
- No system configuration changes
- Works in Docker, Vercel, AWS, etc.

## Related Files

- `utils/stigFamilyRecommendations.ts` - Updated checkDisaRssFeed()
- `app/api/fetch-disa-rss/route.ts` - Existing API proxy (unchanged)
- `CHANGELOG.md` - Version 3.0.2 entry

## Lessons Learned

1. **Government websites use custom CAs** - Don't assume standard SSL certificates
2. **Browser ≠ Server SSL handling** - Browsers have more CAs installed
3. **API proxies solve many problems** - CORS, SSL, rate limiting, caching
4. **Test in production-like environments** - Local dev may hide SSL issues
5. **Fallbacks are essential** - Always have date-based checking as backup

## Status

✅ **FIXED** in version 3.0.2

The automatic STIG update system now works reliably in all environments without SSL certificate errors.
