/**
 * Unit tests for STIG Family Recommendations engine
 */

import {
  getStigFamilyRecommendations,
  getImplementationEffort,
  STIG_FAMILIES,
  StigFamily
} from '../stigFamilyRecommendations';
import { SecurityRequirement, SystemDesignElement } from '../../types/srtm';

// Helper function to create test security requirements
function createTestRequirement(overrides: Partial<SecurityRequirement> = {}): SecurityRequirement {
  return {
    id: '1',
    title: 'Test Requirement',
    description: 'Test description',
    category: 'Other',
    priority: 'High',
    source: 'NIST 800-53',
    status: 'Draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

// Helper function to create test design elements
function createTestDesignElement(overrides: Partial<SystemDesignElement> = {}): SystemDesignElement {
  return {
    id: '1',
    name: 'Test Element',
    description: 'Test description',
    type: 'Service',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

describe('stigFamilyRecommendations', () => {
  describe('STIG_FAMILIES catalog', () => {
    it('should contain validated STIG families', () => {
      expect(STIG_FAMILIES.length).toBeGreaterThan(0);
      
      STIG_FAMILIES.forEach(stig => {
        expect(stig).toHaveProperty('id');
        expect(stig).toHaveProperty('name');
        expect(stig).toHaveProperty('version');
        expect(stig).toHaveProperty('releaseDate');
        expect(stig).toHaveProperty('description');
        expect(stig).toHaveProperty('applicableSystemTypes');
        expect(stig).toHaveProperty('triggerKeywords');
        expect(stig).toHaveProperty('controlFamilies');
        expect(stig).toHaveProperty('priority');
        expect(stig).toHaveProperty('actualRequirements');
        expect(stig).toHaveProperty('stigId');
        expect(stig).toHaveProperty('validated');
      });
    });

    it('should have valid priority values', () => {
      STIG_FAMILIES.forEach(stig => {
        expect(['High', 'Medium', 'Low']).toContain(stig.priority);
      });
    });

    it('should have positive requirement counts', () => {
      STIG_FAMILIES.forEach(stig => {
        expect(stig.actualRequirements).toBeGreaterThan(0);
      });
    });

    it('should have Application Security STIG', () => {
      const appSecStig = STIG_FAMILIES.find(s => s.id === 'asd_stig');
      expect(appSecStig).toBeDefined();
      expect(appSecStig?.name).toContain('Application Security');
    });
  });

  describe('getStigFamilyRecommendations', () => {
    it('should return empty array when no requirements or design elements', () => {
      const result = getStigFamilyRecommendations([], []);
      
      // Should return all STIGs but with 0 relevance scores
      expect(result.every(r => r.relevanceScore === 0)).toBe(true);
    });

    it('should recommend Windows STIG for Windows requirements', () => {
      const requirements: SecurityRequirement[] = [
        createTestRequirement({
          title: 'Windows Server Security',
          description: 'Secure Windows Server 2022',
          category: 'System Integrity',
          controlFamily: 'AC'
        })
      ];

      const designElements: SystemDesignElement[] = [
        createTestDesignElement({
          name: 'Windows Server',
          description: 'Windows Server 2022 domain controller',
          type: 'Service',
          technology: 'Windows'
        })
      ];

      const result = getStigFamilyRecommendations(requirements, designElements);
      
      const windowsStig = result.find(r => r.stigFamily.id.includes('windows'));
      expect(windowsStig).toBeDefined();
      expect(windowsStig!.relevanceScore).toBeGreaterThan(0);
    });

    it('should recommend Application Security STIG for Node.js applications', () => {
      const requirements: SecurityRequirement[] = [
        createTestRequirement({
          title: 'Application Security',
          description: 'Secure Node.js application',
          category: 'Other',
          controlFamily: 'SC'
        })
      ];

      const designElements: SystemDesignElement[] = [
        createTestDesignElement({
          name: 'API Server',
          description: 'Node.js REST API',
          type: 'API',
          technology: 'Node.js'
        })
      ];

      const result = getStigFamilyRecommendations(requirements, designElements);
      
      const appSecStig = result.find(r => r.stigFamily.id === 'asd_stig');
      expect(appSecStig).toBeDefined();
      expect(appSecStig!.relevanceScore).toBeGreaterThan(0);
    });

    it('should recommend PostgreSQL STIG for PostgreSQL databases', () => {
      const requirements: SecurityRequirement[] = [
        createTestRequirement({
          title: 'Database Security',
          description: 'Secure PostgreSQL database',
          category: 'Data Protection',
          controlFamily: 'SC'
        })
      ];

      const designElements: SystemDesignElement[] = [
        createTestDesignElement({
          name: 'Database Server',
          description: 'PostgreSQL database',
          type: 'Database',
          technology: 'PostgreSQL'
        })
      ];

      const result = getStigFamilyRecommendations(requirements, designElements);
      
      const postgresStig = result.find(r => 
        r.stigFamily.name.toLowerCase().includes('postgresql')
      );
      expect(postgresStig).toBeDefined();
      expect(postgresStig!.relevanceScore).toBeGreaterThan(0);
    });

    it('should sort recommendations by relevance score', () => {
      const requirements: SecurityRequirement[] = [
        createTestRequirement({
          title: 'Web Application Security',
          description: 'Secure web application with Node.js and PostgreSQL',
          category: 'Other',
          controlFamily: 'SC'
        })
      ];

      const designElements: SystemDesignElement[] = [
        createTestDesignElement({
          name: 'Web API',
          description: 'Node.js web application',
          type: 'API',
          technology: 'Node.js'
        })
      ];

      const result = getStigFamilyRecommendations(requirements, designElements);
      
      // Should be sorted by relevance score descending
      for (let i = 0; i < result.length - 1; i++) {
        if (result[i].relevanceScore !== result[i + 1].relevanceScore) {
          expect(result[i].relevanceScore).toBeGreaterThanOrEqual(
            result[i + 1].relevanceScore
          );
        }
      }
    });

    it('should provide reasoning for recommendations', () => {
      const requirements: SecurityRequirement[] = [
        createTestRequirement({
          title: 'Application Security',
          description: 'Web application security',
          category: 'Other',
          controlFamily: 'SC'
        })
      ];

      const designElements: SystemDesignElement[] = [
        createTestDesignElement({
          name: 'Web App',
          description: 'Web application',
          type: 'API',
          technology: 'Node.js'
        })
      ];

      const result = getStigFamilyRecommendations(requirements, designElements);
      
      const relevantRecs = result.filter(r => r.relevanceScore > 0);
      relevantRecs.forEach(rec => {
        expect(rec.reasoning.length).toBeGreaterThan(0);
      });
    });

    it('should calculate confidence scores', () => {
      const requirements: SecurityRequirement[] = [
        createTestRequirement({
          title: 'Application Security',
          description: 'Secure Node.js application',
          category: 'Other',
          controlFamily: 'SC'
        })
      ];

      const designElements: SystemDesignElement[] = [
        createTestDesignElement({
          name: 'Node.js API',
          description: 'REST API with Node.js',
          type: 'API',
          technology: 'Node.js'
        })
      ];

      const result = getStigFamilyRecommendations(requirements, designElements);
      
      result.forEach(rec => {
        expect(rec.confidenceScore).toBeGreaterThanOrEqual(0);
        expect(rec.confidenceScore).toBeLessThanOrEqual(100);
      });
    });

    it('should provide score breakdown', () => {
      const requirements: SecurityRequirement[] = [
        createTestRequirement({
          title: 'Application Security',
          description: 'Web application',
          category: 'Other',
          controlFamily: 'AC'
        })
      ];

      const designElements: SystemDesignElement[] = [];

      const result = getStigFamilyRecommendations(requirements, designElements);
      
      result.forEach(rec => {
        expect(rec.scoreBreakdown).toHaveProperty('keywordMatches');
        expect(rec.scoreBreakdown).toHaveProperty('controlFamilyMatches');
        expect(rec.scoreBreakdown).toHaveProperty('designElementMatches');
        expect(rec.scoreBreakdown).toHaveProperty('technologySpecificBonus');
        expect(rec.scoreBreakdown).toHaveProperty('environmentBonus');
        expect(rec.scoreBreakdown).toHaveProperty('penalties');
      });
    });

    it('should assign implementation priorities', () => {
      const requirements: SecurityRequirement[] = [
        createTestRequirement({
          title: 'Web Application Security',
          description: 'Secure web application',
          category: 'Other',
          controlFamily: 'SC'
        })
      ];

      const designElements: SystemDesignElement[] = [
        createTestDesignElement({
          name: 'Web Application',
          description: 'Node.js web application',
          type: 'API',
          technology: 'Node.js'
        })
      ];

      const result = getStigFamilyRecommendations(requirements, designElements);
      
      result.forEach(rec => {
        expect(['Critical', 'High', 'Medium', 'Low']).toContain(
          rec.implementationPriority
        );
      });
    });

    it('should match control families from requirements', () => {
      const requirements: SecurityRequirement[] = [
        createTestRequirement({
          title: 'Access Control',
          description: 'AC controls',
          category: 'Access Control',
          controlFamily: 'AC'
        })
      ];

      const designElements: SystemDesignElement[] = [];

      const result = getStigFamilyRecommendations(requirements, designElements);
      
      // STIGs with AC control family should have higher scores
      const stigsWithAC = result.filter(r => 
        r.stigFamily.controlFamilies.includes('AC') && r.relevanceScore > 0
      );
      expect(stigsWithAC.length).toBeGreaterThan(0);
    });
  });

  describe('getImplementationEffort', () => {
    it('should calculate total requirements', () => {
      const mockRecommendations = [
        {
          stigFamily: {
            id: 'test1',
            name: 'Test STIG 1',
            version: 'V1R1',
            releaseDate: '2025-01-01',
            description: 'Test',
            applicableSystemTypes: ['Test'],
            triggerKeywords: ['test'],
            controlFamilies: ['AC'],
            priority: 'High' as const,
            actualRequirements: 100,
            stigId: 'test1',
            validated: true
          },
          relevanceScore: 10,
          confidenceScore: 80,
          matchingRequirements: [],
          matchingDesignElements: [],
          reasoning: [],
          implementationPriority: 'High' as const,
          scoreBreakdown: {
            keywordMatches: 10,
            controlFamilyMatches: 0,
            designElementMatches: 0,
            technologySpecificBonus: 0,
            environmentBonus: 0,
            penalties: 0
          }
        },
        {
          stigFamily: {
            id: 'test2',
            name: 'Test STIG 2',
            version: 'V1R1',
            releaseDate: '2025-01-01',
            description: 'Test',
            applicableSystemTypes: ['Test'],
            triggerKeywords: ['test'],
            controlFamilies: ['AC'],
            priority: 'Medium' as const,
            actualRequirements: 50,
            stigId: 'test2',
            validated: true
          },
          relevanceScore: 5,
          confidenceScore: 60,
          matchingRequirements: [],
          matchingDesignElements: [],
          reasoning: [],
          implementationPriority: 'Medium' as const,
          scoreBreakdown: {
            keywordMatches: 5,
            controlFamilyMatches: 0,
            designElementMatches: 0,
            technologySpecificBonus: 0,
            environmentBonus: 0,
            penalties: 0
          }
        }
      ];

      const result = getImplementationEffort(mockRecommendations);

      expect(result.totalRequirements).toBe(150);
    });

    it('should estimate hours and days', () => {
      const mockRecommendations = [
        {
          stigFamily: {
            id: 'test1',
            name: 'Test STIG',
            version: 'V1R1',
            releaseDate: '2025-01-01',
            description: 'Test',
            applicableSystemTypes: ['Test'],
            triggerKeywords: ['test'],
            controlFamilies: ['AC'],
            priority: 'High' as const,
            actualRequirements: 100,
            stigId: 'test1',
            validated: true
          },
          relevanceScore: 10,
          confidenceScore: 80,
          matchingRequirements: [],
          matchingDesignElements: [],
          reasoning: [],
          implementationPriority: 'High' as const,
          scoreBreakdown: {
            keywordMatches: 10,
            controlFamilyMatches: 0,
            designElementMatches: 0,
            technologySpecificBonus: 0,
            environmentBonus: 0,
            penalties: 0
          }
        }
      ];

      const result = getImplementationEffort(mockRecommendations);

      expect(result.estimatedHours).toBeGreaterThan(0);
      expect(result.estimatedDays).toBeGreaterThan(0);
      // 100 requirements * 1.5 hours = 150 hours
      expect(result.estimatedHours).toBe(150);
      // 150 hours / 8 hours per day = 19 days (rounded up)
      expect(result.estimatedDays).toBe(19);
    });

    it('should count priorities correctly', () => {
      const mockRecommendations = [
        {
          stigFamily: {
            id: 'test1',
            name: 'Test 1',
            version: 'V1R1',
            releaseDate: '2025-01-01',
            description: 'Test',
            applicableSystemTypes: ['Test'],
            triggerKeywords: ['test'],
            controlFamilies: ['AC'],
            priority: 'High' as const,
            actualRequirements: 100,
            stigId: 'test1',
            validated: true
          },
          relevanceScore: 10,
          confidenceScore: 80,
          matchingRequirements: [],
          matchingDesignElements: [],
          reasoning: [],
          implementationPriority: 'Critical' as const,
          scoreBreakdown: {
            keywordMatches: 10,
            controlFamilyMatches: 0,
            designElementMatches: 0,
            technologySpecificBonus: 0,
            environmentBonus: 0,
            penalties: 0
          }
        },
        {
          stigFamily: {
            id: 'test2',
            name: 'Test 2',
            version: 'V1R1',
            releaseDate: '2025-01-01',
            description: 'Test',
            applicableSystemTypes: ['Test'],
            triggerKeywords: ['test'],
            controlFamilies: ['AC'],
            priority: 'Medium' as const,
            actualRequirements: 50,
            stigId: 'test2',
            validated: true
          },
          relevanceScore: 5,
          confidenceScore: 60,
          matchingRequirements: [],
          matchingDesignElements: [],
          reasoning: [],
          implementationPriority: 'High' as const,
          scoreBreakdown: {
            keywordMatches: 5,
            controlFamilyMatches: 0,
            designElementMatches: 0,
            technologySpecificBonus: 0,
            environmentBonus: 0,
            penalties: 0
          }
        },
        {
          stigFamily: {
            id: 'test3',
            name: 'Test 3',
            version: 'V1R1',
            releaseDate: '2025-01-01',
            description: 'Test',
            applicableSystemTypes: ['Test'],
            triggerKeywords: ['test'],
            controlFamilies: ['AC'],
            priority: 'Low' as const,
            actualRequirements: 25,
            stigId: 'test3',
            validated: true
          },
          relevanceScore: 2,
          confidenceScore: 40,
          matchingRequirements: [],
          matchingDesignElements: [],
          reasoning: [],
          implementationPriority: 'Medium' as const,
          scoreBreakdown: {
            keywordMatches: 2,
            controlFamilyMatches: 0,
            designElementMatches: 0,
            technologySpecificBonus: 0,
            environmentBonus: 0,
            penalties: 0
          }
        }
      ];

      const result = getImplementationEffort(mockRecommendations);

      expect(result.priorityCounts.critical).toBe(1);
      expect(result.priorityCounts.high).toBe(1);
      expect(result.priorityCounts.medium).toBe(1);
      expect(result.priorityCounts.low).toBe(0);
    });

    it('should handle empty recommendations', () => {
      const result = getImplementationEffort([]);

      expect(result.totalRequirements).toBe(0);
      expect(result.estimatedHours).toBe(0);
      expect(result.estimatedDays).toBe(0);
      expect(result.priorityCounts.critical).toBe(0);
      expect(result.priorityCounts.high).toBe(0);
      expect(result.priorityCounts.medium).toBe(0);
      expect(result.priorityCounts.low).toBe(0);
    });
  });
});
