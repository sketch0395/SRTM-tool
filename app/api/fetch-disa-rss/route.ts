import { NextRequest, NextResponse } from 'next/server';

/**
 * DEPRECATED: External DISA RSS fetching is disabled
 * All STIGs must be loaded from local library (/public/stigs/)
 */
export async function GET(request: NextRequest) {
  // 🚫 EXTERNAL API CALLS DISABLED
  return NextResponse.json({
    success: false,
    error: 'External DISA RSS fetching is disabled',
    message: 'This endpoint no longer fetches from external sources (public.cyber.mil)',
    releases: [],
    instructions: {
      step1: 'Use local STIG library in /public/stigs/',
      step2: 'Run extract-stigs.ps1 to extract STIGs from DISA ZIP files',
      step3: 'Use "Local Library" button to browse available STIGs',
      note: 'External API calls are disabled for security'
    }
  }, { status: 410 }); // 410 Gone

  // Dead code below - kept for reference only
  try {
    const disaRssUrl = 'https://public.cyber.mil/stigs/rss/';
    
    console.log('🔍 Fetching DISA STIG RSS feed...');
    
    const response = await fetch(disaRssUrl, {
      headers: {
        'User-Agent': 'SRTM-Tool/1.0 (STIG Update Checker)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      // 30 second timeout
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      console.error(`❌ DISA RSS feed returned status: ${response.status}`);
      return NextResponse.json({
        success: false,
        error: `DISA RSS feed unavailable (HTTP ${response.status})`,
        releases: []
      }, { status: response.status });
    }

    const xmlText = await response.text();
    
    // Parse RSS XML to extract STIG releases
    const releases = parseDisaRss(xmlText);
    
    console.log(`✅ Successfully parsed ${releases.length} STIG releases from DISA`);

    return NextResponse.json({
      success: true,
      releases,
      fetchedAt: new Date().toISOString(),
      source: 'https://public.cyber.mil/stigs/rss/'
    });

  } catch (error: any) {
    console.error('❌ Error fetching DISA RSS:', error);
    
    // Return empty result on error (fallback logic will handle it)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch DISA RSS feed',
      releases: []
    }, { status: 500 });
  }
}

/**
 * Parse DISA RSS XML to extract STIG releases
 */
function parseDisaRss(xmlText: string): any[] {
  const releases: any[] = [];
  
  try {
    // Simple regex-based XML parsing (for basic RSS structure)
    // In production, you might want to use a proper XML parser library
    
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/;
    const linkRegex = /<link>(.*?)<\/link>/;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
    const descriptionRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>/;
    
    let match;
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];
      
      const titleMatch = itemContent.match(titleRegex);
      const linkMatch = itemContent.match(linkRegex);
      const pubDateMatch = itemContent.match(pubDateRegex);
      const descriptionMatch = itemContent.match(descriptionRegex);
      
      if (titleMatch) {
        const title = titleMatch[1];
        const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString().split('T')[0] : '';
        
        // Extract version from title (e.g., "V2R1", "Version 2")
        const versionMatch = title.match(/V(\d+)R?(\d*)|Version\s+(\d+)/i);
        const version = versionMatch ? (versionMatch[1] ? `V${versionMatch[1]}${versionMatch[2] ? 'R' + versionMatch[2] : ''}` : `V${versionMatch[3]}`) : 'Unknown';
        
        releases.push({
          name: title,
          version: version,
          releaseDate: pubDate,
          link: linkMatch ? linkMatch[1] : '',
          description: descriptionMatch ? descriptionMatch[1].substring(0, 200) : '',
          stigId: extractStigId(title)
        });
      }
    }
    
  } catch (error) {
    console.error('Error parsing RSS XML:', error);
  }
  
  return releases;
}

/**
 * Extract STIG ID from title (if present)
 */
function extractStigId(title: string): string {
  // Look for patterns like "APSC-DV-000001" or similar
  const stigIdMatch = title.match(/([A-Z]{2,6}-[A-Z]{2}-\d{6})/);
  if (stigIdMatch) return stigIdMatch[1];
  
  // Otherwise, create a simple identifier from the name
  return title
    .toLowerCase()
    .replace(/stig|security technical implementation guide/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 50);
}