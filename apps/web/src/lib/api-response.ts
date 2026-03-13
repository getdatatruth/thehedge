import { NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';

interface ApiMeta {
  page?: number;
  per_page?: number;
  total?: number;
  total_pages?: number;
  [key: string]: unknown;
}

/**
 * Standard success response for API endpoints.
 */
export function apiSuccess<T>(data: T, meta?: ApiMeta, status = 200) {
  return NextResponse.json(
    { success: true, data, ...(meta ? { meta } : {}) },
    { status, headers: corsHeaders() }
  );
}

/**
 * Standard error response for API endpoints.
 */
export function apiError(message: string, status = 400, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: code || statusToCode(status),
      },
    },
    { status, headers: corsHeaders() }
  );
}

/**
 * Standard paginated response for API endpoints.
 */
export function apiPaginated<T>(
  data: T[],
  page: number,
  perPage: number,
  total: number
) {
  return apiSuccess(data, {
    page,
    per_page: perPage,
    total,
    total_pages: Math.ceil(total / perPage),
  });
}

/**
 * Standard OPTIONS response for CORS preflight.
 */
export function apiOptions() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function statusToCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION_ERROR';
    case 429:
      return 'RATE_LIMITED';
    case 500:
      return 'INTERNAL_ERROR';
    default:
      return 'ERROR';
  }
}
