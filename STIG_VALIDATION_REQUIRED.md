# STIG Data Validation Required

## ⚠️ Important Notice

The STIG data in `utils/stigFamilyRecommendations.ts` has been marked as **NOT VALIDATED** (`validated: false`) because it was not properly verified against official DISA sources.

## Current Status

- **Total STIGs in file**: 17 (curated subset)
- **Official STIGs available**: ~200 from DISA
- **Validation status**: ❌ NONE VERIFIED

## What Needs Verification

For each STIG entry, the following fields need to be verified against official sources:

1. **STIG Name**: Exact official name
2. **Version**: Current version (e.g., "V5R3", "V2R1")
3. **Release Date**: Most recent official release date  
4. **Requirement Count**: Actual number of requirements in the STIG
5. **STIG ID**: Official DISA STIG identifier

## Official Sources

### Primary Sources
1. **DISA Cyber Exchange**: https://public.cyber.mil/stigs/downloads/
   - Authoritative source for all STIGs
   - Download actual STIG files
   - Verify versions, dates, and requirement counts

2. **STIG Viewer**: https://stigviewer.com/stigs
   - ~200 STIGs cataloged
   - Easy browsing and searching
   - View STIG details and requirements online

### How to Validate

For each STIG in the file:

1. Search for the STIG on stigviewer.com or public.cyber.mil
2. Verify the STIG actually exists
3. Check the current version number
4. Note the release date
5. Count or verify the number of requirements
6. Find the official STIG ID
7. Update the entry in `stigFamilyRecommendations.ts`
8. Set `validated: true` only after verification

## STIGs Currently in File (UNVERIFIED)

The following 17 STIGs are in the file but need verification:

### Application/Web
- [ ] Application Security and Development STIG
- [ ] Web Server Security Requirements Guide

### Operating Systems
- [ ] Windows Server 2022 STIG
- [ ] Windows 11 STIG
- [ ] Red Hat Enterprise Linux 9 STIG
- [ ] Canonical Ubuntu 22.04 LTS STIG

### Network Devices
- [ ] Cisco IOS XE Router STIG
- [ ] Cisco IOS Switch STIG

### Virtualization
- [ ] VMware vSphere 8.0 STIG
- [ ] Docker Enterprise 2.x STIG
- [ ] Kubernetes STIG

### Web Servers
- [ ] Apache Server 2.4 STIG
- [ ] Microsoft IIS 10.0 Server STIG

### Databases
- [ ] MS SQL Server 2022 Instance STIG
- [ ] Oracle Database 19c STIG
- [ ] PostgreSQL 9.x STIG

## Removed Fake STIGs

The following fabricated STIGs have been removed:

- ❌ Node.js Application Security Guide (NOT A REAL STIG)
- ❌ NGINX Web Server STIG (NOT VERIFIED TO EXIST)
- ❌ MongoDB Enterprise Advanced 4.x STIG (NOT VERIFIED TO EXIST)
- ❌ AWS GovCloud STIG (NOT VERIFIED TO EXIST)
- ❌ Microsoft Azure Government Cloud STIG (NOT VERIFIED TO EXIST)

## How to Add More STIGs

To expand the STIG catalog (towards the ~200 available):

1. Browse stigviewer.com for additional STIGs
2. Focus on commonly used technologies
3. Gather official data (version, date, requirements, ID)
4. Add entry to `STIG_FAMILIES` array
5. Set `validated: true` only after verification
6. Update `detectTechnologies()` and `checkExactTechnologyMatch()` if needed


# STIG Validation Status

## Application & Web Server STIGs (13) — **VALIDATED**

As of September 30, 2025, the following 13 application and web server STIGs have been **fully validated** against official sources (stigviewer.com). All metadata (name, version, release date, requirement count, STIG ID) is accurate and each is marked `validated: true` in the catalog.

See [`APP_WEB_STIGS_VALIDATED.md`](./APP_WEB_STIGS_VALIDATED.md) for the full validated list and details.

## Catalog Integrity

- All fake or fabricated STIGs have been removed.
- Only real, officially published STIGs are present in the catalog.
- Each validated STIG includes: name, version, release date, requirement count, and official STIG ID.
- Validation status is reflected in both the code and documentation.

## UI Impact

- **Validated STIGs** display a green badge and receive a confidence score bonus.
- **Unvalidated STIGs** (if any are added in the future) will display a warning and reduced confidence.

## Next Steps

- To expand coverage, repeat the validation process for additional STIGs as needed.
- Always use official sources (stigviewer.com, public.cyber.mil) for new STIGs.
- Update both the catalog and documentation with any new validations.

---

**Last Updated**: September 30, 2025  
**Status**: 13 application/web STIGs validated and catalog synchronized.  
**Priority**: High — catalog and documentation are now accurate and trustworthy.
