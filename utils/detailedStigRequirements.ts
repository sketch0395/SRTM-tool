/**
 * STIG CSV Upload and Management
 * Handles parsing and processing of STIG CSV files
 */

import { StigRequirement, GroupedStigRequirement } from '../types/srtm';

export interface DetailedStigRequirement extends Omit<StigRequirement, 'id' | 'createdAt' | 'updatedAt'> {
  // All other fields from StigRequirement interface
  family?: string; // Add family tracking
}

/**
 * Mapping of internal STIG family IDs to stigviewer.com STIG IDs
 * Note: stigviewer.com uses different naming conventions
 * Format: stigviewer.com/stig/{stigviewerId}/
 */
const STIG_ID_MAPPING: Record<string, string> = {
  // Application & Web
  'application-security-dev': 'application_security_and_development',
  'web-server-srg': 'web_server',
  'application-server-srg': 'application_server',
  
  // Database
  'postgresql': 'postgresql_9-x',
  'mysql': 'mysql',
  'oracle': 'oracle_database_12c',
  'mssql': 'ms_sql_server_2016',
  'mongodb': 'mongodb',
  
  // Operating Systems
  'rhel-8': 'red_hat_enterprise_linux_8',
  'rhel-9': 'red_hat_enterprise_linux_9', 
  'ubuntu': 'canonical_ubuntu_20.04_lts',
  'windows-server-2019': 'windows_server_2019',
  'windows-server-2022': 'windows_server_2022',
  'windows-10': 'windows_10',
  'windows-11': 'windows_11',
  
  // Web Servers
  'apache-2.4': 'apache_server_2.4_unix',
  'nginx': 'nginx',
  'iis-10': 'iis_10.0_server',
  'iis-8.5': 'iis_8.5_server',
  
  // Middleware
  'docker': 'docker_enterprise',
  'kubernetes': 'kubernetes',
  
  // Network/Infrastructure
  'firewall-srg': 'firewall',
  'router-srg': 'router',
  'switch-srg': 'network_switch',
  
  // Cloud
  'aws': 'amazon_web_services',
  'azure': 'microsoft_azure',
  'gcp': 'google_cloud_platform',
};

/**
 * Convert internal STIG family ID to stigviewer.com STIG ID
 */
function mapToStigViewerId(internalId: string): string {
  return STIG_ID_MAPPING[internalId] || internalId;
}

// CSV Upload Support for STIG Requirements
export interface CsvStigRequirement {
  benchmarkName?: string;
  benchmarkId?: string;
  releaseInfo?: string;
  version?: string;
  groupId?: string;
  severity: 'high' | 'medium' | 'low' | 'CAT I' | 'CAT II' | 'CAT III';
  ruleId?: string;
  stigId: string;
  classification?: string;
  assetPosture?: string;
  srgId?: string;
  ruleTitle: string;
  fixText: string;
  discussion: string;
  ccis?: string;
  legacyIds?: string;
  checkContent: string;
  checkContentRef?: string;
  iaControls?: string;
  weight?: string;
  falsePositives?: string;
  falseNegatives?: string;
  documentable?: string;
  securityOverrideGuidance?: string;
  potentialImpacts?: string;
  thirdPartyTools?: string;
  responsibility?: string;
  mitigations?: string;
  mitigationControl?: string;
  status?: string;
  comments?: string;
  findingDetails?: string;
  severityOverride?: string;
  severityOverrideReason?: string;
  fqdn?: string;
  ipAddress?: string;
  macAddress?: string;
  name?: string;
  technologyArea?: string;
}

// Function to convert CSV STIG data to our internal format
export function convertCsvToStigRequirement(csvRow: CsvStigRequirement): DetailedStigRequirement {
  // Normalize severity values
  const normalizeSeverity = (severity: string): 'CAT I' | 'CAT II' | 'CAT III' => {
    const sev = severity.toLowerCase();
    if (sev === 'high' || sev === 'cat i') return 'CAT I';
    if (sev === 'medium' || sev === 'cat ii') return 'CAT II';
    if (sev === 'low' || sev === 'cat iii') return 'CAT III';
    return 'CAT II'; // default
  };

  // Extract CCI references
  const cciRefs = csvRow.ccis ? 
    csvRow.ccis.split('\n').filter(line => line.includes('CCI-')).map(line => {
      const match = line.match(/CCI-\d+/);
      return match ? match[0] : '';
    }).filter(cci => cci) : ['CCI-000366'];

  // Normalize status values
  const normalizeStatus = (status?: string): 'Not Started' | 'In Progress' | 'Completed' | 'Exception Requested' => {
    if (!status) return 'Not Started';
    const stat = status.toLowerCase();
    if (stat.includes('progress') || stat.includes('ongoing')) return 'In Progress';
    if (stat.includes('complete') || stat.includes('done')) return 'Completed';
    if (stat.includes('exception') || stat.includes('waiver')) return 'Exception Requested';
    return 'Not Started';
  };

  return {
    stigId: csvRow.stigId || csvRow.ruleId || 'UNKNOWN',
    vulnId: csvRow.groupId || undefined,
    severity: normalizeSeverity(csvRow.severity),
    title: csvRow.ruleTitle || 'Untitled Requirement',
    description: csvRow.discussion || 'No description provided',
    checkText: csvRow.checkContent || 'No check procedure provided',
    fixText: csvRow.fixText || 'No fix procedure provided',
    applicability: 'Applicable',
    status: normalizeStatus(csvRow.status),
    implementationStatus: 'Open',
    cciRef: cciRefs
  };
}

// Parse CSV content and return STIG requirements
export function parseStigCsv(csvContent: string, familyId?: string): DetailedStigRequirement[] {
  const lines = csvContent.split('\n');
  if (lines.length < 2) return [];

  // Parse header row
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase().replace(/\s+/g, ''));
  
  const requirements: DetailedStigRequirement[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV row (handling quoted fields)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value

    // Create CSV STIG object
    const csvRow: CsvStigRequirement = {
      severity: 'medium' as const,
      stigId: '',
      ruleTitle: '',
      fixText: '',
      discussion: '',
      checkContent: ''
    };

    // Map values to CSV STIG object based on headers
    headers.forEach((header, index) => {
      if (values[index]) {
        const value = values[index].replace(/^"|"$/g, ''); // Remove surrounding quotes
        
        switch (header) {
          case 'benchmarkname':
            csvRow.benchmarkName = value;
            break;
          case 'benchmarkid':
            csvRow.benchmarkId = value;
            break;
          case 'severity':
            csvRow.severity = value as any;
            break;
          case 'stigid':
            csvRow.stigId = value;
            break;
          case 'ruletitle':
            csvRow.ruleTitle = value;
            break;
          case 'fixtext':
            csvRow.fixText = value;
            break;
          case 'discussion':
            csvRow.discussion = value;
            break;
          case 'checkcontent':
            csvRow.checkContent = value;
            break;
          case 'ccis':
            csvRow.ccis = value;
            break;
          case 'groupid':
            csvRow.groupId = value;
            break;
          case 'ruleid':
            csvRow.ruleId = value;
            break;
          case 'status':
            csvRow.status = value;
            break;
        }
      }
    });

    // Convert to our internal format
    if (csvRow.stigId && csvRow.ruleTitle) {
      const requirement = convertCsvToStigRequirement(csvRow);
      if (familyId) {
        requirement.family = familyId;
      }
      requirements.push(requirement);
    }
  }

  return requirements;
}

// Database for managing uploaded STIG requirements
export const uploadedStigRequirements: { [familyId: string]: DetailedStigRequirement[] } = {};

// Function to store uploaded STIG requirements
export function storeStigRequirements(familyId: string, requirements: DetailedStigRequirement[]) {
  uploadedStigRequirements[familyId] = requirements;
}

// Function to get stored STIG requirements
export function getStoredStigRequirements(familyId: string): DetailedStigRequirement[] {
  return uploadedStigRequirements[familyId] || [];
}

// Function to get all stored STIG requirements across all families
export function getAllStoredStigRequirements(): StigRequirement[] {
  const allRequirements: StigRequirement[] = [];
  
  Object.keys(uploadedStigRequirements).forEach(familyId => {
    const familyRequirements = uploadedStigRequirements[familyId];
    familyRequirements.forEach((req, index) => {
      allRequirements.push({
        id: `${familyId}-${Date.now()}-${index}`,
        family: req.family || familyId, // Use the family from requirement or fallback to familyId
        ...req,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  });
  
  return allRequirements;
}

// Function to clear stored STIG requirements
export function clearStoredStigRequirements(familyId?: string) {
  if (familyId) {
    delete uploadedStigRequirements[familyId];
  } else {
    // Clear all
    Object.keys(uploadedStigRequirements).forEach(key => {
      delete uploadedStigRequirements[key];
    });
  }
}

/**
 * Get detailed STIG requirements for a given STIG family ID
 * Now supports uploaded CSV data
 */
export function getDetailedStigRequirements(stigFamilyId: string): DetailedStigRequirement[] {
  // Return stored uploaded requirements
  return getStoredStigRequirements(stigFamilyId);
}

/**
 * Convert STIG requirements to the format expected by the traceability matrix
 */
export function convertStigRequirementsToMatrix(stigFamilyIds: string[]): StigRequirement[] {
  console.log('Converting STIG requirements for families:', stigFamilyIds);
  
  const allRequirements: StigRequirement[] = [];
  
  stigFamilyIds.forEach(familyId => {
    const detailedRequirements = getStoredStigRequirements(familyId);
    console.log(`Found ${detailedRequirements.length} requirements for family: ${familyId}`);
    
    detailedRequirements.forEach((req, index) => {
      allRequirements.push({
        id: `${familyId}-${Date.now()}-${index}`,
        ...req,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  });
  
  console.log(`Total converted requirements: ${allRequirements.length}`);
  return allRequirements;
}

// New: Fetch STIG from stigviewer and convert to requirements
export async function fetchAndConvertStigRequirements(familyIds: string[]): Promise<DetailedStigRequirement[]> {
  // Use internal API route to fetch STIG data (avoids CORS/network errors)
  const allRequirements: DetailedStigRequirement[] = [];
  const failedFetches: string[] = [];
  
  for (const familyId of familyIds) {
    // Map internal ID to stigviewer.com ID
    const stigviewerId = mapToStigViewerId(familyId);
    
    const apiUrl = (typeof window !== 'undefined'
      ? `${window.location.origin}/api/import-stig?stigId=${encodeURIComponent(stigviewerId)}`
      : `/api/import-stig?stigId=${encodeURIComponent(stigviewerId)}`);
    
    console.log(`🔍 Fetching STIG: ${familyId} → ${stigviewerId}`);
    
    try {
      const apiRes = await fetch(apiUrl);
      const result = await apiRes.json();
      
      if (!apiRes.ok || !result.success) {
        // API returned error (503 = stigviewer.com unavailable)
        console.warn(`⚠️ Could not fetch ${familyId} (${stigviewerId}): ${result.error || result.message}`);
        failedFetches.push(`${familyId} → ${stigviewerId}`);
        continue;
      }
      
      if (result.success && result.requirements) {
        console.log(`📊 API returned ${result.requirements.length} requirements`);
        
        // Log severity distribution from API
        const severityCounts: Record<string, number> = {};
        result.requirements.forEach((req: any) => {
          const sev = req.severity || 'unknown';
          severityCounts[sev] = (severityCounts[sev] || 0) + 1;
        });
        console.log(`📊 Severity distribution from API:`, severityCounts);
        
        // Convert the API format to DetailedStigRequirement format
        const converted = result.requirements.map((req: any) => {
          // Normalize severity - API returns 'high', 'medium', 'low'
          let severity: 'CAT I' | 'CAT II' | 'CAT III' = 'CAT II';
          const sevText = (req.severity || 'medium').toLowerCase();
          
          if (sevText === 'high' || sevText === 'cat i' || sevText.includes('cat i')) {
            severity = 'CAT I';
          } else if (sevText === 'low' || sevText === 'cat iii' || sevText.includes('cat iii')) {
            severity = 'CAT III';
          } else {
            severity = 'CAT II';
          }
          
          return {
            stigId: req.vulnId || req.ruleId || 'UNKNOWN',
            vulnId: req.vulnId,
            ruleId: req.ruleId,
            severity,
            title: req.title || 'Untitled Requirement',
            description: req.description || 'No description provided',
            checkText: req.checkText || 'No check procedure provided',
            fixText: req.fixText || 'No fix procedure provided',
            applicability: 'Applicable' as const,
            status: 'Not Started' as const,
            implementationStatus: 'Open' as const,
            cciRef: req.cci && req.cci.length > 0 ? req.cci : ['CCI-000366'],
            family: familyId
          } as DetailedStigRequirement;
        });
        
        // Log severity distribution after conversion
        const convertedCounts: Record<string, number> = {};
        converted.forEach((req: DetailedStigRequirement) => {
          convertedCounts[req.severity] = (convertedCounts[req.severity] || 0) + 1;
        });
        console.log(`📊 Severity distribution after conversion:`, convertedCounts);
        
        allRequirements.push(...converted);
        console.log(`✅ Successfully loaded ${converted.length} requirements for ${familyId}`);
      }
    } catch (err) {
      console.error(`❌ Error fetching STIG for ${familyId}:`, err);
      failedFetches.push(`${familyId} → ${stigviewerId}`);
    }
  }
  
  // Show user-friendly message if fetches failed
  if (failedFetches.length > 0 && typeof window !== 'undefined') {
    console.warn(`\n⚠️ STIG IMPORT ISSUE\n` +
      `Failed to automatically fetch ${failedFetches.length} STIG(s):\n` +
      failedFetches.map(f => `  • ${f}`).join('\n') + '\n\n' +
      `Possible reasons:\n` +
      `  • STIG ID mapping may be incorrect for stigviewer.com\n` +
      `  • STIG may not be available on stigviewer.com\n` +
      `  • Network connectivity issues\n\n` +
      `MANUAL UPLOAD OPTIONS:\n` +
      `  1. Download STIG XML from DISA: https://public.cyber.mil/stigs/downloads/\n` +
      `  2. Or browse STIGs: https://stigviewer.com/stigs\n` +
      `  3. Use the STIG Import component to upload the XCCDF XML file\n`);
  }
  
  return allRequirements;
}
// New: Fetch and convert STIG CSVs directly to the matrix format (StigRequirement[])
export async function fetchAndConvertStigRequirementsToMatrix(familyIds: string[]): Promise<StigRequirement[]> {
  const detailed = await fetchAndConvertStigRequirements(familyIds);
  const all: StigRequirement[] = [];
  detailed.forEach((req, index) => {
    const familyId = req.family || 'unknown';
    all.push({
      id: `${familyId}-${Date.now()}-${index}`,
      ...req,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });
  return all;
}

// Legacy function name support
export const convertToStigRequirements = convertStigRequirementsToMatrix;

// Empty database for backward compatibility
export const stigRequirementsDatabase: { [familyId: string]: DetailedStigRequirement[] } = {};

/**
 * Group STIG requirements by title to avoid duplicate display
 * Requirements with the same title are grouped together with a count
 */
export function groupStigRequirementsByTitle(requirements: StigRequirement[]): GroupedStigRequirement[] {
  const groupedMap = new Map<string, GroupedStigRequirement>();

  requirements.forEach(req => {
    const key = req.title.trim();
    
    if (groupedMap.has(key)) {
      const existing = groupedMap.get(key)!;
      existing.count += 1;
      existing.stigIds.push(req.stigId);
      existing.requirements.push(req);
      
      // Update status to highest priority status
      if (req.status === 'Completed' && existing.status !== 'Completed') {
        existing.status = 'Completed';
      } else if (req.status === 'In Progress' && existing.status === 'Not Started') {
        existing.status = 'In Progress';
      } else if (req.status === 'Exception Requested') {
        existing.status = 'Exception Requested';
      }
      
      // Update implementation status to most severe
      if (req.implementationStatus === 'Open' && existing.implementationStatus !== 'Open') {
        existing.implementationStatus = 'Open';
      } else if (req.implementationStatus === 'NotAFinding' && existing.implementationStatus === 'Not_Applicable') {
        existing.implementationStatus = 'NotAFinding';
      }
    } else {
      groupedMap.set(key, {
        title: req.title,
        count: 1,
        family: req.family,
        severity: req.severity,
        description: req.description,
        checkText: req.checkText,
        fixText: req.fixText,
        stigIds: [req.stigId],
        requirements: [req],
        status: req.status,
        implementationStatus: req.implementationStatus
      });
    }
  });

  return Array.from(groupedMap.values()).sort((a, b) => {
    // Sort by severity first (CAT I > CAT II > CAT III), then by title
    const severityOrder = { 'CAT I': 1, 'CAT II': 2, 'CAT III': 3 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Get unique count of STIG requirements by title for a family
 */
export function getUniqueStigRequirementCount(familyId: string): number {
  const requirements = getStoredStigRequirements(familyId);
  const titleSet = new Set(requirements.map(req => req.title?.trim()).filter(Boolean));
  return titleSet.size;
}