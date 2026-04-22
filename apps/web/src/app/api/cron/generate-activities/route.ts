import { NextRequest, NextResponse } from 'next/server';
import { generateActivities } from '@/lib/generate-activities';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allow up to 5 min for 5 parallel age-group generations

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

    // Generate 50 activities per week across age groups and categories
    // 10 per age band: baby (0-1), toddler (1-3), preschool (3-5), primary (5-8), older (8-12)
    const [babyResult, toddlerResult, preschoolResult, primaryResult, olderResult] = await Promise.all([
      generateActivities(10, { focusAgeRange: { min: 0, max: 1 }, focusSeason: season, includeParentGuide: true }),
      generateActivities(10, { focusAgeRange: { min: 1, max: 3 }, focusSeason: season, includeParentGuide: true }),
      generateActivities(10, { focusAgeRange: { min: 3, max: 5 }, includeParentGuide: true }),
      generateActivities(10, { focusAgeRange: { min: 5, max: 8 }, includeParentGuide: true }),
      generateActivities(10, { focusAgeRange: { min: 8, max: 12 }, includeParentGuide: true }),
    ]);

    const allResults = [babyResult, toddlerResult, preschoolResult, primaryResult, olderResult];
    const totalGenerated = allResults.reduce((s, r) => s + (r.generated || 0), 0);
    const allActivities = allResults.flatMap(r => r.activities);
    const allErrors = allResults.flatMap(r => r.errors);

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
      `[CRON] generate-activities: ${totalGenerated} created across 5 age groups, ${allErrors.length} errors`
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
