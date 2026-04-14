'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
  CreditCard,
  Users,
  Crown,
  GraduationCap,
  User,
  Tag,
  Plus,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

interface SubStats {
  totalFamilies: number;
  tierDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  stripeConnected: number;
  monthlyRevenue: number;
  discountCodes: number;
  activeDiscounts: number;
}

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

type Tab = 'overview' | 'discounts' | 'manual';

export function SubscriptionsClient() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<SubStats | null>(null);
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);

  // Discount form
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [discountMaxUses, setDiscountMaxUses] = useState('100');
  const [discountValidUntil, setDiscountValidUntil] = useState('');

  // Manual tier
  const [manualFamilyId, setManualFamilyId] = useState('');
  const [manualTier, setManualTier] = useState('family');
  const [manualLoading, setManualLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Fetch stats failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDiscounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/subscriptions?entity=discounts');
      const data = await res.json();
      setDiscounts(data || []);
    } catch (err) {
      console.error('Fetch discounts failed:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'discounts') fetchDiscounts();
  }, [activeTab, fetchDiscounts]);

  const handleCreateDiscount = async () => {
    if (!discountCode.trim()) return;
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode,
          type: discountType,
          value: parseFloat(discountValue),
          maxUses: parseInt(discountMaxUses),
          validUntil: discountValidUntil || undefined,
          applicableTiers: ['family', 'educator'],
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setShowDiscountForm(false);
      setDiscountCode('');
      setDiscountValue('10');
      fetchDiscounts();
    } catch (err) {
      console.error('Create discount failed:', err);
      alert('Failed to create discount');
    }
  };

  const handleToggleDiscount = async (id: string) => {
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_discount', discountId: id }),
      });
      if (!res.ok) throw new Error('Failed');
      fetchDiscounts();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const handleManualTierChange = async () => {
    if (!manualFamilyId.trim()) return;
    setManualLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manual_tier_change',
          familyId: manualFamilyId,
          tier: manualTier,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setManualFamilyId('');
      alert('Tier changed successfully!');
      fetchStats();
    } catch (err) {
      console.error('Manual tier change failed:', err);
      alert('Failed to change tier');
    } finally {
      setManualLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: TrendingUp },
    { key: 'discounts', label: 'Discounts', icon: Tag },
    { key: 'manual', label: 'Manual Override', icon: CreditCard },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest tracking-tight">
            Subscriptions
          </h1>
          <p className="text-clay/70 mt-1">
            Revenue, tiers, and discount management.
          </p>
        </div>
        <button onClick={fetchStats} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone pb-px">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === key
                ? 'bg-linen border border-stone border-b-linen text-forest -mb-px'
                : 'text-clay/50 hover:text-clay/70'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 text-clay/50 mb-3">
                <Users className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Families</span>
              </div>
              <p className="text-2xl font-bold font-display text-forest">{stats.totalFamilies}</p>
            </div>

            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 text-clay/50 mb-3">
                <DollarSign className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Revenue</span>
              </div>
              <p className="text-2xl font-bold font-display text-forest">
                {stats.stripeConnected > 0 ? `\u20AC${stats.monthlyRevenue}` : '\u2014'}
              </p>
              <p className="text-[10px] text-clay/30 mt-1">
                {stats.stripeConnected} Stripe-connected
              </p>
            </div>

            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 text-clay/50 mb-3">
                <Tag className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Discounts</span>
              </div>
              <p className="text-2xl font-bold font-display text-forest">{stats.activeDiscounts}</p>
              <p className="text-[10px] text-clay/30 mt-1">{stats.discountCodes} total codes</p>
            </div>

            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 text-clay/50 mb-3">
                <CreditCard className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Stripe Connected</span>
              </div>
              <p className="text-2xl font-bold font-display text-forest">{stats.stripeConnected}</p>
            </div>
          </div>

          {/* Tier distribution */}
          <div className="card-elevated p-6">
            <h2 className="font-display text-lg font-bold text-forest mb-4">Tier Distribution</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {Object.entries(stats.tierDistribution).map(([tier, count]) => {
                const icons: Record<string, React.ElementType> = { free: User, family: Crown, educator: GraduationCap };
                const colors: Record<string, string> = { free: 'text-clay/50', family: 'text-moss', educator: 'text-gold' };
                const Icon = icons[tier] || User;
                return (
                  <div key={tier} className="flex items-center gap-4 rounded-2xl bg-parchment/50 p-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-linen ${colors[tier]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold font-display text-forest">{count}</p>
                      <p className="text-xs text-clay/50 capitalize">{tier}</p>
                    </div>
                    <div className="ml-auto">
                      <p className="text-sm font-semibold text-clay/40">
                        {stats.totalFamilies > 0 ? Math.round((count / stats.totalFamilies) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status distribution */}
          <div className="card-elevated p-6">
            <h2 className="font-display text-lg font-bold text-forest mb-4">Status Distribution</h2>
            <div className="grid gap-3 sm:grid-cols-4">
              {Object.entries(stats.statusDistribution).map(([status, count]) => {
                const statusColors: Record<string, string> = {
                  active: 'bg-moss/10 text-moss',
                  trialing: 'bg-gold/10 text-gold',
                  past_due: 'bg-rust/10 text-rust',
                  cancelled: 'bg-clay/10 text-clay/50',
                };
                return (
                  <div key={status} className="rounded-2xl bg-parchment/50 p-4 text-center">
                    <p className="text-xl font-bold font-display text-forest">{count}</p>
                    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase mt-1 ${statusColors[status] || 'bg-linen text-clay/50'}`}>
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {loading && activeTab === 'overview' && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-5 w-5 animate-spin text-clay/30" />
        </div>
      )}

      {/* Discounts Tab */}
      {activeTab === 'discounts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowDiscountForm(!showDiscountForm)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              New Discount Code
            </button>
          </div>

          {showDiscountForm && (
            <div className="card-elevated p-6 space-y-4 max-w-lg">
              <h3 className="font-display text-lg font-bold text-forest">Create Discount Code</h3>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-1 block">Code</label>
                <Input
                  placeholder="e.g. SPRING25"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="h-9 rounded-lg border-stone bg-parchment"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-1 block">Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDiscountType('percentage')}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                        discountType === 'percentage' ? 'bg-forest text-parchment' : 'border border-stone text-clay/50'
                      }`}
                    >
                      Percentage
                    </button>
                    <button
                      onClick={() => setDiscountType('fixed')}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                        discountType === 'fixed' ? 'bg-forest text-parchment' : 'border border-stone text-clay/50'
                      }`}
                    >
                      Fixed Amount
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-1 block">
                    Value ({discountType === 'percentage' ? '%' : '\u20AC'})
                  </label>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="h-9 rounded-lg border-stone bg-parchment"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-1 block">Max Uses</label>
                  <Input
                    type="number"
                    value={discountMaxUses}
                    onChange={(e) => setDiscountMaxUses(e.target.value)}
                    className="h-9 rounded-lg border-stone bg-parchment"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-1 block">Valid Until</label>
                  <Input
                    type="date"
                    value={discountValidUntil}
                    onChange={(e) => setDiscountValidUntil(e.target.value)}
                    className="h-9 rounded-lg border-stone bg-parchment"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreateDiscount} className="btn-primary text-sm py-2 px-4">
                  Create Code
                </button>
                <button onClick={() => setShowDiscountForm(false)} className="btn-secondary text-sm py-2 px-4">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {discounts.length === 0 && !showDiscountForm ? (
            <div className="card-elevated p-12 text-center">
              <Tag className="h-8 w-8 text-clay/20 mx-auto mb-3" />
              <p className="text-sm text-clay/40">No discount codes created yet.</p>
            </div>
          ) : (
            <div className="card-elevated overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone bg-parchment/30">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Code</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Discount</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Uses</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Valid Until</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-clay/40">Status</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-clay/40">Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((d) => (
                    <tr key={d.id} className="border-b border-stone hover:bg-parchment/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-bold text-forest">{d.code}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-clay/60">
                        {d.type === 'percentage' ? `${d.value}%` : `\u20AC${d.value}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-clay/60">{d.usedCount}/{d.maxUses}</td>
                      <td className="px-4 py-3 text-xs text-clay/40">
                        {new Date(d.validUntil).toLocaleDateString('en-IE', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          d.active ? 'bg-moss/10 text-moss' : 'bg-clay/10 text-clay/40'
                        }`}>
                          {d.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleDiscount(d.id)}
                          className="text-clay/40 hover:text-forest transition-all"
                        >
                          {d.active ? <ToggleRight className="h-5 w-5 text-moss" /> : <ToggleLeft className="h-5 w-5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Manual Override Tab */}
      {activeTab === 'manual' && (
        <div className="max-w-lg space-y-6">
          <div className="card-elevated p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-forest">Manual Tier Override</h2>
            <p className="text-sm text-clay/60">
              Change a family&apos;s subscription tier without going through Stripe. Use for comp accounts, testing, or corrections.
            </p>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-2 block">
                Family ID
              </label>
              <Input
                placeholder="Enter family UUID..."
                value={manualFamilyId}
                onChange={(e) => setManualFamilyId(e.target.value)}
                className="h-10 rounded-lg border-stone bg-parchment"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-clay/50 mb-2 block">
                New Tier
              </label>
              <div className="flex gap-2">
                {['free', 'family', 'educator'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setManualTier(tier)}
                    className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                      manualTier === tier
                        ? 'bg-forest text-parchment'
                        : 'bg-parchment text-clay/50 border border-stone hover:border-forest/20'
                    }`}
                  >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleManualTierChange}
              disabled={manualLoading || !manualFamilyId.trim()}
              className="btn-primary"
            >
              {manualLoading ? 'Applying...' : 'Apply Tier Change'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
