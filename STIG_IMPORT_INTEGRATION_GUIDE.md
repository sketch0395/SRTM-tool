# STIG Import Integration Guide

## Quick Start

Add STIG import to your existing SRTM tool in 3 steps:

### Step 1: Add Component to Page

```tsx
// In your page.tsx or relevant component
import StigImport from '@/components/StigImport';

export default function RequirementsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1>STIG Requirements Management</h1>
      
      {/* Add the STIG import component */}
      <StigImport />
      
      {/* Your existing requirements component */}
      <RequirementForm requirements={requirements} />
    </div>
  );
}
```

### Step 2: Test the Feature

**Option A: Fetch from STIGViewer**
1. Click "Fetch from STIGViewer"
2. Select a popular STIG (e.g., "Apache Server 2.4 Unix")
3. Click "Fetch STIG Requirements"
4. Preview the requirements
5. Click "Apply Requirements"

**Option B: Manual Upload**
1. Download STIG XML from [DISA](https://public.cyber.mil/stigs/downloads/)
2. Click "Manual Upload"
3. Select the XCCDF XML file
4. Click "Upload and Parse STIG"
5. Preview and apply

### Step 3: Access Imported STIGs

```typescript
// Get all imported STIGs from localStorage
const importedStigs = JSON.parse(
  localStorage.getItem('importedStigs') || '[]'
);

// Use in your requirements mapping
importedStigs.forEach(stig => {
  console.log(`${stig.stigName}: ${stig.totalRequirements} requirements`);
  
  stig.requirements.forEach(req => {
    // Map to your requirements
    console.log(`${req.vulnId}: ${req.title}`);
    console.log(`NIST Controls: ${req.nistControls.join(', ')}`);
  });
});
```

---

## Integration Examples

### Example 1: Display Imported STIGs in Dropdown

```tsx
'use client';

import { useState, useEffect } from 'react';

export function StigSelector() {
  const [stigs, setStigs] = useState([]);
  const [selectedStig, setSelectedStig] = useState(null);

  useEffect(() => {
    const imported = JSON.parse(
      localStorage.getItem('importedStigs') || '[]'
    );
    setStigs(imported);
  }, []);

  return (
    <select 
      value={selectedStig?.stigId} 
      onChange={(e) => {
        const stig = stigs.find(s => s.stigId === e.target.value);
        setSelectedStig(stig);
      }}
    >
      <option value="">Select a STIG</option>
      {stigs.map(stig => (
        <option key={stig.stigId} value={stig.stigId}>
          {stig.stigName} ({stig.totalRequirements} requirements)
        </option>
      ))}
    </select>
  );
}
```

### Example 2: Map STIG Requirements to System Requirements

```tsx
export function RequirementMapper() {
  const [mappings, setMappings] = useState([]);

  const mapStigToRequirement = (stigReq, systemReqId) => {
    setMappings(prev => [...prev, {
      stigVulnId: stigReq.vulnId,
      stigTitle: stigReq.title,
      systemRequirementId: systemReqId,
      nistControls: stigReq.nistControls,
      severity: stigReq.severity,
      mappedDate: new Date().toISOString()
    }]);

    // Save to localStorage
    localStorage.setItem('stigMappings', JSON.stringify(mappings));
  };

  return (
    <div>
      {/* Your mapping UI here */}
    </div>
  );
}
```

### Example 3: Filter Requirements by Severity

```tsx
export function RequirementFilter() {
  const [severity, setSeverity] = useState('all');
  const [filtered, setFiltered] = useState([]);

  const filterBySeverity = (selectedSeverity) => {
    const stigs = JSON.parse(
      localStorage.getItem('importedStigs') || '[]'
    );

    const allRequirements = stigs.flatMap(s => s.requirements);
    
    const filtered = selectedSeverity === 'all' 
      ? allRequirements
      : allRequirements.filter(r => r.severity === selectedSeverity);

    setFiltered(filtered);
  };

  return (
    <div>
      <select onChange={(e) => {
        setSeverity(e.target.value);
        filterBySeverity(e.target.value);
      }}>
        <option value="all">All Severities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <div>
        {filtered.map(req => (
          <div key={req.vulnId}>
            {req.vulnId}: {req.title}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 4: NIST Control Coverage Analysis

```tsx
export function NistCoverageAnalysis() {
  const [coverage, setCoverage] = useState({});

  useEffect(() => {
    const stigs = JSON.parse(
      localStorage.getItem('importedStigs') || '[]'
    );

    const controlCoverage = {};
    
    stigs.forEach(stig => {
      stig.requirements.forEach(req => {
        req.nistControls.forEach(control => {
          if (!controlCoverage[control]) {
            controlCoverage[control] = [];
          }
          controlCoverage[control].push({
            vulnId: req.vulnId,
            stigName: stig.stigName,
            severity: req.severity
          });
        });
      });
    });

    setCoverage(controlCoverage);
  }, []);

  return (
    <div>
      <h3>NIST 800-53 Control Coverage</h3>
      {Object.entries(coverage).map(([control, requirements]) => (
        <div key={control}>
          <strong>{control}</strong>: {requirements.length} requirements
          <ul>
            {requirements.slice(0, 3).map((req, idx) => (
              <li key={idx}>
                {req.vulnId} - {req.stigName} ({req.severity})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

---

## Advanced Integration

### Custom STIG Parser Hook

```typescript
// hooks/useStigParser.ts
import { useState } from 'react';

interface ParseOptions {
  filterSeverity?: 'high' | 'medium' | 'low';
  nistControlsOnly?: string[];
  maxRequirements?: number;
}

export function useStigParser() {
  const [stigs, setStigs] = useState([]);

  const loadStigs = () => {
    const imported = JSON.parse(
      localStorage.getItem('importedStigs') || '[]'
    );
    setStigs(imported);
    return imported;
  };

  const parseRequirements = (options: ParseOptions = {}) => {
    const allStigs = loadStigs();
    let requirements = allStigs.flatMap(s => 
      s.requirements.map(r => ({ ...r, stigName: s.stigName }))
    );

    if (options.filterSeverity) {
      requirements = requirements.filter(
        r => r.severity === options.filterSeverity
      );
    }

    if (options.nistControlsOnly) {
      requirements = requirements.filter(r =>
        r.nistControls.some(c => 
          options.nistControlsOnly.includes(c)
        )
      );
    }

    if (options.maxRequirements) {
      requirements = requirements.slice(0, options.maxRequirements);
    }

    return requirements;
  };

  const getControlMapping = () => {
    const allStigs = loadStigs();
    const mapping = new Map();

    allStigs.forEach(stig => {
      stig.requirements.forEach(req => {
        req.nistControls.forEach(control => {
          if (!mapping.has(control)) {
            mapping.set(control, []);
          }
          mapping.get(control).push({
            ...req,
            stigName: stig.stigName
          });
        });
      });
    });

    return mapping;
  };

  return {
    stigs,
    loadStigs,
    parseRequirements,
    getControlMapping
  };
}
```

### Usage Example

```tsx
import { useStigParser } from '@/hooks/useStigParser';

export function AdvancedRequirements() {
  const { parseRequirements, getControlMapping } = useStigParser();

  const highSeverityReqs = parseRequirements({ 
    filterSeverity: 'high' 
  });

  const accessControlReqs = parseRequirements({ 
    nistControlsOnly: ['AC-2', 'AC-3', 'AC-6'] 
  });

  const controlMap = getControlMapping();

  return (
    <div>
      <h3>High Severity: {highSeverityReqs.length}</h3>
      <h3>Access Control: {accessControlReqs.length}</h3>
      <h3>Controls Covered: {controlMap.size}</h3>
    </div>
  );
}
```

---

## Testing

### Test Import from STIGViewer

```bash
# Start dev server
npm run dev

# Navigate to your page
# Click "Fetch from STIGViewer"
# Select "Apache Server 2.4 Unix"
# Should fetch ~42 requirements
```

### Test Manual Upload

```bash
# Download STIG from DISA
curl -O https://dl.dod.cyber.mil/wp-content/uploads/stigs/zip/U_Apache_2-4_UNIX_V2R5_STIG.zip

# Unzip and upload the XML file through the UI
```

### Test API Directly

```bash
# Test fetch
curl "http://localhost:3000/api/import-stig?stigId=apache_server_2.4_unix"

# Test upload
curl -X POST http://localhost:3000/api/import-stig \
  -F "file=@/path/to/stig.xml"
```

---

## Troubleshooting

### "Failed to fetch from stigviewer.com"
**Solution**: Use manual upload. Download XML from DISA Cyber Exchange.

### "No requirements found in XML"
**Solution**: Ensure file is valid XCCDF format. Check XML structure matches expected format.

### LocalStorage full
**Solution**: Clear old imports or implement IndexedDB for larger storage.

### Duplicate imports
**Solution**: Check stigId before adding to prevent duplicates:

```typescript
const existingStigs = JSON.parse(
  localStorage.getItem('importedStigs') || '[]'
);

const isDuplicate = existingStigs.some(
  s => s.stigId === newStig.stigId && s.version === newStig.version
);

if (!isDuplicate) {
  existingStigs.push(newStig);
  localStorage.setItem('importedStigs', JSON.stringify(existingStigs));
}
```

---

## Performance Optimization

### Lazy Load Requirements

```typescript
// Don't load all requirements at once
const [visibleRequirements, setVisibleRequirements] = useState([]);

useEffect(() => {
  const stigs = JSON.parse(localStorage.getItem('importedStigs') || '[]');
  
  // Load first 50 requirements
  const firstBatch = stigs
    .flatMap(s => s.requirements)
    .slice(0, 50);
  
  setVisibleRequirements(firstBatch);
}, []);
```

### Virtualized Lists

```bash
npm install react-window
```

```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={requirements.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {requirements[index].title}
    </div>
  )}
</FixedSizeList>
```

---

## Next Steps

1. ✅ Add `<StigImport />` to your page
2. ⬜ Test import with popular STIG
3. ⬜ Integrate with requirement mapping
4. ⬜ Add NIST control analysis
5. ⬜ Implement requirement filtering
6. ⬜ Add export functionality
7. ⬜ Create requirement status tracking

---

**Ready to import STIG requirements!** 🚀
