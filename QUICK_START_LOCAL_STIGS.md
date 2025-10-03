# 🚀 Quick Start: Local STIG Library

## You Don't Have STIGs Yet!

The error you encountered means you need to first **download and extract** the DISA STIG Library.

---

## ✅ Step-by-Step Instructions

### **Step 1: Download STIG Library**

Go to the DISA STIG Downloads page:
👉 **https://public.cyber.mil/stigs/downloads/**

Look for:
- **"STIG Library Compilation"** or
- **"U_STIG_Library_YYYY_MM.zip"** (e.g., `U_STIG_Library_2024_12.zip`)

**File size:** Usually 500 MB - 1 GB

Download it to your Downloads folder or anywhere convenient.

---

### **Step 2: Extract STIGs**

Run the extraction script with the **full path** to your downloaded ZIP:

```powershell
.\extract-stigs.ps1 -ZipPath "C:\Users\ronni\Downloads\U_STIG_Library_2024_12.zip"
```

**Replace the path** with wherever you saved the ZIP file!

#### Common Download Locations:
```powershell
# If in Downloads folder:
.\extract-stigs.ps1 -ZipPath "$env:USERPROFILE\Downloads\U_STIG_Library_2024_12.zip"

# If on Desktop:
.\extract-stigs.ps1 -ZipPath "$env:USERPROFILE\Desktop\U_STIG_Library_2024_12.zip"

# If in a specific folder:
.\extract-stigs.ps1 -ZipPath "C:\path\to\your\U_STIG_Library_2024_12.zip"
```

**This will:**
- Extract all STIG XML files
- Create directories in `public/stigs/`
- Generate metadata for each STIG
- Take about 2-3 minutes

---

### **Step 3: Verify Extraction**

Check what STIGs you have:

```powershell
.\list-stigs.ps1
```

You should see something like:
```
✅ Found 150 STIG(s) in local library

╔═══════════════════════════════════════════════════════════╗
║  STIG ID                          │ Files                 ║
╠═══════════════════════════════════════════════════════════╣
║  windows_server_2022              │ ✓ metadata ✓ XML     ║
║  apache_server_2.4_unix           │ ✓ metadata ✓ XML     ║
║  rhel_8                           │ ✓ metadata ✓ XML     ║
...
```

---

### **Step 4: Use in Application**

1. **Start dev server:**
   ```powershell
   npm run dev
   ```

2. **Open browser:** http://localhost:3000

3. **Navigate to:** STIG Requirements tab

4. **Click:** "Local Library" button (green, database icon)

5. **Import:** Click "Import" on any STIG - done in < 1 second!

---

## 🔧 Troubleshooting

### "File not found" Error

**You got this error:**
```
❌ Error: File not found!
   Path provided: public\stigs
```

**What happened:**
You ran the script but provided the **destination folder** (`public\stigs`) instead of the **ZIP file path**.

**Solution:**
Download the STIG Library ZIP first, then run:
```powershell
.\extract-stigs.ps1 -ZipPath "FULL\PATH\TO\YOUR\STIG_Library.zip"
```

---

### Can't Find the ZIP Download

1. Go to: https://public.cyber.mil/stigs/downloads/
2. Look for "STIG Library" or "Compilation"
3. It's a large file (~500 MB - 1 GB)
4. You may need to register/login to download

---

### No Permission to Extract

If you get a permissions error:

```powershell
# Run PowerShell as Administrator
# Right-click PowerShell → "Run as Administrator"
# Then run the extract script again
```

---

### ZIP Format Not Recognized

If the ZIP won't extract:

1. Make sure you downloaded the **complete file**
2. Try extracting manually with Windows Explorer or 7-Zip
3. Place extracted folders in `public/stigs/`
4. Run `.\list-stigs.ps1` to verify

---

## 📖 Need More Help?

- **Full Documentation:** See `LOCAL_STIG_LIBRARY.md`
- **Technical Details:** See `LOCAL_STIG_LIBRARY_IMPLEMENTATION.md`
- **STIG Directory Reference:** See `public/stigs/README.md`

---

## 🎯 After Setup

Once you have STIGs extracted, you can:

✅ **Browse** 150+ STIGs in the UI  
✅ **Import** any STIG in < 1 second  
✅ **Work offline** - no internet needed  
✅ **Avoid 403 errors** - no more stigviewer.com issues  

---

## ⚡ Quick Commands Reference

```powershell
# Extract STIGs from ZIP
.\extract-stigs.ps1 -ZipPath "path\to\STIG_Library.zip"

# List what STIGs you have
.\list-stigs.ps1

# Start dev server
npm run dev
```

---

**Questions?** Make sure you've downloaded the actual STIG Library ZIP file from cyber.mil first!
