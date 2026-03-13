// ─────────────────────────────────────────────
// Mock data for front-end development
// Remove when backend is wired up
// ─────────────────────────────────────────────

export interface MockActivity {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  age_min: number;
  age_max: number;
  duration_minutes: number;
  energy_level: string;
  mess_level: string;
  location: string;
  premium: boolean;
  screen_free: boolean;
  season: string[];
  weather: string[];
  learning_outcomes: string[];
  materials: { name: string; household_common: boolean }[];
  instructions: string[];
  created_at: string;
  is_new?: boolean;
  collection_ids?: string[];
  parent_activity_id?: string | null;
  variation_type?: string | null;
}

export interface MockCollection {
  id: string;
  title: string;
  slug: string;
  description: string;
  emoji: string;
  color: string;
  bg: string;
  activity_ids: string[];
  featured: boolean;
  seasonal?: boolean;
  event_date?: string;
}

export interface MockChild {
  id: string;
  name: string;
  date_of_birth: string;
  age: number;
  interests: string[];
  school_status: string;
  learning_style: string;
  total_activities: number;
  total_minutes: number;
  avatar_color: string;
}

export interface MockAchievement {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  unlocked?: boolean;
  unlocked_at?: string;
  progress?: number;
}

export interface MockStreak {
  current: number;
  longest: number;
  last_activity_date: string;
}

export interface MockWeeklyPlan {
  id: string;
  week_start: string;
  generated_at: string;
  activities: {
    day: string;
    activity_id: string;
    activity: MockActivity;
    time_slot: string;
    completed: boolean;
  }[];
}

export interface MockActivityLog {
  id: string;
  activity_id: string;
  activity: { title: string; category: string; slug: string };
  child_ids: string[];
  date: string;
  notes: string | null;
  rating: number | null;
  photos: string[];
  duration_minutes: number | null;
  curriculum_areas?: string[];
}

export interface MockNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

// ─── Activities ──────────────────────────────

export const MOCK_ACTIVITIES: MockActivity[] = [
  {
    id: 'act-1',
    title: 'Frogspawn Safari',
    slug: 'frogspawn-safari',
    description: 'Head to a local pond or ditch to search for frogspawn. Learn about the life cycle of frogs and how to observe wildlife responsibly.',
    category: 'nature',
    age_min: 3,
    age_max: 10,
    duration_minutes: 45,
    energy_level: 'moderate',
    mess_level: 'low',
    location: 'outdoor',
    premium: false,
    screen_free: true,
    season: ['spring'],
    weather: ['clear', 'cloudy'],
    learning_outcomes: ['Life cycles', 'Observation skills', 'Respect for nature'],
    materials: [
      { name: 'Wellies', household_common: true },
      { name: 'Magnifying glass', household_common: false },
      { name: 'Jar for observation', household_common: true },
    ],
    instructions: [
      'Find a local pond, stream or ditch — many parks have these.',
      'Look for clumps of jelly-like eggs in shallow, still water.',
      'Use a magnifying glass to observe the tiny dark dots inside.',
      'Talk about what will happen next — tadpoles, then froglets!',
      'Leave the frogspawn where you found it. Never take it home.',
    ],
    created_at: '2026-03-01T10:00:00Z',
    is_new: true,
    collection_ids: ['col-spring', 'col-outdoor-adventures'],
  },
  {
    id: 'act-2',
    title: 'Cloud Detective Walk',
    slug: 'cloud-detective-walk',
    description: 'Go on a walk and learn to identify different types of clouds. Is it a fluffy cumulus or a wispy cirrus? Great for building observation and vocabulary.',
    category: 'nature',
    age_min: 4,
    age_max: 12,
    duration_minutes: 30,
    energy_level: 'moderate',
    mess_level: 'none',
    location: 'outdoor',
    premium: false,
    screen_free: true,
    season: ['spring', 'summer', 'autumn'],
    weather: ['cloudy', 'partly_cloudy'],
    learning_outcomes: ['Weather knowledge', 'Vocabulary building', 'Observation'],
    materials: [
      { name: 'Cloud identification chart', household_common: false },
      { name: 'Sketchpad', household_common: true },
      { name: 'Pencils', household_common: true },
    ],
    instructions: [
      'Find an open space with a good view of the sky.',
      'Lie on your back and look up — what shapes can you see?',
      'Use the cloud chart to name the clouds: cumulus, stratus, cirrus.',
      'Draw the clouds you can see and label them.',
      'Predict what the weather might do next based on the clouds.',
    ],
    created_at: '2026-03-05T10:00:00Z',
    is_new: true,
    collection_ids: ['col-spring'],
  },
  {
    id: 'act-3',
    title: 'Rainbow Bread Baking',
    slug: 'rainbow-bread-baking',
    description: 'Make simple soda bread together, then add natural food colourings to create a rainbow loaf. Covers measuring, mixing, and the science of baking soda.',
    category: 'kitchen',
    age_min: 3,
    age_max: 10,
    duration_minutes: 60,
    energy_level: 'calm',
    mess_level: 'medium',
    location: 'indoor',
    premium: false,
    screen_free: true,
    season: ['spring', 'summer', 'autumn', 'winter'],
    weather: ['any'],
    learning_outcomes: ['Measuring & counting', 'Following instructions', 'Science of baking'],
    materials: [
      { name: 'Flour', household_common: true },
      { name: 'Baking soda', household_common: true },
      { name: 'Buttermilk', household_common: true },
      { name: 'Food colouring', household_common: false },
    ],
    instructions: [
      'Preheat oven to 200°C. Line a baking tray.',
      'Mix 450g flour, 1 tsp salt, 1 tsp baking soda in a bowl.',
      'Make a well and pour in 350ml buttermilk. Mix gently.',
      'Divide dough into portions and knead in different food colours.',
      'Layer or twist the coloured doughs together.',
      'Shape into a round, cut a cross on top, and bake for 30 minutes.',
    ],
    created_at: '2026-02-20T10:00:00Z',
    collection_ids: ['col-rainy-day', 'col-under-5s'],
  },
  {
    id: 'act-4',
    title: 'Volcano Eruption Experiment',
    slug: 'volcano-eruption',
    description: 'Build a simple volcano from household items and watch it erupt! A classic science experiment that never gets old.',
    category: 'science',
    age_min: 3,
    age_max: 10,
    duration_minutes: 30,
    energy_level: 'moderate',
    mess_level: 'high',
    location: 'outdoor',
    premium: false,
    screen_free: true,
    season: ['spring', 'summer', 'autumn', 'winter'],
    weather: ['clear', 'cloudy'],
    learning_outcomes: ['Chemical reactions', 'Cause and effect', 'Scientific method'],
    materials: [
      { name: 'Baking soda', household_common: true },
      { name: 'Vinegar', household_common: true },
      { name: 'Washing-up liquid', household_common: true },
      { name: 'Food colouring', household_common: false },
      { name: 'Container or bottle', household_common: true },
    ],
    instructions: [
      'Place a small container or bottle on a tray outside.',
      'Build a volcano shape around it with sand, soil, or playdough.',
      'Add 2 tablespoons of baking soda to the container.',
      'Add a squirt of washing-up liquid and red food colouring.',
      'Pour in vinegar and stand back — watch it erupt!',
      'Discuss what happened: the acid and base created CO2 gas.',
    ],
    created_at: '2026-02-15T10:00:00Z',
    collection_ids: ['col-science-week'],
  },
  {
    id: 'act-5',
    title: 'Fingerprint Art Gallery',
    slug: 'fingerprint-art-gallery',
    description: 'Use thumbprints and fingerprints to create tiny characters, animals, and scenes. Simple, creative, and endlessly entertaining.',
    category: 'art',
    age_min: 2,
    age_max: 8,
    duration_minutes: 30,
    energy_level: 'calm',
    mess_level: 'medium',
    location: 'indoor',
    premium: false,
    screen_free: true,
    season: ['spring', 'summer', 'autumn', 'winter'],
    weather: ['any'],
    learning_outcomes: ['Fine motor skills', 'Creativity', 'Self-expression'],
    materials: [
      { name: 'Washable ink pad or paint', household_common: false },
      { name: 'Paper', household_common: true },
      { name: 'Fine-tip markers', household_common: true },
    ],
    instructions: [
      'Press your thumb or finger into the ink pad.',
      'Make prints on the paper — try different fingers for different sizes.',
      'Let the prints dry for a moment.',
      'Use fine markers to add faces, legs, wings, or tails.',
      'Create a whole scene — a garden full of fingerprint bugs!',
    ],
    created_at: '2026-03-08T10:00:00Z',
    is_new: true,
    collection_ids: ['col-rainy-day', 'col-under-5s'],
  },
  {
    id: 'act-6',
    title: 'Freeze Dance Party',
    slug: 'freeze-dance-party',
    description: 'Put on music and dance until the music stops — then freeze! Great for burning energy, listening skills, and pure joy.',
    category: 'movement',
    age_min: 2,
    age_max: 8,
    duration_minutes: 15,
    energy_level: 'active',
    mess_level: 'none',
    location: 'indoor',
    premium: false,
    screen_free: false,
    season: ['spring', 'summer', 'autumn', 'winter'],
    weather: ['any'],
    learning_outcomes: ['Listening skills', 'Body awareness', 'Self-regulation'],
    materials: [
      { name: 'Music player or phone', household_common: true },
    ],
    instructions: [
      'Clear a space in the living room.',
      'Put on some fun music — anything with a beat.',
      'Everyone dances until the music stops.',
      'When it stops, freeze! Hold your position.',
      'Anyone who moves is out — or just keep going for fun.',
      'Try different themes: dance like animals, robots, or jelly.',
    ],
    created_at: '2026-02-28T10:00:00Z',
    collection_ids: ['col-rainy-day', 'col-quick-wins'],
  },
  {
    id: 'act-7',
    title: 'Storytelling Circle',
    slug: 'storytelling-circle',
    description: 'Take turns adding to a story, one sentence at a time. Builds imagination, listening, and collaborative thinking.',
    category: 'literacy',
    age_min: 4,
    age_max: 12,
    duration_minutes: 20,
    energy_level: 'calm',
    mess_level: 'none',
    location: 'anywhere',
    premium: false,
    screen_free: true,
    season: ['spring', 'summer', 'autumn', 'winter'],
    weather: ['any'],
    learning_outcomes: ['Storytelling', 'Vocabulary', 'Collaborative thinking', 'Listening'],
    materials: [],
    instructions: [
      'Sit in a circle — works great in the car too.',
      'One person starts: "Once upon a time..."',
      'Each person adds one sentence to the story.',
      'Keep going until the story reaches a natural end.',
      'Try prompts: "A dragon who was afraid of...", "The day it rained..."',
    ],
    created_at: '2026-02-10T10:00:00Z',
    collection_ids: ['col-quick-wins', 'col-car-activities'],
  },
  {
    id: 'act-8',
    title: 'Shape Hunt Around the House',
    slug: 'shape-hunt',
    description: 'Go on a hunt around the house or garden to find as many different shapes as possible. Circles, triangles, rectangles — they are everywhere!',
    category: 'maths',
    age_min: 2,
    age_max: 6,
    duration_minutes: 20,
    energy_level: 'moderate',
    mess_level: 'none',
    location: 'indoor',
    premium: false,
    screen_free: true,
    season: ['spring', 'summer', 'autumn', 'winter'],
    weather: ['any'],
    learning_outcomes: ['Shape recognition', 'Observation', 'Mathematical vocabulary'],
    materials: [
      { name: 'Paper and pencil', household_common: true },
    ],
    instructions: [
      'Choose a shape to hunt for — start with circles.',
      'Walk around the house looking for that shape.',
      'Draw or write down each one you find.',
      'Move on to the next shape: squares, triangles, rectangles.',
      'Count up — which shape appeared the most?',
    ],
    created_at: '2026-01-25T10:00:00Z',
    collection_ids: ['col-under-5s', 'col-quick-wins'],
  },
  {
    id: 'act-9',
    title: 'Setting the Table Challenge',
    slug: 'setting-table-challenge',
    description: 'Turn setting the table into a fun challenge. Learn place settings, counting, and contributing to family life.',
    category: 'life_skills',
    age_min: 3,
    age_max: 8,
    duration_minutes: 10,
    energy_level: 'calm',
    mess_level: 'none',
    location: 'indoor',
    premium: false,
    screen_free: true,
    season: ['spring', 'summer', 'autumn', 'winter'],
    weather: ['any'],
    learning_outcomes: ['Counting', 'Spatial awareness', 'Responsibility'],
    materials: [
      { name: 'Plates', household_common: true },
      { name: 'Cutlery', household_common: true },
      { name: 'Cups', household_common: true },
    ],
    instructions: [
      'Count how many people will eat — how many plates do we need?',
      'Show the place setting: fork on the left, knife and spoon on the right.',
      'Let your child lay out each place setting.',
      'Add a special touch: fold the napkins, add a flower from the garden.',
      'Time it for fun — can they beat their record?',
    ],
    created_at: '2026-01-20T10:00:00Z',
    collection_ids: ['col-quick-wins'],
  },
  {
    id: 'act-10',
    title: 'Breathing Butterfly',
    slug: 'breathing-butterfly',
    description: 'A gentle breathing exercise where children imagine their hands are butterfly wings, opening and closing with each breath.',
    category: 'calm',
    age_min: 3,
    age_max: 10,
    duration_minutes: 10,
    energy_level: 'calm',
    mess_level: 'none',
    location: 'anywhere',
    premium: false,
    screen_free: true,
    season: ['spring', 'summer', 'autumn', 'winter'],
    weather: ['any'],
    learning_outcomes: ['Self-regulation', 'Mindfulness', 'Body awareness'],
    materials: [],
    instructions: [
      'Sit comfortably and put your hands together in front of your chest.',
      'Your hands are butterfly wings.',
      'Breathe in slowly — open your hands wide like wings spreading.',
      'Breathe out slowly — close your hands back together.',
      'Repeat 5–10 times. Try to make each breath slower.',
      'Notice how you feel afterwards — calmer? More relaxed?',
    ],
    created_at: '2026-02-05T10:00:00Z',
    collection_ids: ['col-quick-wins', 'col-bedtime-wind-down'],
  },
  {
    id: 'act-11',
    title: 'Emotion Charades',
    slug: 'emotion-charades',
    description: 'Act out different emotions without words while others guess. Builds emotional literacy and empathy in a playful way.',
    category: 'social',
    age_min: 4,
    age_max: 10,
    duration_minutes: 20,
    energy_level: 'moderate',
    mess_level: 'none',
    location: 'indoor',
    premium: false,
    screen_free: true,
    season: ['spring', 'summer', 'autumn', 'winter'],
    weather: ['any'],
    learning_outcomes: ['Emotional literacy', 'Empathy', 'Non-verbal communication'],
    materials: [
      { name: 'Cards with emotion words', household_common: false },
    ],
    instructions: [
      'Write emotion words on cards: happy, sad, angry, scared, surprised, proud, shy.',
      'Take turns picking a card (or whispering the emotion to young children).',
      'Act out the emotion using only your face and body — no words!',
      'Others guess which emotion it is.',
      'Talk about when you might feel that way.',
    ],
    created_at: '2026-02-18T10:00:00Z',
    collection_ids: ['col-rainy-day'],
  },
  {
    id: 'act-12',
    title: 'Hedgerow Treasure Hunt',
    slug: 'hedgerow-treasure-hunt',
    description: 'Explore Irish hedgerows to find leaves, berries, feathers, and insects. Create a nature treasure collection and learn what grows in our hedges.',
    category: 'nature',
    age_min: 3,
    age_max: 12,
    duration_minutes: 45,
    energy_level: 'active',
    mess_level: 'low',
    location: 'outdoor',
    premium: true,
    screen_free: true,
    season: ['spring', 'summer', 'autumn'],
    weather: ['clear', 'cloudy'],
    learning_outcomes: ['Biodiversity', 'Plant identification', 'Seasonal awareness'],
    materials: [
      { name: 'Collection bag', household_common: true },
      { name: 'Magnifying glass', household_common: false },
      { name: 'Nature identification book', household_common: false },
    ],
    instructions: [
      'Find a local hedgerow — these are the living walls of Irish fields.',
      'Look for different types of leaves: hawthorn, blackthorn, holly, ivy.',
      'Search for berries, seeds, feathers, or interesting stones.',
      'Use your magnifying glass to spot tiny insects.',
      'Collect fallen items (never pick living plants) and create a nature table at home.',
      'Research what you found — which plants are native to Ireland?',
    ],
    created_at: '2026-03-02T10:00:00Z',
    is_new: true,
    collection_ids: ['col-spring', 'col-outdoor-adventures'],
  },
  {
    id: 'act-13',
    title: 'Ice Cream in a Bag',
    slug: 'ice-cream-in-a-bag',
    description: 'Make real ice cream using just two bags, ice, salt, and a few ingredients. A delicious science experiment!',
    category: 'kitchen',
    age_min: 4,
    age_max: 12,
    duration_minutes: 30,
    energy_level: 'active',
    mess_level: 'medium',
    location: 'outdoor',
    premium: true,
    screen_free: true,
    season: ['summer'],
    weather: ['clear'],
    learning_outcomes: ['States of matter', 'Freezing point', 'Following instructions'],
    materials: [
      { name: 'Milk or cream', household_common: true },
      { name: 'Sugar', household_common: true },
      { name: 'Vanilla extract', household_common: true },
      { name: 'Ice', household_common: true },
      { name: 'Salt', household_common: true },
      { name: 'Two zip-lock bags', household_common: true },
    ],
    instructions: [
      'In a small bag, mix 1 cup milk, 2 tbsp sugar, 1 tsp vanilla.',
      'Seal tightly, squeezing out the air.',
      'Fill the large bag halfway with ice, add 6 tbsp salt.',
      'Place the small bag inside the large bag. Seal it.',
      'Shake vigorously for 5–10 minutes.',
      'Open the small bag carefully — ice cream!',
    ],
    created_at: '2026-02-12T10:00:00Z',
    collection_ids: ['col-science-week'],
  },
  {
    id: 'act-14',
    title: 'Leaf Printing',
    slug: 'leaf-printing',
    description: 'Collect interesting leaves and use them to make beautiful prints with paint. Explore shapes, textures, and patterns in nature.',
    category: 'art',
    age_min: 2,
    age_max: 8,
    duration_minutes: 30,
    energy_level: 'calm',
    mess_level: 'high',
    location: 'indoor',
    premium: false,
    screen_free: true,
    season: ['autumn', 'spring'],
    weather: ['any'],
    learning_outcomes: ['Texture awareness', 'Creativity', 'Fine motor skills'],
    materials: [
      { name: 'Collected leaves', household_common: false },
      { name: 'Paint', household_common: false },
      { name: 'Paper', household_common: true },
      { name: 'Paintbrush', household_common: false },
    ],
    instructions: [
      'Go outside and collect leaves of different shapes and sizes.',
      'Lay newspaper on the table to protect it.',
      'Paint the veiny side of a leaf with a thin layer of paint.',
      'Press it painted-side down onto paper. Press gently all over.',
      'Lift carefully to reveal the print!',
      'Experiment with different colours and overlapping prints.',
    ],
    created_at: '2026-03-03T10:00:00Z',
    is_new: true,
    collection_ids: ['col-spring'],
  },
  {
    id: 'act-15',
    title: 'Yoga Animal Adventure',
    slug: 'yoga-animal-adventure',
    description: 'Do yoga poses inspired by animals — downward dog, cobra, butterfly, flamingo. Perfect for body awareness, balance, and winding down.',
    category: 'movement',
    age_min: 3,
    age_max: 8,
    duration_minutes: 20,
    energy_level: 'moderate',
    mess_level: 'none',
    location: 'indoor',
    premium: false,
    screen_free: true,
    season: ['spring', 'summer', 'autumn', 'winter'],
    weather: ['any'],
    learning_outcomes: ['Balance', 'Body awareness', 'Focus', 'Flexibility'],
    materials: [
      { name: 'Yoga mat or towel', household_common: true },
    ],
    instructions: [
      'Roll out a mat or towel on the floor.',
      'Start with "mountain pose" — stand tall and still.',
      'Try "downward dog" — hands and feet on the floor, bottom in the air.',
      'Do "cobra" — lie on your tummy and push up with your arms.',
      'Try "tree pose" — balance on one leg with arms overhead.',
      'End with "butterfly" — sit with feet together, knees out, flap your legs.',
      'Finish lying flat in "sleeping caterpillar" for 1 minute.',
    ],
    created_at: '2026-02-22T10:00:00Z',
    collection_ids: ['col-bedtime-wind-down'],
  },
  {
    id: 'act-16',
    title: 'Picture Book Creation',
    slug: 'picture-book-creation',
    description: 'Create your own picture book with drawings and a simple story. Staple the pages together for a keepsake.',
    category: 'literacy',
    age_min: 3,
    age_max: 10,
    duration_minutes: 45,
    energy_level: 'calm',
    mess_level: 'low',
    location: 'indoor',
    premium: true,
    screen_free: true,
    season: ['spring', 'summer', 'autumn', 'winter'],
    weather: ['any'],
    learning_outcomes: ['Storytelling', 'Fine motor skills', 'Sequencing', 'Creativity'],
    materials: [
      { name: 'Paper', household_common: true },
      { name: 'Pencils and crayons', household_common: true },
      { name: 'Stapler', household_common: true },
    ],
    instructions: [
      'Fold 4–5 sheets of paper in half and staple along the fold.',
      'Think of a simple story — a character, a problem, and a solution.',
      'Draw pictures on each page to tell the story.',
      'Add words or sentences (adults can write for younger children).',
      'Design a front cover with the title and "by [child\'s name]".',
      'Read it aloud to the family!',
    ],
    created_at: '2026-01-30T10:00:00Z',
    collection_ids: ['col-rainy-day'],
  },
  {
    id: 'act-17',
    title: 'Sensory Bottles',
    slug: 'sensory-bottles',
    description: 'Fill clear bottles with water, glitter, beads, and oil to create mesmerising calm-down bottles. Great for self-regulation.',
    category: 'calm',
    age_min: 1,
    age_max: 6,
    duration_minutes: 20,
    energy_level: 'calm',
    mess_level: 'medium',
    location: 'indoor',
    premium: false,
    screen_free: true,
    season: ['spring', 'summer', 'autumn', 'winter'],
    weather: ['any'],
    learning_outcomes: ['Self-regulation', 'Sensory exploration', 'Cause and effect'],
    materials: [
      { name: 'Clear plastic bottle', household_common: true },
      { name: 'Water', household_common: true },
      { name: 'Glitter', household_common: false },
      { name: 'Baby oil', household_common: false },
      { name: 'Food colouring', household_common: false },
      { name: 'Super glue for lid', household_common: true },
    ],
    instructions: [
      'Fill the bottle about 3/4 with warm water.',
      'Add glitter, food colouring, and a splash of baby oil.',
      'Try adding small beads, sequins, or tiny toys.',
      'Seal the lid tightly with super glue (adult job).',
      'Shake it up and watch everything swirl and settle.',
      'Use it as a calm-down tool — watch until everything settles.',
    ],
    created_at: '2026-02-25T10:00:00Z',
    collection_ids: ['col-under-5s', 'col-rainy-day'],
  },
  {
    id: 'act-18',
    title: 'Counting Collections',
    slug: 'counting-collections',
    description: 'Gather small objects from around the house and practice counting, sorting, and grouping. Maths made tangible.',
    category: 'maths',
    age_min: 2,
    age_max: 6,
    duration_minutes: 15,
    energy_level: 'calm',
    mess_level: 'none',
    location: 'indoor',
    premium: false,
    screen_free: true,
    season: ['spring', 'summer', 'autumn', 'winter'],
    weather: ['any'],
    learning_outcomes: ['Counting', 'Sorting', 'Number recognition', 'One-to-one correspondence'],
    materials: [
      { name: 'Small objects (buttons, pasta, stones)', household_common: true },
      { name: 'Bowls or containers', household_common: true },
    ],
    instructions: [
      'Gather a collection of small items: buttons, pasta shapes, stones.',
      'Count them together — touch each one as you count.',
      'Sort them by colour, size, or type.',
      'Try making groups of 2, 5, or 10.',
      'Line them up to compare: which group has more?',
    ],
    created_at: '2026-01-15T10:00:00Z',
    collection_ids: ['col-under-5s', 'col-quick-wins'],
  },
  // Variations of existing activities
  {
    id: 'act-1-var-1',
    title: 'Frogspawn Safari (Rainy Day Version)',
    slug: 'frogspawn-safari-rainy',
    description: 'Can\'t get outside? Learn about frogspawn and the frog life cycle using books, videos, and drawing. Then plan your outdoor trip for a dry day.',
    category: 'nature',
    age_min: 3,
    age_max: 10,
    duration_minutes: 30,
    energy_level: 'calm',
    mess_level: 'low',
    location: 'indoor',
    premium: false,
    screen_free: false,
    season: ['spring'],
    weather: ['rain'],
    learning_outcomes: ['Life cycles', 'Research skills', 'Drawing'],
    materials: [
      { name: 'Paper and pencils', household_common: true },
      { name: 'Library book on frogs', household_common: false },
    ],
    instructions: [
      'Read a book about frogs or look at pictures together.',
      'Draw the life cycle: eggs → tadpole → froglet → frog.',
      'Talk about where frogs live and what they eat.',
      'Plan your outdoor frogspawn trip for when the rain stops.',
    ],
    created_at: '2026-03-02T10:00:00Z',
    parent_activity_id: 'act-1',
    variation_type: 'rainy_day',
    collection_ids: ['col-rainy-day'],
  },
  {
    id: 'act-5-var-1',
    title: 'Fingerprint Art (Toddler Edition)',
    slug: 'fingerprint-art-toddler',
    description: 'A simplified version of fingerprint art for the littlest ones. Focus on the sensory experience of pressing fingers into paint.',
    category: 'art',
    age_min: 1,
    age_max: 3,
    duration_minutes: 15,
    energy_level: 'calm',
    mess_level: 'high',
    location: 'indoor',
    premium: false,
    screen_free: true,
    season: ['spring', 'summer', 'autumn', 'winter'],
    weather: ['any'],
    learning_outcomes: ['Sensory exploration', 'Fine motor skills', 'Cause and effect'],
    materials: [
      { name: 'Washable finger paint', household_common: false },
      { name: 'Large paper', household_common: true },
    ],
    instructions: [
      'Lay large paper on a washable surface.',
      'Put small blobs of washable paint on a plate.',
      'Let your toddler press their fingers and hands into the paint.',
      'Press onto paper — no rules, just explore!',
      'Talk about the colours and marks they make.',
    ],
    created_at: '2026-03-09T10:00:00Z',
    is_new: true,
    parent_activity_id: 'act-5',
    variation_type: 'younger_kids',
    collection_ids: ['col-under-5s'],
  },
];

// ─── Collections ─────────────────────────────

export const MOCK_COLLECTIONS: MockCollection[] = [
  {
    id: 'col-spring',
    title: 'Spring Has Sprung',
    slug: 'spring-has-sprung',
    description: 'Activities perfect for the new season — frogspawn, flowers, and fresh air.',
    emoji: '🌱',
    color: 'text-green-mid',
    bg: 'bg-green-mid/10',
    activity_ids: ['act-1', 'act-2', 'act-12', 'act-14'],
    featured: true,
    seasonal: true,
  },
  {
    id: 'col-rainy-day',
    title: 'Rainy Day Rescue',
    slug: 'rainy-day-rescue',
    description: 'Stuck indoors? These activities will save the day.',
    emoji: '🌧️',
    color: 'text-sky',
    bg: 'bg-sky/10',
    activity_ids: ['act-3', 'act-5', 'act-6', 'act-11', 'act-16', 'act-17', 'act-1-var-1'],
    featured: true,
  },
  {
    id: 'col-quick-wins',
    title: 'Quick Wins (Under 20 min)',
    slug: 'quick-wins',
    description: 'Short on time? These activities pack a punch in 20 minutes or less.',
    emoji: '⚡',
    color: 'text-gold',
    bg: 'bg-gold/10',
    activity_ids: ['act-6', 'act-7', 'act-8', 'act-9', 'act-10', 'act-18'],
    featured: true,
  },
  {
    id: 'col-under-5s',
    title: 'Perfect for Under 5s',
    slug: 'under-5s',
    description: 'Age-appropriate activities for toddlers and preschoolers.',
    emoji: '🧸',
    color: 'text-berry',
    bg: 'bg-berry/10',
    activity_ids: ['act-3', 'act-5', 'act-8', 'act-17', 'act-18', 'act-5-var-1'],
    featured: false,
  },
  {
    id: 'col-outdoor-adventures',
    title: 'Outdoor Adventures',
    slug: 'outdoor-adventures',
    description: 'Get outside and explore — whatever the weather.',
    emoji: '🏕️',
    color: 'text-green-deep',
    bg: 'bg-green-deep/10',
    activity_ids: ['act-1', 'act-2', 'act-4', 'act-12'],
    featured: false,
  },
  {
    id: 'col-science-week',
    title: 'Science Week Special',
    slug: 'science-week',
    description: 'Experiments and discoveries for Science Week Ireland.',
    emoji: '🔬',
    color: 'text-sky',
    bg: 'bg-sky/10',
    activity_ids: ['act-4', 'act-13'],
    featured: false,
    seasonal: true,
    event_date: '2026-11-08',
  },
  {
    id: 'col-bedtime-wind-down',
    title: 'Bedtime Wind Down',
    slug: 'bedtime-wind-down',
    description: 'Calm activities perfect for winding down before bed.',
    emoji: '🌙',
    color: 'text-berry',
    bg: 'bg-berry/8',
    activity_ids: ['act-10', 'act-15', 'act-7'],
    featured: false,
  },
  {
    id: 'col-car-activities',
    title: 'Car Journey Savers',
    slug: 'car-activities',
    description: 'Keep everyone entertained on long drives.',
    emoji: '🚗',
    color: 'text-bark-light',
    bg: 'bg-bark/8',
    activity_ids: ['act-7'],
    featured: false,
  },
];

// ─── Children ────────────────────────────────

export const MOCK_CHILDREN: MockChild[] = [
  {
    id: 'child-1',
    name: 'Saoirse',
    date_of_birth: '2020-06-15',
    age: 5,
    interests: ['nature', 'art', 'animals'],
    school_status: 'preschool',
    learning_style: 'visual',
    total_activities: 47,
    total_minutes: 1230,
    avatar_color: 'bg-green-light',
  },
  {
    id: 'child-2',
    name: 'Fionn',
    date_of_birth: '2023-01-10',
    age: 3,
    interests: ['movement', 'music', 'animals'],
    school_status: 'home',
    learning_style: 'kinesthetic',
    total_activities: 28,
    total_minutes: 680,
    avatar_color: 'bg-sky',
  },
];

// ─── Achievements ────────────────────────────

export const MOCK_ACHIEVEMENTS: MockAchievement[] = [
  { id: 'ach-1', type: 'milestone', name: 'First Steps', description: 'Complete your first activity', icon: '🌱', threshold: 1, unlocked: true, unlocked_at: '2026-01-15', progress: 1 },
  { id: 'ach-2', type: 'milestone', name: 'Getting Started', description: 'Complete 10 activities', icon: '🌿', threshold: 10, unlocked: true, unlocked_at: '2026-02-01', progress: 10 },
  { id: 'ach-3', type: 'milestone', name: 'Half Century', description: 'Complete 50 activities', icon: '🌳', threshold: 50, unlocked: false, progress: 38 },
  { id: 'ach-4', type: 'milestone', name: 'Century Club', description: 'Complete 100 activities', icon: '🏆', threshold: 100, unlocked: false, progress: 38 },
  { id: 'ach-5', type: 'streak', name: '3-Day Streak', description: 'Do activities 3 days in a row', icon: '🔥', threshold: 3, unlocked: true, unlocked_at: '2026-01-20', progress: 3 },
  { id: 'ach-6', type: 'streak', name: '7-Day Streak', description: 'Do activities 7 days in a row', icon: '⚡', threshold: 7, unlocked: true, unlocked_at: '2026-02-15', progress: 7 },
  { id: 'ach-7', type: 'streak', name: '30-Day Streak', description: 'Do activities 30 days in a row', icon: '💫', threshold: 30, unlocked: false, progress: 12 },
  { id: 'ach-8', type: 'category', name: 'Nature Explorer', description: 'Complete 10 nature activities', icon: '🌲', threshold: 10, unlocked: true, unlocked_at: '2026-02-20', progress: 10 },
  { id: 'ach-9', type: 'category', name: 'Little Chef', description: 'Complete 10 kitchen activities', icon: '👨‍🍳', threshold: 10, unlocked: false, progress: 6 },
  { id: 'ach-10', type: 'category', name: 'Mad Scientist', description: 'Complete 10 science activities', icon: '🧪', threshold: 10, unlocked: false, progress: 4 },
  { id: 'ach-11', type: 'category', name: 'Creative Spark', description: 'Complete 10 art activities', icon: '🎨', threshold: 10, unlocked: false, progress: 8 },
  { id: 'ach-12', type: 'explorer', name: 'All-Rounder', description: 'Complete at least one activity from every category', icon: '🌈', threshold: 10, unlocked: false, progress: 7 },
];

// ─── Streaks ─────────────────────────────────

export const MOCK_STREAK: MockStreak = {
  current: 12,
  longest: 14,
  last_activity_date: '2026-03-10',
};

// ─── Weekly Plan ─────────────────────────────

export const MOCK_WEEKLY_PLAN: MockWeeklyPlan = {
  id: 'plan-1',
  week_start: '2026-03-09',
  generated_at: '2026-03-09T08:00:00Z',
  activities: [
    { day: 'Monday', activity_id: 'act-1', activity: MOCK_ACTIVITIES[0], time_slot: 'morning', completed: true },
    { day: 'Monday', activity_id: 'act-10', activity: MOCK_ACTIVITIES[9], time_slot: 'evening', completed: true },
    { day: 'Tuesday', activity_id: 'act-5', activity: MOCK_ACTIVITIES[4], time_slot: 'morning', completed: true },
    { day: 'Tuesday', activity_id: 'act-7', activity: MOCK_ACTIVITIES[6], time_slot: 'afternoon', completed: false },
    { day: 'Wednesday', activity_id: 'act-3', activity: MOCK_ACTIVITIES[2], time_slot: 'morning', completed: false },
    { day: 'Wednesday', activity_id: 'act-15', activity: MOCK_ACTIVITIES[14], time_slot: 'afternoon', completed: false },
    { day: 'Thursday', activity_id: 'act-4', activity: MOCK_ACTIVITIES[3], time_slot: 'morning', completed: false },
    { day: 'Thursday', activity_id: 'act-9', activity: MOCK_ACTIVITIES[8], time_slot: 'evening', completed: false },
    { day: 'Friday', activity_id: 'act-8', activity: MOCK_ACTIVITIES[7], time_slot: 'morning', completed: false },
    { day: 'Friday', activity_id: 'act-6', activity: MOCK_ACTIVITIES[5], time_slot: 'afternoon', completed: false },
    { day: 'Saturday', activity_id: 'act-12', activity: MOCK_ACTIVITIES[11], time_slot: 'morning', completed: false },
    { day: 'Saturday', activity_id: 'act-11', activity: MOCK_ACTIVITIES[10], time_slot: 'afternoon', completed: false },
    { day: 'Sunday', activity_id: 'act-2', activity: MOCK_ACTIVITIES[1], time_slot: 'morning', completed: false },
  ],
};

// ─── Activity Logs ───────────────────────────

export const MOCK_ACTIVITY_LOGS: MockActivityLog[] = [
  {
    id: 'log-1',
    activity_id: 'act-1',
    activity: { title: 'Frogspawn Safari', category: 'nature', slug: 'frogspawn-safari' },
    child_ids: ['child-1', 'child-2'],
    date: '2026-03-10',
    notes: 'Found loads of frogspawn at the park pond! Saoirse was fascinated. Fionn tried to grab it.',
    rating: 5,
    photos: [],
    duration_minutes: 40,
    curriculum_areas: ['SESE', 'Language'],
  },
  {
    id: 'log-2',
    activity_id: 'act-10',
    activity: { title: 'Breathing Butterfly', category: 'calm', slug: 'breathing-butterfly' },
    child_ids: ['child-1'],
    date: '2026-03-10',
    notes: 'Did this before bed. Saoirse really settled down.',
    rating: 4,
    photos: [],
    duration_minutes: 10,
  },
  {
    id: 'log-3',
    activity_id: 'act-5',
    activity: { title: 'Fingerprint Art Gallery', category: 'art', slug: 'fingerprint-art-gallery' },
    child_ids: ['child-1', 'child-2'],
    date: '2026-03-09',
    notes: 'Made a fingerprint zoo! Saoirse did a whole farm scene.',
    rating: 5,
    photos: [],
    duration_minutes: 35,
    curriculum_areas: ['Arts'],
  },
  {
    id: 'log-4',
    activity_id: 'act-6',
    activity: { title: 'Freeze Dance Party', category: 'movement', slug: 'freeze-dance-party' },
    child_ids: ['child-1', 'child-2'],
    date: '2026-03-08',
    notes: null,
    rating: 5,
    photos: [],
    duration_minutes: 15,
  },
  {
    id: 'log-5',
    activity_id: 'act-3',
    activity: { title: 'Rainbow Bread Baking', category: 'kitchen', slug: 'rainbow-bread-baking' },
    child_ids: ['child-1'],
    date: '2026-03-07',
    notes: 'The bread turned out great! Purple and green — looked a bit weird but tasted lovely.',
    rating: 4,
    photos: [],
    duration_minutes: 55,
    curriculum_areas: ['Maths', 'SESE'],
  },
  {
    id: 'log-6',
    activity_id: 'act-8',
    activity: { title: 'Shape Hunt Around the House', category: 'maths', slug: 'shape-hunt' },
    child_ids: ['child-1', 'child-2'],
    date: '2026-03-06',
    notes: 'Found 12 circles, 8 rectangles, and 3 triangles!',
    rating: 4,
    photos: [],
    duration_minutes: 20,
    curriculum_areas: ['Maths'],
  },
];

// ─── Notifications ───────────────────────────

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: 'notif-1', type: 'achievement', title: 'Achievement Unlocked!', body: 'You earned "Nature Explorer" — 10 nature activities completed!', read: false, created_at: '2026-03-10T10:30:00Z' },
  { id: 'notif-2', type: 'plan', title: 'Weekly Plan Ready', body: 'Your personalised plan for this week is ready to view.', read: false, created_at: '2026-03-09T08:00:00Z' },
  { id: 'notif-3', type: 'streak', title: 'Streak Alert!', body: 'You\'re on a 12-day streak! Keep it going today.', read: true, created_at: '2026-03-10T07:00:00Z' },
  { id: 'notif-4', type: 'content', title: 'New Activities Added', body: '5 new spring activities have been added to the library.', read: true, created_at: '2026-03-08T09:00:00Z' },
];

// ─── Admin Stats ─────────────────────────────

export const MOCK_ADMIN_STATS = {
  totalFamilies: 1247,
  totalChildren: 2891,
  totalActivities: 203,
  totalLogs: 18432,
  activeFamiliesThisWeek: 834,
  activeFamiliesLastWeek: 791,
  signupsThisWeek: 47,
  signupsLastWeek: 39,
  tierDistribution: { free: 842, family: 328, educator: 77 },
  topActivities: [
    { title: 'Freeze Dance Party', logs: 2341 },
    { title: 'Frogspawn Safari', logs: 1892 },
    { title: 'Volcano Eruption', logs: 1654 },
    { title: 'Rainbow Bread Baking', logs: 1543 },
    { title: 'Fingerprint Art Gallery', logs: 1421 },
  ],
  weeklySignups: [
    { week: 'Jan 6', count: 28 },
    { week: 'Jan 13', count: 34 },
    { week: 'Jan 20', count: 31 },
    { week: 'Jan 27', count: 42 },
    { week: 'Feb 3', count: 38 },
    { week: 'Feb 10', count: 45 },
    { week: 'Feb 17', count: 51 },
    { week: 'Feb 24', count: 39 },
    { week: 'Mar 3', count: 43 },
    { week: 'Mar 10', count: 47 },
  ],
  retentionRate: 67,
  aiUsageThisWeek: 1243,
};

// ─── Educator Mock Data ──────────────────────

export const MOCK_CURRICULUM_AREAS = [
  { id: 'curr-1', name: 'Language', strands: ['Oral Language', 'Reading', 'Writing'], color: 'bg-green-mid', progress: 72 },
  { id: 'curr-2', name: 'Mathematics', strands: ['Number', 'Algebra', 'Shape & Space', 'Measures', 'Data'], color: 'bg-gold', progress: 58 },
  { id: 'curr-3', name: 'SESE', strands: ['Science', 'Geography', 'History'], color: 'bg-sky', progress: 65 },
  { id: 'curr-4', name: 'Arts Education', strands: ['Visual Arts', 'Music', 'Drama'], color: 'bg-berry', progress: 81 },
  { id: 'curr-5', name: 'Physical Education', strands: ['Athletics', 'Dance', 'Gymnastics', 'Games', 'Aquatics'], color: 'bg-rust', progress: 45 },
  { id: 'curr-6', name: 'SPHE', strands: ['Myself', 'Myself & Others', 'Myself & the Wider World'], color: 'bg-moss', progress: 53 },
  { id: 'curr-7', name: 'Gaeilge', strands: ['Teanga ó Bhéal', 'Léitheoireacht', 'Scríbhneoireacht'], color: 'bg-green-deep', progress: 30 },
];

export const MOCK_EDUCATION_PLAN = {
  id: 'eplan-1',
  child_id: 'child-1',
  child_name: 'Saoirse',
  academic_year: '2025-2026',
  approach: 'eclectic',
  hours_per_week: 15,
  days_per_week: 4,
  priority_areas: ['Language', 'Mathematics', 'SESE'],
  created_at: '2025-09-01T10:00:00Z',
};

export const MOCK_DAILY_SCHEDULE = [
  { id: 'block-1', time: '09:00', subject: 'Language', activity_id: 'act-7', activity_title: 'Storytelling Circle', duration: 30, completed: true },
  { id: 'block-2', time: '09:30', subject: 'Mathematics', activity_id: 'act-18', activity_title: 'Counting Collections', duration: 30, completed: true },
  { id: 'block-3', time: '10:00', subject: 'Break', activity_id: null, activity_title: 'Free play / Snack', duration: 30, completed: true },
  { id: 'block-4', time: '10:30', subject: 'SESE', activity_id: 'act-1', activity_title: 'Frogspawn Safari', duration: 45, completed: false },
  { id: 'block-5', time: '11:15', subject: 'Arts Education', activity_id: 'act-14', activity_title: 'Leaf Printing', duration: 30, completed: false },
  { id: 'block-6', time: '11:45', subject: 'Physical Education', activity_id: 'act-15', activity_title: 'Yoga Animal Adventure', duration: 20, completed: false },
];

export const MOCK_TUSLA_DATA = {
  registration_status: 'registered',
  registration_number: 'HE-2025-00847',
  assessment_due: '2026-06-15',
  total_school_days: 120,
  days_attended: 98,
  attendance_percentage: 82,
  hours_logged: 580,
  required_hours: 900,
  monthly_attendance: [
    { month: 'Sep', days: 16, required: 18 },
    { month: 'Oct', days: 18, required: 20 },
    { month: 'Nov', days: 14, required: 18 },
    { month: 'Dec', days: 10, required: 14 },
    { month: 'Jan', days: 16, required: 18 },
    { month: 'Feb', days: 14, required: 16 },
    { month: 'Mar', days: 10, required: 18 },
  ],
};

export const MOCK_PORTFOLIO_ENTRIES = [
  {
    id: 'port-1',
    child_id: 'child-1',
    title: 'Frogspawn observation drawing',
    description: 'Saoirse drew what she saw at the pond — including the tiny dots inside the eggs.',
    activity_id: 'act-1',
    activity_title: 'Frogspawn Safari',
    curriculum_areas: ['SESE', 'Arts Education'],
    date: '2026-03-10',
    type: 'drawing',
  },
  {
    id: 'port-2',
    child_id: 'child-1',
    title: 'Rainbow bread — measuring ingredients',
    description: 'Measured flour and milk using cups. Counted how many cups we needed.',
    activity_id: 'act-3',
    activity_title: 'Rainbow Bread Baking',
    curriculum_areas: ['Mathematics', 'SESE'],
    date: '2026-03-07',
    type: 'photo',
  },
  {
    id: 'port-3',
    child_id: 'child-1',
    title: 'Fingerprint zoo story',
    description: 'Created a fingerprint zoo and dictated a story about all the animals.',
    activity_id: 'act-5',
    activity_title: 'Fingerprint Art Gallery',
    curriculum_areas: ['Arts Education', 'Language'],
    date: '2026-03-09',
    type: 'drawing',
  },
  {
    id: 'port-4',
    child_id: 'child-1',
    title: 'Shape hunt results',
    description: 'Found and recorded 23 shapes around the house. Made a bar chart of results.',
    activity_id: 'act-8',
    activity_title: 'Shape Hunt Around the House',
    curriculum_areas: ['Mathematics'],
    date: '2026-03-06',
    type: 'worksheet',
  },
];
