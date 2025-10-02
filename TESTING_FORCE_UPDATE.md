# Testing Force Update System - Complete Guide

## Overview

This guide shows you how to test the forced update system by:
1. Simulating an outdated STIG (10 years old)
2. Running a forced update check
3. Observing the system detect and apply updates
4. Validating the results

---

## Test Scenario Setup

### What We'll Simulate

**Scenario**: The PostgreSQL STIG is severely outdated (from 2015, currently V2R5) and a new version V3R1 was released in 2025.

### Steps to Test

1. **Make STIG "outdated"** - Change date to 10 years ago
2. **Mark as unvalidated** - Set `validated: false`
3. **Run force-check** - System detects it's old
4. **Verify detection** - Check if flagged as needing update
5. **Restore to current** - Simulate receiving "new" version
6. **Verify health improvement** - Check score increase

---

## Step 1: Create Test STIG (Outdated)

Let's modify the PostgreSQL STIG to simulate an outdated version:

```typescript
{
  id: 'postgresql-9x',
  name: 'PostgreSQL 9.x STIG',
  version: 'V2R5',
  releaseDate: '2015-09-12',  // ← 10 years old!
  validated: false,            // ← Not validated
  // ... rest unchanged
}
```

### Expected Behavior

- **Date check**: 2015-09-12 is >6 months old ✅
- **Validation**: Not validated ✅
- **Health score**: Should drop from 100%
- **Outdated count**: Should increase by 1
- **Update detection**: System should flag for update

---

## Step 2: Run Tests

### Test 1: Check Database Status (Before)

```bash
curl "http://localhost:3000/api/stig-updates?action=database-status"
```

**Expected Output (Before)**:
```json
{
  "healthScore": 96,  // Slight drop from 100%
  "validatedFamilies": 26,  // One less validated
  "outdatedFamilies": 1,    // One outdated STIG
  "totalStigFamilies": 27
}
```

### Test 2: Check for Updates

```bash
curl "http://localhost:3000/api/stig-updates?action=check"
```

**Expected Output**:
```json
{
  "success": true,
  "updates": [
    {
      "stigId": "postgresql-9x",
      "currentVersion": "V2R5",
      "currentReleaseDate": "2015-09-12",
      "source": "Date Check",
      "severity": "high",  // Old date = high severity
      "updateNotes": "STIG is older than 6 months - check DISA for updates"
    }
  ],
  "count": 1
}
```

### Test 3: Force Update Check

```bash
curl "http://localhost:3000/api/stig-updates?action=force-check"
```

**Expected Output**:
```json
{
  "success": true,
  "message": "Applied 1/1 updates",
  "totalUpdatesFound": 1,
  "updatesApplied": 1,
  "results": [
    {
      "success": true,
      "stigId": "postgresql-9x",
      "oldVersion": "V2R5",
      "newVersion": "V2R5",  // No change (date-based update)
      "message": "Successfully updated postgresql-9x"
    }
  ]
}
```

**Note**: Date-based updates don't have new version data, so version stays same. This is expected!

### Test 4: Check Status (After)

```bash
curl "http://localhost:3000/api/stig-updates?action=database-status"
```

**Expected Output (After applying date-based update)**:
```json
{
  "healthScore": 96,  // Still lower (no real update applied)
  "validatedFamilies": 26,  // Still 26 (date update doesn't validate)
  "outdatedFamilies": 1,    // Still 1 (date didn't change)
  "totalStigFamilies": 27
}
```

---

## Step 3: Simulate Real Update (Manual)

Now simulate receiving a "real" update from stigviewer.com or DISA:

### Update the STIG Manually

```typescript
{
  id: 'postgresql-9x',
  name: 'PostgreSQL 9.x STIG',
  version: 'V3R1',              // ← NEW VERSION!
  releaseDate: '2025-10-02',   // ← NEW DATE!
  validated: true,              // ← Mark as validated
  actualRequirements: 130,      // ← Updated count
  // ... rest unchanged
}
```

### Check Status Again

```bash
curl "http://localhost:3000/api/stig-updates?action=database-status"
```

**Expected Output (After real update)**:
```json
{
  "healthScore": 100,  // Back to perfect!
  "validatedFamilies": 27,  // All validated again
  "outdatedFamilies": 0,    // No outdated STIGs
  "totalStigFamilies": 27
}
```

---

## Step 4: Test STIG Removal

### Remove a STIG Completely

Comment out or remove one STIG from the array:

```typescript
export const STIG_FAMILIES: StigFamily[] = [
  // ... other STIGs
  
  // {  // ← REMOVED: Docker Enterprise
  //   id: 'docker-enterprise',
  //   name: 'Docker Enterprise 2.x STIG',
  //   ...
  // },
  
  // ... other STIGs
];
```

### Expected Behavior

- **Total count**: 27 → 26
- **Validated**: 27 → 26 (if it was validated)
- **Health score**: May stay 100% if all remaining are validated
- **Recommendations**: Docker no longer appears in suggestions

### Test Removal

```bash
# Check database status
curl "http://localhost:3000/api/stig-updates?action=database-status"
```

**Expected**:
```json
{
  "totalStigFamilies": 26,  // One less!
  "validatedFamilies": 26,  // Still 100% if all remaining validated
  "healthScore": 100
}
```

---

## Complete Test Script

Here's a complete PowerShell script to run all tests:

```powershell
Write-Host "`n=== FORCE UPDATE TEST SUITE ===" -ForegroundColor Cyan

# Test 1: Initial Status
Write-Host "`n📊 Test 1: Get Initial Status" -ForegroundColor Yellow
$initial = curl "http://localhost:3000/api/stig-updates?action=database-status" 2>$null | ConvertFrom-Json
Write-Host "  Health: $($initial.status.healthScore)%"
Write-Host "  Validated: $($initial.status.validatedFamilies)/$($initial.status.totalStigFamilies)"
Write-Host "  Outdated: $($initial.status.outdatedFamilies)"

# Test 2: Check for Updates
Write-Host "`n🔍 Test 2: Check for Updates" -ForegroundColor Yellow
$updates = curl "http://localhost:3000/api/stig-updates?action=check" 2>$null | ConvertFrom-Json
Write-Host "  Updates found: $($updates.count)"
if ($updates.count -gt 0) {
    Write-Host "  First update: $($updates.updates[0].stigId)"
    Write-Host "  Source: $($updates.updates[0].source)"
    Write-Host "  Severity: $($updates.updates[0].severity)"
}

# Test 3: Force Check (Apply Updates)
Write-Host "`n🚀 Test 3: Force Check (Apply Updates)" -ForegroundColor Yellow
$forceResult = curl "http://localhost:3000/api/stig-updates?action=force-check" 2>$null | ConvertFrom-Json
Write-Host "  Message: $($forceResult.message)"
Write-Host "  Found: $($forceResult.totalUpdatesFound)"
Write-Host "  Applied: $($forceResult.updatesApplied)"

# Test 4: Final Status
Write-Host "`n📊 Test 4: Get Final Status" -ForegroundColor Yellow
$final = curl "http://localhost:3000/api/stig-updates?action=database-status" 2>$null | ConvertFrom-Json
Write-Host "  Health: $($final.status.healthScore)%"
Write-Host "  Validated: $($final.status.validatedFamilies)/$($final.status.totalStigFamilies)"
Write-Host "  Outdated: $($final.status.outdatedFamilies)"

# Test 5: Compare Results
Write-Host "`n📈 Test 5: Compare Before/After" -ForegroundColor Green
$healthChange = $final.status.healthScore - $initial.status.healthScore
$valChange = $final.status.validatedFamilies - $initial.status.validatedFamilies
$outdatedChange = $final.status.outdatedFamilies - $initial.status.outdatedFamilies

Write-Host "  Health: $($initial.status.healthScore)% → $($final.status.healthScore)% ($(if($healthChange -ge 0){"+$healthChange"}else{$healthChange}))"
Write-Host "  Validated: $($initial.status.validatedFamilies) → $($final.status.validatedFamilies) ($(if($valChange -ge 0){"+$valChange"}else{$valChange}))"
Write-Host "  Outdated: $($initial.status.outdatedFamilies) → $($final.status.outdatedFamilies) ($(if($outdatedChange -le 0){$outdatedChange}else{"+$outdatedChange"}))"

Write-Host "`n✅ Test Suite Complete!`n" -ForegroundColor Green
```

---

## Real-World Testing Scenarios

### Scenario 1: Outdated STIG (10 years old)

**Setup**:
```typescript
{
  id: 'postgresql-9x',
  version: 'V2R5',
  releaseDate: '2015-09-12',  // 10 years ago
  validated: false
}
```

**Expected**:
- ✅ Detected as outdated
- ✅ Flagged for update
- ✅ Health score drops
- ⚠️ Date-based update applied (no version change)
- ⚠️ Still shows as outdated until real update

### Scenario 2: Recently Released STIG

**Setup**:
```typescript
{
  id: 'postgresql-9x',
  version: 'V3R1',
  releaseDate: '2025-10-02',  // Today
  validated: true
}
```

**Expected**:
- ✅ Not flagged as outdated
- ✅ No updates detected
- ✅ Health score remains 100%
- ✅ Validated status maintained

### Scenario 3: Removed STIG

**Setup**: Comment out entire STIG entry

**Expected**:
- ✅ Total count decreases
- ✅ Recommendations no longer include it
- ✅ Health score recalculates
- ✅ System continues functioning

### Scenario 4: New Version Available

**Setup**: Manually update version and date to simulate stigviewer.com finding newer version

```typescript
{
  id: 'postgresql-9x',
  version: 'V3R1',              // Was V2R5
  releaseDate: '2025-10-02',   // Was 2015-09-12
  validated: true,              // Was false
  actualRequirements: 130       // Was 122
}
```

**Expected**:
- ✅ Health score improves
- ✅ Validated count increases
- ✅ Outdated count decreases
- ✅ Green badge appears

---

## Validation Checklist

After running tests, verify:

### Database Status API
- [ ] Health score calculated correctly
- [ ] Validated count accurate
- [ ] Outdated count accurate
- [ ] Total STIG count correct

### Update Detection
- [ ] Old STIGs flagged (>6 months)
- [ ] Severity assigned correctly
- [ ] Source identified (Date Check, stigviewer, DISA)
- [ ] Update notes descriptive

### Update Application
- [ ] Force-check applies updates
- [ ] Backup created (if enabled)
- [ ] Metadata updated
- [ ] Status reflects changes

### UI Display
- [ ] Health score badge color correct
- [ ] Validated percentage shown
- [ ] Outdated count displayed
- [ ] Refresh button works

---

## Troubleshooting

### Issue: No updates detected for old STIG

**Cause**: STIG might already be marked as validated

**Solution**:
```typescript
validated: false  // Set to false to test
```

### Issue: Updates found but not applied

**Cause**: Auto-apply might be disabled

**Solution**:
```bash
# Check config
curl "http://localhost:3000/api/stig-updates?action=status"

# Enable if needed
curl -X POST "http://localhost:3000/api/stig-updates" \
  -H "Content-Type: application/json" \
  -d '{"action":"enable","enabled":true}'
```

### Issue: Health score doesn't change

**Cause**: Date-based updates don't add real data

**Solution**: Manually update version and date to simulate real update

### Issue: STIG removal breaks system

**Cause**: Missing STIG referenced elsewhere

**Solution**: Search for STIG ID references:
```bash
grep -r "postgresql-9x" .
```

---

## Summary

### To Test Force Update System:

1. **Make STIG outdated**: Change date to `'2015-09-12'`, set `validated: false`
2. **Check status**: Run `action=database-status` (health should drop)
3. **Check updates**: Run `action=check` (should find 1 update)
4. **Force apply**: Run `action=force-check` (applies update)
5. **Verify**: Check status again (may still show outdated if date-based)
6. **Real update**: Manually change version/date (simulates real update)
7. **Final verify**: Health should return to 100%

### To Test STIG Removal:

1. **Comment out STIG**: Remove from `STIG_FAMILIES` array
2. **Check status**: Total count should decrease
3. **Check recommendations**: Removed STIG shouldn't appear
4. **Verify health**: Should recalculate correctly

---

**Ready to test? Let me know and I'll make the changes for you!**
