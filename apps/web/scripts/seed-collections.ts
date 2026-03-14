import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CollectionSeed {
  title: string;
  slug: string;
  description: string;
  emoji: string;
  activity_ids: string[];
  featured: boolean;
  seasonal: boolean;
  event_date: string | null;
  published: boolean;
}

async function main() {
  console.log('Seeding collections...');

  // First, fetch all activities to map slugs to real UUIDs
  const { data: activities, error: actError } = await supabase
    .from('activities')
    .select('id, slug');

  if (actError) {
    console.error('Failed to fetch activities:', actError);
    process.exit(1);
  }

  const slugToId: Record<string, string> = {};
  for (const a of activities || []) {
    slugToId[a.slug] = a.id;
  }

  console.log(`Found ${Object.keys(slugToId).length} activities in DB.`);

  // Map mock activity IDs to real UUIDs using slug matching
  // The mock data uses IDs like 'act-1' which correspond to activities by order.
  // We'll use the activity slugs from mock data to match.
  // Map mock IDs to actual DB slugs (the real seeded activities have different slugs)
  const mockIdToSlug: Record<string, string> = {
    'act-1': 'frogspawn-safari',
    'act-2': 'cloud-detective-walk',
    'act-3': 'irish-soda-bread-baking',
    'act-4': 'kitchen-volcano',
    'act-5': 'nature-paintbrush-art',
    'act-6': 'shadow-drawing',
    'act-7': 'story-stones',
    'act-8': 'shape-detectives',
    'act-9': 'leaf-rubbing-gallery',
    'act-10': 'breathing-buddies',
    'act-11': 'cardboard-box-world',
    'act-12': 'puddle-jumping-championship',
    'act-13': 'invisible-ink-secret-messages',
    'act-14': 'hedgerow-treasure-hunt',
    'act-15': 'gratitude-jar',
    'act-16': 'tell-the-time-clock-making',
    'act-17': 'sensory-calm-box',
    'act-18': 'raindrop-races',
    'act-1-var-1': 'indoor-obstacle-course',
    'act-5-var-1': 'animal-movement-game',
  };

  function resolveActivityIds(mockIds: string[]): string[] {
    const resolved: string[] = [];
    for (const mockId of mockIds) {
      const slug = mockIdToSlug[mockId];
      if (slug && slugToId[slug]) {
        resolved.push(slugToId[slug]);
      } else {
        console.warn(`  Warning: Could not resolve mock ID "${mockId}" (slug: ${slug || 'unknown'})`);
      }
    }
    return resolved;
  }

  const collections: CollectionSeed[] = [
    {
      title: 'Spring Has Sprung',
      slug: 'spring-has-sprung',
      description: 'Activities perfect for the new season - frogspawn, flowers, and fresh air.',
      emoji: '🌱',
      activity_ids: resolveActivityIds(['act-1', 'act-2', 'act-12', 'act-14']),
      featured: true,
      seasonal: true,
      event_date: null,
      published: true,
    },
    {
      title: 'Rainy Day Rescue',
      slug: 'rainy-day-rescue',
      description: 'Stuck indoors? These activities will save the day.',
      emoji: '🌧️',
      activity_ids: resolveActivityIds(['act-3', 'act-5', 'act-6', 'act-11', 'act-16', 'act-17', 'act-1-var-1']),
      featured: true,
      seasonal: false,
      event_date: null,
      published: true,
    },
    {
      title: 'Quick Wins (Under 20 min)',
      slug: 'quick-wins',
      description: 'Short on time? These activities pack a punch in 20 minutes or less.',
      emoji: '⚡',
      activity_ids: resolveActivityIds(['act-6', 'act-7', 'act-8', 'act-9', 'act-10', 'act-18']),
      featured: true,
      seasonal: false,
      event_date: null,
      published: true,
    },
    {
      title: 'Perfect for Under 5s',
      slug: 'under-5s',
      description: 'Age-appropriate activities for toddlers and preschoolers.',
      emoji: '🧸',
      activity_ids: resolveActivityIds(['act-3', 'act-5', 'act-8', 'act-17', 'act-18', 'act-5-var-1']),
      featured: false,
      seasonal: false,
      event_date: null,
      published: true,
    },
    {
      title: 'Outdoor Adventures',
      slug: 'outdoor-adventures',
      description: 'Get outside and explore - whatever the weather.',
      emoji: '🏕️',
      activity_ids: resolveActivityIds(['act-1', 'act-2', 'act-4', 'act-12']),
      featured: false,
      seasonal: false,
      event_date: null,
      published: true,
    },
    {
      title: 'Science Week Special',
      slug: 'science-week',
      description: 'Experiments and discoveries for Science Week Ireland.',
      emoji: '🔬',
      activity_ids: resolveActivityIds(['act-4', 'act-13']),
      featured: false,
      seasonal: true,
      event_date: '2026-11-08',
      published: true,
    },
    {
      title: 'Bedtime Wind Down',
      slug: 'bedtime-wind-down',
      description: 'Calm activities perfect for winding down before bed.',
      emoji: '🌙',
      activity_ids: resolveActivityIds(['act-10', 'act-15', 'act-7']),
      featured: false,
      seasonal: false,
      event_date: null,
      published: true,
    },
    {
      title: 'Car Journey Savers',
      slug: 'car-activities',
      description: 'Keep everyone entertained on long drives.',
      emoji: '🚗',
      activity_ids: resolveActivityIds(['act-7']),
      featured: false,
      seasonal: false,
      event_date: null,
      published: true,
    },
  ];

  // Delete existing collections first (idempotent)
  const { error: deleteError } = await supabase
    .from('collections')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all

  if (deleteError) {
    console.error('Failed to clear existing collections:', deleteError);
    // Continue anyway - table might not exist yet
  }

  // Insert collections
  const { data: inserted, error: insertError } = await supabase
    .from('collections')
    .insert(collections)
    .select();

  if (insertError) {
    console.error('Failed to insert collections:', insertError);
    process.exit(1);
  }

  console.log(`Successfully seeded ${inserted?.length || 0} collections:`);
  for (const col of inserted || []) {
    const actCount = ((col.activity_ids as string[]) || []).length;
    console.log(`  ${col.emoji} ${col.title} (${actCount} activities, ${col.featured ? 'featured' : 'standard'})`);
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
