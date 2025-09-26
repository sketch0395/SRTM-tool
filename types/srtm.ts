export interface SecurityRequirement {
  id: string;
  title: string;
  description: string;
  source: string;
  category: 'Authentication' | 'Authorization' | 'Encryption' | 'Audit' | 'Input Validation' | 'Access Control' | 'Data Protection' | 'Network Security' | 'System Integrity' | 'Incident Response' | 'Other';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Approved' | 'Implemented' | 'Tested' | 'Verified';
  nistFunction?: 'Identify' | 'Protect' | 'Detect' | 'Respond' | 'Recover';
  nistSubcategory?: string;
  rmfStep?: 'Categorize' | 'Select' | 'Implement' | 'Assess' | 'Authorize' | 'Monitor';
  controlFamily?: string; // NIST SP 800-53 Control Family (AC, AU, CA, etc.)
  controlIdentifier?: string; // e.g., AC-2, AU-12, CA-7
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemDesignElement {
  id: string;
  name: string;
  type: 'Component' | 'Module' | 'Interface' | 'Service' | 'Database' | 'API';
  description: string;
  technology?: string;
  owner?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  testType: 'Unit' | 'Integration' | 'Security' | 'Performance' | 'Acceptance';
  testMethod: 'Automated' | 'Manual' | 'Semi-Automated';
  expectedResult: string;
  actualResult?: string;
  status: 'Draft' | 'Ready' | 'In Progress' | 'Passed' | 'Failed' | 'Blocked';
  priority: 'High' | 'Medium' | 'Low';
  createdAt: Date;
  updatedAt: Date;
}

export interface TraceabilityLink {
  id: string;
  requirementId: string;
  designElementId?: string;
  testCaseId?: string;
  linkType: 'Requirement-Design' | 'Requirement-Test' | 'Design-Test';
  status: 'Active' | 'Inactive';
  rationale?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SRTMData {
  requirements: SecurityRequirement[];
  designElements: SystemDesignElement[];
  testCases: TestCase[];
  traceabilityLinks: TraceabilityLink[];
  stigRequirements: StigRequirement[];
}

export interface StigRequirement {
  id: string;
  stigId: string; // e.g., V-220697
  vulnId?: string; // Vulnerability ID
  groupId?: string; // Group ID
  ruleId?: string; // Rule ID
  severity: 'CAT I' | 'CAT II' | 'CAT III';
  title: string;
  description: string;
  checkText: string;
  fixText: string;
  targetKey?: string;
  stigRef?: string;
  cciRef?: string[];
  applicability: 'Applicable' | 'Not Applicable' | 'Not Reviewed';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Exception Requested';
  implementationStatus: 'Open' | 'NotAFinding' | 'Not_Applicable';
  findings?: string;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StigImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  stigRequirements: StigRequirement[];
}

export type EntityType = 'requirement' | 'designElement' | 'testCase' | 'traceabilityLink' | 'stig';