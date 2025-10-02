# 🧪 Testing & Validation Guide - Automatic STIG Updates

## ✅ Complete Testing Strategy

This guide will help you verify that the fully automatic STIG update system is working correctly.

---

## 🎯 Quick Test (5 Minutes)

### **Method 1: Force Immediate Check**

Open your browser console (F12) and run:

```javascript
// Import the function
const { scheduledUpdateCheck } = await import('/utils/stigFamilyRecommendations');

// Force an immediate check
await scheduledUpdateCheck();
```

**Expected Console Output:**
```
🔍 Performing scheduled STIG update check...
📋 Found X potential updates
🤖 Auto-apply enabled - applying updates automatically...
💾 Creating backup for [stig-id]...
✅ Successfully updated [stig-id]
✅ Auto-validated [stig-id] from official DISA source
✅ Auto-applied X/Y updates
```

---

## 🔬 Detailed Testing Methods

### **Test 1: Verify Configuration**

**Check that auto-apply is enabled:**

```javascript
// In browser console
const { AUTO_UPDATE_CONFIG } = await import('/utils/stigFamilyRecommendations');

console.log('Auto-update enabled:', AUTO_UPDATE_CONFIG.enabled);
console.log('Auto-apply enabled:', AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply);
console.log('Require manual approval:', AUTO_UPDATE_CONFIG.autoUpdatePreferences.requireManualApproval);
```

**Expected Output:**
```javascript
Auto-update enabled: true
Auto-apply enabled: true
Require manual approval: false
```

✅ **Pass**: All should be true, true, false  
❌ **Fail**: If any values are different, config is not set correctly

---

### **Test 2: Manual Update Check via UI**

**Steps:**
1. Open the SRTM Tool
2. Navigate to STIG Family Recommendations
3. Click **"Auto-Update Settings"** button (⚙️ icon)
4. Verify the dropdown shows:
   - ✓ Auto-Check Status: **Enabled**
   - ✓ Auto-Apply Updates: **Enabled**
   - "🤖 Fully Automatic" message visible
5. Click **"Check for Updates Now"**

**Expected Behavior:**
- Loading spinner appears
- Button text changes to "Checking DISA..."
- After a few seconds, one of these occurs:
  - Alert: "✅ All STIGs are up to date!"
  - Alert: "📋 Found X potential update(s)!"
  - Updates appear in dropdown list

✅ **Pass**: UI responds correctly, check completes  
❌ **Fail**: Errors in console, UI doesn't respond

---

### **Test 3: Verify DISA API Connection**

**Test the DISA RSS feed proxy:**

```javascript
// In browser console
const response = await fetch('/api/fetch-disa-rss');
const data = await response.json();

console.log('DISA RSS Status:', data.success);
console.log('Items found:', data.items?.length);
console.log('Sample item:', data.items?.[0]);
```

**Expected Output:**
```javascript
DISA RSS Status: true
Items found: 20+ (varies)
Sample item: {
  title: "...",
  link: "...",
  pubDate: "...",
  description: "..."
}
```

✅ **Pass**: success: true, items array populated  
❌ **Fail**: success: false or error

---

### **Test 4: Check Update Detection**

**Verify the system can detect updates:**

```javascript
// In browser console
const { checkForStigUpdates } = await import('/utils/stigFamilyRecommendations');

const updates = await checkForStigUpdates();
console.log('Updates found:', updates.length);
console.table(updates);
```

**Expected Output:**
```javascript
Updates found: X (could be 0 if all current)
[
  {
    stigId: "application-security-dev",
    currentVersion: "V6",
    latestVersion: "V7",
    severity: "high",
    updateNotes: "..."
  }
]
```

✅ **Pass**: Function returns array (empty or with updates)  
❌ **Fail**: Error thrown or function not found

---

### **Test 5: Test Backup Creation**

**Verify backups are created before updates:**

```javascript
// In browser console
const { STIG_BACKUPS, getAvailableBackups } = await import('/utils/stigFamilyRecommendations');

console.log('Available backups:');
console.table(getAvailableBackups());

// Check specific backup
const backups = getAvailableBackups();
if (backups.length > 0) {
  console.log('Most recent backup:', backups[0]);
}
```

**Expected Output:**
```javascript
Available backups:
[
  {
    stigId: "application-security-dev",
    backupDate: "2025-10-02T...",
    version: "V6",
    releaseDate: "2025-02-12"
  }
]
```

✅ **Pass**: Backups object exists and contains entries  
❌ **Fail**: Backups empty or undefined

---

### **Test 6: Test Update Application**

**Simulate applying an update:**

```javascript
// In browser console
const { applyStigUpdate } = await import('/utils/stigFamilyRecommendations');

const testUpdate = {
  stigId: 'application-security-dev',
  currentVersion: 'V6',
  latestVersion: 'V7',
  currentReleaseDate: '2025-02-12',
  latestReleaseDate: '2025-09-15',
  actualRequirements: 175,
  severity: 'high'
};

const result = applyStigUpdate(testUpdate);
console.log('Update result:', result);
```

**Expected Output:**
```javascript
{
  success: true,
  stigId: "application-security-dev",
  oldVersion: "V6",
  newVersion: "V7",
  backupCreated: true,
  message: "Successfully updated..."
}
```

✅ **Pass**: success: true, backup created  
❌ **Fail**: success: false or error

---

### **Test 7: Test Rollback Functionality**

**Verify you can rollback updates:**

```javascript
// In browser console
const { rollbackStigUpdate, STIG_FAMILIES } = await import('/utils/stigFamilyRecommendations');

// Check current version
const before = STIG_FAMILIES.find(s => s.id === 'application-security-dev');
console.log('Before rollback:', before.version);

// Rollback
const result = rollbackStigUpdate('application-security-dev');
console.log('Rollback result:', result);

// Check version after rollback
const after = STIG_FAMILIES.find(s => s.id === 'application-security-dev');
console.log('After rollback:', after.version);
```

**Expected Output:**
```javascript
Before rollback: V7
Rollback result: { success: true, message: "..." }
After rollback: V6
```

✅ **Pass**: Version reverted to previous  
❌ **Fail**: Version unchanged or error

---

### **Test 8: Test Database Status Refresh**

**Verify UI auto-refreshes after updates:**

```javascript
// In browser console - before update
const { getStigDatabaseStatus } = await import('/utils/stigFamilyRecommendations');

const statusBefore = getStigDatabaseStatus();
console.log('Status before:', statusBefore);

// Apply an update (use Test 6 code)
// ... apply update ...

// Check status after
const statusAfter = getStigDatabaseStatus();
console.log('Status after:', statusAfter);

console.log('Health score changed:', 
  statusBefore.healthScore !== statusAfter.healthScore
);
```

**Expected Output:**
```javascript
Status before: { healthScore: 82, validatedFamilies: 22, ... }
Status after: { healthScore: 78, validatedFamilies: 21, ... }
Health score changed: true
```

✅ **Pass**: Status reflects changes  
❌ **Fail**: Status unchanged

---

### **Test 9: Test Scheduled Checker**

**Verify the scheduler is running:**

```javascript
// In browser console
const { isSchedulerRunning, getNextUpdateCheck } = await import('/utils/stigUpdateScheduler');

console.log('Scheduler running:', isSchedulerRunning());
console.log('Next check:', getNextUpdateCheck());
```

**Expected Output:**
```javascript
Scheduler running: true
Next check: "2025-10-09" (7 days from now)
```

✅ **Pass**: Scheduler running, next check date set  
❌ **Fail**: Scheduler not running

---

### **Test 10: End-to-End Full Cycle Test**

**Complete workflow test:**

```javascript
// In browser console
async function fullCycleTest() {
  console.log('🧪 Starting full cycle test...\n');
  
  // 1. Check configuration
  console.log('1️⃣ Checking configuration...');
  const { AUTO_UPDATE_CONFIG } = await import('/utils/stigFamilyRecommendations');
  console.log('✅ Auto-apply:', AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply);
  
  // 2. Check for updates
  console.log('\n2️⃣ Checking for updates...');
  const { checkForStigUpdates } = await import('/utils/stigFamilyRecommendations');
  const updates = await checkForStigUpdates();
  console.log('✅ Found', updates.length, 'updates');
  
  // 3. Check database status before
  console.log('\n3️⃣ Database status before...');
  const { getStigDatabaseStatus } = await import('/utils/stigFamilyRecommendations');
  const before = getStigDatabaseStatus();
  console.log('✅ Health:', before.healthScore + '%');
  
  // 4. Run scheduled check (which will auto-apply if enabled)
  console.log('\n4️⃣ Running scheduled check...');
  const { scheduledUpdateCheck } = await import('/utils/stigFamilyRecommendations');
  await scheduledUpdateCheck();
  console.log('✅ Scheduled check complete');
  
  // 5. Check database status after
  console.log('\n5️⃣ Database status after...');
  const after = getStigDatabaseStatus();
  console.log('✅ Health:', after.healthScore + '%');
  
  // 6. Check backups
  console.log('\n6️⃣ Checking backups...');
  const { getAvailableBackups } = await import('/utils/stigFamilyRecommendations');
  const backups = getAvailableBackups();
  console.log('✅ Backups available:', backups.length);
  
  console.log('\n🎉 Full cycle test complete!');
  console.log('📊 Health changed:', before.healthScore !== after.healthScore);
  
  return {
    configOk: AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply,
    updatesFound: updates.length,
    healthBefore: before.healthScore,
    healthAfter: after.healthScore,
    backupsCreated: backups.length,
    testPassed: true
  };
}

// Run the test
await fullCycleTest();
```

**Expected Output:**
```javascript
🧪 Starting full cycle test...
1️⃣ Checking configuration...
✅ Auto-apply: true
2️⃣ Checking for updates...
✅ Found X updates
3️⃣ Database status before...
✅ Health: 82%
4️⃣ Running scheduled check...
✅ Scheduled check complete
5️⃣ Database status after...
✅ Health: 78%
6️⃣ Checking backups...
✅ Backups available: X
🎉 Full cycle test complete!
📊 Health changed: true
```

✅ **Pass**: All steps complete successfully  
❌ **Fail**: Any step throws error

---

## 🔍 Validation Checklist

Copy this checklist and check off each item:

### **Configuration Validation:**
- [ ] `AUTO_UPDATE_CONFIG.enabled = true`
- [ ] `AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply = true`
- [ ] `AUTO_UPDATE_CONFIG.autoUpdatePreferences.requireManualApproval = false`
- [ ] `AUTO_UPDATE_CONFIG.autoUpdatePreferences.backupBeforeUpdate = true`

### **UI Validation:**
- [ ] Settings dropdown shows "Auto-Check Status: ✓ Enabled"
- [ ] Settings dropdown shows "Auto-Apply Updates: ✓ Enabled"
- [ ] "🤖 Fully Automatic" message appears when enabled
- [ ] "Check for Updates Now" button works
- [ ] Database status shows health score and counts

### **Functional Validation:**
- [ ] Can fetch DISA RSS feed successfully
- [ ] Can detect updates from DISA
- [ ] Can apply updates automatically
- [ ] Backups created before updates
- [ ] Validation flags set to true automatically
- [ ] Database status auto-refreshes after updates
- [ ] Can rollback updates if needed
- [ ] Scheduler is running

### **Integration Validation:**
- [ ] Full cycle test passes
- [ ] No console errors
- [ ] UI updates reflect changes
- [ ] Logs show automatic behavior

---

## 🐛 Troubleshooting

### **Problem: "Auto-apply not working"**

**Check:**
```javascript
const { AUTO_UPDATE_CONFIG } = await import('/utils/stigFamilyRecommendations');
console.log(AUTO_UPDATE_CONFIG.autoUpdatePreferences);
```

**Fix:** Ensure `autoApply: true`

---

### **Problem: "No updates found"**

**Possible causes:**
1. All STIGs are already current (good!)
2. DISA RSS feed not accessible
3. Date-based filtering excluding updates

**Test DISA connection:**
```javascript
const response = await fetch('/api/fetch-disa-rss');
const data = await response.json();
console.log('DISA accessible:', data.success);
```

---

### **Problem: "Backups not created"**

**Check backup configuration:**
```javascript
const { AUTO_UPDATE_CONFIG } = await import('/utils/stigFamilyRecommendations');
console.log('Backup enabled:', 
  AUTO_UPDATE_CONFIG.autoUpdatePreferences.backupBeforeUpdate
);
```

**Check existing backups:**
```javascript
const { getAvailableBackups } = await import('/utils/stigFamilyRecommendations');
console.log(getAvailableBackups());
```

---

### **Problem: "Scheduler not running"**

**Check scheduler status:**
```javascript
const { isSchedulerRunning, startUpdateScheduler } = 
  await import('/utils/stigUpdateScheduler');

console.log('Running:', isSchedulerRunning());

// Start if not running
if (!isSchedulerRunning()) {
  startUpdateScheduler();
  console.log('Started!');
}
```

---

### **Problem: "Console errors"**

**Common errors and fixes:**

1. **"Failed to fetch"**
   - Network issue or CORS
   - Check `/api/fetch-disa-rss` endpoint

2. **"STIG not found"**
   - Invalid STIG ID
   - Check STIG_FAMILIES array

3. **"No backup available"**
   - No updates applied yet
   - Create backup with applyStigUpdate()

---

## 📊 Expected Behavior Timeline

### **Week 1 (Initial Setup):**
```
Day 0: System enabled
Day 0: First check scheduled for Day 7
Day 7: First automatic check runs
Day 7: If updates found → applied automatically
```

### **Ongoing (Steady State):**
```
Every 7 days: Automatic check
If updates found: Automatic application
If no updates: Log "No updates found"
```

---

## 🎯 Success Criteria

Your system is working correctly if:

✅ **Configuration**: All auto-settings enabled  
✅ **Detection**: Can find updates from DISA  
✅ **Application**: Updates applied automatically  
✅ **Validation**: Trusted sources auto-validated  
✅ **Backups**: Created before every update  
✅ **UI**: Status reflects changes in real-time  
✅ **Scheduler**: Running and checking on schedule  
✅ **Logging**: Clear console output showing automation  

---

## 📝 Testing Report Template

Use this to document your testing:

```markdown
# STIG Auto-Update Testing Report

**Date**: [Date]
**Tester**: [Your Name]
**Version**: 3.0.0

## Configuration Test
- [ ] Auto-update enabled: YES/NO
- [ ] Auto-apply enabled: YES/NO
- [ ] Manual approval disabled: YES/NO

## Functional Tests
- [ ] DISA connection: PASS/FAIL
- [ ] Update detection: PASS/FAIL (X updates found)
- [ ] Update application: PASS/FAIL
- [ ] Backup creation: PASS/FAIL (X backups)
- [ ] Auto-validation: PASS/FAIL
- [ ] Rollback: PASS/FAIL

## UI Tests
- [ ] Settings dropdown: PASS/FAIL
- [ ] Manual check button: PASS/FAIL
- [ ] Status auto-refresh: PASS/FAIL

## Integration Test
- [ ] Full cycle test: PASS/FAIL

## Issues Found
[None / List any issues]

## Conclusion
System is: WORKING / NOT WORKING

## Recommendations
[Any recommendations]
```

---

## 🚀 Quick Start Test Script

**Copy and paste this into your browser console for instant testing:**

```javascript
(async function quickTest() {
  console.log('🚀 Quick Auto-Update System Test\n');
  
  try {
    // Load modules
    const stigModule = await import('/utils/stigFamilyRecommendations');
    const schedulerModule = await import('/utils/stigUpdateScheduler');
    
    // Test 1: Config
    console.log('1. CONFIG:', 
      stigModule.AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply ? '✅ PASS' : '❌ FAIL'
    );
    
    // Test 2: DISA Connection
    const disa = await fetch('/api/fetch-disa-rss');
    const disaData = await disa.json();
    console.log('2. DISA:', disaData.success ? '✅ PASS' : '❌ FAIL');
    
    // Test 3: Update Detection
    const updates = await stigModule.checkForStigUpdates();
    console.log('3. DETECTION: ✅ PASS (' + updates.length + ' updates)');
    
    // Test 4: Database Status
    const status = stigModule.getStigDatabaseStatus();
    console.log('4. STATUS: ✅ PASS (Health: ' + status.healthScore + '%)');
    
    // Test 5: Scheduler
    console.log('5. SCHEDULER:', 
      schedulerModule.isSchedulerRunning() ? '✅ PASS' : '❌ FAIL'
    );
    
    console.log('\n🎉 Quick test complete!');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  }
})();
```

---

**Testing Status**: Ready for validation ✅  
**Last Updated**: October 2, 2025  
**Version**: 3.0.0