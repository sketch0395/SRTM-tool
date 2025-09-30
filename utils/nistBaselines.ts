/**
 * NIST SP 800-53 Rev 5 Security Control Baselines
 * Source: NIST SP 800-53B - Control Baselines for Information Systems and Organizations
 * 
 * These baselines are validated against the official NIST publication.
 * Last Updated: September 30, 2025
 */

export const NIST_CONTROL_BASELINES = {
  Low: [
    // AC - Access Control
    "AC-1", "AC-2", "AC-3", "AC-7", "AC-8", "AC-14", "AC-17", "AC-18", "AC-19", "AC-20", "AC-22",
    
    // AT - Awareness and Training
    "AT-1", "AT-2", "AT-2(2)", "AT-3", "AT-3(5)", "AT-4",
    
    // AU - Audit and Accountability
    "AU-1", "AU-2", "AU-3", "AU-4", "AU-5", "AU-6", "AU-8", "AU-9", "AU-11", "AU-12",
    
    // CA - Assessment, Authorization, and Monitoring
    "CA-1", "CA-2", "CA-3", "CA-5", "CA-6", "CA-7", "CA-9",
    
    // CM - Configuration Management
    "CM-1", "CM-2", "CM-4", "CM-5", "CM-6", "CM-7", "CM-8", "CM-9", "CM-10", "CM-11",
    
    // CP - Contingency Planning
    "CP-1", "CP-2", "CP-3", "CP-4", "CP-9", "CP-10",
    
    // IA - Identification and Authentication
    "IA-1", "IA-2", "IA-2(1)", "IA-2(2)", "IA-2(8)", "IA-2(12)", "IA-4", "IA-5", "IA-5(1)", "IA-6", "IA-7", "IA-8", "IA-8(1)", "IA-8(2)", "IA-8(4)", "IA-11",
    
    // IR - Incident Response
    "IR-1", "IR-2", "IR-4", "IR-5", "IR-6", "IR-7", "IR-8",
    
    // MA - Maintenance
    "MA-1", "MA-2", "MA-4", "MA-5", "MA-6",
    
    // MP - Media Protection
    "MP-1", "MP-2", "MP-6", "MP-7",
    
    // PE - Physical and Environmental Protection
    "PE-1", "PE-2", "PE-3", "PE-6", "PE-8", "PE-12", "PE-13", "PE-14", "PE-16",
    
    // PL - Planning
    "PL-1", "PL-2", "PL-4", "PL-4(1)",
    
    // PS - Personnel Security
    "PS-1", "PS-2", "PS-3", "PS-4", "PS-5", "PS-6", "PS-7", "PS-8",
    
    // PT - Personally Identifiable Information Processing and Transparency (Low baseline - specific controls)
    "PT-1", "PT-2", "PT-3", "PT-4", "PT-5", "PT-6", "PT-7", "PT-8",
    
    // RA - Risk Assessment
    "RA-1", "RA-3", "RA-5", "RA-5(2)", "RA-7",
    
    // SA - System and Services Acquisition
    "SA-1", "SA-2", "SA-3", "SA-4", "SA-5", "SA-9", "SA-22",
    
    // SC - System and Communications Protection
    "SC-1", "SC-5", "SC-7", "SC-7(4)", "SC-7(5)", "SC-8", "SC-8(1)", "SC-12", "SC-13", "SC-15", "SC-20", "SC-21", "SC-22", "SC-23", "SC-28", "SC-28(1)", "SC-39",
    
    // SI - System and Information Integrity
    "SI-1", "SI-2", "SI-2(2)", "SI-3", "SI-4", "SI-5", "SI-12", "SI-16",
    
    // SR - Supply Chain Risk Management
    "SR-1", "SR-2", "SR-2(1)", "SR-3", "SR-5", "SR-8", "SR-10", "SR-11", "SR-11(1)", "SR-11(2)", "SR-12"
  ],
  
  Moderate: [
    // AC - Access Control
    "AC-1", "AC-2", "AC-2(1)", "AC-2(2)", "AC-2(3)", "AC-2(4)", "AC-2(5)", "AC-2(12)", "AC-2(13)", 
    "AC-3", "AC-4", "AC-5", "AC-6", "AC-6(1)", "AC-6(2)", "AC-6(5)", "AC-6(9)", "AC-7", "AC-8", 
    "AC-10", "AC-11", "AC-11(1)", "AC-12", "AC-14", "AC-17", "AC-17(1)", "AC-17(2)", "AC-17(3)", 
    "AC-17(4)", "AC-18", "AC-18(1)", "AC-19", "AC-19(5)", "AC-20", "AC-20(1)", "AC-20(2)", "AC-21", "AC-22",
    
    // AT - Awareness and Training
    "AT-1", "AT-2", "AT-2(2)", "AT-3", "AT-3(3)", "AT-3(5)", "AT-4",
    
    // AU - Audit and Accountability
    "AU-1", "AU-2", "AU-3", "AU-3(1)", "AU-4", "AU-5", "AU-6", "AU-6(1)", "AU-6(3)", "AU-7", "AU-7(1)", 
    "AU-8", "AU-9", "AU-9(4)", "AU-11", "AU-12", "AU-12(1)",
    
    // CA - Assessment, Authorization, and Monitoring
    "CA-1", "CA-2", "CA-2(1)", "CA-3", "CA-5", "CA-6", "CA-7", "CA-7(1)", "CA-7(4)", "CA-9",
    
    // CM - Configuration Management
    "CM-1", "CM-2", "CM-2(2)", "CM-2(3)", "CM-2(7)", "CM-3", "CM-3(2)", "CM-4", "CM-5", "CM-5(1)", 
    "CM-6", "CM-7", "CM-7(1)", "CM-7(2)", "CM-7(5)", "CM-8", "CM-8(1)", "CM-8(3)", "CM-9", "CM-10", 
    "CM-11", "CM-12", "CM-12(1)",
    
    // CP - Contingency Planning
    "CP-1", "CP-2", "CP-2(1)", "CP-2(2)", "CP-2(3)", "CP-2(8)", "CP-3", "CP-3(1)", "CP-4", "CP-4(1)", 
    "CP-6", "CP-6(1)", "CP-6(3)", "CP-7", "CP-7(1)", "CP-7(2)", "CP-7(3)", "CP-8", "CP-8(1)", "CP-9", 
    "CP-9(1)", "CP-10", "CP-10(2)",
    
    // IA - Identification and Authentication
    "IA-1", "IA-2", "IA-2(1)", "IA-2(2)", "IA-2(8)", "IA-2(12)", "IA-3", "IA-4", "IA-4(4)", "IA-5", 
    "IA-5(1)", "IA-5(2)", "IA-5(6)", "IA-6", "IA-7", "IA-8", "IA-8(1)", "IA-8(2)", "IA-8(4)", "IA-11", 
    "IA-12", "IA-12(2)", "IA-12(3)",
    
    // IR - Incident Response
    "IR-1", "IR-2", "IR-3", "IR-3(2)", "IR-4", "IR-4(1)", "IR-5", "IR-6", "IR-6(1)", "IR-7", "IR-7(1)", "IR-8",
    
    // MA - Maintenance
    "MA-1", "MA-2", "MA-3", "MA-3(1)", "MA-3(2)", "MA-3(3)", "MA-4", "MA-4(3)", "MA-5", "MA-5(1)", "MA-6",
    
    // MP - Media Protection
    "MP-1", "MP-2", "MP-3", "MP-4", "MP-5", "MP-6", "MP-6(2)", "MP-7",
    
    // PE - Physical and Environmental Protection
    "PE-1", "PE-2", "PE-3", "PE-3(1)", "PE-4", "PE-5", "PE-6", "PE-6(1)", "PE-8", "PE-9", "PE-10", 
    "PE-11", "PE-12", "PE-13", "PE-14", "PE-15", "PE-16", "PE-17",
    
    // PL - Planning
    "PL-1", "PL-2", "PL-4", "PL-4(1)", "PL-8", "PL-10", "PL-11",
    
    // PS - Personnel Security
    "PS-1", "PS-2", "PS-3", "PS-4", "PS-5", "PS-6", "PS-7", "PS-8",
    
    // PT - Personally Identifiable Information Processing and Transparency
    "PT-1", "PT-2", "PT-3", "PT-4", "PT-5", "PT-5(2)", "PT-6", "PT-6(1)", "PT-6(2)", "PT-7", "PT-7(1)", "PT-7(2)", "PT-8",
    
    // RA - Risk Assessment
    "RA-1", "RA-2", "RA-3", "RA-3(1)", "RA-5", "RA-5(2)", "RA-5(4)", "RA-5(5)", "RA-7",
    
    // SA - System and Services Acquisition
    "SA-1", "SA-2", "SA-3", "SA-4", "SA-4(1)", "SA-4(2)", "SA-4(9)", "SA-4(10)", "SA-5", "SA-8", 
    "SA-9", "SA-10", "SA-11", "SA-15", "SA-16", "SA-17", "SA-22",
    
    // SC - System and Communications Protection
    "SC-1", "SC-2", "SC-4", "SC-5", "SC-7", "SC-7(3)", "SC-7(4)", "SC-7(5)", "SC-7(7)", "SC-7(8)", 
    "SC-7(18)", "SC-8", "SC-8(1)", "SC-10", "SC-12", "SC-12(1)", "SC-13", "SC-15", "SC-17", "SC-18", 
    "SC-20", "SC-21", "SC-22", "SC-23", "SC-28", "SC-28(1)", "SC-39",
    
    // SI - System and Information Integrity
    "SI-1", "SI-2", "SI-2(2)", "SI-2(3)", "SI-3", "SI-3(1)", "SI-4", "SI-4(2)", "SI-4(4)", "SI-4(5)", 
    "SI-5", "SI-7", "SI-7(1)", "SI-7(7)", "SI-8", "SI-10", "SI-11", "SI-12", "SI-12(1)", "SI-12(2)", "SI-16",
    
    // SR - Supply Chain Risk Management
    "SR-1", "SR-2", "SR-2(1)", "SR-3", "SR-3(1)", "SR-3(2)", "SR-5", "SR-6", "SR-8", "SR-9", "SR-10", 
    "SR-11", "SR-11(1)", "SR-11(2)", "SR-12"
  ],
  
  High: [
    // AC - Access Control
    "AC-1", "AC-2", "AC-2(1)", "AC-2(2)", "AC-2(3)", "AC-2(4)", "AC-2(5)", "AC-2(11)", "AC-2(12)", 
    "AC-2(13)", "AC-3", "AC-3(7)", "AC-4", "AC-4(4)", "AC-5", "AC-6", "AC-6(1)", "AC-6(2)", "AC-6(3)", 
    "AC-6(5)", "AC-6(7)", "AC-6(9)", "AC-6(10)", "AC-7", "AC-8", "AC-10", "AC-11", "AC-11(1)", "AC-12", 
    "AC-14", "AC-17", "AC-17(1)", "AC-17(2)", "AC-17(3)", "AC-17(4)", "AC-18", "AC-18(1)", "AC-18(3)", 
    "AC-18(4)", "AC-18(5)", "AC-19", "AC-19(4)", "AC-19(5)", "AC-20", "AC-20(1)", "AC-20(2)", "AC-21", "AC-22",
    
    // AT - Awareness and Training
    "AT-1", "AT-2", "AT-2(2)", "AT-2(3)", "AT-3", "AT-3(3)", "AT-3(5)", "AT-4",
    
    // AU - Audit and Accountability
    "AU-1", "AU-2", "AU-3", "AU-3(1)", "AU-3(2)", "AU-4", "AU-5", "AU-5(1)", "AU-5(2)", "AU-5(3)", 
    "AU-6", "AU-6(1)", "AU-6(3)", "AU-6(5)", "AU-6(6)", "AU-7", "AU-7(1)", "AU-8", "AU-9", "AU-9(2)", 
    "AU-9(3)", "AU-9(4)", "AU-10", "AU-11", "AU-12", "AU-12(1)", "AU-12(3)", "AU-16", "AU-16(1)", "AU-16(2)",
    
    // CA - Assessment, Authorization, and Monitoring
    "CA-1", "CA-2", "CA-2(1)", "CA-2(2)", "CA-3", "CA-3(6)", "CA-5", "CA-6", "CA-7", "CA-7(1)", "CA-7(4)", 
    "CA-8", "CA-8(1)", "CA-9",
    
    // CM - Configuration Management
    "CM-1", "CM-2", "CM-2(2)", "CM-2(3)", "CM-2(6)", "CM-2(7)", "CM-3", "CM-3(1)", "CM-3(2)", "CM-3(6)", 
    "CM-4", "CM-4(1)", "CM-5", "CM-5(1)", "CM-6", "CM-6(1)", "CM-7", "CM-7(1)", "CM-7(2)", "CM-7(5)", 
    "CM-8", "CM-8(1)", "CM-8(2)", "CM-8(3)", "CM-8(4)", "CM-9", "CM-10", "CM-11", "CM-12", "CM-12(1)",
    
    // CP - Contingency Planning
    "CP-1", "CP-2", "CP-2(1)", "CP-2(2)", "CP-2(3)", "CP-2(5)", "CP-2(8)", "CP-3", "CP-3(1)", "CP-4", 
    "CP-4(1)", "CP-4(2)", "CP-6", "CP-6(1)", "CP-6(2)", "CP-6(3)", "CP-7", "CP-7(1)", "CP-7(2)", "CP-7(3)", 
    "CP-7(4)", "CP-8", "CP-8(1)", "CP-8(2)", "CP-8(3)", "CP-9", "CP-9(1)", "CP-9(2)", "CP-9(3)", "CP-9(5)", 
    "CP-9(6)", "CP-9(8)", "CP-10", "CP-10(2)", "CP-10(4)", "CP-13",
    
    // IA - Identification and Authentication
    "IA-1", "IA-2", "IA-2(1)", "IA-2(2)", "IA-2(5)", "IA-2(8)", "IA-2(12)", "IA-3", "IA-4", "IA-4(4)", 
    "IA-5", "IA-5(1)", "IA-5(2)", "IA-5(6)", "IA-6", "IA-7", "IA-8", "IA-8(1)", "IA-8(2)", "IA-8(4)", 
    "IA-11", "IA-12", "IA-12(2)", "IA-12(3)", "IA-12(4)", "IA-12(5)",
    
    // IR - Incident Response
    "IR-1", "IR-2", "IR-2(2)", "IR-3", "IR-3(2)", "IR-4", "IR-4(1)", "IR-4(2)", "IR-4(3)", "IR-4(4)", 
    "IR-4(11)", "IR-5", "IR-6", "IR-6(1)", "IR-6(2)", "IR-6(3)", "IR-7", "IR-7(1)", "IR-8",
    
    // MA - Maintenance
    "MA-1", "MA-2", "MA-2(2)", "MA-3", "MA-3(1)", "MA-3(2)", "MA-3(3)", "MA-4", "MA-4(3)", "MA-5", 
    "MA-5(1)", "MA-6",
    
    // MP - Media Protection
    "MP-1", "MP-2", "MP-3", "MP-4", "MP-4(2)", "MP-5", "MP-6", "MP-6(1)", "MP-6(2)", "MP-6(3)", "MP-7",
    
    // PE - Physical and Environmental Protection
    "PE-1", "PE-2", "PE-2(1)", "PE-3", "PE-3(1)", "PE-4", "PE-5", "PE-6", "PE-6(1)", "PE-6(4)", "PE-8", 
    "PE-8(1)", "PE-9", "PE-10", "PE-11", "PE-11(1)", "PE-11(2)", "PE-12", "PE-13", "PE-13(1)", "PE-13(2)", 
    "PE-14", "PE-15", "PE-15(1)", "PE-16", "PE-17", "PE-18",
    
    // PL - Planning
    "PL-1", "PL-2", "PL-4", "PL-4(1)", "PL-8", "PL-10", "PL-11",
    
    // PS - Personnel Security
    "PS-1", "PS-2", "PS-3", "PS-4", "PS-4(2)", "PS-5", "PS-6", "PS-7", "PS-8",
    
    // PT - Personally Identifiable Information Processing and Transparency
    "PT-1", "PT-2", "PT-3", "PT-4", "PT-5", "PT-5(2)", "PT-6", "PT-6(1)", "PT-6(2)", "PT-7", "PT-7(1)", "PT-7(2)", "PT-8",
    
    // RA - Risk Assessment
    "RA-1", "RA-2", "RA-3", "RA-3(1)", "RA-3(3)", "RA-5", "RA-5(2)", "RA-5(4)", "RA-5(5)", "RA-7", "RA-9",
    
    // SA - System and Services Acquisition
    "SA-1", "SA-2", "SA-3", "SA-4", "SA-4(1)", "SA-4(2)", "SA-4(9)", "SA-4(10)", "SA-5", "SA-8", "SA-9", 
    "SA-10", "SA-10(1)", "SA-11", "SA-15", "SA-15(2)", "SA-16", "SA-17", "SA-17(1)", "SA-21", "SA-22",
    
    // SC - System and Communications Protection
    "SC-1", "SC-2", "SC-3", "SC-4", "SC-5", "SC-7", "SC-7(3)", "SC-7(4)", "SC-7(5)", "SC-7(7)", "SC-7(8)", 
    "SC-7(10)", "SC-7(11)", "SC-7(18)", "SC-7(21)", "SC-8", "SC-8(1)", "SC-10", "SC-11", "SC-12", "SC-12(1)", 
    "SC-12(2)", "SC-12(3)", "SC-13", "SC-15", "SC-17", "SC-18", "SC-20", "SC-21", "SC-22", "SC-23", "SC-23(1)", 
    "SC-28", "SC-28(1)", "SC-39",
    
    // SI - System and Information Integrity
    "SI-1", "SI-2", "SI-2(2)", "SI-2(3)", "SI-3", "SI-3(1)", "SI-3(4)", "SI-4", "SI-4(2)", "SI-4(4)", 
    "SI-4(5)", "SI-4(12)", "SI-4(20)", "SI-4(22)", "SI-5", "SI-5(1)", "SI-7", "SI-7(1)", "SI-7(2)", 
    "SI-7(5)", "SI-7(7)", "SI-7(15)", "SI-8", "SI-8(2)", "SI-8(3)", "SI-10", "SI-11", "SI-12", "SI-12(1)", 
    "SI-12(2)", "SI-16",
    
    // SR - Supply Chain Risk Management
    "SR-1", "SR-2", "SR-2(1)", "SR-3", "SR-3(1)", "SR-3(2)", "SR-5", "SR-6", "SR-8", "SR-9", "SR-9(1)", 
    "SR-10", "SR-11", "SR-11(1)", "SR-11(2)", "SR-12"
  ]
};

/**
 * Control Family Names (Official NIST SP 800-53 Rev 5)
 */
export const CONTROL_FAMILY_NAMES: Record<string, string> = {
  'AC': 'Access Control',
  'AT': 'Awareness and Training',
  'AU': 'Audit and Accountability',
  'CA': 'Assessment, Authorization, and Monitoring',
  'CM': 'Configuration Management',
  'CP': 'Contingency Planning',
  'IA': 'Identification and Authentication',
  'IR': 'Incident Response',
  'MA': 'Maintenance',
  'MP': 'Media Protection',
  'PE': 'Physical and Environmental Protection',
  'PL': 'Planning',
  'PM': 'Program Management',
  'PS': 'Personnel Security',
  'PT': 'Personally Identifiable Information Processing and Transparency',
  'RA': 'Risk Assessment',
  'SA': 'System and Services Acquisition',
  'SC': 'System and Communications Protection',
  'SI': 'System and Information Integrity',
  'SR': 'Supply Chain Risk Management'
};

/**
 * Get control family code from control identifier
 * @param controlId Control identifier (e.g., "AC-1", "AU-2(1)")
 * @returns Family code (e.g., "AC", "AU")
 */
export function getControlFamily(controlId: string): string {
  return controlId.split('-')[0];
}

/**
 * Get full family name from family code
 * @param familyCode Family code (e.g., "AC", "AU")
 * @returns Full family name
 */
export function getFullFamilyName(familyCode: string): string {
  return CONTROL_FAMILY_NAMES[familyCode] || familyCode;
}

/**
 * Validate if a control exists in a specific baseline
 * @param controlId Control identifier
 * @param baseline Baseline level ('Low', 'Moderate', or 'High')
 * @returns true if control exists in baseline
 */
export function isControlInBaseline(controlId: string, baseline: 'Low' | 'Moderate' | 'High'): boolean {
  return NIST_CONTROL_BASELINES[baseline].includes(controlId);
}
