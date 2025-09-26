export interface SecurityRequirement {
  id: string;
  title: string;
  description: string;
  source: string;
  category: 'Authentication' | 'Authorization' | 'Encryption' | 'Audit' | 'Input Validation' | 'Other';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Approved' | 'Implemented' | 'Tested' | 'Verified';
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
}

export type EntityType = 'requirement' | 'designElement' | 'testCase' | 'traceabilityLink';