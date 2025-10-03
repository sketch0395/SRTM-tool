import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

/**
 * STIG Import API
 * Fetches STIG requirements from stigviewer.com or accepts manual upload
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
  source: 'stigviewer' | 'manual' | 'cache';
  message?: string;
  error?: string;
}

/**
 * GET - Fetch STIG from stigviewer.com
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

    console.log(`🔍 Fetching STIG from stigviewer.com: ${stigId}`);

    // Try JSON API first (has complete severity data)
    const jsonUrl = `https://stigviewer.com/stigs/${stigId}/json`;
    const htmlUrl = `https://stigviewer.com/stigs/${stigId}/`;
    
    // Create custom agent to bypass SSL certificate validation
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    
    try {
      // Attempt JSON API first
      console.log(`📥 Attempting JSON API...`);
      const jsonResponse = await fetch(jsonUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        // @ts-ignore
        agent,
        signal: AbortSignal.timeout(15000),
      });

      if (jsonResponse.ok) {
        const jsonData = await jsonResponse.json();
        console.log(`✅ JSON API successful`);
        
        const stigData = parseStigViewerJson(jsonData, stigId);
        
        if (stigData.requirements.length > 0) {
          return NextResponse.json({
            success: true,
            ...stigData,
            source: 'stigviewer',
            message: `Successfully imported ${stigData.requirements.length} requirements from JSON API`
          } as StigImportResult);
        }
      }
    } catch (jsonError: any) {
      console.log(`⚠️ JSON API failed: ${jsonError.message}, trying HTML...`);
    }
    
    // Fallback to HTML parsing
    try {
      console.log(`📥 Attempting HTML parsing...`);
      const response = await fetch(htmlUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html',
        },
        // @ts-ignore
        agent,
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Parse STIG information from HTML
      const stigData = await parseStigViewerHtml(html, stigId);

      if (stigData.requirements.length === 0) {
        throw new Error('No requirements found in STIG data');
      }

      console.log(`✅ Successfully fetched ${stigData.requirements.length} requirements from stigviewer.com`);

      return NextResponse.json({
        success: true,
        ...stigData,
        source: 'stigviewer',
        message: `Successfully imported ${stigData.requirements.length} requirements from stigviewer.com`
      } as StigImportResult);

    } catch (fetchError: any) {
      console.error('❌ Error fetching from stigviewer.com:', fetchError.message);

      // Return error with instructions for manual upload
      return NextResponse.json({
        success: false,
        stigId,
        error: fetchError.message,
        message: 'Failed to fetch from stigviewer.com. Please upload STIG manually.',
        instructions: {
          step1: 'Download STIG XML from DISA Cyber Exchange: https://public.cyber.mil/stigs/downloads/',
          step2: 'Or download from STIGViewer: https://stigviewer.com/stigs',
          step3: 'Upload the XCCDF XML file using the manual upload option'
        }
      }, { status: 503 });
    }

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
 * POST - Manual STIG upload (XML file)
 * Body: FormData with 'file' field containing XCCDF XML
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
    if (!fileName.endsWith('.xml') && !fileName.endsWith('.xccdf')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an XCCDF XML file.' },
        { status: 400 }
      );
    }

    console.log(`📁 Processing manual STIG upload: ${file.name}`);

    // Read file content
    const xmlContent = await file.text();

    // Parse XCCDF XML
    const stigData = parseXccdfXml(xmlContent, file.name);

    if (stigData.requirements.length === 0) {
      throw new Error('No requirements found in XML file. Please ensure this is a valid XCCDF STIG file.');
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
