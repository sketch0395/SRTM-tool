/**
 * Local STIG Library Management
 * Handles reading and serving STIG files from the local public/stigs directory
 */

import fs from 'fs';
import path from 'path';

export interface LocalStigMetadata {
  stigId: string;
  name: string;
  version: string;
  releaseDate: string;
  filename: string;
  format?: 'xml' | 'csv';
}

/**
 * Get the path to the local STIG directory
 */
export function getStigDirectory(): string {
  return path.join(process.cwd(), 'public', 'stigs');
}

/**
 * Check if a STIG exists in the local library
 */
export function hasLocalStig(stigId: string): boolean {
  const stigDir = path.join(getStigDirectory(), stigId);
  return fs.existsSync(stigDir);
}

/**
 * Get metadata for a local STIG
 */
export function getLocalStigMetadata(stigId: string): LocalStigMetadata | null {
  try {
    const metadataPath = path.join(getStigDirectory(), stigId, 'metadata.json');
    
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      return metadata;
    }
    
    // Try to auto-detect if no metadata file
    const stigDir = path.join(getStigDirectory(), stigId);
    if (fs.existsSync(stigDir)) {
      const files = fs.readdirSync(stigDir);
      const xmlFile = files.find(f => f.endsWith('.xml') || f.endsWith('.xccdf'));
      const csvFile = files.find(f => f.endsWith('.csv'));
      
      if (xmlFile || csvFile) {
        return {
          stigId,
          name: stigId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          version: 'Unknown',
          releaseDate: new Date().toISOString().split('T')[0],
          filename: xmlFile || csvFile || '',
          format: xmlFile ? 'xml' : 'csv'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error reading metadata for ${stigId}:`, error);
    return null;
  }
}

/**
 * Read local STIG file content
 */
export function getLocalStigContent(stigId: string): string | null {
  try {
    const metadata = getLocalStigMetadata(stigId);
    if (!metadata) return null;
    
    const filePath = path.join(getStigDirectory(), stigId, metadata.filename);
    
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    
    return null;
  } catch (error) {
    console.error(`Error reading STIG file for ${stigId}:`, error);
    return null;
  }
}

/**
 * List all available local STIGs
 */
export function listLocalStigs(): LocalStigMetadata[] {
  try {
    const stigsDir = getStigDirectory();
    
    if (!fs.existsSync(stigsDir)) {
      return [];
    }
    
    const directories = fs.readdirSync(stigsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    const stigs: LocalStigMetadata[] = [];
    
    for (const stigId of directories) {
      const metadata = getLocalStigMetadata(stigId);
      if (metadata) {
        stigs.push(metadata);
      }
    }
    
    return stigs.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error listing local STIGs:', error);
    return [];
  }
}

/**
 * Get statistics about local STIG library
 */
export function getLocalStigStats() {
  const stigs = listLocalStigs();
  
  return {
    total: stigs.length,
    byFormat: {
      xml: stigs.filter(s => s.format === 'xml').length,
      csv: stigs.filter(s => s.format === 'csv').length
    },
    stigs: stigs.map(s => ({
      id: s.stigId,
      name: s.name,
      version: s.version
    }))
  };
}
