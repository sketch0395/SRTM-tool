# 🚀 Quick Start: Testing the Auto-Update Feature

## ✅ Step-by-Step Testing Guide

### **Step 1: Navigate to the Page**
1. Open your SRTM Tool application
2. Go to the **STIG Family Recommendations** section

### **Step 2: Find the Settings Button**
Look in the top-right corner next to the title:
```
STIG Family Recommendations          [⚙️ Auto-Update Settings ▼]
```

### **Step 3: Open Settings Dropdown**
Click the **"Auto-Update Settings"** button
- Dropdown panel will appear
- Shows current status (Enabled/Disabled)

### **Step 4: Test the Update Check**
Click the blue **"Check for Updates Now"** button
- Spinner appears: "Checking DISA..."
- Wait 5-30 seconds (depending on DISA response time)
- Alert will appear with results

### **Step 5: Review Results**

#### **If Updates Found:**
```
📋 Found X potential updates!

Check the settings dropdown or console for details.
```
- Results appear in the dropdown
- Each shows: STIG ID, version change, notes
- Console shows detailed information

#### **If No Updates:**
```
✅ All STIGs are up to date! No updates found.
```

#### **If DISA Unavailable:**
```
⚠️ Could not check for updates. The DISA RSS feed may be unavailable.

Using fallback date-based checking instead.
```
- Still performs date-based checks
- Less precise but functional

### **Step 6: Enable Auto-Update (Optional)**
1. In the dropdown, find **"Auto-Check Status"**
2. Click the toggle button:
   - **✗ Disabled** → Click to enable
   - **✓ Enabled** → Already on
3. When enabled, shows:
   - Frequency: weekly
   - Last Check: date
   - Next Check: date

### **Step 7: Close Dropdown**
- Click anywhere outside the dropdown
- Or click the settings button again

## 🎯 What to Look For

### **Console Output (F12 → Console)**
```javascript
🔍 Checking DISA RSS feed for updates...
✅ Found 3 updates from DISA RSS

// Detailed update information appears here
```

### **In the Dropdown**
```
2 Updates Found:

┌─────────────────────────────────────┐
│ application-security-dev            │
│ New version available: V7           │
│ V6 → V7                            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ web-server-srg                      │
│ Update available                    │
└─────────────────────────────────────┘
```

## 🐛 Troubleshooting

### **Nothing Happens When I Click**
- Check browser console (F12) for errors
- Ensure you have internet connectivity
- Try refreshing the page

### **"Network Error" or Similar**
- DISA website may be temporarily down
- Corporate firewall may be blocking
- System will use fallback checking

### **Dropdown Won't Close**
- Click directly outside the dropdown box
- Or click the settings button again
- Refresh page if stuck

### **Updates Show But Seem Wrong**
- Check console for detailed info
- Verify against https://public.cyber.mil/stigs/
- Updates are suggestions, not automatic

## 📊 Expected Results

### **First Time Running**
You should see several updates because:
- Local data may be from earlier validation
- DISA releases STIGs frequently
- System is conservative (flags anything potentially outdated)

### **Common Update Count**
- **0-5 updates**: Normal, data is recent
- **5-15 updates**: Expected if not checked recently
- **15+ updates**: Database needs validation

### **Update Types**
- Version changes (V2 → V3)
- Date-based flags (>6 months old)
- Validation needed flags

## 🔄 Auto-Update Behavior

When **enabled**:
- Checks **weekly** automatically
- Shows in-app notifications
- Stores results for review
- Does **not** auto-apply (manual approval required)

When **disabled**:
- Only checks when you click "Check Now"
- No automatic background checking
- Still fully functional, just manual

## ✅ Success Indicators

You'll know it's working when:
- ✅ Alert appears after check
- ✅ Results show in dropdown
- ✅ Console shows detailed logs
- ✅ Version numbers displayed
- ✅ Can enable/disable toggle

## 🎉 You're Done!

The auto-update system is now fully functional and ready to keep your STIG database current!

**Pro Tip**: Enable auto-update and let it run weekly. Check the dropdown occasionally to see if any updates need attention.

---

**Questions?** Check the console logs or the detailed documentation files.