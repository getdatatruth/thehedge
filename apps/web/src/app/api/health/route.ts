import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency_ms?: number;
  error?: string;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const start = Date.now();
  const services: ServiceStatus[] = [];

  // 1. Check Supabase DB
  const dbStatus = await checkDatabase();
  services.push(dbStatus);

  // 2. Check Supabase Auth
  const authStatus = await checkAuth();
  services.push(authStatus);

  // 3. Check HedgeAI (Anthropic API key configured)
  services.push(checkHedgeAI());

  // 4. Check Stripe
  services.push(checkStripe());

  // 5. Check Email (Resend)
  services.push(checkEmail());

  // 6. Check Weather API
  const weatherStatus = await checkWeather();
  services.push(weatherStatus);

  const allOperational = services.every((s) => s.status === 'operational');
  const anyDown = services.some((s) => s.status === 'down');
  const overallStatus = anyDown ? 'unhealthy' : allOperational ? 'healthy' : 'degraded';

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime_ms: Date.now() - start,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev',
    environment: process.env.NODE_ENV,
    services,
  };

  const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 207 : 503;

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

async function checkDatabase(): Promise<ServiceStatus> {
  try {
    const start = Date.now();
    const supabase = createAdminClient();
    const { error } = await supabase.from('activities').select('id', { count: 'exact', head: true });
    const latency = Date.now() - start;

    if (error) {
      return { name: 'Database (Supabase)', status: 'down', latency_ms: latency, error: error.message };
    }
    return { name: 'Database (Supabase)', status: latency > 3000 ? 'degraded' : 'operational', latency_ms: latency };
  } catch (e) {
    return { name: 'Database (Supabase)', status: 'down', error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

async function checkAuth(): Promise<ServiceStatus> {
  try {
    const start = Date.now();
    const supabase = createAdminClient();
    // List users is a lightweight auth check
    const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    const latency = Date.now() - start;

    if (error) {
      return { name: 'Authentication', status: 'down', latency_ms: latency, error: error.message };
    }
    return { name: 'Authentication', status: latency > 3000 ? 'degraded' : 'operational', latency_ms: latency };
  } catch (e) {
    return { name: 'Authentication', status: 'down', error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

function checkHedgeAI(): ServiceStatus {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  return {
    name: 'HedgeAI',
    status: hasKey ? 'operational' : 'down',
    ...(!hasKey && { error: 'ANTHROPIC_API_KEY not configured' }),
  };
}

function checkStripe(): ServiceStatus {
  const hasKey = !!process.env.STRIPE_SECRET_KEY;
  const hasPrices = !!process.env.STRIPE_PRICE_FAMILY && !!process.env.STRIPE_PRICE_EDUCATOR;
  if (!hasKey) {
    return { name: 'Payments (Stripe)', status: 'down', error: 'STRIPE_SECRET_KEY not configured' };
  }
  if (!hasPrices) {
    return { name: 'Payments (Stripe)', status: 'degraded', error: 'Price IDs not configured' };
  }
  return { name: 'Payments (Stripe)', status: 'operational' };
}

function checkEmail(): ServiceStatus {
  const hasKey = !!process.env.RESEND_API_KEY;
  return {
    name: 'Email (Resend)',
    status: hasKey ? 'operational' : 'down',
    ...(!hasKey && { error: 'RESEND_API_KEY not configured' }),
  };
}

async function checkWeather(): Promise<ServiceStatus> {
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=51.90&longitude=-8.48&current_weather=true',
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    const latency = Date.now() - start;

    if (!res.ok) {
      return { name: 'Weather API', status: 'degraded', latency_ms: latency, error: `HTTP ${res.status}` };
    }
    return { name: 'Weather API', status: latency > 4000 ? 'degraded' : 'operational', latency_ms: latency };
  } catch (e) {
    return { name: 'Weather API', status: 'degraded', error: e instanceof Error ? e.message : 'Timeout' };
  }
}
