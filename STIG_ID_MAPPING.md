# STIG ID Mapping Reference

## Overview

This document explains the mapping between internal STIG family IDs and stigviewer.com STIG IDs.

## Why Mapping is Needed

Your application uses internal IDs like `application-security-dev`, but stigviewer.com uses different naming conventions like `application_security_and_development`.

## Current Mappings

### Application & Web STIGs
| Internal ID | StigViewer.com ID | STIG Name |
|------------|-------------------|-----------|
| `application-security-dev` | `application_security_and_development` | Application Security and Development STIG |
| `web-server-srg` | `web_server` | Web Server Security Requirements Guide |
| `application-server-srg` | `application_server` | Application Server SRG |

### Database STIGs
| Internal ID | StigViewer.com ID | STIG Name |
|------------|-------------------|-----------|
| `postgresql` | `postgresql_9-x` | PostgreSQL 9.x STIG |
| `mysql` | `mysql` | MySQL STIG |
| `oracle` | `oracle_database_12c` | Oracle Database 12c STIG |
| `mssql` | `ms_sql_server_2016` | MS SQL Server 2016 STIG |
| `mongodb` | `mongodb` | MongoDB STIG |

### Operating Systems
| Internal ID | StigViewer.com ID | STIG Name |
|------------|-------------------|-----------|
| `rhel-8` | `red_hat_enterprise_linux_8` | Red Hat Enterprise Linux 8 STIG |
| `rhel-9` | `red_hat_enterprise_linux_9` | Red Hat Enterprise Linux 9 STIG |
| `ubuntu` | `canonical_ubuntu_20.04_lts` | Ubuntu 20.04 LTS STIG |
| `windows-server-2019` | `windows_server_2019` | Windows Server 2019 STIG |
| `windows-server-2022` | `windows_server_2022` | Windows Server 2022 STIG |
| `windows-10` | `windows_10` | Windows 10 STIG |
| `windows-11` | `windows_11` | Windows 11 STIG |

### Web Servers
| Internal ID | StigViewer.com ID | STIG Name |
|------------|-------------------|-----------|
| `apache-2.4` | `apache_server_2.4_unix` | Apache Server 2.4 Unix STIG |
| `nginx` | `nginx` | Nginx STIG |
| `iis-10` | `iis_10.0_server` | IIS 10.0 Server STIG |
| `iis-8.5` | `iis_8.5_server` | IIS 8.5 Server STIG |

### Middleware
| Internal ID | StigViewer.com ID | STIG Name |
|------------|-------------------|-----------|
| `docker` | `docker_enterprise` | Docker Enterprise STIG |
| `kubernetes` | `kubernetes` | Kubernetes STIG |

### Network/Infrastructure
| Internal ID | StigViewer.com ID | STIG Name |
|------------|-------------------|-----------|
| `firewall-srg` | `firewall` | Firewall SRG |
| `router-srg` | `router` | Router SRG |
| `switch-srg` | `network_switch` | Network Switch STIG |

### Cloud Platforms
| Internal ID | StigViewer.com ID | STIG Name |
|------------|-------------------|-----------|
| `aws` | `amazon_web_services` | Amazon Web Services STIG |
| `azure` | `microsoft_azure` | Microsoft Azure STIG |
| `gcp` | `google_cloud_platform` | Google Cloud Platform STIG |

## How to Find Correct STIG IDs

### Method 1: Browse stigviewer.com
1. Go to https://stigviewer.com/stigs
2. Find your STIG in the list
3. Click on it to see the URL format: `https://stigviewer.com/stig/{stig-id}/`
4. Extract the `{stig-id}` part

### Method 2: Test in Browser
1. Try the URL: `https://stigviewer.com/stig/YOUR_GUESS_HERE/`
2. If it loads, you found the correct ID
3. If 404, try variations with underscores instead of hyphens

## Common Patterns

stigviewer.com typically uses:
- **Underscores** instead of hyphens: `red_hat` not `red-hat`
- **Lowercase** everything: `windows_server_2019` not `Windows-Server-2019`
- **Full names** expanded: `application_security_and_development` not `app-sec`
- **Version numbers**: `postgresql_9-x`, `iis_10.0_server`

## Adding New Mappings

To add a new STIG mapping:

1. **Find the correct stigviewer.com ID** (see methods above)

2. **Edit `utils/detailedStigRequirements.ts`**:
```typescript
const STIG_ID_MAPPING: Record<string, string> = {
  // ... existing mappings ...
  'your-internal-id': 'stigviewer_com_id',
};
```

3. **Test the mapping**:
   - Select the STIG from recommendations page
   - Check browser console for: `🔍 Fetching STIG: your-internal-id → stigviewer_com_id`
   - Verify requirements load successfully

## Troubleshooting

### STIG Not Found (404)
**Problem**: Console shows `HTTP 404: Not Found`

**Solutions**:
1. Check if the STIG ID is correct on stigviewer.com
2. Try variations: underscores vs hyphens, version numbers
3. Search stigviewer.com manually for the correct ID
4. Use manual upload as fallback

### Wrong STIG Loaded
**Problem**: Wrong requirements appear after selection

**Solutions**:
1. Verify the mapping in `STIG_ID_MAPPING`
2. Check if there are multiple versions (e.g., `postgresql_9-x` vs `postgresql_10`)
3. Update the mapping to the correct version

### STIG ID Not Mapped
**Problem**: Internal ID maps to itself (no mapping exists)

**Behavior**: System will try to fetch using the internal ID directly

**Solution**: Add the correct mapping to `STIG_ID_MAPPING`

## Implementation Details

### Mapping Function
```typescript
function mapToStigViewerId(internalId: string): string {
  return STIG_ID_MAPPING[internalId] || internalId;
}
```

### Usage in Fetch Function
```typescript
const stigviewerId = mapToStigViewerId(familyId);
console.log(`🔍 Fetching STIG: ${familyId} → ${stigviewerId}`);
const apiUrl = `/api/import-stig?stigId=${encodeURIComponent(stigviewerId)}`;
```

## Future Improvements

1. **Automatic Discovery**: Scrape stigviewer.com to build mapping automatically
2. **Version Mapping**: Support multiple versions (e.g., PostgreSQL 9, 10, 11)
3. **Fuzzy Matching**: Suggest closest match if exact mapping not found
4. **User Customization**: Allow users to add/edit mappings via UI
5. **Validation**: Check if mapped STIG exists on stigviewer.com during app startup

## Related Files

- **`utils/detailedStigRequirements.ts`** - Contains the mapping and fetch logic
- **`app/api/import-stig/route.ts`** - API endpoint that fetches from stigviewer.com
- **`utils/stigFamilyRecommendations.ts`** - Defines internal STIG family IDs

## References

- **stigviewer.com**: https://stigviewer.com/stigs
- **DISA STIG Downloads**: https://public.cyber.mil/stigs/downloads/
- **STIG Viewer Documentation**: https://stigviewer.com/help

---

**Last Updated**: October 3, 2025
**Maintained By**: SRTM Tool Development Team
