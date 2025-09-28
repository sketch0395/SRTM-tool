/**
 * STIG CSV Upload and Management
 * Handles parsing and processing of STIG CSV files
 */

import { StigRequirement } from '../types/srtm';

export interface DetailedStigRequirement extends Omit<StigRequirement, 'id' | 'createdAt' | 'updatedAt'> {
  // All other fields from StigRequirement interface
  family?: string; // Add family tracking
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

// Legacy function name support
export const convertToStigRequirements = convertStigRequirementsToMatrix;

// Empty database for backward compatibility
export const stigRequirementsDatabase: { [familyId: string]: DetailedStigRequirement[] } = {};