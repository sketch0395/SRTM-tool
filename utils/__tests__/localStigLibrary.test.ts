/**
 * Unit tests for Local STIG Library utility functions
 */

import fs from 'fs';
import path from 'path';
import {
  getStigDirectory,
  hasLocalStig,
  getLocalStigMetadata,
  getLocalStigContent,
  listLocalStigs,
  getLocalStigStats,
  LocalStigMetadata
} from '../localStigLibrary';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('localStigLibrary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStigDirectory', () => {
    it('should return correct path to stigs directory', () => {
      const stigDir = getStigDirectory();
      expect(stigDir).toContain('public');
      expect(stigDir).toContain('stigs');
      expect(stigDir).toBe(path.join(process.cwd(), 'public', 'stigs'));
    });
  });

  describe('hasLocalStig', () => {
    it('should return true when STIG directory exists', () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      const result = hasLocalStig('ms_windows_server_2022_stig');
      
      expect(result).toBe(true);
      expect(mockedFs.existsSync).toHaveBeenCalled();
    });

    it('should return false when STIG directory does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);
      
      const result = hasLocalStig('non_existent_stig');
      
      expect(result).toBe(false);
      expect(mockedFs.existsSync).toHaveBeenCalled();
    });

    it('should check correct path', () => {
      mockedFs.existsSync.mockReturnValue(true);
      
      hasLocalStig('test_stig');
      
      const expectedPath = path.join(getStigDirectory(), 'test_stig');
      expect(mockedFs.existsSync).toHaveBeenCalledWith(expectedPath);
    });
  });

  describe('getLocalStigMetadata', () => {
    it('should return metadata when metadata.json exists', () => {
      const mockMetadata = {
        stigId: 'test_stig',
        name: 'Test STIG',
        version: 'V1R1',
        releaseDate: '2025-01-01',
        filename: 'test.xml',
        format: 'xml' as const
      };

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockMetadata));

      const result = getLocalStigMetadata('test_stig');

      expect(result).toEqual(mockMetadata);
      expect(mockedFs.readFileSync).toHaveBeenCalled();
    });

    it('should auto-detect XML file when no metadata exists', () => {
      mockedFs.existsSync.mockImplementation((path: any) => {
        // metadata.json doesn't exist, but stig directory does
        return !path.toString().includes('metadata.json');
      });
      mockedFs.readdirSync.mockReturnValue(['test.xml'] as any);

      const result = getLocalStigMetadata('test_stig');

      expect(result).toBeTruthy();
      expect(result?.stigId).toBe('test_stig');
      expect(result?.filename).toBe('test.xml');
      expect(result?.format).toBe('xml');
    });

    it('should auto-detect CSV file when no metadata exists', () => {
      mockedFs.existsSync.mockImplementation((path: any) => {
        return !path.toString().includes('metadata.json');
      });
      mockedFs.readdirSync.mockReturnValue(['test.csv'] as any);

      const result = getLocalStigMetadata('test_stig');

      expect(result).toBeTruthy();
      expect(result?.stigId).toBe('test_stig');
      expect(result?.filename).toBe('test.csv');
      expect(result?.format).toBe('csv');
    });

    it('should return null when STIG does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = getLocalStigMetadata('non_existent_stig');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', () => {
      mockedFs.existsSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = getLocalStigMetadata('test_stig');

      expect(result).toBeNull();
    });

    it('should format STIG name correctly from ID', () => {
      mockedFs.existsSync.mockImplementation((path: any) => {
        return !path.toString().includes('metadata.json');
      });
      mockedFs.readdirSync.mockReturnValue(['test.xml'] as any);

      const result = getLocalStigMetadata('windows_server_2022_stig');

      expect(result?.name).toContain('Windows');
      expect(result?.name).toContain('Server');
      expect(result?.name).toContain('2022');
      expect(result?.name).toContain('Stig');
    });
  });

  describe('getLocalStigContent', () => {
    it('should return file content when STIG exists', () => {
      const mockMetadata = {
        stigId: 'test_stig',
        name: 'Test STIG',
        version: 'V1R1',
        releaseDate: '2025-01-01',
        filename: 'test.xml',
        format: 'xml' as const
      };
      const mockContent = '<xml>STIG content</xml>';

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify(mockMetadata));
      mockedFs.readFileSync.mockReturnValueOnce(mockContent);

      const result = getLocalStigContent('test_stig');

      expect(result).toBe(mockContent);
    });

    it('should return null when STIG does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = getLocalStigContent('non_existent_stig');

      expect(result).toBeNull();
    });

    it('should return null when file does not exist', () => {
      const mockMetadata = {
        stigId: 'test_stig',
        name: 'Test STIG',
        version: 'V1R1',
        releaseDate: '2025-01-01',
        filename: 'test.xml',
        format: 'xml' as const
      };

      mockedFs.existsSync.mockImplementation((path: any) => {
        // Metadata exists, but file doesn't
        return path.toString().includes('metadata.json');
      });
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockMetadata));

      const result = getLocalStigContent('test_stig');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('Read error');
      });

      const result = getLocalStigContent('test_stig');

      expect(result).toBeNull();
    });
  });

  describe('listLocalStigs', () => {
    it('should return list of all STIGs', () => {
      const mockDirents = [
        { name: 'stig1', isDirectory: () => true },
        { name: 'stig2', isDirectory: () => true },
        { name: 'file.txt', isDirectory: () => false }
      ];

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(mockDirents as any);
      mockedFs.readFileSync.mockImplementation((path: any) => {
        if (path.includes('stig1')) {
          return JSON.stringify({
            stigId: 'stig1',
            name: 'STIG 1',
            version: 'V1R1',
            releaseDate: '2025-01-01',
            filename: 'stig1.xml',
            format: 'xml'
          });
        }
        return JSON.stringify({
          stigId: 'stig2',
          name: 'STIG 2',
          version: 'V1R1',
          releaseDate: '2025-01-01',
          filename: 'stig2.xml',
          format: 'xml'
        });
      });

      const result = listLocalStigs();

      expect(result).toHaveLength(2);
      expect(result[0].stigId).toBe('stig1');
      expect(result[1].stigId).toBe('stig2');
    });

    it('should return empty array when directory does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = listLocalStigs();

      expect(result).toEqual([]);
    });

    it('should sort STIGs alphabetically by name', () => {
      const mockDirents = [
        { name: 'zebra', isDirectory: () => true },
        { name: 'alpha', isDirectory: () => true }
      ];

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(mockDirents as any);
      mockedFs.readFileSync.mockImplementation((path: any) => {
        if (path.includes('zebra')) {
          return JSON.stringify({
            stigId: 'zebra',
            name: 'Zebra STIG',
            version: 'V1R1',
            releaseDate: '2025-01-01',
            filename: 'z.xml',
            format: 'xml'
          });
        }
        return JSON.stringify({
          stigId: 'alpha',
          name: 'Alpha STIG',
          version: 'V1R1',
          releaseDate: '2025-01-01',
          filename: 'a.xml',
          format: 'xml'
        });
      });

      const result = listLocalStigs();

      expect(result[0].name).toBe('Alpha STIG');
      expect(result[1].name).toBe('Zebra STIG');
    });

    it('should handle errors gracefully', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockImplementation(() => {
        throw new Error('Read error');
      });

      const result = listLocalStigs();

      expect(result).toEqual([]);
    });
  });

  describe('getLocalStigStats', () => {
    it('should return correct statistics', () => {
      const mockDirents = [
        { name: 'stig1', isDirectory: () => true },
        { name: 'stig2', isDirectory: () => true },
        { name: 'stig3', isDirectory: () => true }
      ];

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue(mockDirents as any);
      mockedFs.readFileSync.mockImplementation((path: any) => {
        if (path.includes('stig1')) {
          return JSON.stringify({
            stigId: 'stig1',
            name: 'STIG 1',
            version: 'V1R1',
            releaseDate: '2025-01-01',
            filename: 'stig1.xml',
            format: 'xml'
          });
        }
        if (path.includes('stig2')) {
          return JSON.stringify({
            stigId: 'stig2',
            name: 'STIG 2',
            version: 'V1R1',
            releaseDate: '2025-01-01',
            filename: 'stig2.xml',
            format: 'xml'
          });
        }
        return JSON.stringify({
          stigId: 'stig3',
          name: 'STIG 3',
          version: 'V1R1',
          releaseDate: '2025-01-01',
          filename: 'stig3.csv',
          format: 'csv'
        });
      });

      const result = getLocalStigStats();

      expect(result.total).toBe(3);
      expect(result.byFormat.xml).toBe(2);
      expect(result.byFormat.csv).toBe(1);
      expect(result.stigs).toHaveLength(3);
      expect(result.stigs[0]).toHaveProperty('id');
      expect(result.stigs[0]).toHaveProperty('name');
      expect(result.stigs[0]).toHaveProperty('version');
    });

    it('should return zero counts for empty directory', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = getLocalStigStats();

      expect(result.total).toBe(0);
      expect(result.byFormat.xml).toBe(0);
      expect(result.byFormat.csv).toBe(0);
      expect(result.stigs).toEqual([]);
    });
  });
});
