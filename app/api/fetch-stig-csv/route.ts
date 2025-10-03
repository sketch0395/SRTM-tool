import { NextResponse } from 'next/server';

/**
 * DEPRECATED: External STIG fetching is disabled
 * All STIGs must be loaded from local library (/public/stigs/)
 * Use /api/import-stig instead which reads from local library
 */
export async function GET(request: Request) {
  // 🚫 EXTERNAL API CALLS DISABLED
  return NextResponse.json({
    error: 'External STIG fetching is disabled',
    message: 'This endpoint no longer fetches from external sources (stigviewer.com or public.cyber.mil)',
    instructions: {
      step1: 'Use /api/import-stig?stigId=<stig_id> to load from local library',
      step2: 'Or use the "Local Library" button in the UI to browse available STIGs',
      step3: 'All STIGs must be extracted to /public/stigs/ first using extract-stigs.ps1',
      note: 'External API calls are disabled for security and reliability'
    }
  }, { status: 410 }); // 410 Gone - endpoint permanently disabled
}