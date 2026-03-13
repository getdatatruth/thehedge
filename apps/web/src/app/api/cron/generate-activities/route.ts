import { NextRequest, NextResponse } from 'next/server';
import { generateActivities } from '@/lib/generate-activities';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for AI generation

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await generateActivities(5);

    console.log(
      `[CRON] generate-activities: ${result.generated} created, ${result.errors.length} errors`
    );

    if (result.errors.length > 0) {
      console.warn('[CRON] generate-activities errors:', result.errors);
    }

    return NextResponse.json({
      success: result.success,
      generated: result.generated,
      activities: result.activities,
      errors: result.errors,
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
