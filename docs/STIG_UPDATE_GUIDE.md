# STIG Family Recommendations Update Guide

## Current Status: ⚠️ Manual Updates Required

The STIG family recommendations in this tool are **NOT automatically updated** and require manual maintenance by developers.

## Update Frequency Recommendations

### Quarterly Review (Every 3 months) - **REQUIRED**
- Full review of all STIG families
- Verify versions, release dates, and requirement counts
- Check for new STIG families from DISA

### Monthly Check (High-Priority STIGs) - **RECOMMENDED**
- Application Security and Development STIG
- Web Server Security Requirements Guide
- Database STIGs (Oracle, SQL Server, MySQL)
- Operating System STIGs (Windows, RHEL, Ubuntu)

### Immediate Updates - **CRITICAL**
- When security vulnerabilities are addressed in new STIG releases
- Major version updates for commonly used technologies
- Emergency STIG releases from DISA

## Official Sources to Monitor

1. **DISA Cyber Exchange** - https://public.cyber.mil/stigs/downloads/
   - Primary source for all official STIGs
   - Check weekly for new releases

2. **STIG Viewer** - https://stigviewer.com/stigs
   - Alternative interface for browsing STIGs
   - Good for comparing versions

3. **DISA STIG RSS Feed** - https://public.cyber.mil/stigs/rss/
   - Subscribe for automatic notifications
   - Set up alerts for new releases

## Update Process

### 1. Identify Updates Needed
```bash
# Check current database status in the application
# Look for families with validated: false
# Note families with old release dates (>6 months)
```

### 2. Verify Against Official Sources
- Download latest STIG releases from DISA
- Compare versions in the code vs. official releases
- Count actual requirements in official STIGs

### 3. Update Files
Two files need to be maintained:
- `utils/stigFamilyRecommendations.ts` - Working/development version
- `utils/stigFamilyRecommendations_VALIDATED.ts` - Verified version

### 4. Update Metadata
Update the `STIG_DATABASE_METADATA` object:
```typescript
export const STIG_DATABASE_METADATA = {
  lastUpdated: 'YYYY-MM-DD',        // Today's date
  lastValidated: 'YYYY-MM-DD',      // When you verified against official sources
  nextReviewDue: 'YYYY-MM-DD',      // 3 months from now
  // ... other fields
};
```

### 5. Validation Checklist
- [ ] Version numbers match official DISA releases
- [ ] Release dates are accurate
- [ ] Requirement counts are verified
- [ ] New STIGs added if applicable
- [ ] `validated: true` only for verified entries
- [ ] Metadata updated with current dates

## Database Health Monitoring

The application includes a health score (0-100) based on:
- **Validation Percentage** (40 points): % of families with `validated: true`
- **Outdated Families** (-30 points): Families >6 months old without validation
- **Review Status** (-20 points): Penalty if review is overdue

### Health Score Interpretation:
- **80-100%**: ✅ Excellent - Database is well-maintained
- **60-79%**: ⚠️ Good - Some updates needed
- **<60%**: ❌ Poor - Urgent updates required

## Automation Opportunities

Consider implementing:
1. **DISA RSS Feed Monitor** - Automated alerts for new STIG releases
2. **Version Checker** - Periodic comparison with official DISA catalog
3. **Automated Testing** - Verify STIG data integrity
4. **Update Reminders** - Calendar notifications for review dates

## Emergency Updates

If critical security updates are released:
1. Update immediately (don't wait for quarterly review)
2. Focus on high-usage STIG families first
3. Document the emergency update in `criticalUpdatesNeeded`
4. Test the application thoroughly
5. Communicate changes to users

## Contact Information

For questions about STIG updates:
- DISA Help Desk: https://public.cyber.mil/stigs/contact/
- STIG Viewer Support: Available through their website

---

**Last Updated**: October 2025  
**Next Review Due**: January 2026  
**Current Health Score**: Check in application