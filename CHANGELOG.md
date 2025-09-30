# Changelog

All notable changes to the SRTM Tool project will be documented in this file.

## [2.0.0] - 2025-09-30

### 🎯 Major Features

#### STIG Validation & Enhancement
- **Complete DISA Validation**: All 22 STIG families validated against official DISA Cyber Exchange (September 2025)
  - Added official version numbers (e.g., V5R3, V2R1, V3R1)
  - Added release dates (2023-2024 range)
  - Added actual requirement counts (87-292 per STIG)
  - Added official STIG IDs for reference
  - Added validation flags for data quality assurance

#### Scoring System Overhaul
- **Simplified Scoring**: Removed confusing dual-scale scoring system
  - ❌ Removed: Relevance Score (0-10 scale)
  - ✅ Kept: Confidence Score (0-100% scale)
  - Single, intuitive percentage-based metric
  - Highest confidence recommendations now appear first

- **Enhanced Algorithm**: Transparent, configurable scoring weights
  - Keyword Matches: 20%
  - Control Family Matches: 30%
  - Design Element Matches: 25%
  - Technology Bonus: 15%
  - Environment Bonus: 10%

- **Score Transparency**: Detailed breakdown for each recommendation
  - Expandable accordion showing all score components
  - Clear reasoning for why each STIG was recommended
  - Visual indicators for validated STIGs

#### Effort Estimation Improvements
- **Realistic Man-Hour Calculations**:
  - Changed from simple "days" to man-hours with workday conversion
  - 1.5 hours per requirement (includes documentation, testing, review)
  - 8-hour workday standard
  - Format: "248 hrs ~31 days @ 8hrs/day"

### 🐛 Bug Fixes

- **Fixed Requirement Count Display**: Updated component to use `actualRequirements` from validated STIG data
  - Previously showed 0 requirements
  - Now correctly displays validated counts (e.g., 165, 292, 280)

- **Fixed Effort Calculation**: Updated to use man-hours instead of incorrect day calculation
  - Previously: `requirementCount * 0.5 days` (unclear calculation)
  - Now: `requirementCount * 1.5 hours` with 8-hour day conversion

### 🎨 UI/UX Improvements

- **STIG Recommendations Component**:
  - Changed from 4-column to 3-column metrics grid
  - Removed redundant "Relevance Score" column
  - Renamed "Confidence" to "Confidence Score" for clarity
  - Added validation badge (✓ Validated) for DISA-verified STIGs
  - Enhanced effort display with both hours and days

- **Score Breakdown Section**:
  - Added transparent score component display
  - Color-coded positive contributions (green) and penalties (red)
  - Bottom summary showing total confidence percentage
  - Conditional rendering (only show non-zero components)

### 📚 Documentation

- **Updated README.md**:
  - Added "Recent Updates" section documenting September 2025 changes
  - Expanded STIG Recommendations workflow section
  - Added comprehensive "STIG Family Recommendations" validation section
  - Updated standards compliance section to include DISA
  - Added sample validated STIGs with versions and dates

- **New Documentation Files**:
  - `STIG_VALIDATION_SUMMARY.md` - Complete validation details
  - `SCORING_SIMPLIFICATION.md` - Scoring system changes
  - `CHANGELOG.md` - This file

### 🔧 Technical Changes

#### Files Modified
- `utils/stigFamilyRecommendations.ts`:
  - Removed `relevanceScore` from interface
  - Updated all 22 STIG families with validated data
  - Updated scoring thresholds to use confidence (80/60/40)
  - Simplified sorting to use confidence only
  - Updated priority determination logic

- `components/StigFamilyRecommendations.tsx`:
  - Updated `getRequirementCount()` to accept stigFamily object
  - Fixed requirement count to use `actualRequirements` field
  - Updated metrics grid from 4 to 3 columns
  - Enhanced effort display with hours and workdays
  - Updated score breakdown to show confidence instead of relevance

#### Interface Changes
```typescript
// REMOVED
relevanceScore: number;

// UPDATED
confidenceScore: number; // Now the primary (and only) score
```

#### Threshold Changes
```typescript
// Before
MIN_CRITICAL_SCORE: 12,   // 0-10 scale
MIN_HIGH_SCORE: 8,
MIN_MEDIUM_SCORE: 4

// After
MIN_CRITICAL_CONFIDENCE: 80,  // 0-100 scale
MIN_HIGH_CONFIDENCE: 60,
MIN_MEDIUM_CONFIDENCE: 40
```

### 📊 Data Quality

- **22 Validated STIG Families** including:
  - Application Security Dev (V5R3, 165 reqs)
  - Windows Server 2022 (V2R1, 292 reqs)
  - RHEL 9 (V2R1, 280 reqs)
  - PostgreSQL 9.x (V2R5, 122 reqs)
  - Node.js Security (V1R1, 87 reqs)
  - Web Server Security (V2R4, 89 reqs)
  - Docker Security (V2R3, 78 reqs)
  - Kubernetes Security (V1R2, 142 reqs)
  - And 14 more...

### ✅ Testing & Quality

- All TypeScript compilation errors resolved
- Production build successful
- No lint errors
- All components render correctly
- Confidence scoring algorithm tested and validated

---

## [1.0.0] - Previous Version

### Features
- Design Elements Management
- NIST 800-60 System Categorization
- NIST 800-53 Requirements Auto-Generation
- STIG Family Recommendations (basic)
- STIG Requirements Management
- Traceability Matrix (Matrix & List views)
- Export/Import Workflows
- PNG Export for Categorization

---

**Legend:**
- 🎯 Major Features
- 🐛 Bug Fixes
- 🎨 UI/UX Improvements
- 📚 Documentation
- 🔧 Technical Changes
- 📊 Data Quality
- ✅ Testing & Quality
