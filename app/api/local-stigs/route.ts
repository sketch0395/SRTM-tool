/**
 * API endpoint to list available local STIGs
 * GET /api/local-stigs - List all STIGs in the local library
 */

import { NextRequest, NextResponse } from 'next/server';
import { listLocalStigs, getLocalStigStats } from '@/utils/localStigLibrary';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format'); // 'list' or 'stats'
    
    if (format === 'stats') {
      const stats = getLocalStigStats();
      return NextResponse.json({
        success: true,
        stats
      });
    }
    
    // Default: return full list
    const stigs = listLocalStigs();
    
    return NextResponse.json({
      success: true,
      count: stigs.length,
      stigs
    });
    
  } catch (error) {
    console.error('Error listing local STIGs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to list local STIGs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
