import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import { hasLocalStig, getLocalStigContent, getLocalStigMetadata } from '@/utils/localStigLibrary';

/**
 * STIG Import API
 * Priority order:
 * 1. Check local STIG library (/public/stigs/)
 * 2. Fallback to stigviewer.com
 * 3. Accept manual upload
 * 
 * Note: stigviewer.com has SSL certificate issues, so we bypass cert validation
 */

interface StigRequirement {
  vulnId: string;
  ruleId: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  checkText: string;
  fixText: string;
  cci: string[];
  nistControls: string[];
}

interface StigImportResult {
  success: boolean;
  stigId: string;
  stigName: string;
  version: string;
  releaseDate: string;
  requirements: StigRequirement[];
  totalRequirements: number;
  source: 'stigviewer' | 'manual' | 'cache' | 'local';
  message?: string;
  error?: string;
}

/**
 * GET - Fetch STIG from local library or stigviewer.com
 * Query params: stigId (e.g., 'apache_server_2.4_unix')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stigId = searchParams.get('stigId');

    if (!stigId) {
      return NextResponse.json(
        { error: 'stigId parameter is required' },
        { status: 400 }
      );
    }

    // 🎯 PRIORITY 1: Check local STIG library first
    console.log(`🔍 Checking local STIG library for: ${stigId}`);
    
    if (hasLocalStig(stigId)) {
      console.log(`✅ Found STIG in local library: ${stigId}`);
      
      try {
        const metadata = getLocalStigMetadata(stigId);
        const content = getLocalStigContent(stigId);
        
        if (content && metadata) {
          console.log(`📄 Reading local STIG file: ${metadata.filename}`);
          
          // Determine format and parse accordingly
          const isXml = metadata.format === 'xml' || metadata.filename.toLowerCase().endsWith('.xml');
          
          if (isXml) {
            console.log(`🔄 Parsing local XML file...`);
            const stigData = parseXccdfXml(content, stigId);
            
            if (stigData.requirements.length > 0) {
              return NextResponse.json({
                success: true,
                ...stigData,
                version: metadata.version,
                releaseDate: metadata.releaseDate,
                source: 'local',
                message: `✅ Successfully imported ${stigData.requirements.length} requirements from local library (${metadata.filename})`
              } as StigImportResult);
            }
          } else {
            console.log(`🔄 Parsing local CSV file...`);
            const stigData = parseStigCsv(content, stigId);
            
            if (stigData.requirements.length > 0) {
              return NextResponse.json({
                success: true,
                ...stigData,
                stigName: metadata.name,
                version: metadata.version,
                releaseDate: metadata.releaseDate,
                source: 'local',
                message: `✅ Successfully imported ${stigData.requirements.length} requirements from local library (${metadata.filename})`
              } as StigImportResult);
            }
          }
        }
      } catch (localError: any) {
        console.error(`❌ Error reading local STIG: ${localError.message}`);
        // STIG not found in local library
      }
    } else {
      console.log(`❌ STIG not found in local library: ${stigId}`);
    }

    // 🚫 EXTERNAL API DISABLED: No stigviewer.com fallback
    // All STIGs must be in local library (/public/stigs/)
    console.log(`❌ STIG "${stigId}" not found in local library`);
    
    // Return error with instructions for manual upload or local library extraction
    return NextResponse.json({
      success: false,
      stigId,
      error: 'STIG not found in local library',
      message: `STIG "${stigId}" not found in local library. All external API calls are disabled for security.`,
      instructions: {
        step1: 'Check available STIGs: Run list-stigs.ps1 to see what\'s in your local library',
        step2: 'Browse local library: Use the "Local Library" button in the STIG Requirements tab',
        step3: 'Extract more STIGs: Run extract-stigs.ps1 with the DISA STIG Library ZIP',
        step4: 'Manual upload: Use the "Upload STIG" button to upload XML/CSV files directly',
        note: 'External API calls to stigviewer.com and DISA websites are disabled'
      }
    }, { status: 404 });

  } catch (error: any) {
    console.error('❌ Error in STIG import:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        message: 'An error occurred while importing STIG'
      },
      { status: 500 }
    );
  }
}

/**
 * Parse DISA STIG CSV file
 * CSV format from DISA Cyber Exchange
 */
function parseStigCsv(csvContent: string, fileName: string): Omit<StigImportResult, 'success' | 'source' | 'message'> {
  const requirements: StigRequirement[] = [];
  
  // Properly split CSV content into lines, handling multi-line quoted fields
  const lines: string[] = [];
  let currentLine = '';
  let insideQuotes = false;
  
  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];
    
    if (char === '"') {
      // Check if it's an escaped quote
      if (nextChar === '"') {
        currentLine += char + nextChar;
        i++; // Skip next quote
      } else {
        insideQuotes = !insideQuotes;
        currentLine += char;
      }
    } else if (char === '\n' && !insideQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else if (char === '\r') {
      // Skip carriage returns
      continue;
    } else {
      currentLine += char;
    }
  }
  
  // Add the last line if not empty
  if (currentLine.trim()) {
    lines.push(currentLine);
  }
  
  console.log(`📄 Split CSV into ${lines.length} lines`);
  
  if (lines.length < 2) {
    return {
      stigId: fileName.replace(/\.csv$/i, ''),
      stigName: 'Imported STIG',
      version: 'Unknown',
      releaseDate: new Date().toISOString().split('T')[0],
      requirements: [],
      totalRequirements: 0
    };
  }

  // Parse header row - handle quoted CSV fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Find the header row (skip classification banners like "~~~~~~~ Unclassified ~~~~~~")
  let headerLineIndex = 0;
  let headers: string[] = [];
  
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const parsedLine = parseCSVLine(lines[i]);
    const lineText = parsedLine.join('').toLowerCase();
    
    // Skip classification banners and empty lines
    if (lineText.includes('unclassified') || lineText.includes('~~~~~') || parsedLine.length < 5) {
      continue;
    }
    
    // Check if this looks like a header row (has common STIG column names)
    if (lineText.includes('stig') || lineText.includes('severity') || lineText.includes('rule')) {
      headerLineIndex = i;
      headers = parsedLine.map(h => h.toLowerCase().trim());
      console.log(`📋 Found header row at line ${i + 1}`);
      break;
    }
  }
  
  if (headers.length === 0) {
    console.error('❌ Could not find valid header row in CSV');
    return {
      stigId: fileName.replace(/\.csv$/i, ''),
      stigName: 'Imported STIG',
      version: 'Unknown',
      releaseDate: new Date().toISOString().split('T')[0],
      requirements: [],
      totalRequirements: 0
    };
  }

  console.log(`📋 CSV Headers found: ${headers.slice(0, 10).join(', ')}...`);
  console.log(`📋 All headers (first 15):`, headers.slice(0, 15));
  
  // Find column indices
  const getIndex = (names: string[]) => {
    for (const name of names) {
      const idx = headers.findIndex(h => h.includes(name));
      if (idx !== -1) {
        console.log(`✅ Found "${name}" at index ${idx}: "${headers[idx]}"`);
        return idx;
      }
    }
    console.log(`❌ Could not find any of: ${names.join(', ')}`);
    return -1;
  };

  const stigIdIdx = getIndex(['stig id', 'stigid']);
  const severityIdx = getIndex(['severity']);
  const titleIdx = getIndex(['rule title', 'ruletitle']);
  const discussionIdx = getIndex(['discussion']);
  const checkIdx = getIndex(['check content', 'checkcontent']);
  const fixIdx = getIndex(['fix text', 'fixtext']);
  const cciIdx = getIndex(['ccis', 'cci']);
  const ruleIdIdx = getIndex(['rule id', 'ruleid']);
  
  console.log(`📊 Column indices:`, {
    stigId: stigIdIdx,
    severity: severityIdx,
    title: titleIdx,
    discussion: discussionIdx,
    check: checkIdx,
    fix: fixIdx,
    cci: cciIdx,
    ruleId: ruleIdIdx
  });

  let stigName = 'Imported STIG';
  let version = 'Unknown';
  
  console.log(`📄 Processing ${lines.length - headerLineIndex - 1} data rows from CSV`);
  
  // Parse data rows (start after header row)
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    
    if (i === headerLineIndex + 1) {
      console.log(`📝 First data row has ${values.length} values`);
    }
    
    // Extract STIG name from first data row if available
    if (i === headerLineIndex + 1 && values.length > 0) {
      const benchmarkIdx = headers.findIndex(h => h.includes('benchmark'));
      if (benchmarkIdx !== -1 && values[benchmarkIdx]) {
        stigName = values[benchmarkIdx];
      }
      const versionIdx = headers.findIndex(h => h.includes('version') || h.includes('release'));
      if (versionIdx !== -1 && values[versionIdx]) {
        version = values[versionIdx];
      }
    }

    const vulnId = stigIdIdx !== -1 ? values[stigIdIdx] : '';
    const ruleId = ruleIdIdx !== -1 ? values[ruleIdIdx] : vulnId;
    
    if (!vulnId) {
      if (i <= headerLineIndex + 3) {
        console.log(`⚠️ Line ${i}: No STIG ID found`);
      }
      continue;
    }
    
    if (i === headerLineIndex + 1) {
      console.log(`✅ First requirement found: ${vulnId}`);
    }

    // Parse severity - handle multiple formats
    const severityValue = severityIdx !== -1 ? values[severityIdx].toLowerCase().trim() : 'medium';
    let severity: 'high' | 'medium' | 'low' = 'medium';
    
    // Direct severity values
    if (severityValue === 'high' || severityValue.includes('cat i') || severityValue.includes('cat 1') || severityValue.includes('cati')) {
      severity = 'high';
    } else if (severityValue === 'low' || severityValue.includes('cat iii') || severityValue.includes('cat 3') || severityValue.includes('catiii')) {
      severity = 'low';
    } else if (severityValue === 'medium' || severityValue.includes('cat ii') || severityValue.includes('cat 2') || severityValue.includes('catii')) {
      severity = 'medium';
    }
    
    // Log first few for debugging
    if (i <= headerLineIndex + 3) {
      console.log(`📊 Row ${i - headerLineIndex}: vulnId="${vulnId}", severity="${severityValue}" → ${severity}`);
    }

    // Extract CCI references
    const cciText = cciIdx !== -1 ? values[cciIdx] : '';
    const cciMatches = cciText.match(/CCI-\d+/g);
    const cci = cciMatches || ['CCI-000366'];

    requirements.push({
      vulnId,
      ruleId,
      severity,
      title: titleIdx !== -1 ? values[titleIdx] : `Requirement ${vulnId}`,
      description: discussionIdx !== -1 ? values[discussionIdx] : 'No description provided',
      checkText: checkIdx !== -1 ? values[checkIdx] : 'Review system configuration per STIG guidance.',
      fixText: fixIdx !== -1 ? values[fixIdx] : 'Configure system per STIG guidance.',
      cci,
      nistControls: []
    });
  }

  console.log(`✅ CSV parsing complete: ${requirements.length} requirements found`);

  return {
    stigId: fileName.replace(/\.csv$/i, ''),
    stigName,
    version,
    releaseDate: new Date().toISOString().split('T')[0],
    requirements,
    totalRequirements: requirements.length
  };
}

/**
 * POST - Manual STIG upload (XML or CSV file)
 * Body: FormData with 'file' field containing XCCDF XML or DISA CSV
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    const isXml = fileName.endsWith('.xml') || fileName.endsWith('.xccdf');
    const isCsv = fileName.endsWith('.csv');
    
    if (!isXml && !isCsv) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an XCCDF XML file or DISA CSV file.' },
        { status: 400 }
      );
    }

    console.log(`📁 Processing manual STIG upload: ${file.name}`);

    // Read file content
    const fileContent = await file.text();

    let stigData;
    
    if (isCsv) {
      // Parse CSV file
      stigData = parseStigCsv(fileContent, fileName);
    } else {
      // Parse XCCDF XML
      stigData = parseXccdfXml(fileContent, fileName);
    }

    if (stigData.requirements.length === 0) {
      throw new Error(`No requirements found in ${isCsv ? 'CSV' : 'XML'} file. Please ensure this is a valid DISA STIG file.`);
    }

    console.log(`✅ Successfully parsed ${stigData.requirements.length} requirements from manual upload`);

    return NextResponse.json({
      success: true,
      ...stigData,
      source: 'manual',
      message: `Successfully imported ${stigData.requirements.length} requirements from ${file.name}`
    } as StigImportResult);

  } catch (error: any) {
    console.error('❌ Error processing manual upload:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        message: 'Failed to parse STIG file. Please ensure this is a valid XCCDF XML file.'
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch detailed requirement page from stigviewer.com
 * Returns check and fix text for a specific vulnerability
 */
async function fetchRequirementDetails(stigId: string, vulnId: string): Promise<{checkText: string, fixText: string}> {
  try {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const url = `https://stigviewer.com/stig/${stigId}/requirement/${vulnId}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // @ts-ignore
      agent,
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract check text
    const checkMatch = html.match(/<div[^>]*(?:id|class)="[^"]*check[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                      html.match(/Check Text[:\s]*<[^>]*>([\s\S]*?)<\/(?:div|pre|p)>/i) ||
                      html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    
    const checkText = checkMatch ? 
      checkMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim() : 
      'Review the system configuration to verify compliance with the security requirement.';
    
    // Extract fix text  
    const fixMatch = html.match(/<div[^>]*(?:id|class)="[^"]*fix[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                    html.match(/Fix Text[:\s]*<[^>]*>([\s\S]*?)<\/(?:div|pre|p)>/i);
    
    const fixText = fixMatch ? 
      fixMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim() : 
      'Configure the system to meet the security requirement as specified in the STIG documentation.';
    
    return { checkText, fixText };
  } catch (error) {
    // Return defaults if fetch fails
    return {
      checkText: 'Review the system configuration to verify compliance with the security requirement. Detailed check procedure available in the full STIG documentation.',
      fixText: 'Configure the system to meet the security requirement. Detailed fix procedure available in the full STIG documentation.'
    };
  }
}

/**
 * Parse stig viewer.com JSON API response
 * JSON format has complete data including severity for each requirement
 */
function parseStigViewerJson(jsonData: any, stigId: string): Omit<StigImportResult, 'success' | 'source' | 'message'> {
  const requirements: StigRequirement[] = [];

  try {
    const stig = jsonData.stig || jsonData;
    const stigName = stig.title || stigId;
    const version = stig.version || 'Unknown';
    const releaseDate = stig.date || new Date().toISOString().split('T')[0];
    
    console.log(`📋 Parsing JSON: ${stigName}, Version: ${version}, Release: ${releaseDate}`);

    const findings = stig.findings || {};
    const vulnIds = Object.keys(findings);
    
    console.log(`🔍 Found ${vulnIds.length} requirements in JSON`);

    vulnIds.forEach((vulnId) => {
      const finding = findings[vulnId];
      if (!finding) return;

      // Extract severity from finding
      // JSON might have severity as "high", "medium", "low" or "CAT I", "CAT II", "CAT III"
      let severity: 'high' | 'medium' | 'low' = 'medium';
      const sevText = (finding.severity || finding.cat || 'medium').toString().toLowerCase();
      
      if (sevText.includes('high') || sevText.includes('cat i') || sevText === 'i' || sevText === '1') {
        severity = 'high';
      } else if (sevText.includes('low') || sevText.includes('cat iii') || sevText === 'iii' || sevText === '3') {
        severity = 'low';
      } else {
        severity = 'medium';
      }

      requirements.push({
        vulnId,
        ruleId: finding.ruleId || finding.rule_id || finding.ruleid || `${vulnId}-rule`,
        severity,
        title: finding.title || finding.ruleTitle || finding.ruletitle || `Requirement ${vulnId}`,
        description: finding.discussion || finding.description || finding.title || '',
        checkText: finding.checktext || finding.checkText || finding.check_text || finding.check || 'Review system configuration per STIG guidance.',
        fixText: finding.fixtext || finding.fixText || finding.fix_text || finding.fix || 'Configure system per STIG guidance.',
        cci: finding.cci || finding.ccis || ['CCI-000366'],
        nistControls: finding.nistControls || finding.nist || []
      });
    });

    console.log(`✅ Successfully parsed ${requirements.length} requirements from JSON`);
    
    // Log severity distribution
    const severityDist: Record<string, number> = {};
    requirements.forEach(req => {
      severityDist[req.severity] = (severityDist[req.severity] || 0) + 1;
    });
    console.log(`📊 JSON Severity Distribution:`, severityDist);

    return {
      stigId,
      stigName,
      version,
      releaseDate,
      requirements,
      totalRequirements: requirements.length
    };

  } catch (error: any) {
    console.error('Error parsing stigviewer.com JSON:', error);
    throw new Error(`Failed to parse stigviewer.com JSON: ${error.message}`);
  }
}

/**
 * Parse stigviewer.com HTML to extract STIG requirements
 * Fetches full requirement details including check and fix text
 */
async function parseStigViewerHtml(html: string, stigId: string): Promise<Omit<StigImportResult, 'success' | 'source' | 'message'>> {
  const requirements: StigRequirement[] = [];

  try {
    // Extract STIG metadata from page title and headers
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const stigName = titleMatch ? titleMatch[1].replace(' | STIGViewer', '').trim() : stigId;

    // Extract version from page
    const versionMatch = html.match(/Version[:\s]+([VvRr\d.]+)/i) || html.match(/class="[^"]*version[^"]*"[^>]*>([^<]+)</i);
    const version = versionMatch ? versionMatch[1].trim() : 'Unknown';

    // Extract release date
    const dateMatch = html.match(/Release[:\s]+(\d{1,2}\s+\w+\s+\d{4})/i) || 
                     html.match(/Date[:\s]+(\d{4}-\d{2}-\d{2})/i) ||
                     html.match(/(\d{4}-\d{2}-\d{2})/);
    const releaseDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    console.log(`📋 Parsing STIG: ${stigName}, Version: ${version}, Release: ${releaseDate}`);

    // Method 1: Extract complete requirement entries with all details
    // stigviewer.com has links like: href="/stig/{stigId}/requirement/V-#####"
    // Pattern to match entire requirement sections with severity info
    const reqSectionPattern = /(?:CAT\s+(I{1,3})|severity[^>]*?(high|medium|low))[^V]*(V-\d+)[^<]*<a[^>]*href="[^"]*\/requirement\/\3"[^>]*>([^<]+)</gi;
    let match;
    const detailedReqs: Array<{vulnId: string, severity: string, title: string}> = [];
    
    while ((match = reqSectionPattern.exec(html)) !== null) {
      const severity = match[1] || match[2]; // CAT I/II/III or high/medium/low
      const vulnId = match[3];
      const title = match[4].trim();
      detailedReqs.push({ vulnId, severity, title });
    }
    
    console.log(`🔍 Method 1: Found ${detailedReqs.length} requirements with severity info`);

    // Method 2: Extract from table rows if available
    const tableRows: Array<{vulnId: string, severity: string, title: string}> = [];
    const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    
    while ((rowMatch = rowPattern.exec(html)) !== null) {
      const rowHtml = rowMatch[1];
      
      // Check if this row has a vuln ID
      const vulnMatch = rowHtml.match(/>(V-\d+)</);
      if (!vulnMatch) continue;
      
      const vulnId = vulnMatch[1];
      
      // Extract severity from this row
      const catMatch = rowHtml.match(/CAT\s+(I{1,3})/i);
      const sevMatch = rowHtml.match(/>(high|medium|low)</i);
      const severity = catMatch ? catMatch[1] : (sevMatch ? sevMatch[1] : 'II');
      
      // Extract title
      const titleMatch = rowHtml.match(/<a[^>]*href="[^"]*\/requirement\/[^"]*"[^>]*>([^<]+)</i);
      const title = titleMatch ? titleMatch[1].trim() : `Requirement ${vulnId}`;
      
      tableRows.push({ vulnId, severity, title });
    }
    
    console.log(`🔍 Method 2: Found ${tableRows.length} requirements from table rows`);

    // Method 3: Fallback - extract all V-#### with default data
    const vulnIdPattern = /V-\d+/g;
    const allVulnIds = [...new Set(html.match(vulnIdPattern) || [])];
    console.log(`🔍 Method 3: Found ${allVulnIds.length} total V-#### patterns`);

    // Use the method that found the most requirements
    let reqData: Array<{vulnId: string, severity: string, title: string}> = [];
    
    if (detailedReqs.length >= tableRows.length && detailedReqs.length > 0) {
      reqData = detailedReqs;
      console.log(`✓ Using Method 1: ${detailedReqs.length} requirements with severity`);
    } else if (tableRows.length > 0) {
      reqData = tableRows;
      console.log(`✓ Using Method 2: ${tableRows.length} requirements from tables`);
    } else {
      // Fallback: create basic entries
      reqData = allVulnIds.map(vulnId => ({
        vulnId,
        severity: 'II', // default
        title: `${stigName} - ${vulnId}`
      }));
      console.log(`✓ Using Method 3: ${allVulnIds.length} basic requirements`);
    }

    console.log(`📝 Processing ${reqData.length} requirements...`);

    let requirementCount = 0;
    
    for (const req of reqData) {
      const { vulnId, severity: rawSeverity, title } = req;
      
      // Extract Rule ID if available
      const rulePattern = new RegExp(`${vulnId}[^S]*?(SV-\\d+r\\d+_rule)`, 'i');
      const ruleMatch = html.match(rulePattern);
      const ruleId = ruleMatch ? ruleMatch[1] : `${vulnId}-rule`;
      
      // Normalize severity
      let severity: 'high' | 'medium' | 'low' = 'medium';
      const sevText = rawSeverity.toLowerCase();
      if (sevText.includes('i') && !sevText.includes('ii') || sevText === 'high' || sevText === '1') {
        severity = 'high';
      } else if (sevText.includes('iii') || sevText === 'low' || sevText === '3') {
        severity = 'low';
      } else {
        severity = 'medium';
      }
      
      // Description defaults to title
      const description = title;
      
      // Extract CCI references - search for this vulnId in HTML
      const vulnContext = html.substring(
        Math.max(0, html.indexOf(vulnId) - 300),
        Math.min(html.length, html.indexOf(vulnId) + 300)
      );
      const cciMatches = vulnContext.match(/CCI-\d+/g);
      const cci = cciMatches && cciMatches.length > 0 ? [...new Set(cciMatches)] : ['CCI-000366'];
      
      // Default check and fix text with note about full documentation
      const checkText = `Review the system configuration to verify compliance with ${vulnId}. Refer to the full STIG documentation for detailed check procedures.`;
      const fixText = `Configure the system to meet the requirements specified in ${vulnId}. Refer to the full STIG documentation for detailed fix procedures.`;
      
      // Extract NIST controls from context
      const nistMatches = vulnContext.match(/([A-Z]{2}-\d+(?:\s*\([a-z0-9]+\))?)/g);
      const nistControls = nistMatches ? [...new Set(nistMatches)] : [];
      
      requirements.push({
        vulnId,
        ruleId,
        severity,
        title,
        description,
        checkText,
        fixText,
        cci,
        nistControls
      });
      
      requirementCount++;
    }

    console.log(`✅ Successfully parsed ${requirementCount} requirements from HTML`);
    
    // Log severity distribution
    const severityDist: Record<string, number> = {};
    requirements.forEach(req => {
      severityDist[req.severity] = (severityDist[req.severity] || 0) + 1;
    });
    console.log(`📊 API Severity Distribution:`, severityDist);

    // If we didn't find any requirements in table format, try alternative parsing
    if (requirements.length === 0) {
      console.warn('⚠️ No requirements found in table format, trying alternative parsing...');
      
      // Try to find all V-#### patterns and create basic requirements
      const vulnIdPattern = /V-\d+/g;
      const vulnIds = [...new Set(html.match(vulnIdPattern) || [])];
      
      vulnIds.forEach((vulnId, index) => {
        requirements.push({
          vulnId,
          ruleId: `${vulnId}-rule`,
          severity: 'medium',
          title: `${stigName} - ${vulnId}`,
          description: `Security requirement ${vulnId} from ${stigName}`,
          checkText: 'Review the system configuration to verify compliance. Detailed check procedure available in the full STIG documentation.',
          fixText: 'Configure the system to meet the security requirement. Detailed fix procedure available in the full STIG documentation.',
          cci: ['CCI-000366'],
          nistControls: []
        });
      });
      
      console.log(`📝 Created ${requirements.length} basic requirements from Vuln IDs`);
    }

    return {
      stigId,
      stigName,
      version,
      releaseDate,
      requirements,
      totalRequirements: requirements.length
    };

  } catch (error: any) {
    console.error('Error parsing stigviewer.com HTML:', error);
    throw new Error(`Failed to parse stigviewer.com page: ${error.message}`);
  }
}

/**
 * Parse XCCDF XML file to extract STIG requirements
 */
function parseXccdfXml(xmlContent: string, fileName: string): Omit<StigImportResult, 'success' | 'source' | 'message'> {
  const requirements: StigRequirement[] = [];

  try {
    // Extract STIG ID from filename
    const stigId = fileName.replace(/\.xml|\.xccdf/gi, '').toLowerCase().replace(/\s+/g, '_');

    // Parse XML using regex (simplified - in production use a proper XML parser)
    
    // Extract Benchmark title
    const titleMatch = xmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const stigName = titleMatch ? titleMatch[1].trim() : stigId;

    // Extract version
    const versionMatch = xmlContent.match(/<version[^>]*>([^<]+)<\/version>/i) ||
                        xmlContent.match(/Version[:\s]+([VvRr\d.]+)/i);
    const version = versionMatch ? versionMatch[1] : 'Unknown';

    // Extract release date
    const dateMatch = xmlContent.match(/release-date[^>]*>([^<]+)</i) ||
                     xmlContent.match(/(\d{1,2}\s+\w+\s+\d{4})/);
    const releaseDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    // Extract all Group elements (requirements)
    const groupPattern = /<Group[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/Group>/gi;
    let groupMatch;

    while ((groupMatch = groupPattern.exec(xmlContent)) !== null) {
      const groupId = groupMatch[1];
      const groupContent = groupMatch[2];

      // Extract Rule from Group
      const ruleMatch = groupContent.match(/<Rule[^>]*id="([^"]+)"[^>]*severity="([^"]+)"[^>]*>([\s\S]*?)<\/Rule>/i);
      
      if (ruleMatch) {
        const ruleId = ruleMatch[1];
        const severity = ruleMatch[2].toLowerCase() as 'high' | 'medium' | 'low';
        const ruleContent = ruleMatch[3];

        // Extract title
        const titleMatch = ruleContent.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : `Requirement ${groupId}`;

        // Extract description
        const descMatch = ruleContent.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
        const description = descMatch ? stripHtml(descMatch[1]) : '';

        // Extract check text
        const checkMatch = ruleContent.match(/<check-content[^>]*>([\s\S]*?)<\/check-content>/i);
        const checkText = checkMatch ? stripHtml(checkMatch[1]) : 'No check procedure provided';

        // Extract fix text
        const fixMatch = ruleContent.match(/<fixtext[^>]*>([\s\S]*?)<\/fixtext>/i);
        const fixText = fixMatch ? stripHtml(fixMatch[1]) : 'No fix procedure provided';

        // Extract CCI references
        const cciPattern = /<ident[^>]*system="http:\/\/cyber\.mil\/legacy\/cci"[^>]*>([^<]+)<\/ident>/gi;
        const cci: string[] = [];
        let cciMatch;
        while ((cciMatch = cciPattern.exec(ruleContent)) !== null) {
          cci.push(cciMatch[1]);
        }

        // Extract NIST controls
        const nistPattern = /<reference[^>]*>([\s\S]*?)NIST[^<]*([A-Z]{2}-\d+(?:\s*\(\d+\))?(?:\s*[a-z])?)[^<]*([\s\S]*?)<\/reference>/gi;
        const nistControls: string[] = [];
        let nistMatch;
        while ((nistMatch = nistPattern.exec(ruleContent)) !== null) {
          const control = nistMatch[2].trim();
          if (control && !nistControls.includes(control)) {
            nistControls.push(control);
          }
        }

        requirements.push({
          vulnId: groupId,
          ruleId,
          severity,
          title,
          description: description.substring(0, 500), // Limit description length
          checkText: checkText.substring(0, 1000),
          fixText: fixText.substring(0, 1000),
          cci: cci.length > 0 ? cci : ['CCI-000000'],
          nistControls: nistControls.length > 0 ? nistControls : ['AC-1']
        });
      }
    }

    if (requirements.length === 0) {
      throw new Error('No requirements found in XML. The file may not be a valid XCCDF STIG file.');
    }

    return {
      stigId,
      stigName,
      version,
      releaseDate,
      requirements,
      totalRequirements: requirements.length
    };

  } catch (error: any) {
    console.error('Error parsing XCCDF XML:', error);
    throw new Error(`Failed to parse XCCDF XML: ${error.message}`);
  }
}

/**
 * Strip HTML tags and decode entities
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}
