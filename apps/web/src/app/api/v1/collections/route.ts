import { NextRequest } from 'next/server';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiSuccess, apiError, apiOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return apiOptions();
}

/**
 * GET /api/v1/collections
 * List published collections with their activities resolved.
 *
 * Query params:
 *   featured=true  — only featured collections
 *   seasonal=true  — only seasonal collections
 */
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await createApiClient(request);
  if (!user) return apiError(error || 'Unauthorized', 401);

  const { searchParams } = request.nextUrl;
  const featured = searchParams.get('featured');
  const seasonal = searchParams.get('seasonal');

  try {
    let query = supabase
      .from('collections')
      .select('*')
      .eq('published', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (featured === 'true') query = query.eq('featured', true);
    if (seasonal === 'true') query = query.eq('seasonal', true);

    const { data: collections, error: colError } = await query;
    if (colError) throw colError;

    if (!collections || collections.length === 0) {
      return apiSuccess([]);
    }

    // Gather all unique activity IDs across all collections
    const allActivityIds = new Set<string>();
    for (const col of collections) {
      const ids = (col.activity_ids as string[]) || [];
      for (const id of ids) allActivityIds.add(id);
    }

    // Fetch all referenced activities in a single query
    let activitiesMap: Record<string, unknown> = {};
    if (allActivityIds.size > 0) {
      const { data: acts } = await supabase
        .from('activities')
        .select('*')
        .eq('published', true)
        .in('id', Array.from(allActivityIds));

      if (acts) {
        for (const a of acts) {
          activitiesMap[a.id] = a;
        }
      }
    }

    // Attach resolved activities to each collection
    const result = collections.map((col) => {
      const actIds = (col.activity_ids as string[]) || [];
      return {
        ...col,
        activities: actIds
          .map((id: string) => activitiesMap[id])
          .filter(Boolean),
      };
    });

    return apiSuccess(result);
  } catch (err) {
    console.error('GET /api/v1/collections error:', err);
    return apiError('Failed to fetch collections', 500);
  }
}
