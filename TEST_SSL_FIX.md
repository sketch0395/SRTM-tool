# Quick Test: SSL Certificate Fix (v3.0.2)

## What Was Fixed

❌ **Before**: Server-side fetch failed with SSL certificate error  
✅ **After**: Server-side fetch uses API proxy (no SSL issues)

## Quick Test Methods

### Method 1: Browser Test (Fastest)

Open browser console and run:
```javascript
fetch('http://localhost:3000/api/stig-updates?action=check')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Test passed!', data);
  })
  .catch(err => {
    console.error('❌ Test failed:', err);
  });
```

### Method 2: PowerShell Test

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/stig-updates?action=check" | ConvertTo-Json -Depth 10
```

### Method 3: Direct Visit

Navigate to: `http://localhost:3000/api/stig-updates?action=check`

## Expected Success Indicators

### Console Output (No Errors)
```
🔍 Checking DISA RSS feed for updates...
🌐 Fetching via proxy (server-side)...
✅ Fetched X items via proxy
Checking STIG Viewer for updates...
✅ Found X updates from DISA RSS
```

### JSON Response
```json
{
  "success": true,
  "updates": [ /* array of updates */ ],
  "count": 2
}
```

### No More These Errors
- ❌ "UNABLE_TO_VERIFY_LEAF_SIGNATURE"
- ❌ "unable to verify the first certificate"
- ❌ "fetch failed"
- ❌ "TypeError: fetch failed"

## What Should Happen

1. ✅ API call completes successfully
2. ✅ Console shows "Fetching via proxy (server-side)"
3. ✅ No SSL certificate errors
4. ✅ Updates are returned (if available)
5. ✅ Exit code 200 (success)

## If Test Fails

### Check 1: Dev Server Running
```powershell
# Make sure dev server is running
npm run dev
```

### Check 2: API Route Exists
Verify file exists: `app/api/fetch-disa-rss/route.ts`

### Check 3: Clear Cache
```powershell
# Stop server, clear cache, restart
Remove-Item -Recurse -Force .next
npm run dev
```

### Check 4: Environment Variable (Optional)
```powershell
# Set if deploying to production
$env:NEXT_PUBLIC_BASE_URL = "https://your-domain.com"
```

## Advanced Test: Full Update Cycle

### 1. Check for Updates
```javascript
fetch('/api/stig-updates?action=check')
  .then(r => r.json())
  .then(console.log);
```

### 2. Verify Database Status
```javascript
fetch('/api/stig-updates?action=status')
  .then(r => r.json())
  .then(console.log);
```

### 3. Enable Scheduled Checks
```javascript
fetch('/api/stig-updates?action=enable', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

## Success Criteria

✅ All API calls return 200 status  
✅ No SSL certificate errors in console  
✅ Updates are fetched successfully  
✅ Server logs show "Fetching via proxy"  
✅ JSON responses are properly formatted  

## Version Info

- **Fixed in**: v3.0.2
- **Previous issue**: v3.0.1 (server-side SSL error)
- **Original feature**: v3.0.0 (auto-updates)

## Files Changed

- `utils/stigFamilyRecommendations.ts` - checkDisaRssFeed() function
- Server-side fetch now uses API proxy with absolute URL
- Same behavior for both browser and server contexts

---

**Status**: ✅ Fixed and ready for testing
