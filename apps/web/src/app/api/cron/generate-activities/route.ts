import { NextRequest, NextResponse } from 'next/server';
import { generateActivities } from '@/lib/generate-activities';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Allow up to 120s for parallel AI generation

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Determine current season for focused generation
    const month = new Date().getMonth();
    const season = month >= 2 && month <= 4 ? 'spring' : month >= 5 && month <= 7 ? 'summer' : month >= 8 && month <= 10 ? 'autumn' : 'winter';

    // Generate 10 activities per week: 5 seasonal + 5 general mix
    const [seasonalResult, generalResult] = await Promise.all([
      generateActivities(5, { focusSeason: season, includeParentGuide: true }),
      generateActivities(5, { includeParentGuide: true }),
    ]);

    const totalGenerated = (seasonalResult.generated || 0) + (generalResult.generated || 0);
    const allActivities = [...seasonalResult.activities, ...generalResult.activities];
    const allErrors = [...seasonalResult.errors, ...generalResult.errors];

    // Auto-publish generated activities
    if (allActivities.length > 0) {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase
        .from('activities')
        .update({ published: true })
        .in('slug', allActivities.map(a => a.slug));
    }

    console.log(
      `[CRON] generate-activities: ${totalGenerated} created (${seasonalResult.generated} seasonal, ${generalResult.generated} general), ${allErrors.length} errors`
    );

    if (allErrors.length > 0) {
      console.warn('[CRON] generate-activities errors:', allErrors);
    }

    return NextResponse.json({
      success: totalGenerated > 0,
      generated: totalGenerated,
      activities: allActivities,
      errors: allErrors,
      season,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] generate-activities failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate activities',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
