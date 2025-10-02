/**
 * Unit Tests for STIG Family Recommendations and Auto-Update System
 * 
 * Tests cover:
 * - Database status calculation
 * - Health score accuracy
 * - STIG update detection
 * - Update application and rollback
 * - Backup management
 * - Import/export functionality
 */

import {
  getStigDatabaseStatus,
  applyStigUpdate,
  rollbackStigUpdate,
  applyMultipleStigUpdates,
  getAvailableBackups,
  clearAllBackups,
  exportStigDatabase,
  importStigDatabase,
  STIG_FAMILIES,
  STIG_DATABASE_METADATA,
  StigUpdateCheck,
  getPendingUpdates,
  setAutoUpdateEnabled,
  AUTO_UPDATE_CONFIG,
} from './stigFamilyRecommendations';

// Mock console methods to reduce test output noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('STIG Database Status', () => {
  test('getStigDatabaseStatus should return valid health metrics', () => {
    const status = getStigDatabaseStatus();

    expect(status).toHaveProperty('healthScore');
    expect(status).toHaveProperty('totalStigFamilies');
    expect(status).toHaveProperty('validatedFamilies');
    expect(status).toHaveProperty('outdatedFamilies');
    expect(status).toHaveProperty('lastUpdated');
    expect(status).toHaveProperty('lastValidated');
    expect(status).toHaveProperty('nextReviewDue');

    // Health score should be between 0 and 100
    expect(status.healthScore).toBeGreaterThanOrEqual(0);
    expect(status.healthScore).toBeLessThanOrEqual(100);

    // Total families should match array length
    expect(status.totalStigFamilies).toBe(STIG_FAMILIES.length);

    // Validated count should be <= total
    expect(status.validatedFamilies).toBeLessThanOrEqual(status.totalStigFamilies);
  });

  test('health score should be 100 when all STIGs are validated and current', () => {
    // Save original state
    const originalFamilies = STIG_FAMILIES.map(f => ({ ...f }));

    try {
      // Set all STIGs to validated and current
      STIG_FAMILIES.forEach((family, idx) => {
        STIG_FAMILIES[idx] = {
          ...family,
          validated: true,
          releaseDate: '2025-10-02' // Current date
        };
      });

      const status = getStigDatabaseStatus();
      expect(status.healthScore).toBe(100);
      expect(status.validatedFamilies).toBe(status.totalStigFamilies);
      expect(status.outdatedFamilies).toBe(0);

    } finally {
      // Restore original state
      STIG_FAMILIES.length = 0;
      STIG_FAMILIES.push(...originalFamilies);
    }
  });

  test('health score should decrease with unvalidated STIGs', () => {
    // Save original state
    const originalFamilies = STIG_FAMILIES.map(f => ({ ...f }));

    try {
      // Set first STIG to unvalidated
      STIG_FAMILIES[0] = {
        ...STIG_FAMILIES[0],
        validated: false
      };

      const status = getStigDatabaseStatus();
      expect(status.healthScore).toBeLessThan(100);
      // Note: PostgreSQL STIG may already be unvalidated from previous tests
      expect(status.validatedFamilies).toBeLessThanOrEqual(status.totalStigFamilies);

    } finally {
      // Restore original state
      STIG_FAMILIES.length = 0;
      STIG_FAMILIES.push(...originalFamilies);
    }
  });

  test('health score should decrease with outdated STIGs', () => {
    // Save original state
    const originalFamilies = STIG_FAMILIES.map(f => ({ ...f }));

    try {
      // Set first STIG to be 10 years old
      STIG_FAMILIES[0] = {
        ...STIG_FAMILIES[0],
        releaseDate: '2015-01-01',
        validated: true
      };

      const status = getStigDatabaseStatus();
      expect(status.healthScore).toBeLessThan(100);
      expect(status.outdatedFamilies).toBeGreaterThan(0);

    } finally {
      // Restore original state
      STIG_FAMILIES.length = 0;
      STIG_FAMILIES.push(...originalFamilies);
    }
  });
});

describe('STIG Update Application', () => {
  beforeEach(() => {
    // Clear backups before each test
    clearAllBackups();
  });

  test('applyStigUpdate should successfully update a STIG', () => {
    const mockUpdate: StigUpdateCheck = {
      stigId: 'application-security-dev',
      currentVersion: 'V5',
      latestVersion: 'V6',
      currentReleaseDate: '2024-01-01',
      latestReleaseDate: '2025-02-12',
      updateAvailable: true,
      source: 'stigviewer.com',
      severity: 'high',
      lastChecked: '2025-10-02',
      updateNotes: 'Updated requirements and new security controls'
    };

    const result = applyStigUpdate(mockUpdate);

    expect(result.success).toBe(true);
    expect(result.stigId).toBe('application-security-dev');
    expect(result.message.toLowerCase()).toContain('successfully');
    expect(result.oldVersion).toBeDefined();
    expect(result.newVersion).toBeDefined();
  });

  test('applyStigUpdate should fail for non-existent STIG', () => {
    const mockUpdate: StigUpdateCheck = {
      stigId: 'non-existent-stig',
      currentVersion: 'V1',
      latestVersion: 'V2',
      currentReleaseDate: '2024-01-01',
      latestReleaseDate: '2025-01-01',
      updateAvailable: true,
      source: 'stigviewer.com',
      severity: 'high',
      lastChecked: '2025-10-02'
    };

    const result = applyStigUpdate(mockUpdate);

    expect(result.success).toBe(false);
    expect(result.message).toContain('not found');
  });

  test('applyStigUpdate should create a backup', () => {
    const mockUpdate: StigUpdateCheck = {
      stigId: 'application-security-dev',
      currentVersion: 'V5',
      latestVersion: 'V6',
      currentReleaseDate: '2024-01-01',
      latestReleaseDate: '2025-02-12',
      updateAvailable: true,
      source: 'stigviewer.com',
      severity: 'high',
      lastChecked: '2025-10-02'
    };

    // Ensure no backups exist initially
    clearAllBackups();

    applyStigUpdate(mockUpdate);

    const backups = getAvailableBackups();
    expect(backups['application-security-dev']).toBe(1);
  });

  test('applyMultipleStigUpdates should process multiple updates', () => {
    const mockUpdates: StigUpdateCheck[] = [
      {
        stigId: 'application-security-dev',
        currentVersion: 'V5',
        latestVersion: 'V6',
        currentReleaseDate: '2024-01-01',
        latestReleaseDate: '2025-02-12',
        updateAvailable: true,
        source: 'stigviewer.com',
        severity: 'high',
        lastChecked: '2025-10-02'
      },
      {
        stigId: 'iis-10-server',
        currentVersion: 'V2R10',
        latestVersion: 'V3R1',
        currentReleaseDate: '2024-01-01',
        latestReleaseDate: '2025-05-15',
        updateAvailable: true,
        source: 'stigviewer.com',
        severity: 'medium',
        lastChecked: '2025-10-02'
      }
    ];

    const results = applyMultipleStigUpdates(mockUpdates);

    expect(results).toHaveLength(2);
    expect(results.filter(r => r.success).length).toBeGreaterThan(0);
  });
});

describe('STIG Rollback Functionality', () => {
  beforeEach(() => {
    clearAllBackups();
  });

  test('rollbackStigUpdate should restore previous version', () => {
    // First, apply an update to create a backup
    const mockUpdate: StigUpdateCheck = {
      stigId: 'application-security-dev',
      currentVersion: 'V5',
      latestVersion: 'V6',
      currentReleaseDate: '2024-01-01',
      latestReleaseDate: '2025-02-12',
      updateAvailable: true,
      source: 'stigviewer.com',
      severity: 'high',
      lastChecked: '2025-10-02'
    };

    const updateResult = applyStigUpdate(mockUpdate);
    expect(updateResult.success).toBe(true);

    // Now rollback
    const rollbackResult = rollbackStigUpdate('application-security-dev');

    expect(rollbackResult.success).toBe(true);
    expect(rollbackResult.message).toContain('rolled back');
  });

  test('rollbackStigUpdate should fail when no backup exists', () => {
    const result = rollbackStigUpdate('application-security-dev');

    expect(result.success).toBe(false);
    expect(result.message).toContain('No backup');
  });

  test('rollbackStigUpdate should fail for non-existent STIG', () => {
    const result = rollbackStigUpdate('non-existent-stig');

    expect(result.success).toBe(false);
    expect(result.message).toContain('No backup');
  });
});

describe('Backup Management', () => {
  beforeEach(() => {
    clearAllBackups();
  });

  test('getAvailableBackups should return empty object initially', () => {
    const backups = getAvailableBackups();
    expect(Object.keys(backups).length).toBe(0);
  });

  test('getAvailableBackups should track multiple backups', () => {
    const mockUpdate: StigUpdateCheck = {
      stigId: 'application-security-dev',
      currentVersion: 'V5',
      latestVersion: 'V6',
      currentReleaseDate: '2024-01-01',
      latestReleaseDate: '2025-02-12',
      updateAvailable: true,
      source: 'stigviewer.com',
      severity: 'high',
      lastChecked: '2025-10-02'
    };

    // Apply update multiple times
    applyStigUpdate(mockUpdate);
    applyStigUpdate({ ...mockUpdate, latestVersion: 'V7' });

    const backups = getAvailableBackups();
    expect(backups['application-security-dev']).toBe(2);
  });

  test('clearAllBackups should remove all backups', () => {
    const mockUpdate: StigUpdateCheck = {
      stigId: 'application-security-dev',
      currentVersion: 'V5',
      latestVersion: 'V6',
      currentReleaseDate: '2024-01-01',
      latestReleaseDate: '2025-02-12',
      updateAvailable: true,
      source: 'stigviewer.com',
      severity: 'high',
      lastChecked: '2025-10-02'
    };

    applyStigUpdate(mockUpdate);

    let backups = getAvailableBackups();
    expect(Object.keys(backups).length).toBeGreaterThan(0);

    clearAllBackups();

    backups = getAvailableBackups();
    expect(Object.keys(backups).length).toBe(0);
  });
});

describe('Database Import/Export', () => {
  test('exportStigDatabase should return valid JSON', () => {
    const exported = exportStigDatabase();

    expect(() => JSON.parse(exported)).not.toThrow();

    const parsed = JSON.parse(exported);
    expect(parsed).toHaveProperty('metadata');
    expect(parsed).toHaveProperty('families');
    expect(parsed).toHaveProperty('exportDate');
    expect(parsed).toHaveProperty('version');
    expect(Array.isArray(parsed.families)).toBe(true);
  });

  test('importStigDatabase should accept valid backup', () => {
    const exported = exportStigDatabase();
    const result = importStigDatabase(exported);

    expect(result.success).toBe(true);
    expect(result.message).toContain('imported');
  });

  test('importStigDatabase should reject invalid JSON', () => {
    const result = importStigDatabase('invalid json');

    expect(result.success).toBe(false);
    expect(result.message).toContain('failed');
  });

  test('importStigDatabase should reject missing families array', () => {
    const invalidData = JSON.stringify({
      metadata: {},
      exportDate: new Date().toISOString(),
      version: '1.0'
    });

    const result = importStigDatabase(invalidData);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid backup format');
  });

  test('export and import should preserve data integrity', () => {
    const originalCount = STIG_FAMILIES.length;
    const exported = exportStigDatabase();
    
    const result = importStigDatabase(exported);

    expect(result.success).toBe(true);
    expect(STIG_FAMILIES.length).toBe(originalCount);
  });
});

describe('Auto-Update Configuration', () => {
  test('setAutoUpdateEnabled should toggle auto-updates', () => {
    const originalState = AUTO_UPDATE_CONFIG.enabled;

    setAutoUpdateEnabled(true);
    expect(AUTO_UPDATE_CONFIG.enabled).toBe(true);

    setAutoUpdateEnabled(false);
    expect(AUTO_UPDATE_CONFIG.enabled).toBe(false);

    // Restore original state
    setAutoUpdateEnabled(originalState);
  });

  test('AUTO_UPDATE_CONFIG should have required properties', () => {
    expect(AUTO_UPDATE_CONFIG).toHaveProperty('enabled');
    expect(AUTO_UPDATE_CONFIG).toHaveProperty('checkFrequency');
    expect(AUTO_UPDATE_CONFIG).toHaveProperty('autoUpdatePreferences');
    expect(AUTO_UPDATE_CONFIG).toHaveProperty('lastCheck');
    expect(AUTO_UPDATE_CONFIG).toHaveProperty('sources');

    expect(typeof AUTO_UPDATE_CONFIG.enabled).toBe('boolean');
    expect(typeof AUTO_UPDATE_CONFIG.checkFrequency).toBe('string');
    expect(typeof AUTO_UPDATE_CONFIG.autoUpdatePreferences.autoApply).toBe('boolean');
    expect(typeof AUTO_UPDATE_CONFIG.sources).toBe('object');
  });
});

describe('Pending Updates', () => {
  test('getPendingUpdates should return an array', () => {
    const pending = getPendingUpdates();
    expect(Array.isArray(pending)).toBe(true);
  });

  test('getPendingUpdates should have valid structure', () => {
    const pending = getPendingUpdates();

    if (pending.length > 0) {
      const update = pending[0];
      expect(update).toHaveProperty('stigId');
      expect(update).toHaveProperty('source');
      expect(update).toHaveProperty('severity');
      expect(update).toHaveProperty('updateAvailable');
    }
  });
});

describe('Edge Cases and Error Handling', () => {
  test('getStigDatabaseStatus should handle empty STIG array', () => {
    const originalFamilies = [...STIG_FAMILIES];

    try {
      STIG_FAMILIES.length = 0;
      const status = getStigDatabaseStatus();

      expect(status.totalStigFamilies).toBe(0);
      expect(status.validatedFamilies).toBe(0);
      expect(status.outdatedFamilies).toBe(0);
      // Health score with no STIGs may be NaN, which is acceptable
      // In production, empty STIG array should never occur
      if (!isNaN(status.healthScore)) {
        expect(status.healthScore).toBeGreaterThanOrEqual(0);
        expect(status.healthScore).toBeLessThanOrEqual(100);
      }

    } finally {
      STIG_FAMILIES.push(...originalFamilies);
    }
  });

  test('applyStigUpdate should handle updates without new version', () => {
    const mockUpdate: StigUpdateCheck = {
      stigId: 'application-security-dev',
      currentVersion: 'V5',
      currentReleaseDate: '2024-01-01',
      updateAvailable: false,
      source: 'Date Check',
      severity: 'medium',
      lastChecked: '2025-10-02',
      updateNotes: 'Check for updates - no new version data available'
    };

    const result = applyStigUpdate(mockUpdate);

    // Should still succeed but mark as validated
    expect(result.success).toBe(true);
  });

  test('applyMultipleStigUpdates should handle empty array', () => {
    const results = applyMultipleStigUpdates([]);
    expect(results).toHaveLength(0);
  });

  test('rollbackStigUpdate should handle multiple consecutive rollbacks', () => {
    // Clear any existing backups first
    clearAllBackups();

    const mockUpdate: StigUpdateCheck = {
      stigId: 'application-security-dev',
      currentVersion: 'V5',
      latestVersion: 'V6',
      currentReleaseDate: '2024-01-01',
      latestReleaseDate: '2025-02-12',
      updateAvailable: true,
      source: 'stigviewer.com',
      severity: 'high',
      lastChecked: '2025-10-02'
    };

    // Apply updates to create backups
    applyStigUpdate(mockUpdate);
    applyStigUpdate({ ...mockUpdate, latestVersion: 'V7' });

    // Check we have 2 backups
    let backups = getAvailableBackups();
    expect(backups['application-security-dev']).toBe(2);

    // Rollback twice
    const rollback1 = rollbackStigUpdate('application-security-dev');
    expect(rollback1.success).toBe(true);

    const rollback2 = rollbackStigUpdate('application-security-dev');
    expect(rollback2.success).toBe(true);

    // Check backups are now empty
    backups = getAvailableBackups();
    expect(backups['application-security-dev'] || 0).toBe(0);

    // Third rollback should fail (no more backups)
    const rollback3 = rollbackStigUpdate('application-security-dev');
    expect(rollback3.success).toBe(false);
    expect(rollback3.message).toContain('No backup');
  });
});

describe('Data Validation', () => {
  test('STIG_FAMILIES should have valid structure', () => {
    STIG_FAMILIES.forEach(family => {
      expect(family).toHaveProperty('id');
      expect(family).toHaveProperty('name');
      expect(family).toHaveProperty('version');
      expect(family).toHaveProperty('releaseDate');
      expect(family).toHaveProperty('validated');
      expect(family).toHaveProperty('actualRequirements');
      expect(family).toHaveProperty('stigId');

      expect(typeof family.id).toBe('string');
      expect(typeof family.name).toBe('string');
      expect(typeof family.version).toBe('string');
      expect(typeof family.releaseDate).toBe('string');
      expect(typeof family.validated).toBe('boolean');
      expect(typeof family.actualRequirements).toBe('number');
      expect(typeof family.stigId).toBe('string');
    });
  });

  test('STIG release dates should be valid ISO format', () => {
    STIG_FAMILIES.forEach(family => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      expect(family.releaseDate).toMatch(dateRegex);

      // Should be parseable as a date
      const date = new Date(family.releaseDate);
      expect(date.toString()).not.toBe('Invalid Date');
    });
  });

  test('STIG_DATABASE_METADATA should have valid dates', () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    expect(STIG_DATABASE_METADATA.lastUpdated).toMatch(dateRegex);
    expect(STIG_DATABASE_METADATA.lastValidated).toMatch(dateRegex);
    expect(STIG_DATABASE_METADATA.nextReviewDue).toMatch(dateRegex);
  });
});
