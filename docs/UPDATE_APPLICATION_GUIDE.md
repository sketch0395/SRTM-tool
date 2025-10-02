# 🔄 STIG Update Application - Complete Guide

## ✅ **NOW IMPLEMENTED: Automatic Update Application**

The system can now not only **detect** updates but also **apply** them automatically to your STIG database!

## 🎯 How It Works

### **1. Check for Updates**
```
1. Click "Auto-Update Settings" button
2. Click "Check for Updates Now"
3. System fetches from DISA
4. Shows list of available updates
```

### **2. Review Updates**
Each update shows:
- **STIG ID**: Which STIG needs updating
- **Version Change**: V6 → V7
- **Release Date**: When the new version was released
- **Severity**: Critical/High/Medium/Low
- **Update Notes**: What changed

### **3. Select Updates to Apply**
- **Click on any update** to select/deselect it
- **Select All**: Button to select all updates
- **Clear**: Button to deselect all

### **4. Apply Selected Updates**
- Click **"Apply X Selected Updates"** button
- Confirmation dialog appears
- System creates backups automatically
- Updates are applied to database
- Success message shows results

## 🛡️ Safety Features

### **Automatic Backups**
- Every update creates a backup **before** applying changes
- Backups stored in memory for quick rollback
- Can rollback individual STIGs if needed

### **Manual Approval Required**
- No updates applied automatically
- You choose which updates to apply
- Confirmation dialog before applying

### **Validation Reset**
- Updated STIGs marked as `validated: false`
- Reminds you to verify against official sources
- Helps track what's been manually verified

### **Export/Import**
- Export entire database as JSON
- Create manual backups before major changes
- Import previously exported databases

## 🎨 UI Flow

```
┌──────────────────────────────────────────┐
│ Auto-Update Settings [▼]                 │
└──────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────┐
│ [Check for Updates Now]                  │
│                                           │
│ 3 Updates Found:                          │
│                                           │
│ ☑ application-security-dev                │
│   V6 → V7 (Sep 2025) [CRITICAL]         │
│                                           │
│ ☑ web-server-srg                          │
│   Update available [MEDIUM]               │
│                                           │
│ ☐ apache-server-2-4                       │
│   V3 → V4 (Oct 2025) [HIGH]              │
│                                           │
│ [Select All] [Clear]                      │
│                                           │
│ [Apply 2 Selected Updates]                │
│ Backups will be created automatically     │
│                                           │
│ [💾 Export Database Backup]              │
└──────────────────────────────────────────┘
```

## 📋 Update Application Process

### **What Happens When You Apply:**

```javascript
1. ✅ Confirmation dialog shown
   └─> Explains what will happen

2. 💾 Backups created
   └─> Original versions saved for rollback

3. 🔄 Updates applied
   ├─> Version number updated
   ├─> Release date updated  
   ├─> Requirement count updated (if available)
   └─> Validation flag set to false

4. 📊 Database metadata updated
   └─> lastUpdated timestamp recorded

5. ✅ Success message shown
   └─> Shows successful/failed counts

6. 🗑️ Applied updates removed from list
   └─> Only failed updates remain
```

## 🔧 API Endpoints

### **Apply Single Update**
```bash
POST /api/stig-updates
{
  "action": "apply-update",
  "updates": [
    {
      "stigId": "application-security-dev",
      "currentVersion": "V6",
      "latestVersion": "V7",
      "currentReleaseDate": "2025-02-12",
      "latestReleaseDate": "2025-09-15"
    }
  ]
}
```

### **Apply Multiple Updates**
```bash
POST /api/stig-updates
{
  "action": "apply-multiple",
  "updates": [ /* array of updates */ ]
}
```

### **Rollback Update**
```bash
POST /api/stig-updates
{
  "action": "rollback",
  "stigId": "application-security-dev"
}
```

### **Export Database**
```bash
GET /api/stig-updates?action=export
```

### **Import Database**
```bash
POST /api/stig-updates
{
  "action": "import",
  "importData": "{ /* JSON backup */ }"
}
```

## 🎯 Step-by-Step Example

### **Scenario: Update Application Security STIG**

1. **Open Settings**
   - Click "Auto-Update Settings"

2. **Check for Updates**
   - Click "Check for Updates Now"
   - Wait for DISA check to complete

3. **Review Results**
   ```
   application-security-dev
   V6 → V7 (Released: Sep 15, 2025)
   New version available with security enhancements
   [CRITICAL]
   ```

4. **Select the Update**
   - Click on the update card
   - Checkbox appears ✓

5. **Apply the Update**
   - Click "Apply 1 Selected Update"
   - Confirm in dialog

6. **Verify Success**
   ```
   ✅ Update Complete!
   
   Successfully applied: 1
   Failed: 0
   
   Backups created for rollback if needed.
   ```

7. **Check Database**
   - STIG Family Recommendations now shows V7
   - Health score may decrease (validation needed)
   - Update removed from list

## 📊 Update Results

### **Success Response**
```json
{
  "success": true,
  "stigId": "application-security-dev",
  "oldVersion": "V6",
  "newVersion": "V7",
  "oldReleaseDate": "2025-02-12",
  "newReleaseDate": "2025-09-15",
  "backupCreated": true,
  "message": "Successfully updated..."
}
```

### **Batch Update Response**
```json
{
  "success": true,
  "results": [ /* array of individual results */ ],
  "summary": {
    "total": 3,
    "successful": 2,
    "failed": 1
  },
  "message": "Applied 2 of 3 updates"
}
```

## 🔄 Rollback Feature

### **When to Rollback**
- Applied wrong version
- Update caused issues
- Need to revert to previous state

### **How to Rollback**
```javascript
// Via API
POST /api/stig-updates
{
  "action": "rollback",
  "stigId": "application-security-dev"
}

// Programmatically
import { rollbackStigUpdate } from './utils/stigFamilyRecommendations';
rollbackStigUpdate('application-security-dev');
```

### **Rollback Behavior**
- Restores most recent backup
- Version reverted
- Release date reverted
- Requirement count reverted
- Validation status restored

## 💾 Backup Management

### **Automatic Backups**
- Created before every update
- Stored in memory (per session)
- Multiple backups per STIG supported

### **Manual Backups**
- Click "Export Database Backup"
- Downloads JSON file
- Filename includes date
- Can be imported later

### **Backup Structure**
```json
{
  "metadata": { /* database metadata */ },
  "families": [ /* all STIG families */ ],
  "exportDate": "2025-10-02T...",
  "version": "1.0"
}
```

## ⚠️ Important Notes

### **After Applying Updates**
1. **Verify Against Official Sources**
   - Check DISA Cyber Exchange
   - Confirm version numbers
   - Validate requirement counts

2. **Update Validation Status**
   - Manually mark as `validated: true`
   - After confirming against DISA

3. **Test Your System**
   - Ensure STIG recommendations still work
   - Check requirement mappings
   - Verify traceability links

### **Database Health**
- Health score may decrease after updates
- This is normal (unvalidated updates)
- Score improves after manual validation

### **Session Persistence**
- In-memory backups cleared on page refresh
- Use Export feature for permanent backups
- Consider implementing persistent storage

## 🚀 Best Practices

### **Before Applying Updates**
1. **Export database backup** (manual safety net)
2. **Review all selected updates** carefully
3. **Start with low-severity updates** first
4. **Apply critical updates** separately

### **After Applying Updates**
1. **Verify updates worked** correctly
2. **Check for any errors** in console
3. **Test STIG functionality**
4. **Update validation status** if verified

### **Regular Maintenance**
1. **Weekly update checks**
2. **Monthly batch updates**
3. **Quarterly full validation**
4. **Annual backup exports**

## 🎉 Summary

**Before**: Could only detect updates  
**Now**: Can detect AND apply updates automatically

**Before**: Manual version updates needed  
**Now**: One-click update application

**Before**: No backup system  
**Now**: Automatic backups with rollback

**Before**: Risky to update  
**Now**: Safe with confirmation and backups

The system is now a **complete update management solution**! 🚀

---

**Status**: ✅ Production Ready  
**Last Updated**: October 2025  
**Version**: 2.0