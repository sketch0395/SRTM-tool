/**
 * Unit tests for STIG Requirements utility functions
 */

import {
  convertCsvToStigRequirement,
  parseStigCsv,
  storeStigRequirements,
  getStoredStigRequirements,
  getAllStoredStigRequirements,
  clearStoredStigRequirements,
  getDetailedStigRequirements,
  convertStigRequirementsToMatrix,
  groupStigRequirementsByTitle,
  getUniqueStigRequirementCount,
  CsvStigRequirement,
  DetailedStigRequirement
} from '../detailedStigRequirements';

describe('detailedStigRequirements', () => {
  beforeEach(() => {
    // Clear stored requirements before each test
    clearStoredStigRequirements();
  });

  describe('convertCsvToStigRequirement', () => {
    it('should convert basic CSV row to STIG requirement', () => {
      const csvRow: CsvStigRequirement = {
        stigId: 'V-123456',
        severity: 'high',
        ruleTitle: 'Test Requirement',
        discussion: 'Test description',
        checkContent: 'Test check',
        fixText: 'Test fix'
      };

      const result = convertCsvToStigRequirement(csvRow);

      expect(result.stigId).toBe('V-123456');
      expect(result.severity).toBe('CAT I');
      expect(result.title).toBe('Test Requirement');
      expect(result.description).toBe('Test description');
      expect(result.checkText).toBe('Test check');
      expect(result.fixText).toBe('Test fix');
    });

    it('should normalize severity from "high" to "CAT I"', () => {
      const csvRow: CsvStigRequirement = {
        stigId: 'V-123456',
        severity: 'high',
        ruleTitle: 'Test',
        discussion: 'Test',
        checkContent: 'Test',
        fixText: 'Test'
      };

      const result = convertCsvToStigRequirement(csvRow);
      expect(result.severity).toBe('CAT I');
    });

    it('should normalize severity from "medium" to "CAT II"', () => {
      const csvRow: CsvStigRequirement = {
        stigId: 'V-123456',
        severity: 'medium',
        ruleTitle: 'Test',
        discussion: 'Test',
        checkContent: 'Test',
        fixText: 'Test'
      };

      const result = convertCsvToStigRequirement(csvRow);
      expect(result.severity).toBe('CAT II');
    });

    it('should normalize severity from "low" to "CAT III"', () => {
      const csvRow: CsvStigRequirement = {
        stigId: 'V-123456',
        severity: 'low',
        ruleTitle: 'Test',
        discussion: 'Test',
        checkContent: 'Test',
        fixText: 'Test'
      };

      const result = convertCsvToStigRequirement(csvRow);
      expect(result.severity).toBe('CAT III');
    });

    it('should normalize severity from "CAT I" to "CAT I"', () => {
      const csvRow: CsvStigRequirement = {
        stigId: 'V-123456',
        severity: 'CAT I',
        ruleTitle: 'Test',
        discussion: 'Test',
        checkContent: 'Test',
        fixText: 'Test'
      };

      const result = convertCsvToStigRequirement(csvRow);
      expect(result.severity).toBe('CAT I');
    });

    it('should extract CCI references from ccis field', () => {
      const csvRow: CsvStigRequirement = {
        stigId: 'V-123456',
        severity: 'medium',
        ruleTitle: 'Test',
        discussion: 'Test',
        checkContent: 'Test',
        fixText: 'Test',
        ccis: 'CCI-001234\nCCI-005678\nSome other text'
      };

      const result = convertCsvToStigRequirement(csvRow);
      expect(result.cciRef).toContain('CCI-001234');
      expect(result.cciRef).toContain('CCI-005678');
      expect(result.cciRef).toHaveLength(2);
    });

    it('should use default CCI when none provided', () => {
      const csvRow: CsvStigRequirement = {
        stigId: 'V-123456',
        severity: 'medium',
        ruleTitle: 'Test',
        discussion: 'Test',
        checkContent: 'Test',
        fixText: 'Test'
      };

      const result = convertCsvToStigRequirement(csvRow);
      expect(result.cciRef).toContain('CCI-000366');
    });

    it('should normalize status values', () => {
      const testCases = [
        { status: 'complete', expected: 'Completed' },
        { status: 'in progress', expected: 'In Progress' },
        { status: 'ongoing', expected: 'In Progress' },
        { status: 'exception', expected: 'Exception Requested' },
        { status: 'waiver', expected: 'Exception Requested' },
        { status: undefined, expected: 'Not Started' }
      ];

      testCases.forEach(({ status, expected }) => {
        const csvRow: CsvStigRequirement = {
          stigId: 'V-123456',
          severity: 'medium',
          ruleTitle: 'Test',
          discussion: 'Test',
          checkContent: 'Test',
          fixText: 'Test',
          status
        };

        const result = convertCsvToStigRequirement(csvRow);
        expect(result.status).toBe(expected);
      });
    });

    it('should use ruleId if stigId not provided', () => {
      const csvRow: Partial<CsvStigRequirement> & { severity: 'high' | 'medium' | 'low' | 'CAT I' | 'CAT II' | 'CAT III' } = {
        ruleId: 'SV-123456r1',
        severity: 'medium',
        ruleTitle: 'Test',
        discussion: 'Test',
        checkContent: 'Test',
        fixText: 'Test'
      };

      const result = convertCsvToStigRequirement(csvRow as CsvStigRequirement);
      expect(result.stigId).toBe('SV-123456r1');
    });

    it('should handle missing optional fields', () => {
      const csvRow: CsvStigRequirement = {
        stigId: 'V-123456',
        severity: 'medium',
        ruleTitle: 'Test',
        discussion: 'Test',
        checkContent: 'Test',
        fixText: 'Test'
      };

      const result = convertCsvToStigRequirement(csvRow);
      expect(result.applicability).toBe('Applicable');
      expect(result.implementationStatus).toBe('Open');
    });
  });

  describe('storeStigRequirements', () => {
    it('should store requirements for a family', () => {
      const requirements: DetailedStigRequirement[] = [
        {
          stigId: 'V-123456',
          severity: 'CAT I',
          title: 'Test 1',
          description: 'Desc 1',
          checkText: 'Check 1',
          fixText: 'Fix 1',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        }
      ];

      storeStigRequirements('test_family', requirements);
      const stored = getStoredStigRequirements('test_family');

      expect(stored).toHaveLength(1);
      expect(stored[0].stigId).toBe('V-123456');
    });

    it('should overwrite existing requirements for same family', () => {
      const req1: DetailedStigRequirement[] = [
        {
          stigId: 'V-111111',
          severity: 'CAT I',
          title: 'Old',
          description: 'Old',
          checkText: 'Old',
          fixText: 'Old',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        }
      ];

      const req2: DetailedStigRequirement[] = [
        {
          stigId: 'V-222222',
          severity: 'CAT II',
          title: 'New',
          description: 'New',
          checkText: 'New',
          fixText: 'New',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        }
      ];

      storeStigRequirements('test_family', req1);
      storeStigRequirements('test_family', req2);
      
      const stored = getStoredStigRequirements('test_family');
      expect(stored).toHaveLength(1);
      expect(stored[0].stigId).toBe('V-222222');
    });
  });

  describe('getStoredStigRequirements', () => {
    it('should return empty array for non-existent family', () => {
      const result = getStoredStigRequirements('non_existent');
      expect(result).toEqual([]);
    });

    it('should return stored requirements for family', () => {
      const requirements: DetailedStigRequirement[] = [
        {
          stigId: 'V-123456',
          severity: 'CAT I',
          title: 'Test',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        }
      ];

      storeStigRequirements('test_family', requirements);
      const result = getStoredStigRequirements('test_family');

      expect(result).toEqual(requirements);
    });
  });

  describe('getAllStoredStigRequirements', () => {
    it('should return empty array when no requirements stored', () => {
      const result = getAllStoredStigRequirements();
      expect(result).toEqual([]);
    });

    it('should return all requirements from all families', () => {
      const req1: DetailedStigRequirement[] = [
        {
          stigId: 'V-111111',
          severity: 'CAT I',
          title: 'Test 1',
          description: 'Test 1',
          checkText: 'Test 1',
          fixText: 'Test 1',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        }
      ];

      const req2: DetailedStigRequirement[] = [
        {
          stigId: 'V-222222',
          severity: 'CAT II',
          title: 'Test 2',
          description: 'Test 2',
          checkText: 'Test 2',
          fixText: 'Test 2',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        }
      ];

      storeStigRequirements('family1', req1);
      storeStigRequirements('family2', req2);

      const result = getAllStoredStigRequirements();
      expect(result.length).toBe(2);
    });

    it('should add id, createdAt, and updatedAt to requirements', () => {
      const req: DetailedStigRequirement[] = [
        {
          stigId: 'V-123456',
          severity: 'CAT I',
          title: 'Test',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        }
      ];

      storeStigRequirements('test_family', req);
      const result = getAllStoredStigRequirements();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('updatedAt');
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('clearStoredStigRequirements', () => {
    it('should clear specific family requirements', () => {
      const req: DetailedStigRequirement[] = [
        {
          stigId: 'V-123456',
          severity: 'CAT I',
          title: 'Test',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        }
      ];

      storeStigRequirements('family1', req);
      storeStigRequirements('family2', req);

      clearStoredStigRequirements('family1');

      expect(getStoredStigRequirements('family1')).toEqual([]);
      expect(getStoredStigRequirements('family2')).toHaveLength(1);
    });

    it('should clear all requirements when no family specified', () => {
      const req: DetailedStigRequirement[] = [
        {
          stigId: 'V-123456',
          severity: 'CAT I',
          title: 'Test',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        }
      ];

      storeStigRequirements('family1', req);
      storeStigRequirements('family2', req);

      clearStoredStigRequirements();

      expect(getStoredStigRequirements('family1')).toEqual([]);
      expect(getStoredStigRequirements('family2')).toEqual([]);
    });
  });

  describe('getDetailedStigRequirements', () => {
    it('should return stored requirements for family', () => {
      const req: DetailedStigRequirement[] = [
        {
          stigId: 'V-123456',
          severity: 'CAT I',
          title: 'Test',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        }
      ];

      storeStigRequirements('test_family', req);
      const result = getDetailedStigRequirements('test_family');

      expect(result).toEqual(req);
    });
  });

  describe('convertStigRequirementsToMatrix', () => {
    it('should convert requirements to matrix format', () => {
      const req: DetailedStigRequirement[] = [
        {
          stigId: 'V-123456',
          severity: 'CAT I',
          title: 'Test',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        }
      ];

      storeStigRequirements('family1', req);
      const result = convertStigRequirementsToMatrix(['family1']);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('updatedAt');
    });

    it('should handle multiple families', () => {
      const req1: DetailedStigRequirement[] = [
        {
          stigId: 'V-111111',
          severity: 'CAT I',
          title: 'Test 1',
          description: 'Test 1',
          checkText: 'Test 1',
          fixText: 'Test 1',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        }
      ];

      const req2: DetailedStigRequirement[] = [
        {
          stigId: 'V-222222',
          severity: 'CAT II',
          title: 'Test 2',
          description: 'Test 2',
          checkText: 'Test 2',
          fixText: 'Test 2',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        }
      ];

      storeStigRequirements('family1', req1);
      storeStigRequirements('family2', req2);

      const result = convertStigRequirementsToMatrix(['family1', 'family2']);
      expect(result).toHaveLength(2);
    });
  });

  describe('groupStigRequirementsByTitle', () => {
    it('should group requirements with same title', () => {
      const requirements = [
        {
          id: '1',
          stigId: 'V-111111',
          severity: 'CAT I' as const,
          title: 'Same Title',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable' as const,
          status: 'Not Started' as const,
          implementationStatus: 'Open' as const,
          cciRef: ['CCI-000366'],
          family: 'family1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          stigId: 'V-222222',
          severity: 'CAT I' as const,
          title: 'Same Title',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable' as const,
          status: 'Not Started' as const,
          implementationStatus: 'Open' as const,
          cciRef: ['CCI-000366'],
          family: 'family2',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const result = groupStigRequirementsByTitle(requirements);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Same Title');
      expect(result[0].count).toBe(2);
      expect(result[0].stigIds).toContain('V-111111');
      expect(result[0].stigIds).toContain('V-222222');
    });

    it('should keep separate groups for different titles', () => {
      const requirements = [
        {
          id: '1',
          stigId: 'V-111111',
          severity: 'CAT I' as const,
          title: 'Title 1',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable' as const,
          status: 'Not Started' as const,
          implementationStatus: 'Open' as const,
          cciRef: ['CCI-000366'],
          family: 'family1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          stigId: 'V-222222',
          severity: 'CAT II' as const,
          title: 'Title 2',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable' as const,
          status: 'Not Started' as const,
          implementationStatus: 'Open' as const,
          cciRef: ['CCI-000366'],
          family: 'family1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const result = groupStigRequirementsByTitle(requirements);

      expect(result).toHaveLength(2);
    });

    it('should sort by severity then title', () => {
      const requirements = [
        {
          id: '1',
          stigId: 'V-111111',
          severity: 'CAT III' as const,
          title: 'Z Title',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable' as const,
          status: 'Not Started' as const,
          implementationStatus: 'Open' as const,
          cciRef: ['CCI-000366'],
          family: 'family1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          stigId: 'V-222222',
          severity: 'CAT I' as const,
          title: 'A Title',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable' as const,
          status: 'Not Started' as const,
          implementationStatus: 'Open' as const,
          cciRef: ['CCI-000366'],
          family: 'family1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const result = groupStigRequirementsByTitle(requirements);

      expect(result[0].severity).toBe('CAT I');
      expect(result[1].severity).toBe('CAT III');
    });

    it('should update status to highest priority', () => {
      const requirements = [
        {
          id: '1',
          stigId: 'V-111111',
          severity: 'CAT I' as const,
          title: 'Same Title',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable' as const,
          status: 'Not Started' as const,
          implementationStatus: 'Open' as const,
          cciRef: ['CCI-000366'],
          family: 'family1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          stigId: 'V-222222',
          severity: 'CAT I' as const,
          title: 'Same Title',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable' as const,
          status: 'Completed' as const,
          implementationStatus: 'Open' as const,
          cciRef: ['CCI-000366'],
          family: 'family1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const result = groupStigRequirementsByTitle(requirements);

      expect(result[0].status).toBe('Completed');
    });
  });

  describe('getUniqueStigRequirementCount', () => {
    it('should return count of unique titles', () => {
      const req: DetailedStigRequirement[] = [
        {
          stigId: 'V-111111',
          severity: 'CAT I',
          title: 'Title 1',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        },
        {
          stigId: 'V-222222',
          severity: 'CAT II',
          title: 'Title 1',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        },
        {
          stigId: 'V-333333',
          severity: 'CAT II',
          title: 'Title 2',
          description: 'Test',
          checkText: 'Test',
          fixText: 'Test',
          applicability: 'Applicable',
          status: 'Not Started',
          implementationStatus: 'Open',
          cciRef: ['CCI-000366']
        }
      ];

      storeStigRequirements('test_family', req);
      const result = getUniqueStigRequirementCount('test_family');

      expect(result).toBe(2);
    });

    it('should return 0 for non-existent family', () => {
      const result = getUniqueStigRequirementCount('non_existent');
      expect(result).toBe(0);
    });
  });
});
