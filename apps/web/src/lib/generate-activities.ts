import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase/admin';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CATEGORIES = [
  'nature', 'kitchen', 'science', 'art', 'movement',
  'literacy', 'maths', 'life_skills', 'calm', 'social',
] as const;

const LOCATIONS = ['indoor', 'outdoor', 'both', 'anywhere'] as const;
const ENERGY_LEVELS = ['calm', 'moderate', 'active'] as const;
const MESS_LEVELS = ['none', 'low', 'medium', 'high'] as const;
const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;

type Category = typeof CATEGORIES[number];
type Location = typeof LOCATIONS[number];
type EnergyLevel = typeof ENERGY_LEVELS[number];
type MessLevel = typeof MESS_LEVELS[number];

interface GeneratedActivity {
  title: string;
  slug: string;
  description: string;
  instructions: { steps: string[] };
  category: Category;
  ageMin: number;
  ageMax: number;
  durationMinutes: number;
  location: Location;
  weather: string[];
  season: string[];
  materials: { name: string; household_common: boolean }[];
  learningOutcomes: string[];
  curriculumTags: Record<string, string[]> | null;
  energyLevel: EnergyLevel;
  messLevel: MessLevel;
  screenFree: boolean;
}

export interface GenerationResult {
  success: boolean;
  generated: number;
  activities: { title: string; slug: string; category: string }[];
  errors: string[];
}

function getCurrentSeason(): string {
  const month = new Date().getMonth(); // 0-indexed
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function getMonthName(): string {
  return new Date().toLocaleString('en-IE', { month: 'long' });
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function getExistingTitles(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('activities')
    .select('title');

  if (error) {
    console.error('Failed to fetch existing titles:', error);
    return [];
  }

  return (data || []).map((a: { title: string }) => a.title);
}

async function getExistingSlugs(): Promise<Set<string>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('activities')
    .select('slug');

  if (error) {
    console.error('Failed to fetch existing slugs:', error);
    return new Set();
  }

  return new Set((data || []).map((a: { slug: string }) => a.slug));
}

function buildPrompt(existingTitles: string[], count: number): string {
  const season = getCurrentSeason();
  const month = getMonthName();

  return `You are a content creator for The Hedge, an Irish family learning platform inspired by Ireland's hedge schools. Generate exactly ${count} new, unique activities for families.

IMPORTANT CONTEXT:
- It is currently ${month} (${season}) in Ireland
- Activities should be seasonally appropriate
- Use Irish English: "grand" not "great", "mam" not "mom", "jumper" not "sweater"
- All activities must be screen-free
- Only use household materials — nothing families would need to buy
- Activities should be rooted in Irish culture, nature, and geography where appropriate
- Cover a mix of categories and age ranges

DO NOT duplicate any of these existing activity titles:
${existingTitles.map((t) => `- ${t}`).join('\n')}

Generate exactly ${count} activities as a JSON array. Each activity must match this exact schema:

{
  "title": "Activity Title",
  "description": "2-3 sentence engaging description in Irish English",
  "instructions": { "steps": ["Step 1 detailed instruction", "Step 2...", "...at least 5 steps"] },
  "category": "one of: ${CATEGORIES.join(', ')}",
  "ageMin": 3,
  "ageMax": 10,
  "durationMinutes": 30,
  "location": "one of: ${LOCATIONS.join(', ')}",
  "weather": ["array of: sunny, dry, overcast, rainy, windy, mild, cold, any"],
  "season": ["array of: ${SEASONS.join(', ')}"],
  "materials": [{ "name": "Material name", "household_common": true }],
  "learningOutcomes": ["What children learn from this activity"],
  "curriculumTags": { "aistear_theme": ["Well-being", "Identity and Belonging", "Communicating", "Exploring and Thinking"] },
  "energyLevel": "one of: ${ENERGY_LEVELS.join(', ')}",
  "messLevel": "one of: ${MESS_LEVELS.join(', ')}",
  "screenFree": true
}

Rules for the values:
- category MUST be exactly one of: ${CATEGORIES.join(', ')}
- location MUST be exactly one of: ${LOCATIONS.join(', ')}
- energyLevel MUST be exactly one of: ${ENERGY_LEVELS.join(', ')}
- messLevel MUST be exactly one of: ${MESS_LEVELS.join(', ')}
- ageMin must be between 0 and 14
- ageMax must be between ageMin and 14
- durationMinutes should be between 10 and 120
- instructions.steps must have at least 5 steps
- materials should all have household_common: true (we only suggest household items)
- curriculumTags should map Aistear themes to relevant sub-themes
- Emphasise the current season (${season}) but include a mix

Respond with ONLY the JSON array, no other text.`;
}

function validateActivity(activity: GeneratedActivity): string[] {
  const errors: string[] = [];

  if (!activity.title || typeof activity.title !== 'string') {
    errors.push('Missing or invalid title');
  }
  if (!activity.description || typeof activity.description !== 'string') {
    errors.push('Missing or invalid description');
  }
  if (!activity.instructions?.steps || !Array.isArray(activity.instructions.steps) || activity.instructions.steps.length < 3) {
    errors.push('Instructions must have at least 3 steps');
  }
  if (!CATEGORIES.includes(activity.category as Category)) {
    errors.push(`Invalid category: ${activity.category}`);
  }
  if (!LOCATIONS.includes(activity.location as Location)) {
    errors.push(`Invalid location: ${activity.location}`);
  }
  if (!ENERGY_LEVELS.includes(activity.energyLevel as EnergyLevel)) {
    errors.push(`Invalid energyLevel: ${activity.energyLevel}`);
  }
  if (!MESS_LEVELS.includes(activity.messLevel as MessLevel)) {
    errors.push(`Invalid messLevel: ${activity.messLevel}`);
  }
  if (typeof activity.ageMin !== 'number' || activity.ageMin < 0 || activity.ageMin > 14) {
    errors.push(`Invalid ageMin: ${activity.ageMin}`);
  }
  if (typeof activity.ageMax !== 'number' || activity.ageMax < activity.ageMin || activity.ageMax > 14) {
    errors.push(`Invalid ageMax: ${activity.ageMax}`);
  }
  if (typeof activity.durationMinutes !== 'number' || activity.durationMinutes < 5 || activity.durationMinutes > 180) {
    errors.push(`Invalid durationMinutes: ${activity.durationMinutes}`);
  }
  if (!Array.isArray(activity.materials)) {
    errors.push('Materials must be an array');
  }
  if (!Array.isArray(activity.learningOutcomes)) {
    errors.push('learningOutcomes must be an array');
  }
  if (!Array.isArray(activity.weather)) {
    errors.push('weather must be an array');
  }
  if (!Array.isArray(activity.season)) {
    errors.push('season must be an array');
  }

  return errors;
}

export async function generateActivities(count: number = 5): Promise<GenerationResult> {
  const result: GenerationResult = {
    success: false,
    generated: 0,
    activities: [],
    errors: [],
  };

  try {
    // Fetch existing titles and slugs to avoid duplicates
    const [existingTitles, existingSlugs] = await Promise.all([
      getExistingTitles(),
      getExistingSlugs(),
    ]);

    const prompt = buildPrompt(existingTitles, count);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON array from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      result.errors.push('Failed to parse JSON from AI response');
      return result;
    }

    let rawActivities: GeneratedActivity[];
    try {
      rawActivities = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      result.errors.push(`JSON parse error: ${parseErr instanceof Error ? parseErr.message : 'Unknown'}`);
      return result;
    }

    if (!Array.isArray(rawActivities) || rawActivities.length === 0) {
      result.errors.push('AI returned empty or non-array response');
      return result;
    }

    const supabase = createAdminClient();
    const existingTitleSet = new Set(existingTitles.map((t) => t.toLowerCase()));

    for (const activity of rawActivities) {
      // Validate the activity
      const validationErrors = validateActivity(activity);
      if (validationErrors.length > 0) {
        result.errors.push(`Skipped "${activity.title || 'unknown'}": ${validationErrors.join(', ')}`);
        continue;
      }

      // Skip duplicates
      if (existingTitleSet.has(activity.title.toLowerCase())) {
        result.errors.push(`Skipped "${activity.title}": duplicate title`);
        continue;
      }

      // Generate unique slug
      let slug = slugify(activity.title);
      let slugSuffix = 1;
      while (existingSlugs.has(slug)) {
        slug = `${slugify(activity.title)}-${slugSuffix}`;
        slugSuffix++;
      }

      // Insert into DB as unpublished draft
      const { error: insertError } = await supabase
        .from('activities')
        .insert({
          title: activity.title,
          slug,
          description: activity.description,
          instructions: activity.instructions,
          category: activity.category,
          age_min: activity.ageMin,
          age_max: activity.ageMax,
          duration_minutes: activity.durationMinutes,
          location: activity.location,
          weather: activity.weather,
          season: activity.season,
          materials: activity.materials,
          learning_outcomes: activity.learningOutcomes,
          curriculum_tags: activity.curriculumTags || null,
          energy_level: activity.energyLevel,
          mess_level: activity.messLevel,
          screen_free: activity.screenFree !== false,
          premium: false,
          created_by: 'ai-pipeline',
          published: false,
        });

      if (insertError) {
        result.errors.push(`Failed to insert "${activity.title}": ${insertError.message}`);
        continue;
      }

      // Track successful insert
      existingSlugs.add(slug);
      existingTitleSet.add(activity.title.toLowerCase());
      result.activities.push({
        title: activity.title,
        slug,
        category: activity.category,
      });
      result.generated++;
    }

    result.success = result.generated > 0;
    return result;
  } catch (error) {
    result.errors.push(
      `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return result;
  }
}
