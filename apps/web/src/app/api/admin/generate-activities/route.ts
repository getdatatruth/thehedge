import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { generateActivities } from '@/lib/generate-activities';
import { apiOptions } from '@/lib/api-response';

export const maxDuration = 60; // Allow up to 60s for AI generation

export async function OPTIONS() {
  return apiOptions();
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    // Allow admin to specify count (default 5, max 10)
    let count = 5;
    try {
      const body = await request.json();
      if (body.count && typeof body.count === 'number') {
        count = Math.min(Math.max(1, body.count), 10);
      }
    } catch {
      // No body or invalid JSON - use default count
    }

    const result = await generateActivities(count);

    console.log(
      `[ADMIN] generate-activities by ${auth.user.email}: ${result.generated} created`
    );

    return NextResponse.json({
      success: result.success,
      generated: result.generated,
      activities: result.activities,
      errors: result.errors,
      triggeredBy: auth.user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[ADMIN] generate-activities failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate activities',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
