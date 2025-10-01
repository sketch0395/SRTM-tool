import { NextResponse } from 'next/server';

import { STIG_FAMILIES } from '../../../utils/stigFamilyRecommendations';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const familyIdsParam = searchParams.get('familyIds');
  if (!familyIdsParam) {
    return NextResponse.json({ error: 'Missing familyIds parameter' }, { status: 400 });
  }
  const familyIds = familyIdsParam.split(',').map(id => id.trim()).filter(id => id);
  const csvResults: Record<string, string> = {};

  for (const familyId of familyIds) {
    // Determine official STIG ID for download
    const family = STIG_FAMILIES.find(f => f.id === familyId);
    const stigId = family?.stigId || familyId;
    try {
      // Attempt fetch from STIG Viewer
      const viewerUrl = `https://stigviewer.com/stigs/download/${stigId}.csv`;
      let res = await fetch(viewerUrl);
      let text: string | null = null;
      if (res.ok) {
        text = await res.text();
      }
      // Fallback to DISA public cyber.mil if no data
      if (!text) {
        const disaUrl = `https://public.cyber.mil/stigs/download/${stigId}.csv`;
        res = await fetch(disaUrl);
        if (res.ok) {
          text = await res.text();
          console.info(`Fetched CSV for ${familyId} from DISA fallback`);
        }
      }
      if (text) {
        csvResults[familyId] = text;
      } else {
        console.error(`No CSV data returned for ${familyId} from any source`);
      }
    } catch (err) {
      console.error(`Error fetching CSV for ${familyId}:`, err);
    }
  }

  return NextResponse.json(csvResults);
}