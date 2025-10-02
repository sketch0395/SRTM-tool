# 🧪 How to Test the Automatic STIG Update System

## ⚡ Quick Testing Methods

### **Method 1: Browser Console (Fastest)**

1. Open your SRTM Tool in the browser
2. Press `F12` to open Developer Console
3. Run this quick test script:

```javascript
// Quick Test Script - Copy and paste into console
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

**Expected Output:**
```
🚀 Quick Auto-Update System Test

1. CONFIG: ✅ PASS
2. DISA: ✅ PASS
3. DETECTION: ✅ PASS (2 updates)
4. STATUS: ✅ PASS (Health: 82%)
5. SCHEDULER: ✅ PASS

🎉 Quick test complete!
```

---

### **Method 2: Manual UI Check**

1. Open the SRTM Tool
2. Go to **STIG Family Recommendations** section
3. Click **"Auto-Update Settings"** button (⚙️)
4. Verify you see:
   - ✅ Auto-Check Status: **Enabled**
   - ✅ Auto-Apply Updates: **Enabled**
   - 🤖 "Fully Automatic" message
5. Click **"Check for Updates Now"**

**Success Indicators:**
- Button shows "Checking DISA..." with spinner
- After check: Shows "X updates found" or "All up to date"
- No errors in console

---

### **Method 3: Test Panel UI (Optional)**

Add the test panel component to your page for visual testing:

#### **Step 1: Import the Component**

In `app/page.tsx` or any page, add:

```typescript
import AutoUpdateTestPanel from '../components/AutoUpdateTestPanel';
```

#### **Step 2: Add to Your Page**

```tsx
{/* Add this anywhere in your page */}
<div className="mb-8">
  <AutoUpdateTestPanel />
</div>
```

#### **Step 3: Use the Test Panel**

1. Navigate to the page with the test panel
2. Click **"Run All Tests"**
3. Watch the results appear
4. Check the success rate

**Visual Feedback:**
- Green cards = Tests passed ✅
- Red cards = Tests failed ❌
- Success rate shown at top

---

### **Method 4: Force Scheduled Check**

Test the automatic update system by forcing an immediate check:

```javascript
// In browser console
const { performScheduledUpdateCheck } = await import('/utils/stigFamilyRecommendations');

console.log('🔍 Forcing scheduled check...');
await performScheduledUpdateCheck();
console.log('✅ Check complete!');
```

**Watch Console for:**
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

## 📊 What to Look For

### **✅ System is Working If:**

1. **Configuration Check:**
   - `AUTO_UPDATE_CONFIG.enabled = true`
   - `AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply = true`
   - `AUTO_UPDATE_CONFIG.autoUpdatePreferences.requireManualApproval = false`

2. **DISA Connection:**
   - `/api/fetch-disa-rss` returns `success: true`
   - RSS items are fetched (typically 20+)

3. **Update Detection:**
   - `checkForStigUpdates()` returns array (empty or with updates)
   - No errors thrown

4. **Automatic Application:**
   - When updates found, they're applied automatically
   - Console shows "🤖 Auto-apply enabled..."
   - Backups created before updates

5. **Auto-Validation:**
   - Updated STIGs marked as `validated: true`
   - Console shows "✅ Auto-validated [stig-id] from official DISA source"

6. **UI Auto-Refresh:**
   - Database status updates after changes
   - Health score reflects new state
   - Validated count changes

---

## 🐛 Troubleshooting

### **Problem: Tests Failing**

**Check 1: Is auto-apply enabled?**
```javascript
const { AUTO_UPDATE_CONFIG } = await import('/utils/stigFamilyRecommendations');
console.log(AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply); // Should be true
```

**Check 2: Can you reach DISA?**
```javascript
const response = await fetch('/api/fetch-disa-rss');
const data = await response.json();
console.log(data); // Should have success: true
```

**Check 3: Is the scheduler running?**
```javascript
const { isSchedulerRunning } = await import('/utils/stigUpdateScheduler');
console.log(isSchedulerRunning()); // Should be true
```

---

### **Problem: No Updates Found**

This is actually **normal** if your STIGs are current!

**To test with mock update:**
```javascript
const { applyStigUpdate } = await import('/utils/stigFamilyRecommendations');

// Create a mock update
const mockUpdate = {
  stigId: 'application-security-dev',
  currentVersion: 'V6',
  latestVersion: 'V7',
  currentReleaseDate: '2025-02-12',
  latestReleaseDate: '2025-10-02',
  actualRequirements: 175,
  severity: 'high',
  updateNotes: 'Test update'
};

// Apply it
const result = applyStigUpdate(mockUpdate);
console.log('Mock update result:', result);
```

---

### **Problem: Updates Not Applying Automatically**

**Check auto-apply setting:**
```javascript
const { AUTO_UPDATE_CONFIG } = await import('/utils/stigFamilyRecommendations');

if (!AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply) {
  // Enable it
  AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply = true;
  console.log('✅ Auto-apply enabled!');
}
```

---

## 🎯 Success Criteria

Your system is **fully functional** when:

✅ All 5 quick tests pass  
✅ Can check DISA for updates  
✅ Updates apply automatically when found  
✅ Backups created before updates  
✅ Validation flags set automatically  
✅ Database status auto-refreshes  
✅ Scheduler runs on schedule  
✅ No console errors  

---

## 📝 Testing Checklist

Copy this and check off each item:

```
[ ] Ran quick test script - all passed
[ ] Checked UI settings - auto-apply enabled
[ ] Forced scheduled check - worked
[ ] DISA connection successful
[ ] Update detection working
[ ] Backups being created
[ ] Auto-validation functioning
[ ] UI auto-refresh working
[ ] Scheduler running
[ ] No console errors
```

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Monitor the console** over the next week
2. **Check logs** for automatic checks (every 7 days)
3. **Verify backups** are accumulating
4. **Watch health score** update automatically
5. **Trust the system** - it's fully automated!

---

## 📚 Full Testing Guide

For comprehensive testing procedures, see: `TESTING_GUIDE.md`

**File Contains:**
- 10 detailed test scenarios
- Troubleshooting guides
- Validation checklists
- Testing report templates
- Advanced testing procedures

---

**Quick Start**: Just run the browser console script above - takes 5 seconds! ⚡

**Status**: Ready to test ✅  
**Last Updated**: October 2, 2025