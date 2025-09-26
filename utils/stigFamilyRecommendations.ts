/**
 * STIG Family Recommendation Engine
 * Analyzes security requirements and design elements to recommend applicable STIG families
 */

import { SecurityRequirement, SystemDesignElement } from '../types/srtm';

export interface StigFamily {
  id: string;
  name: string;
  description: string;
  applicableSystemTypes: string[];
  triggerKeywords: string[];
  controlFamilies: string[]; // NIST 800-53 families that map to this STIG
  priority: 'High' | 'Medium' | 'Low';
  estimatedRequirements: number;
}

export interface StigFamilyRecommendation {
  stigFamily: StigFamily;
  relevanceScore: number;
  matchingRequirements: string[]; // IDs of matching requirements
  matchingDesignElements: string[]; // IDs of matching design elements
  reasoning: string[];
  implementationPriority: 'Critical' | 'High' | 'Medium' | 'Low';
}

// Comprehensive STIG Family catalog
export const STIG_FAMILIES: StigFamily[] = [
  // Application Security STIGs (Priority for development environments)
  {
    id: 'application-security-dev',
    name: 'Application Security and Development STIG',
    description: 'Security Technical Implementation Guide for Application Security and Development practices',
    applicableSystemTypes: ['Application', 'Development', 'Web Application', 'API', 'Software'],
    triggerKeywords: ['node.js', 'nodejs', 'javascript', 'web app', 'api', 'application', 'development', 'software', 'code', 'programming', 'react', 'angular', 'vue', 'express', 'frontend', 'backend'],
    controlFamilies: ['AC', 'AU', 'CM', 'IA', 'SC', 'SI', 'SA'],
    priority: 'High',
    estimatedRequirements: 165
  },
  {
    id: 'web-application-security',
    name: 'Web Application Security STIG',
    description: 'Security Technical Implementation Guide for Web Applications',
    applicableSystemTypes: ['Web Application', 'API', 'Frontend', 'Backend', 'Service'],
    triggerKeywords: ['web application', 'webapp', 'web app', 'api', 'rest', 'graphql', 'http', 'https', 'session', 'authentication', 'authorization', 'cors', 'xss', 'sql injection'],
    controlFamilies: ['AC', 'AU', 'SC', 'SI', 'SA'],
    priority: 'High',
    estimatedRequirements: 145
  },
  {
    id: 'secure-coding-practices',
    name: 'Secure Coding Practices STIG',
    description: 'Security requirements for secure software development lifecycle',
    applicableSystemTypes: ['Development', 'Application', 'Software', 'Code'],
    triggerKeywords: ['secure coding', 'sdlc', 'code review', 'static analysis', 'dynamic analysis', 'vulnerability scanning', 'penetration testing', 'security testing'],
    controlFamilies: ['SA', 'SC', 'SI', 'CM'],
    priority: 'High',
    estimatedRequirements: 95
  },
  {
    id: 'windows-server-2019',
    name: 'Windows Server 2019 STIG',
    description: 'Security Technical Implementation Guide for Windows Server 2019',
    applicableSystemTypes: ['Windows', 'Server', 'Domain Controller', 'File Server'],
    triggerKeywords: ['windows', 'server', 'active directory', 'domain', 'ntfs', 'registry', 'powershell', 'iis'],
    controlFamilies: ['AC', 'AU', 'CM', 'IA', 'SC', 'SI'],
    priority: 'High',
    estimatedRequirements: 285
  },
  {
    id: 'windows-10-11',
    name: 'Windows 10/11 STIG',
    description: 'Security Technical Implementation Guide for Windows 10 and 11 workstations',
    applicableSystemTypes: ['Windows', 'Workstation', 'Desktop', 'Laptop'],
    triggerKeywords: ['windows 10', 'windows 11', 'workstation', 'desktop', 'laptop', 'endpoint'],
    controlFamilies: ['AC', 'AU', 'CM', 'IA', 'SC', 'SI'],
    priority: 'High',
    estimatedRequirements: 195
  },
  {
    id: 'rhel-8',
    name: 'Red Hat Enterprise Linux 8 STIG',
    description: 'Security Technical Implementation Guide for RHEL 8',
    applicableSystemTypes: ['Linux', 'RHEL', 'CentOS', 'Unix'],
    triggerKeywords: ['linux', 'rhel', 'redhat', 'centos', 'unix', 'bash', 'systemd', 'selinux'],
    controlFamilies: ['AC', 'AU', 'CM', 'IA', 'SC', 'SI'],
    priority: 'High',
    estimatedRequirements: 275
  },
  {
    id: 'ubuntu-20-04',
    name: 'Ubuntu 20.04 LTS STIG',
    description: 'Security Technical Implementation Guide for Ubuntu 20.04 LTS',
    applicableSystemTypes: ['Linux', 'Ubuntu', 'Debian'],
    triggerKeywords: ['ubuntu', 'debian', 'apt', 'snap', 'systemd', 'apparmor'],
    controlFamilies: ['AC', 'AU', 'CM', 'IA', 'SC', 'SI'],
    priority: 'High',
    estimatedRequirements: 260
  },
  {
    id: 'cisco-ios-xe',
    name: 'Cisco IOS XE Router STIG',
    description: 'Security Technical Implementation Guide for Cisco IOS XE Routers',
    applicableSystemTypes: ['Router', 'Network', 'Cisco', 'Infrastructure'],
    triggerKeywords: ['cisco', 'ios', 'router', 'routing', 'ospf', 'bgp', 'snmp', 'acl'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC'],
    priority: 'High',
    estimatedRequirements: 145
  },
  {
    id: 'cisco-ios-switch',
    name: 'Cisco IOS Switch STIG',
    description: 'Security Technical Implementation Guide for Cisco IOS Switches',
    applicableSystemTypes: ['Switch', 'Network', 'Cisco', 'Infrastructure'],
    triggerKeywords: ['cisco', 'ios', 'switch', 'switching', 'vlan', 'stp', 'port security'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC'],
    priority: 'High',
    estimatedRequirements: 135
  },
  {
    id: 'vmware-vsphere-7',
    name: 'VMware vSphere 7.0 STIG',
    description: 'Security Technical Implementation Guide for VMware vSphere 7.0',
    applicableSystemTypes: ['VMware', 'Virtualization', 'Hypervisor', 'Cloud'],
    triggerKeywords: ['vmware', 'vsphere', 'vcenter', 'esxi', 'virtualization', 'hypervisor', 'vm'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC', 'SI'],
    priority: 'High',
    estimatedRequirements: 225
  },
  {
    id: 'docker',
    name: 'Docker Enterprise STIG',
    description: 'Security Technical Implementation Guide for Docker Enterprise',
    applicableSystemTypes: ['Docker', 'Container', 'Kubernetes', 'Cloud'],
    triggerKeywords: ['docker', 'container', 'kubernetes', 'k8s', 'containerization', 'pod'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC', 'SI'],
    priority: 'Medium',
    estimatedRequirements: 95
  },
  {
    id: 'apache-server-2-4',
    name: 'Apache Server 2.4 STIG',
    description: 'Security Technical Implementation Guide for Apache HTTP Server 2.4',
    applicableSystemTypes: ['Web Server', 'Apache', 'HTTP'],
    triggerKeywords: ['apache', 'httpd', 'web server', 'http', 'https', 'ssl', 'tls'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC', 'SI'],
    priority: 'High',
    estimatedRequirements: 85
  },
  {
    id: 'nginx',
    name: 'NGINX STIG',
    description: 'Security Technical Implementation Guide for NGINX Web Server',
    applicableSystemTypes: ['Web Server', 'NGINX', 'HTTP', 'Reverse Proxy'],
    triggerKeywords: ['nginx', 'web server', 'reverse proxy', 'load balancer', 'http', 'https'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC', 'SI'],
    priority: 'High',
    estimatedRequirements: 75
  },
  {
    id: 'microsoft-iis-10',
    name: 'Microsoft IIS 10.0 STIG',
    description: 'Security Technical Implementation Guide for Microsoft Internet Information Services 10.0',
    applicableSystemTypes: ['Web Server', 'IIS', 'Windows', 'HTTP'],
    triggerKeywords: ['iis', 'internet information services', 'web server', 'asp.net', 'windows web'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC', 'SI'],
    priority: 'High',
    estimatedRequirements: 95
  },
  {
    id: 'microsoft-sql-server-2019',
    name: 'Microsoft SQL Server 2019 STIG',
    description: 'Security Technical Implementation Guide for Microsoft SQL Server 2019',
    applicableSystemTypes: ['Database', 'SQL Server', 'Microsoft', 'RDBMS'],
    triggerKeywords: ['sql server', 'database', 'rdbms', 'tsql', 'sql', 'microsoft database'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC', 'SI'],
    priority: 'High',
    estimatedRequirements: 125
  },
  {
    id: 'oracle-database-19c',
    name: 'Oracle Database 19c STIG',
    description: 'Security Technical Implementation Guide for Oracle Database 19c',
    applicableSystemTypes: ['Database', 'Oracle', 'RDBMS'],
    triggerKeywords: ['oracle', 'database', 'rdbms', 'plsql', 'oracle db'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC', 'SI'],
    priority: 'High',
    estimatedRequirements: 145
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL STIG',
    description: 'Security Technical Implementation Guide for PostgreSQL Database',
    applicableSystemTypes: ['Database', 'PostgreSQL', 'RDBMS', 'Open Source'],
    triggerKeywords: ['postgresql', 'postgres', 'database', 'rdbms', 'sql', 'db'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC', 'SI'],
    priority: 'High',
    estimatedRequirements: 115
  },
  {
    id: 'nodejs-security',
    name: 'Node.js Security STIG',
    description: 'Security Technical Implementation Guide for Node.js Applications and Runtime',
    applicableSystemTypes: ['Node.js', 'JavaScript', 'Runtime', 'API', 'Backend'],
    triggerKeywords: ['node.js', 'nodejs', 'node', 'javascript', 'npm', 'express', 'backend', 'server-side', 'runtime', 'v8'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC', 'SI', 'SA'],
    priority: 'High',
    estimatedRequirements: 85
  },
  {
    id: 'mongodb',
    name: 'MongoDB STIG',
    description: 'Security Technical Implementation Guide for MongoDB',
    applicableSystemTypes: ['Database', 'MongoDB', 'NoSQL', 'Document Database'],
    triggerKeywords: ['mongodb', 'mongo', 'nosql', 'document database', 'json'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC', 'SI'],
    priority: 'Medium',
    estimatedRequirements: 85
  },
  {
    id: 'aws-foundations',
    name: 'AWS Foundations STIG',
    description: 'Security Technical Implementation Guide for Amazon Web Services Foundations',
    applicableSystemTypes: ['Cloud', 'AWS', 'Amazon', 'Infrastructure'],
    triggerKeywords: ['aws', 'amazon', 'cloud', 'ec2', 's3', 'iam', 'vpc', 'cloudtrail'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC', 'SI', 'CP'],
    priority: 'High',
    estimatedRequirements: 165
  },
  {
    id: 'microsoft-azure',
    name: 'Microsoft Azure STIG',
    description: 'Security Technical Implementation Guide for Microsoft Azure',
    applicableSystemTypes: ['Cloud', 'Azure', 'Microsoft', 'Infrastructure'],
    triggerKeywords: ['azure', 'microsoft cloud', 'cloud', 'azure ad', 'resource group'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC', 'SI', 'CP'],
    priority: 'High',
    estimatedRequirements: 155
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes STIG',
    description: 'Security Technical Implementation Guide for Kubernetes',
    applicableSystemTypes: ['Container', 'Kubernetes', 'Orchestration', 'Cloud'],
    triggerKeywords: ['kubernetes', 'k8s', 'container orchestration', 'pod', 'deployment', 'service'],
    controlFamilies: ['AC', 'AU', 'CM', 'SC', 'SI'],
    priority: 'High',
    estimatedRequirements: 105
  },
  {
    id: 'general-purpose-os',
    name: 'General Purpose Operating System STIG',
    description: 'Generic STIG for general purpose operating systems',
    applicableSystemTypes: ['Operating System', 'Generic', 'Multi-platform'],
    triggerKeywords: ['operating system', 'os', 'system', 'platform'],
    controlFamilies: ['AC', 'AU', 'CM', 'IA', 'SC', 'SI'],
    priority: 'Medium',
    estimatedRequirements: 200
  }
];

/**
 * Analyzes requirements and design elements to recommend STIG families
 */
export function getStigFamilyRecommendations(
  requirements: SecurityRequirement[],
  designElements: SystemDesignElement[]
): StigFamilyRecommendation[] {
  const recommendations: StigFamilyRecommendation[] = [];

  for (const stigFamily of STIG_FAMILIES) {
    const recommendation = analyzeStigFamily(stigFamily, requirements, designElements);
    if (recommendation.relevanceScore > 0) {
      recommendations.push(recommendation);
    }
  }

  // Sort by relevance score (descending)
  return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function analyzeStigFamily(
  stigFamily: StigFamily,
  requirements: SecurityRequirement[],
  designElements: SystemDesignElement[]
): StigFamilyRecommendation {
  let relevanceScore = 0;
  const matchingRequirements: string[] = [];
  const matchingDesignElements: string[] = [];
  const reasoning: string[] = [];

  // Check if this is a development/application environment
  const isDevelopmentEnvironment = designElements.some(element => {
    const elementText = `${element.name} ${element.description} ${element.type} ${element.technology || ''}`.toLowerCase();
    return elementText.includes('node') || elementText.includes('javascript') || 
           elementText.includes('postgres') || elementText.includes('api') ||
           elementText.includes('application') || elementText.includes('web');
  });

  // Boost application security STIGs for development environments
  if (isDevelopmentEnvironment && stigFamily.id.includes('application') || 
      stigFamily.id.includes('web') || stigFamily.id.includes('nodejs') || 
      stigFamily.id.includes('secure-coding')) {
    relevanceScore += 5; // Base boost for app security STIGs
    reasoning.push('Development environment detected - application security controls are critical');
  }

  // Analyze requirements
  for (const req of requirements) {
    const reqText = `${req.title} ${req.description} ${req.category} ${req.controlFamily || ''} ${req.source}`.toLowerCase();
    
    // Check for keyword matches
    const keywordMatches = stigFamily.triggerKeywords.filter(keyword => 
      reqText.includes(keyword.toLowerCase())
    );
    
    if (keywordMatches.length > 0) {
      // Higher weight for application security STIGs
      const weight = stigFamily.id.includes('application') || stigFamily.id.includes('web') || 
                    stigFamily.id.includes('nodejs') || stigFamily.id.includes('secure-coding') ? 3 : 2;
      relevanceScore += keywordMatches.length * weight;
      matchingRequirements.push(req.id);
      reasoning.push(`Requirement "${req.title}" matches keywords: ${keywordMatches.join(', ')}`);
    }

    // Check for control family matches
    if (req.controlFamily && stigFamily.controlFamilies.includes(req.controlFamily)) {
      relevanceScore += 3; // 3 points for control family match
      if (!matchingRequirements.includes(req.id)) {
        matchingRequirements.push(req.id);
      }
      reasoning.push(`Requirement "${req.title}" uses control family ${req.controlFamily}`);
    }
  }

  // Analyze design elements with enhanced matching
  for (const element of designElements) {
    const elementText = `${element.name} ${element.description} ${element.type} ${element.technology || ''}`.toLowerCase();
    
    // Check for keyword matches
    const keywordMatches = stigFamily.triggerKeywords.filter(keyword => 
      elementText.includes(keyword.toLowerCase())
    );
    
    // Check for system type matches
    const typeMatches = stigFamily.applicableSystemTypes.filter(type => 
      elementText.includes(type.toLowerCase()) || element.type.toLowerCase().includes(type.toLowerCase())
    );

    if (keywordMatches.length > 0 || typeMatches.length > 0) {
      // Enhanced scoring for development technologies
      let keywordWeight = 1.5;
      let typeWeight = 2.5;
      
      // Special handling for Node.js and PostgreSQL
      if ((elementText.includes('node') || elementText.includes('postgres')) && 
          (stigFamily.id.includes('nodejs') || stigFamily.id.includes('postgresql') || 
           stigFamily.id.includes('application'))) {
        keywordWeight = 4; // Much higher weight for exact tech matches
        typeWeight = 5;
        reasoning.push(`Direct technology match: ${element.name} requires specific security controls`);
      }
      
      relevanceScore += (keywordMatches.length * keywordWeight) + (typeMatches.length * typeWeight);
      matchingDesignElements.push(element.id);
      
      if (keywordMatches.length > 0) {
        reasoning.push(`Design element "${element.name}" matches keywords: ${keywordMatches.join(', ')}`);
      }
      if (typeMatches.length > 0) {
        reasoning.push(`Design element "${element.name}" matches system types: ${typeMatches.join(', ')}`);
      }
    }
  }

  // Penalize irrelevant STIGs for development environments
  if (isDevelopmentEnvironment) {
    // Reduce scores for infrastructure STIGs when we have a development environment
    if (stigFamily.id.includes('windows-server') || stigFamily.id.includes('cisco') || 
        stigFamily.id.includes('vmware') || stigFamily.id.includes('rhel')) {
      relevanceScore = Math.max(0, relevanceScore - 3);
      if (relevanceScore > 0) {
        reasoning.push('Score reduced: Infrastructure STIG less relevant for application development');
      }
    }
  }

  // Determine implementation priority based on relevance score and STIG priority
  let implementationPriority: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
  if (relevanceScore >= 10 && stigFamily.priority === 'High') {
    implementationPriority = 'Critical';
  } else if (relevanceScore >= 7 || stigFamily.priority === 'High') {
    implementationPriority = 'High';
  } else if (relevanceScore >= 4 || stigFamily.priority === 'Medium') {
    implementationPriority = 'Medium';
  }

  return {
    stigFamily,
    relevanceScore,
    matchingRequirements,
    matchingDesignElements,
    reasoning,
    implementationPriority
  };
}

/**
 * Get estimated implementation effort for recommended STIG families
 */
export function getImplementationEffort(recommendations: StigFamilyRecommendation[]) {
  const totalRequirements = recommendations.reduce((sum, rec) => 
    sum + rec.stigFamily.estimatedRequirements, 0);
  
  const criticalCount = recommendations.filter(r => r.implementationPriority === 'Critical').length;
  const highCount = recommendations.filter(r => r.implementationPriority === 'High').length;
  const mediumCount = recommendations.filter(r => r.implementationPriority === 'Medium').length;
  
  // Rough estimation: 1 hour per requirement on average
  const estimatedHours = totalRequirements * 1.2; // 1.2 hours per requirement including documentation
  const estimatedDays = Math.ceil(estimatedHours / 8);

  return {
    totalRequirements,
    estimatedHours: Math.round(estimatedHours),
    estimatedDays,
    priorityCounts: {
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: recommendations.length - criticalCount - highCount - mediumCount
    }
  };
}