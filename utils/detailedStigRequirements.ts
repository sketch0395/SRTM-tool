/**
 * Detailed STIG Requirements Database
 * Contains actual STIG requirements organized by family
 */

import { StigRequirement } from '../types/srtm';

export interface DetailedStigRequirement extends Omit<StigRequirement, 'id' | 'createdAt' | 'updatedAt'> {
  // All other fields from StigRequirement interface
}

// Application Security and Development STIG Requirements
export const APPLICATION_SECURITY_REQUIREMENTS: DetailedStigRequirement[] = [
  {
    stigId: 'APSC-DV-000010',
    vulnId: 'V-222400',
    groupId: 'SRG-APP-000001',
    ruleId: 'SV-222400r508029_rule',
    severity: 'CAT II',
    title: 'The application must limit the number of concurrent sessions to an organization-defined number per user.',
    description: 'Application management includes the ability to control the number of users and user sessions that utilize an application. Limiting the number of allowed users and sessions per user is helpful in reducing the risks related to several types of denial-of-service attacks.',
    checkText: 'Review the application documentation and interview the application administrator to identify if the application implements session management. If the application does not implement session management, this requirement is not applicable. Review the application configuration to determine if the application limits concurrent user sessions. If the application does not limit concurrent user sessions to an organization-defined number per user, this is a finding.',
    fixText: 'Configure the application to limit the number of concurrent sessions to an organization-defined number per user.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-000054']
  },
  {
    stigId: 'APSC-DV-000020',
    vulnId: 'V-222401',
    groupId: 'SRG-APP-000001',
    ruleId: 'SV-222401r508032_rule',
    severity: 'CAT II',
    title: 'The application must automatically terminate a user session after organization-defined conditions or trigger events requiring session disconnect.',
    description: 'Automatic session termination addresses the termination of user-initiated logical sessions in contrast to the termination of network connections that are associated with communications sessions.',
    checkText: 'Review the application documentation and interview the application administrator to identify if the application implements session management. If the application does not implement session management, this requirement is not applicable. Review the application configuration to determine if the application automatically terminates user sessions after organization-defined conditions. If the application does not automatically terminate user sessions, this is a finding.',
    fixText: 'Configure the application to automatically terminate user sessions after organization-defined conditions or trigger events requiring session disconnect.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-002361']
  },
  {
    stigId: 'APSC-DV-000030',
    vulnId: 'V-222402',
    groupId: 'SRG-APP-000002',
    ruleId: 'SV-222402r508035_rule',
    severity: 'CAT I',
    title: 'The application must not display passwords/PINs as clear text.',
    description: 'To prevent the compromise of authentication information such as passwords and PINs during the authentication process, the feedback from the application must not provide any information that would allow an unauthorized user to compromise the authentication mechanism.',
    checkText: 'Review the application documentation and observe the application authentication process. Verify the application does not display passwords/PINs in clear text during user authentication. If passwords/PINs are displayed in clear text, this is a finding.',
    fixText: 'Configure the application to not display passwords/PINs as clear text.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-000206']
  }
];

// Node.js Security STIG Requirements
export const NODEJS_SECURITY_REQUIREMENTS: DetailedStigRequirement[] = [
  {
    stigId: 'NODEJS-00-000010',
    severity: 'CAT II',
    title: 'Node.js applications must validate all input parameters.',
    description: 'Input validation is critical to prevent injection attacks and ensure data integrity. All user inputs must be validated against expected formats, lengths, and character sets.',
    checkText: 'Review the Node.js application code to verify that all input parameters are validated. Check for implementation of input validation libraries such as Joi, express-validator, or custom validation functions. If input validation is not implemented for all user inputs, this is a finding.',
    fixText: 'Implement comprehensive input validation for all user inputs using validation libraries like Joi or express-validator. Validate data types, formats, lengths, and character sets.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-000213']
  },
  {
    stigId: 'NODEJS-00-000020',
    severity: 'CAT I',
    title: 'Node.js applications must not use deprecated or vulnerable npm packages.',
    description: 'Using outdated or vulnerable npm packages exposes the application to known security vulnerabilities. Regular audits and updates of dependencies are essential.',
    checkText: 'Run "npm audit" command to check for known vulnerabilities in dependencies. Review package.json and package-lock.json for deprecated packages. If vulnerable or deprecated packages are found, this is a finding.',
    fixText: 'Update all npm packages to their latest secure versions. Use "npm audit fix" to automatically fix vulnerabilities where possible. Replace deprecated packages with supported alternatives.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-002605']
  },
  {
    stigId: 'NODEJS-00-000030',
    severity: 'CAT II',
    title: 'Node.js applications must implement proper error handling without exposing sensitive information.',
    description: 'Error messages should not reveal sensitive information about the application structure, database schema, or system configuration that could be used by attackers.',
    checkText: 'Review error handling implementation in the Node.js application. Check that error messages in production do not expose stack traces, database errors, or system paths. If sensitive information is exposed in error messages, this is a finding.',
    fixText: 'Implement proper error handling that logs detailed errors server-side but returns generic error messages to clients in production. Use environment-specific error handling.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-001312']
  },
  {
    stigId: 'NODEJS-00-000040',
    severity: 'CAT II',
    title: 'Node.js applications must implement secure session management.',
    description: 'Sessions must be properly configured with secure flags, appropriate timeouts, and protection against session fixation and hijacking attacks.',
    checkText: 'Review session configuration in the Node.js application. Check for secure session settings including httpOnly, secure flags, proper timeout values, and session regeneration. If secure session management is not implemented, this is a finding.',
    fixText: 'Configure sessions with secure settings: httpOnly flag, secure flag for HTTPS, appropriate timeout values, and implement session regeneration on authentication.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-000366']
  }
];

// PostgreSQL STIG Requirements
export const POSTGRESQL_REQUIREMENTS: DetailedStigRequirement[] = [
  {
    stigId: 'PGS9-00-000100',
    vulnId: 'V-233516',
    groupId: 'SRG-APP-000001',
    ruleId: 'SV-233516r617333_rule',
    severity: 'CAT II',
    title: 'PostgreSQL must limit the number of connections.',
    description: 'Database management systems can maintain multiple simultaneous sessions. It is important to limit the number of sessions to reduce the risk of denial of service attacks and resource exhaustion.',
    checkText: 'Review PostgreSQL configuration file (postgresql.conf) for the max_connections parameter. If max_connections is not set to an organization-defined value or is set to unlimited (-1), this is a finding.',
    fixText: 'Set the max_connections parameter in postgresql.conf to an organization-defined maximum number of concurrent connections.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-000054']
  },
  {
    stigId: 'PGS9-00-000200',
    vulnId: 'V-233517',
    groupId: 'SRG-APP-000002',
    ruleId: 'SV-233517r617336_rule',
    severity: 'CAT I',
    title: 'PostgreSQL must protect against unauthorized access by configuring authentication methods.',
    description: 'PostgreSQL must be configured to use appropriate authentication methods and not allow unauthorized access through weak authentication mechanisms.',
    checkText: 'Review the pg_hba.conf file to verify that appropriate authentication methods are configured. Check that trust authentication is not used for remote connections. If weak authentication methods are configured, this is a finding.',
    fixText: 'Configure strong authentication methods in pg_hba.conf such as md5, scram-sha-256, or certificate-based authentication. Remove trust authentication for remote connections.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-000213']
  },
  {
    stigId: 'PGS9-00-000300',
    vulnId: 'V-233518',
    groupId: 'SRG-APP-000003',
    ruleId: 'SV-233518r617339_rule',
    severity: 'CAT II',
    title: 'PostgreSQL must enforce approved authorizations for logical access.',
    description: 'PostgreSQL must enforce approved authorizations for logical access to information and system resources in accordance with applicable access control policies.',
    checkText: 'Review PostgreSQL user privileges and role assignments. Verify that users have only the minimum necessary privileges. If users have excessive privileges, this is a finding.',
    fixText: 'Implement principle of least privilege by granting users only the minimum necessary permissions. Use roles to group permissions and assign roles to users appropriately.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-000213']
  }
];

// Web Application Security STIG Requirements
export const WEB_APPLICATION_SECURITY_REQUIREMENTS: DetailedStigRequirement[] = [
  {
    stigId: 'WBAP-SI-000100',
    severity: 'CAT I',
    title: 'Web applications must protect against SQL injection attacks.',
    description: 'SQL injection vulnerabilities occur when user input is directly incorporated into SQL queries without proper sanitization or parameterization.',
    checkText: 'Review web application code for SQL queries. Verify that all user inputs are properly sanitized and parameterized queries are used. If SQL injection vulnerabilities exist, this is a finding.',
    fixText: 'Use parameterized queries, prepared statements, or stored procedures. Implement input validation and sanitization for all user inputs that interact with databases.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-001310']
  },
  {
    stigId: 'WBAP-SI-000200',
    severity: 'CAT II',
    title: 'Web applications must protect against Cross-Site Scripting (XSS) attacks.',
    description: 'XSS vulnerabilities allow attackers to inject malicious scripts into web pages viewed by other users, potentially leading to session hijacking, credential theft, or other attacks.',
    checkText: 'Review web application for XSS protection mechanisms. Check for input validation, output encoding, and Content Security Policy implementation. If XSS protections are not implemented, this is a finding.',
    fixText: 'Implement input validation, output encoding, and Content Security Policy (CSP) headers. Use security libraries that automatically encode outputs.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-001310']
  },
  {
    stigId: 'WBAP-SI-000300',
    severity: 'CAT II',
    title: 'Web applications must implement proper authentication mechanisms.',
    description: 'Web applications must implement strong authentication mechanisms to verify user identities and prevent unauthorized access.',
    checkText: 'Review web application authentication mechanisms. Verify multi-factor authentication, password complexity requirements, and account lockout policies are implemented. If weak authentication is found, this is a finding.',
    fixText: 'Implement strong authentication mechanisms including multi-factor authentication, enforce password complexity requirements, and configure appropriate account lockout policies.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-000213']
  }
];

// Secure Coding Practices STIG Requirements
export const SECURE_CODING_REQUIREMENTS: DetailedStigRequirement[] = [
  {
    stigId: 'SCOD-DV-000100',
    severity: 'CAT II',
    title: 'Applications must implement secure coding practices for input validation.',
    description: 'Secure coding practices require that all input from users be validated to prevent injection attacks and ensure data integrity.',
    checkText: 'Review application source code to verify that input validation is implemented consistently throughout the application. If input validation is missing or inconsistent, this is a finding.',
    fixText: 'Implement comprehensive input validation using whitelist validation, regular expressions, and data type checking for all user inputs.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-001310']
  },
  {
    stigId: 'SCOD-DV-000200',
    severity: 'CAT II',
    title: 'Applications must implement secure error handling.',
    description: 'Error handling must be implemented to prevent the disclosure of sensitive information while providing adequate logging for security monitoring.',
    checkText: 'Review application error handling to ensure sensitive information is not disclosed in error messages. Verify that errors are properly logged. If inadequate error handling is found, this is a finding.',
    fixText: 'Implement secure error handling that logs detailed information server-side while returning generic error messages to users.',
    applicability: 'Applicable',
    status: 'Not Started',
    implementationStatus: 'Open',
    cciRef: ['CCI-001312']
  }
];

/**
 * Get detailed STIG requirements for a given STIG family ID
 */
export function getDetailedStigRequirements(stigFamilyId: string): DetailedStigRequirement[] {
  switch (stigFamilyId) {
    case 'application-security-dev':
      return APPLICATION_SECURITY_REQUIREMENTS;
    case 'nodejs-security':
      return NODEJS_SECURITY_REQUIREMENTS;
    case 'postgresql':
      return POSTGRESQL_REQUIREMENTS;
    case 'web-application-security':
      return WEB_APPLICATION_SECURITY_REQUIREMENTS;
    case 'secure-coding-practices':
      return SECURE_CODING_REQUIREMENTS;
    default:
      // For STIG families not yet implemented, return placeholder requirements
      return [
        {
          stigId: `${stigFamilyId.toUpperCase()}-PLACEHOLDER-001`,
          severity: 'CAT II',
          title: `${stigFamilyId.replace(/-/g, ' ').toUpperCase()} Security Requirements`,
          description: `This is a placeholder for detailed ${stigFamilyId} STIG requirements. Full implementation pending.`,
          checkText: `Review the system for ${stigFamilyId} compliance requirements.`,
          fixText: `Implement ${stigFamilyId} security controls according to the official STIG documentation.`,
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open'
        }
      ];
  }
}

/**
 * Convert detailed STIG requirements to StigRequirement format
 */
export function convertToStigRequirements(stigFamilyIds: string[]): import('../types/srtm').StigRequirement[] {
  const allRequirements: import('../types/srtm').StigRequirement[] = [];
  
  stigFamilyIds.forEach(familyId => {
    const detailedRequirements = getDetailedStigRequirements(familyId);
    
    detailedRequirements.forEach((req, index) => {
      allRequirements.push({
        id: `${familyId}-${Date.now()}-${index}`,
        ...req,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  });
  
  return allRequirements;
}