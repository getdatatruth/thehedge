import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from '@/lib/ai-model';
import { createClient } from '@/lib/supabase/server';
import {
  deriveProfile,
  buildFallbackFramework,
  frameworkPrompt,
  type KTAnswers,
  type KTFramework,
} from '@/lib/kitchen-table';

// POST /api/kitchen-table
// Takes the kitchen-table answers, writes the Family Framework (one invisible
// LLM pass with a deterministic fallback), persists the spine, and returns it.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profileRow } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single();
  const familyId = profileRow?.family_id;
  if (!familyId) return NextResponse.json({ error: 'No family' }, { status: 400 });

  let answers: KTAnswers;
  try {
    const body = await request.json();
    answers = body.answers as KTAnswers;
    if (!answers || !Array.isArray(answers.children)) throw new Error('bad answers');
  } catch {
    return NextResponse.json({ error: 'Invalid answers' }, { status: 400 });
  }

  const profile = deriveProfile(answers);

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

  // Persist the spine. approach maps to the existing education_approach enum.
  await supabase
    .from('families')
    .update({ approach: profile.approach, doorway: profile.doorway })
    .eq('id', familyId);

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

  return NextResponse.json({ framework, profile });
}

function frameworkToMarkdown(f: KTFramework): string {
  return [
    `# Your Family Framework`,
    f.opening,
    `## What you told me`,
    f.whatYouToldMe,
    `## How The Hedge will work for you`,
    ...f.commitments.map((c) => `- ${c}`),
    `## The quiet floor`,
    f.quietFloor,
    `## For your worry`,
    f.forYourWorry,
    `## Three things you can do today`,
    ...f.thingsToday.map((t) => `- ${t}`),
  ].join('\n\n');
}
