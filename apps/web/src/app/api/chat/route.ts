import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from '@/lib/ai-model';
import { createApiClient } from '@/lib/supabase/api-client';
import { apiError, apiOptions } from '@/lib/api-response';
import { buildFamilyContext, recordAiMemory } from '@/lib/family-context';
import { generateSparkActivity, BUILD_INTENT, pickChildFromText } from '@/lib/spark';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are The Hedge, a warm, calm companion for Irish families, inspired by Ireland's hedge schools. You talk with parents about their children's learning, play, and home education.

How you sound:
- Calm and unhurried. Learning that feels like a breath, not a battle.
- Warm and encouraging, like a text from your most resourceful friend.
- Southern Irish English: "lovely" not "great", "mam" not "mom", "jumper" not "sweater". Never use the word "wee" or the word "grand".
- Never use em dashes. Use ordinary dashes or commas instead.
- Never mention points, scores, streaks, or any kind of gamified tracking.
- Never guilt-trip a parent about screen time. Never talk about "optimising" or "hacking" children.

What you can do:
- Chat naturally and answer questions in plain, friendly prose.
- Suggest activities when it helps, woven into your reply as ideas a parent can actually use, not rigid forms. Prefer household materials, nothing they would need to buy.
- Answer home education questions, including Irish home-ed practicalities, Tusla registration, and the Alternative Education Assessment and Registration Service (AEARS) process. Be accurate, calm, and practical, and gently suggest checking official Tusla guidance for anything formal.

Keep replies conversational and to the point. You remember the whole conversation so far, so build on what the parent has already told you rather than starting fresh each time.

Privacy: you only ever use THIS family's own information to help them. Their details are private to them and are never used to help any other family.`;

const RATE_LIMITS: Record<string, number> = {
  free: 5,
  family: 30,
  educator: 999,
};

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function OPTIONS() {
  return apiOptions();
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error } = await createApiClient(request);
    if (!user) return apiError(error || 'Unauthorized', 401);

    // Get user profile and tier
    const { data: profile } = await supabase
      .from('users')
      .select('family_id, families(subscription_tier)')
      .eq('id', user.id)
      .single();

    const family = (
      Array.isArray(profile?.families) ? profile.families[0] : profile?.families
    ) as { subscription_tier: string } | null;

    const tier = family?.subscription_tier || 'free';
    const weeklyLimit = RATE_LIMITS[tier] || 5;
    const familyId = profile?.family_id;

    // Enforce the weekly limit server-side against the real ai_usage ledger.
    // (Monday-start week, matching the rest of the app.)
    const now = new Date();
    const day = now.getDay();
    const weekStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - day + (day === 0 ? -6 : 1)
    );
    let used = 0;
    if (familyId) {
      const { count } = await supabase
        .from('ai_usage')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId)
        .eq('feature', 'ai_chat')
        .gte('created_at', weekStart.toISOString());
      used = count || 0;
    }
    if (used >= weeklyLimit) {
      return apiError(
        `You've used all ${weeklyLimit} of this week's chats on the ${tier} plan. Upgrade to keep the conversation going.`,
        402
      );
    }

    const body = await request.json();
    const { messages, context } = body as {
      messages?: ChatMessage[];
      context?: unknown;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return apiError('Missing messages', 400);
    }

    // Normalise and resend the full conversation so the model has memory.
    const conversation = messages
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' &&
          m.content.trim().length > 0
      )
      .map((m) => ({ role: m.role, content: m.content }));

    if (conversation.length === 0 || conversation[conversation.length - 1].role !== 'user') {
      return apiError('The conversation must end with a user message', 400);
    }

    // ── Spark in Ask: if the parent asks to build a specific activity, generate
    // one with the same curriculum-grounded logic and hand it back as a card,
    // instead of a chat reply. Falls through to a normal reply if it cannot. ──
    const lastUser = conversation[conversation.length - 1].content;
    if (familyId && BUILD_INTENT.test(lastUser)) {
      const { data: kids } = await supabase
        .from('children')
        .select('id, name, date_of_birth, interests, school_status, territory')
        .eq('family_id', familyId);
      const children = kids || [];
      const child = pickChildFromText(children, lastUser);
      if (child) {
        const result = await generateSparkActivity(supabase, { familyId, child, prompt: lastUser });
        if (result) {
          // Counts as this family's AI turn (the normal path below would
          // otherwise charge it; we return before reaching it).
          await supabase.from('ai_usage').insert({ family_id: familyId, feature: 'ai_chat' });
          void recordAiMemory(familyId, `Asked to build an activity: ${lastUser}`);
          const reply = `Here is something for ${result.childName}, ready to go and tied to the curriculum. Tap it to open, have a go, and log it whenever you like.`;
          return new Response(JSON.stringify({ type: 'activity', reply, activity: result }), {
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
          });
        }
        // generation failed: fall through to a normal conversational reply below.
      }
    }

    // Assemble a rich, personalised picture of THIS family from their own real
    // data (framework, children, what they've done lately, favourites, and the
    // memory we've built up over time), and fold it into the system prompt so it
    // shapes every turn without ever showing up in the visible transcript.
    const { text: familyContextText } = await buildFamilyContext(supabase, familyId);

    const contextBlocks: string[] = [];
    if (familyContextText) contextBlocks.push(familyContextText);
    // Any extra context the client passed (weather, season, etc).
    if (context) contextBlocks.push(`Right now: ${JSON.stringify(context)}`);

    const system = contextBlocks.length
      ? `${SYSTEM_PROMPT}\n\nWhat you know about this family (use it naturally, do not read it back as a list):\n${contextBlocks.join('\n')}`
      : SYSTEM_PROMPT;

    // Record the spend before streaming so the limit means something even if
    // the client disconnects mid-stream.
    if (familyId) {
      await supabase.from('ai_usage').insert({ family_id: familyId, feature: 'ai_chat' });
    }

    const anthropicStream = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1536,
      system,
      messages: conversation,
      stream: true,
    });

    // Learn this family a little more: jot down the gist of what they just
    // asked about so future replies build on it. Fire-and-forget and safe; it
    // must never delay or break the reply.
    const lastUserAsk = conversation[conversation.length - 1]?.content;
    if (familyId && lastUserAsk) {
      void recordAiMemory(familyId, `Asked: ${lastUserAsk}`);
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of anthropicStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (streamErr) {
          console.error('AI chat stream error:', streamErr);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('AI chat error:', err);
    return apiError('Failed to reply', 500);
  }
}
