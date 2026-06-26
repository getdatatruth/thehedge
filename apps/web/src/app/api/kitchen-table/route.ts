import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from '@/lib/ai-model';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { coordsForCounty } from '@/lib/ie-counties';
import {
  deriveProfile,
  buildFallbackFramework,
  frameworkPrompt,
  frameworkToMarkdown,
  type KTAnswers,
  type KTFramework,
} from '@/lib/kitchen-table';
import { seedStarterWeek } from '@/lib/starter-plan';

// POST /api/kitchen-table
// Takes the kitchen-table answers, writes the Family Framework (one invisible
// LLM pass with a deterministic fallback), persists the spine, and returns it.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let answers: KTAnswers;
  try {
    const body = await request.json();
    answers = body.answers as KTAnswers;
    if (!answers || !Array.isArray(answers.children)) throw new Error('bad answers');
  } catch {
    return NextResponse.json({ error: 'Invalid answers' }, { status: 400 });
  }

  const profile = deriveProfile(answers);

  const { data: profileRow } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();
  let familyId = profileRow?.family_id as string | undefined;

  // A brand-new account has only an auth user: no family, no users row yet.
  // The Kitchen Table is the first thing they do, so it bootstraps the family
  // itself. Uses the service-role client because under RLS the user client
  // cannot read back (RETURNING) a family it does not yet belong to.
  if (!familyId) {
    const admin = createAdminClient();
    const firstChild = answers.children.find((c) => c?.name?.trim())?.name?.trim();
    const familyName = firstChild
      ? `${firstChild}'s family`
      : (user.user_metadata?.name as string | undefined)?.trim() || 'Your family';
    // Give every newly-onboarded family a 14-day trial of the tier that fits
    // their doorway, so they experience the whole product (Plan, and the
    // AEARS tooling for home-educators) rather than hitting a paywall on the
    // verbs the nav shows them. It lapses to free automatically after 14 days.
    const isHomeEd = profile.doorway === 'homeschool' || profile.doorway === 'considering';
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14);
    const { data: fam, error: famErr } = await admin
      .from('families')
      .insert({
        name: familyName,
        country: 'IE',
        subscription_tier: isHomeEd ? 'educator' : 'family',
        subscription_status: 'trialing',
        trial_ends_at: trialEnds.toISOString(),
      })
      .select('id')
      .single();
    if (famErr || !fam) {
      return NextResponse.json({ error: 'Could not set up your family' }, { status: 500 });
    }
    familyId = fam.id as string;
    const { error: userErr } = await admin.from('users').upsert({
      id: user.id,
      family_id: familyId,
      name: (user.user_metadata?.name as string | undefined)?.trim() || user.email?.split('@')[0] || 'Parent',
      email: user.email,
      role: 'owner',
    });
    if (userErr) {
      return NextResponse.json({ error: 'Could not set up your account' }, { status: 500 });
    }
  }

  // One invisible authoring pass, with a deterministic fallback so it never fails.
  let framework: KTFramework = buildFallbackFramework(profile);
  try {
    if (process.env.ANTHROPIC_API_KEY) {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 900,
        messages: [{ role: 'user', content: frameworkPrompt(profile) }],
      });
      const text = msg.content.find((c) => c.type === 'text');
      if (text && 'text' in text) {
        const raw = text.text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(raw) as KTFramework;
        if (parsed.commitments?.length && parsed.whatYouToldMe) framework = parsed;
      }
    }
  } catch {
    // keep the warm deterministic fallback
  }

  // Persist the spine + finish onboarding. approach maps to the existing
  // education_approach enum; geocode the county so weather works from day one.
  const coords = coordsForCounty(profile.county);
  const familyUpdate: Record<string, unknown> = {
    approach: profile.approach,
    doorway: profile.doorway,
    onboarding_completed: true,
  };
  if (profile.county) familyUpdate.county = profile.county;
  if (coords) { familyUpdate.latitude = coords.lat; familyUpdate.longitude = coords.lng; }
  await supabase.from('families').update(familyUpdate).eq('id', familyId);

  // If this family has no children yet (a fresh onboarding), seed them.
  const { data: existingKids } = await supabase
    .from('children')
    .select('id')
    .eq('family_id', familyId)
    .limit(1);
  if ((existingKids?.length ?? 0) === 0 && profile.children.length > 0) {
    const thisYear = new Date().getFullYear();
    await supabase.from('children').insert(
      profile.children
        .filter((c) => c.name?.trim())
        .map((c) => ({
          family_id: familyId,
          name: c.name.trim(),
          date_of_birth: `${c.age != null ? thisYear - c.age : thisYear - 6}-01-01`,
          interests: c.interests || [],
        })),
    );
  }

  await supabase.from('family_frameworks').insert({
    family_id: familyId,
    transcript: (answers as unknown as { transcript?: unknown }).transcript ?? [],
    profile: { ...profile, framework },
    rendered_markdown: frameworkToMarkdown(framework),
  });

  // Seed a gentle, personalised starter week so the Plan tab (and the week) feel
  // alive from minute one rather than landing empty. Best-effort and idempotent:
  // it only seeds when the family has no daily_plans yet. Uses the service-role
  // client for the same reason the bootstrap above does: a brand-new family's
  // RLS context lags within this request, so the user client cannot reliably
  // read the rows it writes. The seeder scopes every read and write to this
  // family's own ids, so this is safe.
  await seedStarterWeek(createAdminClient(), familyId, profile.approach);

  return NextResponse.json({ framework, profile });
}
