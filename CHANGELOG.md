# Changelog

All notable changes to the SRTM Tool project will be documented in this file.

## [3.0.3] - 2025-10-02

### Added
- **stigviewer.com Integration**: Primary STIG update source now uses stigviewer.com
  - More reliable than DISA RSS feed
  - Better SSL certificate handling (no custom CAs needed)
  - Parses STIG versions, release dates, and requirement counts from HTML
  - Checks top 5 high-priority STIGs for updates
  - Rate-limited requests (200ms delay) to be respectful
  - DISA RSS feed maintained as fallback source

### Changed
- **Update Check Priority**: stigviewer.com → DISA RSS → Date-based fallback
- **Console Output**: More detailed logging with progress indicators
- **Error Handling**: Graceful degradation through multiple sources

### Technical Details
- `checkStigViewerSource()`: New function to fetch from stigviewer.com
- HTML parsing with regex for version, date, and requirement extraction
- Automatic URL conversion (name → lowercase_underscore format)
- 200ms rate limiting between requests
- Compatible with both browser and server contexts

## [3.0.2] - 2025-10-02

### Fixed
- **SSL Certificate Error**: Fixed server-side DISA RSS fetching failing with "UNABLE_TO_VERIFY_LEAF_SIGNATURE"
  - Changed server-side fetch strategy to use API proxy instead of direct fetch
  - Government SSL certificates with custom CAs now handled properly
  - Both browser and server contexts now use the same API proxy for consistency
  - Eliminates SSL verification issues without compromising security

### Technical Details
- Server-side fetch now uses `${baseUrl}/api/fetch-disa-rss` instead of direct DISA URL
- API proxy handles SSL certificate validation properly
- Maintains same JSON response format for both contexts
- Automatic fallback to date-based checking if proxy unavailable

## [3.0.1] - 2025-10-02 🔧 **BUGFIX**

### 🐛 Bug Fixes

#### Server-Side Fetch Issue
- **Fixed**: TypeError when checking for updates from API routes
  - Root cause: Relative URLs (`/api/...`) don't work in server-side `fetch()`
  - Solution: Context-aware fetching (browser vs server)
  - Browser: Uses API proxy with relative URL
  - Server: Fetches directly from DISA RSS feed
  - Benefit: Faster and more reliable update checks

#### Enhanced RSS Parsing
- **Improved**: XML parsing for TypeScript compatibility
  - Changed from `matchAll()` to `exec()` loop for broader support
  - Works with all TypeScript compilation targets
  - More robust regex-based parsing

#### Impact
- ✅ Automatic update checks now work in all contexts
- ✅ API route `/api/stig-updates?action=check` fully functional
- ✅ No more "Failed to parse URL" errors
- ✅ Better performance (direct DISA fetch server-side)

## [3.0.0] - 2025-10-02 🤖 **FULLY AUTOMATED**

### 🚀 Zero-Touch STIG Updates

#### Fully Automatic Update System
- **100% Automated**: No developer intervention required for STIG updates
  - System automatically checks DISA on schedule (weekly by default)
  - Updates fetched directly from official DISA sources
  - Updates applied automatically without manual approval
  - Auto-validated as trusted official data
  - Backups created automatically before every update

#### New Configuration Options
- **`autoApply`**: New setting to enable/disable automatic update application
  - Default: `true` (fully automatic)
  - When enabled: Updates install automatically
  - When disabled: Updates require manual approval (legacy behavior)
  
- **Zero-Touch Defaults**:
  - `enabled: true` - Auto-update system ON by default
  - `requireManualApproval: false` - No approval needed
  - `autoApply: true` - Automatically install updates
  - `criticalOnly: false` - Apply all updates (not just critical)
  - `backupBeforeUpdate: true` - Always create backups

#### Enhanced UI Controls
- **Auto-Apply Toggle**: New UI control in settings dropdown
  - Enable/disable automatic update application
  - Visual indicator when fully automatic mode enabled
  - Clear messaging about automation status
  
#### Smart Auto-Validation
- **Trusted Source Detection**: Updates from DISA automatically marked as validated
  - `validated: true` set automatically for official sources
  - No manual verification needed
  - Reduces developer workload to ZERO

#### Benefits
- ⏱️ **Zero developer time** - completely self-maintaining
- 🚀 **Always current** - stays up-to-date with DISA automatically
- ✅ **Auto-validated** - official sources trusted by default
- 🛡️ **Safe** - automatic backups with rollback capability
- 📊 **Audit trail** - full logging of all automatic updates

## [2.1.0] - 2025-10-02

### 🔄 Auto-Refresh Database Status

#### Real-Time Status Updates
- **Reactive Database Status**: STIG Database Status now automatically updates in real-time
  - Converts static calculation to reactive state management
  - Auto-refreshes after applying STIG updates
  - Auto-refreshes when recommendations change
  - Added manual refresh button (🔄 icon) for user control
  - Instant visual feedback without page reload

#### Smart Refresh Triggers
- **Automatic After Updates**: Status updates immediately after applying STIG updates
  - Health score reflects new validation status
  - Outdated families count updates
  - Next review date resets appropriately
- **Automatic on Change**: Refreshes when security requirements or design elements change
- **Manual Control**: Users can click refresh icon anytime for latest status

#### Enhanced User Experience
- Real-time health score monitoring (0-100%)
- Live validation percentage tracking
- Accurate outdated families count
- No stale data - always current
- Better transparency in update process

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
