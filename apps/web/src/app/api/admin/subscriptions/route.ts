import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit';

// ─── In-memory discount store ──────────────────────────
// Will be migrated to Stripe coupons in Phase 2.1

interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  applicableTiers: string[];
  active: boolean;
  createdAt: string;
}

const discountCodes: DiscountCode[] = [];
let nextDiscountId = 1;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity');
    const supabase = createAdminClient();

    if (entity === 'discounts') {
      return NextResponse.json(discountCodes);
    }

    // Default: subscription stats
    const { data: families } = await supabase
      .from('families')
      .select('subscription_tier, subscription_status, stripe_customer_id, created_at');

    const stats = {
      totalFamilies: (families || []).length,
      tierDistribution: { free: 0, family: 0, educator: 0 } as Record<string, number>,
      statusDistribution: { active: 0, trialing: 0, past_due: 0, cancelled: 0 } as Record<string, number>,
      stripeConnected: 0,
      monthlyRevenue: 0, // Placeholder - needs Stripe API
      discountCodes: discountCodes.length,
      activeDiscounts: discountCodes.filter((d) => d.active).length,
    };

    (families || []).forEach((f: { subscription_tier: string; subscription_status: string; stripe_customer_id: string | null }) => {
      const tier = f.subscription_tier || 'free';
      const status = f.subscription_status || 'active';
      stats.tierDistribution[tier] = (stats.tierDistribution[tier] || 0) + 1;
      stats.statusDistribution[status] = (stats.statusDistribution[status] || 0) + 1;
      if (f.stripe_customer_id) stats.stripeConnected++;
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('GET /api/admin/subscriptions error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const discount: DiscountCode = {
      id: String(nextDiscountId++),
      code: body.code.toUpperCase(),
      type: body.type || 'percentage',
      value: body.value || 10,
      maxUses: body.maxUses || 100,
      usedCount: 0,
      validFrom: body.validFrom || new Date().toISOString(),
      validUntil: body.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      applicableTiers: body.applicableTiers || ['family', 'educator'],
      active: true,
      createdAt: new Date().toISOString(),
    };

    discountCodes.push(discount);

    logAuditEvent('admin', 'create_discount', 'discount', discount.id, {
      code: discount.code,
      type: discount.type,
      value: discount.value,
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/subscriptions error:', error);
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'toggle_discount') {
      const idx = discountCodes.findIndex((d) => d.id === body.discountId);
      if (idx === -1) {
        return NextResponse.json({ error: 'Discount not found' }, { status: 404 });
      }
      discountCodes[idx].active = !discountCodes[idx].active;
      return NextResponse.json(discountCodes[idx]);
    }

    if (action === 'manual_tier_change') {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from('families')
        .update({
          subscription_tier: body.tier,
          updated_at: new Date().toISOString(),
        })
        .eq('id', body.familyId);

      if (error) throw error;

      logAuditEvent('admin', 'manual_tier_change', 'family', body.familyId, {
        newTier: body.tier,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('PUT /api/admin/subscriptions error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
