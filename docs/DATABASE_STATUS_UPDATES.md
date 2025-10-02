# Database Status Updates - How It Works

## Overview

The STIG database status is **dynamically calculated** and updates automatically when:
1. STIG updates are checked
2. STIG updates are applied
3. The user clicks the refresh button in the UI

## How Database Status is Calculated

### 1. Dynamic Calculation

The `getStigDatabaseStatus()` function calculates status in real-time:

```typescript
{
  lastUpdated: '2025-10-02',              // Last time metadata changed
  lastValidated: '2025-09-01',            // Last manual validation
  nextReviewDue: '2026-01-01',            // Scheduled review date
  totalStigFamilies: 27,                  // Total STIGs in database
  validatedFamilies: 13,                  // STIGs marked as validated
  validationPercentage: 48,               // % validated
  outdatedFamilies: 14,                   // STIGs older than 6 months
  isReviewOverdue: false,                 // Review date passed?
  daysUntilReview: 91,                    // Days until review
  healthScore: 64                         // Overall health (0-100)
}
```

### 2. Health Score Formula

```typescript
function calculateDatabaseHealthScore(validated, total, outdated, overdue) {
  let score = 100;
  
  // Validation score (40 points max)
  score = (score - 40) + (validated / total) * 40;
  
  // Outdated penalty (30 points max)
  score -= (outdated / total) * 30;
  
  // Overdue penalty (20 points)
  if (overdue) score -= 20;
  
  return Math.max(0, Math.round(score));
}
```

### 3. Health Score Interpretation

| Score | Status | Color | Meaning |
|-------|--------|-------|---------|
| **80-100** | 🟢 Excellent | Green | Most STIGs validated, few outdated |
| **60-79** | 🟡 Good | Yellow | Some validation needed |
| **40-59** | 🟠 Fair | Orange | Many STIGs need attention |
| **0-39** | 🔴 Poor | Red | Urgent updates required |

## When Status Updates

### Automatic Updates

#### 1. When Checking for Updates ✅

```javascript
// Triggers lastUpdated change
fetch('/api/stig-updates?action=check')
```

Updates:
- `STIG_DATABASE_METADATA.lastUpdated` → current date
- `AUTO_UPDATE_CONFIG.lastCheck` → current date

#### 2. When Applying Updates ✅

```javascript
// Automatically updates metadata
applyStigUpdate(update)
```

Updates:
- `STIG_DATABASE_METADATA.lastUpdated` → current date
- `STIG_FAMILIES[x].version` → new version
- `STIG_FAMILIES[x].releaseDate` → new date
- `STIG_FAMILIES[x].validated` → false (needs re-validation)

#### 3. When Auto-Apply Runs ✅

```javascript
// Scheduled checks with auto-apply
performScheduledUpdateCheck()
```

Updates:
- Applies all updates automatically
- Sets `validated: true` for official sources
- Updates metadata timestamp

### Manual Updates

#### 1. UI Refresh Button

Click the refresh icon next to "STIG Database Status":
```tsx
<button onClick={refreshDbStatus}>
  <RefreshCw className="h-3.5 w-3.5" />
</button>
```

Recalculates:
- All status fields
- Health score
- Validation percentage
- Outdated count

#### 2. API Endpoint

```bash
# Get current status
curl "http://localhost:3000/api/stig-updates?action=database-status"
```

Response:
```json
{
  "success": true,
  "status": {
    "healthScore": 64,
    "validatedFamilies": 13,
    "totalStigFamilies": 27,
    // ... full status
  }
}
```

## Testing Database Status Updates

### Test 1: Check Updates (Updates Timestamp)

```bash
# Before check
curl "http://localhost:3000/api/stig-updates?action=database-status" | jq '.status.lastUpdated'
# Output: "2025-10-02"

# Run check
curl "http://localhost:3000/api/stig-updates?action=check"

# After check
curl "http://localhost:3000/api/stig-updates?action=database-status" | jq '.status.lastUpdated'
# Output: "2025-10-02" (updated to today)
```

### Test 2: Apply Updates (Changes Health Score)

```javascript
// In browser console
const before = await fetch('/api/stig-updates?action=database-status')
  .then(r => r.json());
console.log('Before:', before.status.healthScore, '%');

// Apply an update (if available)
await fetch('/api/stig-updates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'apply-update',
    update: { /* update data */ }
  })
});

// Check after
const after = await fetch('/api/stig-updates?action=database-status')
  .then(r => r.json());
console.log('After:', after.status.healthScore, '%');
```

### Test 3: UI Refresh Button

1. Open the application at `http://localhost:3000`
2. Scroll to "STIG Database Status" section
3. Note the current health score
4. Click the refresh icon (🔄)
5. Status recalculates immediately

### Test 4: Automatic Updates

```javascript
// Enable auto-updates
await fetch('/api/stig-updates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'enable', enabled: true })
});

// Run scheduled check (simulates cron job)
await fetch('/api/stig-updates?action=scheduled');

// Check status - should show updates applied
const status = await fetch('/api/stig-updates?action=database-status')
  .then(r => r.json());
console.log('Validated families:', status.status.validatedFamilies);
```

## What Gets Updated

### Metadata Fields

```typescript
STIG_DATABASE_METADATA = {
  lastUpdated: '2025-10-02',     // ✅ Updates automatically
  lastValidated: '2025-09-01',   // ⚠️ Manual only
  nextReviewDue: '2026-01-01',   // ⚠️ Manual only
  totalStigFamilies: 0,          // ✅ Calculated dynamically
  validatedFamilies: 0,          // ✅ Calculated dynamically
  updateFrequency: 'Quarterly',  // ⚠️ Manual only
  dataSources: [...],            // ⚠️ Manual only
  criticalUpdatesNeeded: [],     // ⚠️ Manual only
  updateNotes: '...'             // ⚠️ Manual only
}
```

### STIG Family Fields

```typescript
STIG_FAMILIES[x] = {
  version: 'V7',                 // ✅ Updates on apply
  releaseDate: '2025-09-15',     // ✅ Updates on apply
  actualRequirements: 170,       // ✅ Updates on apply
  validated: true,               // ✅ Updates on auto-apply
  // ... other fields unchanged
}
```

## UI Display

### Health Score Colors

```tsx
{/* Green: 80-100 */}
<div className="bg-green-50 border-green-200">
  <div className="bg-green-100 text-green-800">
    Health: 85%
  </div>
</div>

{/* Yellow: 60-79 */}
<div className="bg-yellow-50 border-yellow-200">
  <div className="bg-yellow-100 text-yellow-800">
    Health: 64%
  </div>
</div>

{/* Red: 0-59 */}
<div className="bg-red-50 border-red-200">
  <div className="bg-red-100 text-red-800">
    Health: 42%
  </div>
</div>
```

### Status Information

```tsx
{/* Main status line */}
13/27 families validated (48%) • 14 may need updates

{/* Next review */}
Next review: 91 days

{/* Warning (if needed) */}
⚠️ Action Needed: STIG data requires manual updates.
Last validated: 2025-09-01
```

## Current Status Example

### Your Database (October 2, 2025)

```json
{
  "healthScore": 64,              // 🟡 Good (yellow)
  "validatedFamilies": 13,        // 48% validated
  "totalStigFamilies": 27,
  "outdatedFamilies": 14,         // 14 STIGs > 6 months old
  "isReviewOverdue": false,       // Still have time
  "daysUntilReview": 91,          // ~3 months until review
  "validationPercentage": 48
}
```

### What This Means

- ✅ **System is operational** (health 64%)
- ⚠️ **Some STIGs need validation** (only 48% validated)
- ⚠️ **14 STIGs may need updates** (older than 6 months)
- ✅ **Review not overdue** (91 days remaining)

### To Improve Health Score

1. **Run update check** → Increases `lastUpdated`
2. **Apply available updates** → Increases `validatedFamilies`
3. **Enable auto-apply** → Automatically validates from official sources
4. **Manual validation** → Update `lastValidated` in metadata

## API Endpoints Summary

| Endpoint | Method | Purpose | Updates Status? |
|----------|--------|---------|-----------------|
| `/api/stig-updates?action=check` | GET | Check for updates | ✅ Yes (timestamp) |
| `/api/stig-updates?action=database-status` | GET | Get current status | ❌ No (read-only) |
| `/api/stig-updates?action=scheduled` | GET | Run scheduled check | ✅ Yes (if auto-apply) |
| `/api/stig-updates (apply-update)` | POST | Apply single update | ✅ Yes (metadata) |
| `/api/stig-updates (apply-multiple)` | POST | Apply batch updates | ✅ Yes (metadata) |

## Troubleshooting

### Status Not Updating

**Issue**: UI shows old status after running checks

**Solutions**:
1. Click the refresh button (🔄)
2. Reload the page
3. Check API response: `curl "http://localhost:3000/api/stig-updates?action=database-status"`

### Health Score Not Changing

**Issue**: Health score stays at 64% after applying updates

**Reason**: Health score depends on multiple factors:
- Validation percentage (40 points)
- Outdated STIGs (30 points penalty)
- Overdue review (20 points penalty)

**To improve**:
- Validate more STIGs (increase validated count)
- Apply updates to outdated STIGs
- Complete scheduled review

### lastUpdated Not Changing

**Issue**: Timestamp doesn't update after check

**Check**:
```javascript
// Verify API updates metadata
fetch('/api/stig-updates?action=check')
  .then(() => fetch('/api/stig-updates?action=database-status'))
  .then(r => r.json())
  .then(data => console.log('Last updated:', data.status.lastUpdated));
```

If still not updating, check console for errors.

## Summary

✅ **Database status updates automatically** when:
- Checking for updates
- Applying updates
- Running scheduled checks

✅ **UI refreshes automatically** when:
- Recommendations change
- User clicks refresh button
- Page reloads

✅ **Health score reflects**:
- Validation percentage
- Outdated STIG count
- Review status

✅ **Current system status**: Operational with 64% health (Good)

---

**Last Updated**: October 2, 2025  
**Version**: 3.0.3  
**Status**: ✅ Working as designed
