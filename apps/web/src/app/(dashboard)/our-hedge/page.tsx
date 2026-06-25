import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Leaf, RefreshCw, Users, CreditCard, ShieldCheck, ChevronRight, ArrowRight } from 'lucide-react';
import { SignOutButton } from './sign-out-button';
import type { KTFramework } from '@/lib/kitchen-table';

export const metadata = { title: 'Our Hedge - The Hedge' };

const APPROACH_LABEL: Record<string, string> = {
  structured: 'You follow a plan, a real structure you can lean on.',
  blended: 'A loose rhythm, some structure and plenty of freedom.',
  child_led: "You follow your children's lead, wherever it goes.",
  relaxed: "Life is the learning. Ideas when you want them, no pressure.",
  exploratory: 'Nature and the seasons lead the way.',
};

export default async function OurHedgePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('name, family_id, families(name, approach)')
    .eq('id', user.id)
    .single();
  const family = (Array.isArray(profile?.families) ? profile.families[0] : profile?.families) as
    { name: string; approach: string | null } | null;
  const familyId = profile?.family_id;

  let framework: KTFramework | null = null;
  if (familyId) {
    const { data: fw } = await supabase
      .from('family_frameworks')
      .select('profile')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const p = fw?.profile as { framework?: KTFramework } | null;
    framework = p?.framework ?? null;
  }

  const approachLine = family?.approach ? APPROACH_LABEL[family.approach] : null;

  return (
    <div className="max-w-2xl mx-auto pt-2 pb-16">
      <header className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-moss/80">Our Hedge</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mt-2 tracking-tight">
          {family?.name || 'Your family'}
        </h1>
        {approachLine && <p className="text-[14px] text-clay mt-2">{approachLine}</p>}
      </header>

      {/* ─── Our Framework ─── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold text-ink">Our Framework</h2>
          <Link href="/welcome" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-moss hover:text-forest transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
            Re-do our chat
          </Link>
        </div>

        {framework ? (
          <div className="space-y-3">
            {framework.whatYouToldMe && (
              <FwCard title="What you told me"><p>{framework.whatYouToldMe}</p></FwCard>
            )}
            {framework.commitments?.length > 0 && (
              <FwCard title="How The Hedge works for you">
                <ul className="space-y-2.5">
                  {framework.commitments.map((c, i) => (
                    <li key={i} className="flex gap-2.5"><Leaf className="h-4 w-4 text-moss shrink-0 mt-1" /><span>{c}</span></li>
                  ))}
                </ul>
              </FwCard>
            )}
            {framework.quietFloor && <FwCard title="The quiet floor"><p>{framework.quietFloor}</p></FwCard>}
            {framework.forYourWorry && <FwCard title="For your worry"><p>{framework.forYourWorry}</p></FwCard>}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-stone/40 shadow-sm p-6 text-center">
            <p className="text-[14px] text-umber font-medium">You have not had your kitchen-table chat yet.</p>
            <p className="text-[13px] text-clay mt-1">A few warm questions, and The Hedge writes your family its own framework.</p>
            <Link href="/welcome" className="inline-flex items-center gap-2 bg-forest text-parchment font-semibold text-sm rounded-2xl px-5 py-2.5 mt-4 hover:bg-forest/90 transition-colors">
              Pull up a chair <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* ─── The rest of the hearth ─── */}
      <section>
        <h2 className="font-display text-lg font-semibold text-ink mb-3">Settings</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <HearthCard href="/settings?tab=children" icon={Users} title="Our Family" blurb="Children and grown-ups" />
          <HearthCard href="/settings/billing" icon={CreditCard} title="Our Plan" blurb="Your subscription" />
          <HearthCard href="/settings" icon={ShieldCheck} title="Account & Privacy" blurb="Login, data, GDPR" />
        </div>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}

function FwCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-stone/40 shadow-sm p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-moss/80 mb-2.5">{title}</p>
      <div className="text-[15px] text-umber leading-relaxed">{children}</div>
    </div>
  );
}

function HearthCard({ href, icon: Icon, title, blurb }: { href: string; icon: React.ElementType; title: string; blurb: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-2xl bg-white border border-stone/40 p-4 shadow-sm transition-all hover:border-moss/40">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest/10">
        <Icon className="h-4 w-4 text-forest" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink">{title}</p>
        <p className="text-[11px] text-clay truncate">{blurb}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-stone shrink-0 transition-all group-hover:text-moss group-hover:translate-x-0.5" />
    </Link>
  );
}
