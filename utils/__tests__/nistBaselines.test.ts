/**
 * Unit tests for NIST Baselines utility functions
 */

import {
  getControlFamily,
  getFullFamilyName,
  isControlInBaseline,
  NIST_CONTROL_BASELINES,
  CONTROL_FAMILY_NAMES
} from '../nistBaselines';

describe('nistBaselines', () => {
  describe('getControlFamily', () => {
    it('should extract family code from simple control ID', () => {
      expect(getControlFamily('AC-1')).toBe('AC');
      expect(getControlFamily('AU-2')).toBe('AU');
      expect(getControlFamily('SC-7')).toBe('SC');
    });

    it('should extract family code from control ID with enhancements', () => {
      expect(getControlFamily('AC-2(1)')).toBe('AC');
      expect(getControlFamily('AU-6(3)')).toBe('AU');
      expect(getControlFamily('SC-7(21)')).toBe('SC');
    });

    it('should handle multi-digit control numbers', () => {
      expect(getControlFamily('CM-10')).toBe('CM');
      expect(getControlFamily('SI-12')).toBe('SI');
    });

    it('should handle two-letter family codes', () => {
      expect(getControlFamily('IA-5')).toBe('IA');
      expect(getControlFamily('IR-8')).toBe('IR');
      expect(getControlFamily('PT-7')).toBe('PT');
    });
  });

  describe('getFullFamilyName', () => {
    it('should return full name for valid family codes', () => {
      expect(getFullFamilyName('AC')).toBe('Access Control');
      expect(getFullFamilyName('AU')).toBe('Audit and Accountability');
      expect(getFullFamilyName('SC')).toBe('System and Communications Protection');
      expect(getFullFamilyName('SI')).toBe('System and Information Integrity');
    });

    it('should return the code itself for unknown family codes', () => {
      expect(getFullFamilyName('XX')).toBe('XX');
      expect(getFullFamilyName('ZZ')).toBe('ZZ');
    });

    it('should handle all valid NIST family codes', () => {
      Object.keys(CONTROL_FAMILY_NAMES).forEach(code => {
        const name = getFullFamilyName(code);
        expect(name).toBe(CONTROL_FAMILY_NAMES[code]);
        expect(name).not.toBe(code);
      });
    });
  });

  describe('isControlInBaseline', () => {
    describe('Low baseline', () => {
      it('should return true for controls in Low baseline', () => {
        expect(isControlInBaseline('AC-1', 'Low')).toBe(true);
        expect(isControlInBaseline('AU-2', 'Low')).toBe(true);
        expect(isControlInBaseline('SC-7', 'Low')).toBe(true);
      });

      it('should return false for controls not in Low baseline', () => {
        expect(isControlInBaseline('AC-2(1)', 'Low')).toBe(false);
        expect(isControlInBaseline('AU-3(1)', 'Low')).toBe(false);
      });

      it('should handle enhanced controls in Low baseline', () => {
        expect(isControlInBaseline('AT-2(2)', 'Low')).toBe(true);
        expect(isControlInBaseline('IA-2(1)', 'Low')).toBe(true);
      });
    });

    describe('Moderate baseline', () => {
      it('should return true for controls in Moderate baseline', () => {
        expect(isControlInBaseline('AC-1', 'Moderate')).toBe(true);
        expect(isControlInBaseline('AC-2(1)', 'Moderate')).toBe(true);
        expect(isControlInBaseline('AU-3(1)', 'Moderate')).toBe(true);
      });

      it('should return false for controls not in Moderate baseline', () => {
        expect(isControlInBaseline('AC-2(6)', 'Moderate')).toBe(false);
      });

      it('should include all Low baseline controls', () => {
        NIST_CONTROL_BASELINES.Low.forEach(control => {
          expect(isControlInBaseline(control, 'Moderate')).toBe(true);
        });
      });
    });

    describe('High baseline', () => {
      it('should return true for controls in High baseline', () => {
        expect(isControlInBaseline('AC-1', 'High')).toBe(true);
        expect(isControlInBaseline('AC-2(1)', 'High')).toBe(true);
        // AC-2(6) might not be in High baseline - test with a control we know exists
        expect(isControlInBaseline('AC-3', 'High')).toBe(true);
      });

      it('should include all Moderate baseline controls', () => {
        NIST_CONTROL_BASELINES.Moderate.forEach(control => {
          expect(isControlInBaseline(control, 'High')).toBe(true);
        });
      });

      it('should include all Low baseline controls', () => {
        NIST_CONTROL_BASELINES.Low.forEach(control => {
          expect(isControlInBaseline(control, 'High')).toBe(true);
        });
      });
    });

    it('should return false for non-existent controls', () => {
      expect(isControlInBaseline('XX-999', 'Low')).toBe(false);
      expect(isControlInBaseline('XX-999', 'Moderate')).toBe(false);
      expect(isControlInBaseline('XX-999', 'High')).toBe(false);
    });
  });

  describe('NIST_CONTROL_BASELINES structure', () => {
    it('should have three baseline levels', () => {
      expect(NIST_CONTROL_BASELINES).toHaveProperty('Low');
      expect(NIST_CONTROL_BASELINES).toHaveProperty('Moderate');
      expect(NIST_CONTROL_BASELINES).toHaveProperty('High');
    });

    it('should have arrays of controls for each baseline', () => {
      expect(Array.isArray(NIST_CONTROL_BASELINES.Low)).toBe(true);
      expect(Array.isArray(NIST_CONTROL_BASELINES.Moderate)).toBe(true);
      expect(Array.isArray(NIST_CONTROL_BASELINES.High)).toBe(true);
    });

    it('should have non-empty baselines', () => {
      expect(NIST_CONTROL_BASELINES.Low.length).toBeGreaterThan(0);
      expect(NIST_CONTROL_BASELINES.Moderate.length).toBeGreaterThan(0);
      expect(NIST_CONTROL_BASELINES.High.length).toBeGreaterThan(0);
    });

    it('should have Moderate baseline larger than Low', () => {
      expect(NIST_CONTROL_BASELINES.Moderate.length).toBeGreaterThan(
        NIST_CONTROL_BASELINES.Low.length
      );
    });

    it('should have High baseline larger than Moderate', () => {
      expect(NIST_CONTROL_BASELINES.High.length).toBeGreaterThan(
        NIST_CONTROL_BASELINES.Moderate.length
      );
    });
  });

  describe('CONTROL_FAMILY_NAMES structure', () => {
    it('should contain all standard NIST 800-53 families', () => {
      const expectedFamilies = [
        'AC', 'AT', 'AU', 'CA', 'CM', 'CP', 'IA', 'IR', 
        'MA', 'MP', 'PE', 'PL', 'PM', 'PS', 'PT', 'RA', 
        'SA', 'SC', 'SI', 'SR'
      ];

      expectedFamilies.forEach(family => {
        expect(CONTROL_FAMILY_NAMES).toHaveProperty(family);
        expect(CONTROL_FAMILY_NAMES[family]).toBeTruthy();
        expect(typeof CONTROL_FAMILY_NAMES[family]).toBe('string');
      });
    });

    it('should have descriptive names for all families', () => {
      Object.entries(CONTROL_FAMILY_NAMES).forEach(([code, name]) => {
        expect(name.length).toBeGreaterThan(code.length);
        expect(name).not.toBe(code);
      });
    });
  });
});
