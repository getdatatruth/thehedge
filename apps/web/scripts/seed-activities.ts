import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Activity {
  title: string;
  slug: string;
  description: string;
  instructions: { steps: string[] };
  category: string;
  age_min: number;
  age_max: number;
  duration_minutes: number;
  location: string;
  weather: string[];
  season: string[];
  materials: { name: string; household_common: boolean }[];
  learning_outcomes: string[];
  energy_level: string;
  mess_level: string;
  screen_free: boolean;
  premium: boolean;
  created_by: string;
  published: boolean;
}

const activities: Activity[] = [
  // ─── NATURE & OUTDOOR (5) ────────────────────────────
  {
    title: 'Frogspawn Safari',
    slug: 'frogspawn-safari',
    description: 'Head to your nearest pond, ditch, or boggy patch to spot frogspawn in early spring. Learn about the life cycle of Irish frogs while getting mucky boots.',
    instructions: { steps: [
      'Find a local pond, stream, or ditch — frogspawn appears from February to April.',
      'Look for jelly-like clumps of eggs in shallow, still water near the edges.',
      'Observe closely — can you see the tiny black dots (embryos) inside each egg?',
      'Gently scoop a small amount into a clear jar to examine, then return it carefully.',
      'Talk about the life cycle: egg → tadpole → froglet → frog.',
      'Draw or photograph what you found to add to your nature journal.',
      'Visit again in a few weeks to see how the tadpoles are developing.'
    ]},
    category: 'nature',
    age_min: 3, age_max: 12,
    duration_minutes: 45,
    location: 'outdoor',
    weather: ['dry', 'overcast', 'mild'],
    season: ['spring'],
    materials: [
      { name: 'Wellies', household_common: true },
      { name: 'Clear jar or container', household_common: true },
      { name: 'Magnifying glass (optional)', household_common: true },
      { name: 'Nature journal or paper', household_common: true }
    ],
    learning_outcomes: ['Life cycles', 'Observation skills', 'Irish wildlife knowledge', 'Scientific vocabulary'],
    energy_level: 'moderate',
    mess_level: 'medium',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Cloud Detective Walk',
    slug: 'cloud-detective-walk',
    description: 'Become a cloud detective on your next walk. Learn to identify different cloud types and predict what the weather might do next — a skill Irish people have practised for centuries.',
    instructions: { steps: [
      'Head outside on a day with visible clouds — most Irish days!',
      'Lie on a blanket or stand in an open area with a clear view of the sky.',
      'Look for three main types: fluffy cumulus (fair weather), flat stratus (grey blanket), and wispy cirrus (high and thin).',
      'Play "cloud shapes" — what animals or objects can you spot in the clouds?',
      'Notice which direction the clouds are moving. Wind from the west usually brings rain in Ireland.',
      'Make predictions: will it rain later? Will the sun come out?',
      'Draw the clouds you see and label them in your journal.'
    ]},
    category: 'nature',
    age_min: 4, age_max: 12,
    duration_minutes: 30,
    location: 'outdoor',
    weather: ['dry', 'overcast', 'sunny', 'partly_cloudy'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Blanket (optional)', household_common: true },
      { name: 'Paper and pencils', household_common: true }
    ],
    learning_outcomes: ['Weather patterns', 'Observation skills', 'Scientific classification', 'Prediction'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Fairy House Engineering',
    slug: 'fairy-house-engineering',
    description: 'Build a miniature fairy house using natural materials from your garden or local park. Combines engineering thinking with Irish folklore imagination.',
    instructions: { steps: [
      'Collect natural materials: sticks, bark, leaves, pebbles, moss, acorn caps, feathers.',
      'Choose a sheltered spot at the base of a tree or in a hedge — fairies like privacy!',
      'Start with a base — lay flat sticks or bark to make a floor.',
      'Build walls by leaning sticks together or stacking flat stones.',
      'Create a roof using large leaves, bark, or overlapping sticks.',
      'Add details: a pebble path, moss carpet, acorn cap bowls, leaf door.',
      'Leave a small offering — a shiny pebble or berry — to welcome the fairies.',
      'Visit tomorrow to see if anyone has "moved in"!'
    ]},
    category: 'nature',
    age_min: 3, age_max: 10,
    duration_minutes: 45,
    location: 'outdoor',
    weather: ['dry', 'sunny', 'overcast'],
    season: ['spring', 'summer', 'autumn'],
    materials: [
      { name: 'Natural materials (sticks, leaves, stones)', household_common: true },
      { name: 'Small container for collecting', household_common: true }
    ],
    learning_outcomes: ['Engineering design', 'Fine motor skills', 'Creativity', 'Irish folklore', 'Problem-solving'],
    energy_level: 'moderate',
    mess_level: 'medium',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Hedgerow Treasure Hunt',
    slug: 'hedgerow-treasure-hunt',
    description: 'Ireland\'s hedgerows are bursting with life. Go on a sensory treasure hunt to find, smell, and identify what\'s growing in your local hedge.',
    instructions: { steps: [
      'Walk along any local hedgerow — country roads, park boundaries, or garden edges.',
      'Make a checklist: something soft, something prickly, something that smells, something red, something with seeds.',
      'Identify common hedgerow plants: hawthorn (May blossom), blackberry, elder, ivy, ferns.',
      'Gently touch different leaves — which are smooth? Fuzzy? Waxy?',
      'Listen carefully — can you hear birds, insects, or rustling?',
      'Collect one fallen item from each plant (never pick living plants without permission).',
      'At home, press your finds between heavy books or tape them into a journal.'
    ]},
    category: 'nature',
    age_min: 3, age_max: 12,
    duration_minutes: 40,
    location: 'outdoor',
    weather: ['dry', 'sunny', 'overcast'],
    season: ['spring', 'summer', 'autumn'],
    materials: [
      { name: 'Paper bag or container for collecting', household_common: true },
      { name: 'Paper and pencil for checklist', household_common: true }
    ],
    learning_outcomes: ['Plant identification', 'Sensory exploration', 'Irish ecology', 'Observation'],
    energy_level: 'moderate',
    mess_level: 'low',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Night Sky Stargazing',
    slug: 'night-sky-stargazing',
    description: 'On a clear evening, wrap up warm and explore the night sky together. Ireland\'s dark skies are perfect for spotting constellations, planets, and maybe even the Milky Way.',
    instructions: { steps: [
      'Check the forecast for a clear night — winter evenings are best in Ireland.',
      'Head to your garden or a dark spot away from streetlights after sunset.',
      'Let your eyes adjust to the dark for 10-15 minutes — no phones!',
      'Look for the Plough (part of Ursa Major) — it\'s visible all year from Ireland.',
      'Follow the Plough\'s pointer stars to find Polaris, the North Star.',
      'In winter, look for Orion\'s Belt — three bright stars in a row.',
      'Watch for satellites crossing the sky — they look like slowly moving stars.',
      'Talk about what you see. Wonder together about how far away the stars are.'
    ]},
    category: 'nature',
    age_min: 5, age_max: 12,
    duration_minutes: 30,
    location: 'outdoor',
    weather: ['dry', 'clear'],
    season: ['autumn', 'winter'],
    materials: [
      { name: 'Warm clothes and blankets', household_common: true },
      { name: 'Flask of hot chocolate (optional)', household_common: true }
    ],
    learning_outcomes: ['Astronomy basics', 'Observation skills', 'Patience', 'Wonder and curiosity'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },

  // ─── KITCHEN & FOOD (5) ──────────────────────────────
  {
    title: 'Kitchen Volcano',
    slug: 'kitchen-volcano',
    description: 'The classic baking soda and vinegar eruption — but with proper science talk about acids, bases, and chemical reactions. Messy, exciting, and genuinely educational.',
    instructions: { steps: [
      'Place a small cup or jar on a tray or in the sink to catch the overflow.',
      'Add 2-3 tablespoons of baking soda to the cup.',
      'Add a squeeze of washing-up liquid and a few drops of food colouring (red or orange looks volcanic!).',
      'Pour in white vinegar — about the same amount as baking soda — and watch it erupt!',
      'Talk about what\'s happening: baking soda (a base) reacts with vinegar (an acid) to create carbon dioxide gas.',
      'The bubbles are CO2 — the same gas we breathe out and that makes fizzy drinks bubbly.',
      'Experiment: does more vinegar make a bigger eruption? What about warm vs cold vinegar?',
      'Try adding the vinegar slowly vs quickly — what changes?'
    ]},
    category: 'kitchen',
    age_min: 3, age_max: 10,
    duration_minutes: 20,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Baking soda', household_common: true },
      { name: 'White vinegar', household_common: true },
      { name: 'Washing-up liquid', household_common: true },
      { name: 'Food colouring', household_common: true },
      { name: 'Small cup or jar', household_common: true },
      { name: 'Tray or baking sheet', household_common: true }
    ],
    learning_outcomes: ['Chemical reactions', 'Acids and bases', 'Scientific method', 'Measurement'],
    energy_level: 'active',
    mess_level: 'high',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Irish Soda Bread Baking',
    slug: 'irish-soda-bread-baking',
    description: 'Bake a traditional Irish soda bread together — one of the simplest and most satisfying things you can make. No yeast, no kneading, and ready in under an hour.',
    instructions: { steps: [
      'Preheat the oven to 200°C. Lightly flour a baking tray.',
      'Mix 450g plain flour, 1 tsp salt, and 1 tsp bicarbonate of soda in a large bowl.',
      'Make a well in the centre and pour in about 350ml buttermilk.',
      'Mix with a wooden spoon or your hands until it just comes together — don\'t overwork it.',
      'Turn onto a floured surface and shape into a round about 5cm thick.',
      'Cut a deep cross on top — traditionally to "let the fairies out" or to help it cook evenly.',
      'Bake for 30-35 minutes. It\'s ready when it sounds hollow when tapped on the bottom.',
      'Let it cool on a wire rack. Eat warm with real Irish butter — nothing better.'
    ]},
    category: 'kitchen',
    age_min: 4, age_max: 12,
    duration_minutes: 50,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Plain flour (450g)', household_common: true },
      { name: 'Salt', household_common: true },
      { name: 'Bicarbonate of soda', household_common: true },
      { name: 'Buttermilk (350ml)', household_common: true }
    ],
    learning_outcomes: ['Measurement', 'Following instructions', 'Irish food heritage', 'Chemistry of baking'],
    energy_level: 'moderate',
    mess_level: 'medium',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Rainbow Fruit Kebabs',
    slug: 'rainbow-fruit-kebabs',
    description: 'Thread a rainbow onto a skewer. Sort fruit by colour, practise counting, and learn about healthy eating — then eat your creation.',
    instructions: { steps: [
      'Wash and prepare fruit: strawberries, oranges, banana, kiwi, blueberries, grapes.',
      'Lay out the fruit in colour groups — red, orange, yellow, green, blue, purple.',
      'Give each child a wooden skewer (trim sharp ends for younger children) or a straw.',
      'Thread fruit in rainbow order: one of each colour.',
      'Count how many pieces on each kebab. Who has the most?',
      'Talk about which fruits grow in Ireland (strawberries, apples, blackberries).',
      'Eat and enjoy! Talk about favourite flavours and textures.'
    ]},
    category: 'kitchen',
    age_min: 3, age_max: 8,
    duration_minutes: 20,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Mixed fruit (at least 5 colours)', household_common: true },
      { name: 'Wooden skewers or thick straws', household_common: true },
      { name: 'Chopping board and knife (adult use)', household_common: true }
    ],
    learning_outcomes: ['Colour sorting', 'Counting', 'Healthy eating', 'Fine motor skills'],
    energy_level: 'calm',
    mess_level: 'low',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Invisible Ink Secret Messages',
    slug: 'invisible-ink-secret-messages',
    description: 'Write secret messages using lemon juice that only appear when heated. Part spy craft, part kitchen science — kids absolutely love this.',
    instructions: { steps: [
      'Squeeze lemon juice into a small bowl. Add a few drops of water.',
      'Dip a cotton bud, paintbrush, or toothpick into the lemon juice.',
      'Write a secret message or draw a picture on white paper.',
      'Let the paper dry completely — the message should be invisible.',
      'To reveal: hold the paper near a warm lamp or radiator (adult supervision).',
      'Alternatively, an adult can carefully use a hairdryer on high heat.',
      'The lemon juice turns brown when heated because the acid weakens the paper fibres.',
      'Try with other liquids: milk, apple juice, honey-water — which works best?'
    ]},
    category: 'kitchen',
    age_min: 5, age_max: 12,
    duration_minutes: 25,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Lemon juice', household_common: true },
      { name: 'White paper', household_common: true },
      { name: 'Cotton buds or paintbrush', household_common: true },
      { name: 'Lamp or hairdryer', household_common: true }
    ],
    learning_outcomes: ['Chemical reactions', 'Heat and materials', 'Fine motor skills', 'Scientific experimentation'],
    energy_level: 'calm',
    mess_level: 'low',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Pizza Fraction Fun',
    slug: 'pizza-fraction-fun',
    description: 'Make mini pizzas and learn fractions by dividing them into halves, quarters, and thirds. Maths has never tasted this good.',
    instructions: { steps: [
      'Preheat oven to 200°C. Use pitta breads, tortillas, or English muffins as bases.',
      'Spread tomato sauce on each base.',
      'Before adding toppings, draw lines with sauce to divide into halves.',
      'Ask: "If we cut this in half, how many pieces do we get? What\'s each piece called?"',
      'Now try quarters — cut the halves in half. "What fraction is each piece?"',
      'Let children choose toppings for each section — different toppings in each fraction.',
      'Bake for 8-10 minutes until cheese is melted and bubbly.',
      'When eating: "You ate 2 out of 4 slices — that\'s 2/4, or half!"'
    ]},
    category: 'kitchen',
    age_min: 5, age_max: 10,
    duration_minutes: 35,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Pitta breads or tortillas', household_common: true },
      { name: 'Tomato sauce', household_common: true },
      { name: 'Grated cheese', household_common: true },
      { name: 'Toppings (sweetcorn, peppers, ham)', household_common: true }
    ],
    learning_outcomes: ['Fractions', 'Division', 'Following instructions', 'Measurement'],
    energy_level: 'moderate',
    mess_level: 'medium',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },

  // ─── SCIENCE & DISCOVERY (5) ─────────────────────────
  {
    title: 'Density Tower Experiment',
    slug: 'density-tower-experiment',
    description: 'Stack liquids on top of each other in a glass to create a colourful density tower. A stunning visual science experiment using everyday kitchen items.',
    instructions: { steps: [
      'Gather liquids: honey, golden syrup, milk, washing-up liquid, water, vegetable oil.',
      'Add food colouring to the water so you can see it clearly.',
      'Slowly pour honey into a tall clear glass — this is the densest liquid.',
      'Carefully pour golden syrup down the side of the glass — it should float on the honey.',
      'Continue layering: milk, then coloured water, then washing-up liquid, then oil on top.',
      'Pour each one very slowly down the side of the glass to keep layers separate.',
      'Try dropping small objects in: a grape, a coin, a piece of cork — where do they settle?',
      'Discuss: heavier (denser) liquids sink, lighter ones float. Just like in the sea!'
    ]},
    category: 'science',
    age_min: 4, age_max: 12,
    duration_minutes: 25,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Honey', household_common: true },
      { name: 'Washing-up liquid', household_common: true },
      { name: 'Milk', household_common: true },
      { name: 'Vegetable oil', household_common: true },
      { name: 'Food colouring', household_common: true },
      { name: 'Tall clear glass or jar', household_common: true }
    ],
    learning_outcomes: ['Density', 'Scientific observation', 'Prediction', 'Properties of liquids'],
    energy_level: 'calm',
    mess_level: 'medium',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Magnet Treasure Hunt',
    slug: 'magnet-treasure-hunt',
    description: 'Explore your home with a magnet to discover which objects are magnetic and which aren\'t. A hands-on introduction to physics that feels like a treasure hunt.',
    instructions: { steps: [
      'Find a fridge magnet or any magnet you have at home.',
      'Make a prediction chart with two columns: "Magnetic" and "Not Magnetic".',
      'Before testing each object, predict: will the magnet stick or not?',
      'Test objects around the house: spoons, coins, door handles, radiators, tins, pencils, toys.',
      'Record results. Were your predictions right?',
      'Notice the pattern: magnets stick to iron and steel, but not aluminium, wood, plastic, or copper.',
      'Challenge: can you find something magnetic in every room of the house?',
      'Extension: can a magnet work through paper? Through your hand? Through a table?'
    ]},
    category: 'science',
    age_min: 3, age_max: 8,
    duration_minutes: 25,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'A magnet (fridge magnet works)', household_common: true },
      { name: 'Paper and pencil for recording', household_common: true }
    ],
    learning_outcomes: ['Magnetism', 'Prediction and testing', 'Classification', 'Scientific method'],
    energy_level: 'moderate',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Raindrop Races',
    slug: 'raindrop-races',
    description: 'Next time it rains (so, most days in Ireland), press your faces to the window and race raindrops. Then go outside to explore what rain actually does.',
    instructions: { steps: [
      'On a rainy day, find a window with raindrops running down it.',
      'Each person picks a raindrop at the top of the window.',
      'Race! Which raindrop reaches the bottom first?',
      'Notice: bigger drops move faster. Why? (They\'re heavier, so gravity pulls them more.)',
      'Watch what happens when two drops merge — does the new drop speed up?',
      'Put on wellies and waterproofs. Go outside and catch rain in different containers.',
      'Measure how much rain falls in 10 minutes using a jar with markings.',
      'Jump in puddles. Because you\'re in Ireland and it\'s basically the law.'
    ]},
    category: 'science',
    age_min: 3, age_max: 8,
    duration_minutes: 30,
    location: 'both',
    weather: ['rainy'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'A window with raindrops', household_common: true },
      { name: 'Wellies and waterproofs', household_common: true },
      { name: 'Jars or containers for catching rain', household_common: true }
    ],
    learning_outcomes: ['Gravity', 'Measurement', 'Water cycle basics', 'Observation'],
    energy_level: 'moderate',
    mess_level: 'low',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Shadow Drawing',
    slug: 'shadow-drawing',
    description: 'Use the sun to cast shadows of toys and objects, then trace around them. Come back later to see how the shadow has moved — an introduction to how the Earth rotates.',
    instructions: { steps: [
      'On a sunny day, place toys or interesting objects on a large sheet of paper outside.',
      'Position them so they cast clear shadows on the paper.',
      'Trace around each shadow with a marker or crayon.',
      'Write the time next to each tracing.',
      'Come back 1-2 hours later and trace the new shadow position in a different colour.',
      'Compare: the shadow has moved! And changed shape!',
      'Explain: the Earth is slowly spinning, so the sun appears to move across the sky.',
      'Challenge: can you predict where the shadow will be at lunchtime?'
    ]},
    category: 'science',
    age_min: 4, age_max: 10,
    duration_minutes: 30,
    location: 'outdoor',
    weather: ['sunny'],
    season: ['spring', 'summer'],
    materials: [
      { name: 'Large sheets of paper or cardboard', household_common: true },
      { name: 'Markers or crayons', household_common: true },
      { name: 'Small toys or objects', household_common: true }
    ],
    learning_outcomes: ['Earth\'s rotation', 'Light and shadow', 'Time', 'Prediction'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Sink or Float Challenge',
    slug: 'sink-or-float-challenge',
    description: 'Fill a basin with water and test household objects to see what sinks and what floats. Simple, splashy, and introduces the concept of buoyancy.',
    instructions: { steps: [
      'Fill a large basin, washing-up bowl, or the bath with water.',
      'Gather 10-15 household objects: apple, coin, cork, pencil, stone, Lego brick, sponge, spoon, orange.',
      'Before testing each one, hold it up and ask: "Will it sink or float? Why?"',
      'Place each object gently in the water. Sort into two groups.',
      'Surprise test: an orange floats with its skin on, but sinks when peeled! (The skin has tiny air pockets.)',
      'Try making a ball of plasticine — it sinks. Now flatten it into a boat shape — it floats!',
      'Discuss: it\'s not just about weight, it\'s about shape and how much water is pushed aside.',
      'Let them free-play and experiment with their own ideas.'
    ]},
    category: 'science',
    age_min: 3, age_max: 8,
    duration_minutes: 25,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Large basin or bowl of water', household_common: true },
      { name: 'Assorted household objects', household_common: true },
      { name: 'Towel for spills', household_common: true }
    ],
    learning_outcomes: ['Buoyancy', 'Prediction', 'Classification', 'Cause and effect'],
    energy_level: 'moderate',
    mess_level: 'medium',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },

  // ─── ART & CREATIVITY (5) ────────────────────────────
  {
    title: 'Nature Paintbrush Art',
    slug: 'nature-paintbrush-art',
    description: 'Collect natural items — leaves, twigs, feathers, flowers — and use them as paintbrushes to create wild, textured art. No shop-bought brushes allowed!',
    instructions: { steps: [
      'Go outside and collect items to paint with: leaves, pine needles, twigs, feathers, grass, flowers.',
      'Set up paint pots (any paint or make your own with flour, water, and food colouring).',
      'Tape a large sheet of paper to the table or ground.',
      'Experiment: dip a leaf in paint and press it — what pattern does it make?',
      'Try dragging a pine branch, stamping with a flower, flicking a twig.',
      'Which natural brush makes the thinnest line? The fattest? The most interesting texture?',
      'Create a full picture using only nature brushes.',
      'Display your masterpiece — every one will look completely different!'
    ]},
    category: 'art',
    age_min: 3, age_max: 10,
    duration_minutes: 35,
    location: 'both',
    weather: ['dry', 'sunny', 'overcast'],
    season: ['spring', 'summer', 'autumn'],
    materials: [
      { name: 'Paint (any kind)', household_common: true },
      { name: 'Large paper', household_common: true },
      { name: 'Natural items (leaves, twigs, feathers)', household_common: true },
      { name: 'Old clothes or apron', household_common: true }
    ],
    learning_outcomes: ['Creativity', 'Texture exploration', 'Fine motor skills', 'Nature connection'],
    energy_level: 'moderate',
    mess_level: 'high',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Celtic Knot Drawing',
    slug: 'celtic-knot-drawing',
    description: 'Learn to draw a simple Celtic knot pattern — the kind found on Irish high crosses and the Book of Kells. Start simple, then get as complex as you like.',
    instructions: { steps: [
      'Start with a piece of graph paper or draw a grid of dots.',
      'Begin with the simplest knot: draw a pretzel shape — two loops crossing over each other.',
      'The key rule: the line goes over, then under, then over, then under — alternating at every crossing.',
      'Practise the basic pretzel until it feels comfortable.',
      'Try a longer knot: draw a figure-eight shape, then weave the crossings over-under.',
      'For a true Celtic look, make the line thicker and add a parallel line to create a "ribbon" effect.',
      'Colour the spaces between the ribbons — traditional colours are gold, green, red, and blue.',
      'Look up the Book of Kells for inspiration — Ireland\'s greatest artwork is full of these patterns.'
    ]},
    category: 'art',
    age_min: 6, age_max: 12,
    duration_minutes: 30,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Paper (graph paper ideal)', household_common: true },
      { name: 'Pencil and rubber', household_common: true },
      { name: 'Colouring pencils or markers', household_common: true }
    ],
    learning_outcomes: ['Irish heritage', 'Pattern recognition', 'Fine motor skills', 'Concentration'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Cardboard Box World',
    slug: 'cardboard-box-world',
    description: 'Transform a cardboard box into anything — a spaceship, a castle, a submarine, a shop. The only limit is imagination (and sellotape supply).',
    instructions: { steps: [
      'Find the biggest cardboard box you have (delivery boxes are perfect).',
      'Ask: "What should this become?" Let the children decide together.',
      'Gather supplies: markers, paint, scissors (adult help), tape, string, old magazines.',
      'Plan the design — where will the door be? Windows? Controls?',
      'Cut and shape with adult help. Tape sections together.',
      'Decorate: paint, draw, stick on magazine cut-outs, add buttons from bottle caps.',
      'Add details: a steering wheel from a paper plate, dials drawn on, a flag from a stick and paper.',
      'Play! Let the imaginary world unfold. This box might be in use for weeks.'
    ]},
    category: 'art',
    age_min: 3, age_max: 10,
    duration_minutes: 60,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Large cardboard box', household_common: true },
      { name: 'Markers, paint, or crayons', household_common: true },
      { name: 'Tape and scissors', household_common: true },
      { name: 'Old magazines, bottle caps, etc.', household_common: true }
    ],
    learning_outcomes: ['Imaginative play', 'Design and planning', 'Collaboration', 'Fine motor skills'],
    energy_level: 'moderate',
    mess_level: 'medium',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Leaf Rubbing Gallery',
    slug: 'leaf-rubbing-gallery',
    description: 'Collect autumn leaves with interesting shapes and create beautiful rubbings with crayons. Frame them for a seasonal gallery wall.',
    instructions: { steps: [
      'Collect leaves with strong veins and interesting shapes — oak, sycamore, beech, holly.',
      'Place a leaf vein-side up under a sheet of thin paper.',
      'Hold the paper firmly and rub the side of a crayon gently over the leaf.',
      'Watch the leaf\'s shape and veins magically appear on the paper!',
      'Try different colours on the same leaf for an artistic effect.',
      'Label each rubbing with the tree name if you can identify it.',
      'Arrange your best rubbings into a gallery display on the wall.',
      'Talk about why leaves change colour in autumn (chlorophyll breaking down).'
    ]},
    category: 'art',
    age_min: 3, age_max: 9,
    duration_minutes: 25,
    location: 'indoor',
    weather: ['any'],
    season: ['autumn', 'spring'],
    materials: [
      { name: 'Fallen leaves (different shapes)', household_common: true },
      { name: 'Thin paper', household_common: true },
      { name: 'Crayons (wrappers removed)', household_common: true },
      { name: 'Blu-tack or tape for display', household_common: true }
    ],
    learning_outcomes: ['Tree identification', 'Fine motor skills', 'Seasonal awareness', 'Texture'],
    energy_level: 'calm',
    mess_level: 'low',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Story Stones',
    slug: 'story-stones',
    description: 'Paint simple pictures on smooth stones — a sun, a dragon, a castle, a tree. Then take turns drawing stones from a bag to build a story together.',
    instructions: { steps: [
      'Collect smooth, flat stones from the garden, beach, or a riverbank.',
      'Wash and dry the stones thoroughly.',
      'Paint simple pictures on each one: a character (princess, pirate, animal), a place (castle, forest, sea), an object (treasure, sword, boat), weather (sun, storm, snow).',
      'Let the paint dry completely. Seal with clear nail varnish if you want them to last.',
      'Put all stones in a bag or box.',
      'Take turns: close your eyes, pick a stone, and add that element to a story you\'re telling together.',
      '"Once upon a time there was a [picks pirate stone] pirate who lived in a [picks castle stone] castle..."',
      'Keep going until all stones are used. Every story will be different and hilarious!'
    ]},
    category: 'art',
    age_min: 4, age_max: 10,
    duration_minutes: 45,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Smooth stones', household_common: true },
      { name: 'Paint and small brushes', household_common: true },
      { name: 'A bag or box', household_common: true }
    ],
    learning_outcomes: ['Storytelling', 'Creativity', 'Oral language', 'Fine motor skills'],
    energy_level: 'calm',
    mess_level: 'medium',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },

  // ─── MOVEMENT & PHYSICAL (5) ─────────────────────────
  {
    title: 'Indoor Obstacle Course',
    slug: 'indoor-obstacle-course',
    description: 'Build an epic obstacle course using cushions, chairs, blankets, and whatever you\'ve got. Perfect for burning energy on a wet Irish afternoon.',
    instructions: { steps: [
      'Clear a space in the living room or hallway.',
      'Set up stations: cushion stepping stones, crawl under a table, jump over a pillow wall.',
      'Add challenges: balance a book on your head, spin around 3 times, throw a sock into a bucket.',
      'Create a tunnel by draping a blanket over chairs.',
      'Use masking tape on the floor for a balance beam line.',
      'Time each person with a kitchen timer or phone.',
      'Let the kids redesign and add new obstacles after each round.',
      'Play "the floor is lava" between stations for extra drama.'
    ]},
    category: 'movement',
    age_min: 3, age_max: 10,
    duration_minutes: 30,
    location: 'indoor',
    weather: ['rainy', 'any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Cushions and pillows', household_common: true },
      { name: 'Blankets', household_common: true },
      { name: 'Chairs', household_common: true },
      { name: 'Masking tape (optional)', household_common: true }
    ],
    learning_outcomes: ['Gross motor skills', 'Balance', 'Problem-solving', 'Physical fitness'],
    energy_level: 'active',
    mess_level: 'low',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Garden Mini Olympics',
    slug: 'garden-mini-olympics',
    description: 'Set up your own Olympic Games in the garden. Long jump, sprint, target throw, and more — complete with medal ceremony and national anthems.',
    instructions: { steps: [
      'Agree on 5-6 events: sprint (mark a start and finish), standing long jump, ball throw for distance, egg-and-spoon race, hula hoop endurance, sack race (pillowcase).',
      'Make a score sheet with each person\'s name.',
      'Set up each event with clear start/finish marks using sticks or stones.',
      'Take turns at each event. Measure distances with steps or a tape measure.',
      'Record scores: 3 points for first, 2 for second, 1 for third.',
      'Add up total scores at the end.',
      'Medal ceremony: make medals from cardboard wrapped in foil, hung on string.',
      'Sing your family anthem on the podium (a garden wall or step will do).'
    ]},
    category: 'movement',
    age_min: 4, age_max: 12,
    duration_minutes: 45,
    location: 'outdoor',
    weather: ['dry', 'sunny', 'overcast'],
    season: ['spring', 'summer'],
    materials: [
      { name: 'Balls', household_common: true },
      { name: 'Spoons and eggs (or potatoes)', household_common: true },
      { name: 'Pillowcases for sack race', household_common: true },
      { name: 'Cardboard and foil for medals', household_common: true }
    ],
    learning_outcomes: ['Physical fitness', 'Sportsmanship', 'Measurement', 'Counting and scoring'],
    energy_level: 'active',
    mess_level: 'low',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Animal Movement Game',
    slug: 'animal-movement-game',
    description: 'Call out an animal and everyone has to move like it — frog jumps, bear crawls, flamingo balances. A brilliant way to burn energy while learning about animals.',
    instructions: { steps: [
      'Clear a space indoors or play in the garden.',
      'One person is the caller. They shout an animal name.',
      'Everyone moves like that animal: frog (jump), crab (walk sideways), bear (crawl on all fours).',
      'Snake (slither on tummy), flamingo (balance on one leg), kangaroo (big jumps), eagle (arms out, run).',
      'The caller shouts "FREEZE!" — everyone stops. Last to freeze is the next caller.',
      'Add Irish animals: salmon (swimming motion), hare (fast hopping), badger (low crawl).',
      'Talk about where each animal lives in Ireland.',
      'Get increasingly silly: sloth (very slow motion), cheetah (sprint on the spot).'
    ]},
    category: 'movement',
    age_min: 3, age_max: 8,
    duration_minutes: 20,
    location: 'both',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [],
    learning_outcomes: ['Gross motor skills', 'Animal knowledge', 'Listening skills', 'Physical fitness'],
    energy_level: 'active',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Yoga Animal Adventure',
    slug: 'yoga-animal-adventure',
    description: 'A calming yoga session where every pose is an animal. Tree pose becomes "tall Irish oak," cobra becomes "Connemara serpent." Wind down after a busy day.',
    instructions: { steps: [
      'Find a soft surface — carpet, rug, or grass. Bare feet work best.',
      'Start standing: "We\'re going on an adventure through an Irish forest..."',
      'Tree pose: stand on one leg, other foot against your calf, arms up like branches. "You\'re a tall oak tree."',
      'Cat-cow: on all fours, arch and round your back. "You\'re a farm cat stretching."',
      'Cobra: lie on tummy, push chest up with hands. "You\'re a snake in the long grass."',
      'Butterfly: sit with soles of feet together, gently flap knees. "A butterfly landing on a wildflower."',
      'Downward dog: hands and feet on ground, bottom in the air. "An Irish wolfhound stretching!"',
      'End lying down in savasana: "You\'re a cloud floating over the Burren." Breathe slowly for 1 minute.'
    ]},
    category: 'movement',
    age_min: 3, age_max: 10,
    duration_minutes: 15,
    location: 'both',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Soft surface or yoga mat', household_common: true }
    ],
    learning_outcomes: ['Balance', 'Flexibility', 'Mindfulness', 'Body awareness'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Puddle Jumping Championship',
    slug: 'puddle-jumping-championship',
    description: 'The noble Irish art of puddle jumping, elevated to a competitive sport. Categories: biggest splash, longest jump over, most creative landing.',
    instructions: { steps: [
      'Wait for rain (shouldn\'t take long in Ireland). Put on wellies and waterproofs.',
      'Find an area with good puddles — a park path, a lane, or your driveway.',
      'Event 1 — Biggest Splash: take turns jumping into the same puddle. Whoever makes the biggest splash wins.',
      'Event 2 — Long Jump: find a puddle and try to jump OVER it without landing in it.',
      'Event 3 — Creative Landing: jump into a puddle in the most creative way possible. Judged on style.',
      'Event 4 — Ripple Count: gently throw a pebble into a calm puddle. Count the ripples.',
      'Bonus: find a puddle that reflects the sky. What can you see in it?',
      'Go home for hot chocolate. Hang wellies to dry. Champions are crowned.'
    ]},
    category: 'movement',
    age_min: 3, age_max: 8,
    duration_minutes: 25,
    location: 'outdoor',
    weather: ['rainy', 'overcast'],
    season: ['autumn', 'winter', 'spring'],
    materials: [
      { name: 'Wellies', household_common: true },
      { name: 'Waterproof jacket and trousers', household_common: true }
    ],
    learning_outcomes: ['Gross motor skills', 'Joyful movement', 'Water observation', 'Sportsmanship'],
    energy_level: 'active',
    mess_level: 'high',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },

  // ─── LITERACY & LANGUAGE (5) ─────────────────────────
  {
    title: 'Story in a Bag',
    slug: 'story-in-a-bag',
    description: 'Fill a bag with random household objects. Pull them out one by one and build a story around whatever appears. Hilarious, creative, and brilliant for language development.',
    instructions: { steps: [
      'One person fills a bag with 5-7 random objects from around the house (without the others seeing).',
      'Objects could be: a spoon, a sock, a toy dinosaur, a key, a rubber duck, a button.',
      'Sit together. The storyteller starts: "Once upon a time..."',
      'Pull out the first object. It must be woven into the story.',
      'Take turns pulling objects and continuing the story.',
      'The rule: whatever comes out must become part of the story, no matter how silly.',
      'Encourage descriptive language: "Where was the dinosaur? What was it feeling? What happened next?"',
      'The last object must somehow end the story. Record it on a phone or write it down.'
    ]},
    category: 'literacy',
    age_min: 4, age_max: 12,
    duration_minutes: 20,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'A bag or pillowcase', household_common: true },
      { name: '5-7 random household objects', household_common: true }
    ],
    learning_outcomes: ['Storytelling', 'Vocabulary', 'Imagination', 'Turn-taking'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Letter Hunt Around the House',
    slug: 'letter-hunt-around-house',
    description: 'Pick a letter and race around the house finding objects that start with that sound. Perfect for reinforcing phonics in a physical, playful way.',
    instructions: { steps: [
      'Choose a letter of the week, or pick one from a hat.',
      'Set a timer for 3 minutes.',
      'Everyone races around the house collecting or pointing at things that start with that letter sound.',
      'Come back together. Take turns showing what you found.',
      'Count: who found the most? Did anyone find something nobody else did?',
      'For younger children: focus on the sound, not the letter name. "B says buh."',
      'For older children: challenge them to find objects with that letter in the middle or end too.',
      'Play again with a new letter. Can you get through the whole alphabet over a week?'
    ]},
    category: 'literacy',
    age_min: 3, age_max: 7,
    duration_minutes: 15,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Timer (phone or kitchen timer)', household_common: true }
    ],
    learning_outcomes: ['Phonics', 'Letter recognition', 'Vocabulary building', 'Active learning'],
    energy_level: 'active',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Poetry Picnic',
    slug: 'poetry-picnic',
    description: 'Pack a blanket and some biscuits, head to the garden or park, and write poems together. Acrostics, haiku, rhyming couplets — or just silly limericks.',
    instructions: { steps: [
      'Pack a blanket, snacks, pencils, and paper. Head to the garden, park, or even the living room floor.',
      'Start with an acrostic: write your name down the side of the page, then write a word or phrase for each letter.',
      'Try a haiku (5-7-5 syllables): "Green fields stretching wide / Soft rain falling on my face / Ireland, you\'re grand so."',
      'Limericks are brilliant fun: "There once was a cat from Kinsale / Who had a magnificent tail..."',
      'For younger children: start a rhyme and let them finish it. "I went to the shop to buy a... [mop/top/pop]."',
      'Read your poems aloud to each other. Snap your fingers instead of clapping (very poetic).',
      'Collect your best poems into a family poetry book.',
      'Talk about famous Irish poets: Yeats, Heaney, Eavan Boland.'
    ]},
    category: 'literacy',
    age_min: 5, age_max: 12,
    duration_minutes: 30,
    location: 'both',
    weather: ['dry', 'sunny'],
    season: ['spring', 'summer'],
    materials: [
      { name: 'Paper and pencils', household_common: true },
      { name: 'Blanket', household_common: true },
      { name: 'Snacks', household_common: true }
    ],
    learning_outcomes: ['Creative writing', 'Rhyme and rhythm', 'Irish literary heritage', 'Self-expression'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Cupla Focal — Daily Irish',
    slug: 'cupla-focal-daily-irish',
    description: 'Learn a handful of Irish words and phrases as a family. Stick them around the house and use them in everyday life. Tá sé go hiontach!',
    instructions: { steps: [
      'Pick 5 Irish words or phrases for the week. Start with greetings: Dia duit (hello), Slán (bye), Go raibh maith agat (thank you).',
      'Write each one on a sticky note with the pronunciation underneath.',
      'Stick them in relevant places: "Doras" (door) on the door, "Fuinneog" (window) on the window.',
      'Try to use them in conversation: "Will you close the doras, please?"',
      'Colours: dearg (red), glas (green), gorm (blue), bán (white), dubh (black).',
      'Animals: madra (dog), cat (cat — same!), capall (horse), bó (cow), éan (bird).',
      'Family: Mamó (granny), Daideo (grandad), deartháir (brother), deirfiúr (sister).',
      'By Friday, test each other. Can everyone remember all 5? Add 5 more next week.'
    ]},
    category: 'literacy',
    age_min: 3, age_max: 12,
    duration_minutes: 15,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Sticky notes', household_common: true },
      { name: 'Markers', household_common: true }
    ],
    learning_outcomes: ['Irish language', 'Cultural heritage', 'Memory', 'Bilingual awareness'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Family Newspaper',
    slug: 'family-newspaper',
    description: 'Create a family newspaper with headlines, stories, interviews, weather reports, and comic strips. A brilliant collaborative writing project for a rainy afternoon.',
    instructions: { steps: [
      'Fold a large sheet of paper in half to create a newspaper format.',
      'Assign roles: editor, reporter, weather forecaster, sports correspondent, cartoonist.',
      'Write a headline story about something that happened in your family this week.',
      'Interview a family member: "Mammy, what was your favourite moment this week?"',
      'Draw a comic strip about a funny thing that happened.',
      'Write a weather forecast for tomorrow (check outside and make your prediction).',
      'Add a "what\'s on" section: upcoming family events, birthdays, plans.',
      'Read the newspaper aloud at dinner. Keep copies — they\'ll be treasures someday.'
    ]},
    category: 'literacy',
    age_min: 6, age_max: 12,
    duration_minutes: 45,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Large paper', household_common: true },
      { name: 'Pens, pencils, markers', household_common: true }
    ],
    learning_outcomes: ['Writing genres', 'Interview skills', 'Collaboration', 'Layout and design'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },

  // ─── MATHS IN REAL LIFE (5) ──────────────────────────
  {
    title: 'Conker Maths',
    slug: 'conker-maths',
    description: 'Collect conkers (horse chestnuts) in autumn and use them for counting, sorting, addition, subtraction, and even multiplication. Maths with nature\'s perfect manipulatives.',
    instructions: { steps: [
      'Go on a conker hunt under horse chestnut trees in September/October.',
      'Collect as many as you can in a bag or bucket.',
      'At home: sort by size — small, medium, large. How many in each group?',
      'Counting: line them up and count. Can you count by 2s? 5s? 10s?',
      'Addition: "I have 5 conkers. You give me 3 more. How many now?"',
      'Subtraction: "I had 8 conkers but a squirrel took 3. How many left?"',
      'For older children: multiplication. "If 4 children each have 3 conkers, how many altogether?"',
      'Bonus: measure circumference with string. Which conker is biggest?'
    ]},
    category: 'maths',
    age_min: 3, age_max: 10,
    duration_minutes: 25,
    location: 'both',
    weather: ['dry'],
    season: ['autumn'],
    materials: [
      { name: 'Conkers (horse chestnuts)', household_common: true },
      { name: 'Bag for collecting', household_common: true },
      { name: 'String for measuring (optional)', household_common: true }
    ],
    learning_outcomes: ['Counting', 'Addition and subtraction', 'Sorting and classifying', 'Measurement'],
    energy_level: 'moderate',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Shape Detectives',
    slug: 'shape-detectives',
    description: 'Hunt for 2D and 3D shapes around your house and neighbourhood. Circles on clocks, rectangles on doors, cylinders in the kitchen — shapes are everywhere.',
    instructions: { steps: [
      'Start indoors. Can you find a circle? (Clock, plate, coin.) A rectangle? (Door, book, screen.)',
      'Make a checklist: circle, square, rectangle, triangle, oval, hexagon, star.',
      'Tick off each shape as you find it. Take a photo or draw each one.',
      'Move to 3D shapes: sphere (ball), cube (dice), cylinder (tin), cone (traffic cone), pyramid.',
      'Head outside: what shapes can you see? Windows, road signs, wheels, bricks.',
      'Challenge: can you find a hexagon? (Hint: look at a honeycomb pattern, nuts and bolts, or a football.)',
      'Back home: build each shape using toothpicks/cocktail sticks and blu-tack or marshmallows.',
      'Count the sides, corners, and edges of each shape.'
    ]},
    category: 'maths',
    age_min: 3, age_max: 8,
    duration_minutes: 25,
    location: 'both',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Paper and pencil for checklist', household_common: true },
      { name: 'Toothpicks and blu-tack (optional)', household_common: true }
    ],
    learning_outcomes: ['Shape recognition', '2D and 3D geometry', 'Observation', 'Mathematical vocabulary'],
    energy_level: 'moderate',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Kitchen Measuring Challenge',
    slug: 'kitchen-measuring-challenge',
    description: 'Get into the kitchen and measure everything — pour water between containers, weigh fruit on scales, compare lengths with a ruler. Real-world maths that sticks.',
    instructions: { steps: [
      'Set up stations around the kitchen table.',
      'Station 1 — Capacity: fill a jug and pour into different cups. How many cups fill the jug?',
      'Station 2 — Weight: use kitchen scales to weigh fruit. Which is heavier: an apple or a banana?',
      'Station 3 — Length: measure objects with a ruler. How long is a fork? A banana? Your hand?',
      'Station 4 — Estimation: before measuring, guess first. "How many spoons of rice fill this cup?"',
      'Record all your measurements. Were your estimates close?',
      'For older children: convert between units. 1 litre = 1000ml. 1kg = 1000g.',
      'Final challenge: can you pour exactly 250ml into a cup without a measuring jug?'
    ]},
    category: 'maths',
    age_min: 4, age_max: 10,
    duration_minutes: 25,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Measuring jug', household_common: true },
      { name: 'Kitchen scales', household_common: true },
      { name: 'Ruler or tape measure', household_common: true },
      { name: 'Various cups, spoons, containers', household_common: true }
    ],
    learning_outcomes: ['Measurement', 'Estimation', 'Units of measure', 'Comparison'],
    energy_level: 'moderate',
    mess_level: 'low',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Treasure Map Coordinates',
    slug: 'treasure-map-coordinates',
    description: 'Draw a treasure map of your garden or park using a grid. Hide treasure and give coordinates to find it. Grid references, pirate style.',
    instructions: { steps: [
      'Draw a simple grid on a large piece of paper: label columns A-F and rows 1-6.',
      'Walk around your garden or a park. Sketch landmarks on the grid: the big tree at C3, the shed at E5.',
      'Hide a "treasure" (a small toy, some sweets, or a special stone) somewhere in the mapped area.',
      'Mark the treasure location on your map with an X.',
      'Give the map to the other players. Can they use the coordinates to find the treasure?',
      'Make it harder: instead of an X, give clues. "Start at A1. Go 3 squares east and 2 squares north."',
      'Take turns hiding and seeking. Each person makes their own map.',
      'Talk about how real maps work — compass directions, scale, and grid references.'
    ]},
    category: 'maths',
    age_min: 5, age_max: 12,
    duration_minutes: 35,
    location: 'outdoor',
    weather: ['dry', 'sunny', 'overcast'],
    season: ['spring', 'summer', 'autumn'],
    materials: [
      { name: 'Large paper', household_common: true },
      { name: 'Pencils and markers', household_common: true },
      { name: 'Something to hide as treasure', household_common: true }
    ],
    learning_outcomes: ['Coordinates', 'Grid references', 'Map skills', 'Spatial awareness'],
    energy_level: 'moderate',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Shop Play with Real Money',
    slug: 'shop-play-real-money',
    description: 'Set up a pretend shop using real (or pretend) coins and household items with price tags. Practice addition, subtraction, and making change — essential life maths.',
    instructions: { steps: [
      'Gather household items to "sell": tins, fruit, books, toys.',
      'Write price tags for each item. Start simple: 5c, 10c, 20c, 50c, €1.',
      'Set up a shop counter (a table or box). Get some real coins or make paper ones.',
      'Take turns being shopkeeper and customer.',
      'Customer: choose items, add up the total, and pay.',
      'Shopkeeper: count the money, check it\'s right, and give change.',
      '"That\'s 30c and 20c — so 50c altogether. You gave me €1, so your change is 50c."',
      'For older children: add bigger prices, use notes, calculate percentages for a "sale".'
    ]},
    category: 'maths',
    age_min: 4, age_max: 10,
    duration_minutes: 30,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Coins (real or paper)', household_common: true },
      { name: 'Household items to sell', household_common: true },
      { name: 'Paper for price tags', household_common: true },
      { name: 'Sticky notes', household_common: true }
    ],
    learning_outcomes: ['Money handling', 'Addition and subtraction', 'Making change', 'Real-world maths'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },

  // ─── LIFE SKILLS (5) ─────────────────────────────────
  {
    title: 'Tie Your Own Laces',
    slug: 'tie-your-own-laces',
    description: 'The bunny ears method makes shoe-tying manageable for little fingers. A life skill milestone that deserves celebration when mastered.',
    instructions: { steps: [
      'Start with a shoe off the foot — it\'s easier to learn on a table.',
      'Use two different coloured laces if possible, so you can see each one clearly.',
      'Step 1: Cross the laces over to make an X. Pull one under and through. Pull tight.',
      'Step 2 — Bunny Ears: make a loop (ear) with each lace. Hold one in each hand.',
      'Step 3: Cross the bunny ears over each other, just like step 1.',
      'Step 4: Push one ear under and through the hole. Pull both ears to tighten.',
      'Practise slowly 5 times. Then try it on your foot.',
      'When they can do it independently, celebrate! This is a big milestone.'
    ]},
    category: 'life_skills',
    age_min: 4, age_max: 7,
    duration_minutes: 15,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Shoes with laces', household_common: true }
    ],
    learning_outcomes: ['Fine motor skills', 'Independence', 'Patience', 'Sequencing'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'My First Map',
    slug: 'my-first-map',
    description: 'Draw a map of your bedroom, house, or neighbourhood. Learn about bird\'s eye view, scale, and the magic of representing the real world on paper.',
    instructions: { steps: [
      'Start with something simple: draw your bedroom from above, as if you were a bird looking down.',
      'Stand in the doorway and look at the layout. Where is the bed? The window? The wardrobe?',
      'Draw the room shape first (probably a rectangle). Add the door and window.',
      'Add furniture as simple shapes: bed = rectangle, desk = square, rug = circle.',
      'Label everything. Add a compass rose (N, S, E, W) — which way is the window facing?',
      'For a challenge: map the whole house, or your walk to the shop/school.',
      'Use a key: star for "my favourite spot", heart for "where the dog sleeps", etc.',
      'Compare your map with the real room. Did you get the sizes roughly right?'
    ]},
    category: 'life_skills',
    age_min: 5, age_max: 12,
    duration_minutes: 25,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Paper and pencil', household_common: true },
      { name: 'Ruler (optional)', household_common: true },
      { name: 'Coloured pencils', household_common: true }
    ],
    learning_outcomes: ['Spatial awareness', 'Map skills', 'Bird\'s eye view', 'Scale'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Tell the Time — Clock Making',
    slug: 'tell-the-time-clock-making',
    description: 'Make a clock face from a paper plate and learn to tell the time. Move the hands to different times throughout the day and talk about what happens at each.',
    instructions: { steps: [
      'Use a paper plate or cut a circle from cardboard.',
      'Write the numbers 1-12 around the edge, like a real clock. (Tip: start with 12, 3, 6, 9 first.)',
      'Cut two arrows from card: a short fat one (hour hand) and a long thin one (minute hand).',
      'Attach them to the centre with a brass paper fastener or a blob of blu-tack.',
      'Start with o\'clock times: set to 8 o\'clock — "What happens at 8? School time!"',
      'Move to half past: "The long hand points to 6. It\'s half past 3 — home time!"',
      'Play a game: call out a time and race to set your clocks. Or set a time and guess what activity it might be.',
      'Carry the clock around for a day. At each real time, match it on your paper clock.'
    ]},
    category: 'life_skills',
    age_min: 4, age_max: 8,
    duration_minutes: 30,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Paper plate or cardboard circle', household_common: true },
      { name: 'Card for hands', household_common: true },
      { name: 'Paper fastener or blu-tack', household_common: true },
      { name: 'Markers', household_common: true }
    ],
    learning_outcomes: ['Telling time', 'Number placement', 'Daily routine awareness', 'Fine motor skills'],
    energy_level: 'calm',
    mess_level: 'low',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Basic First Aid Heroes',
    slug: 'basic-first-aid-heroes',
    description: 'Teach children the basics of first aid: how to clean a cut, when to get help, the recovery position, and how to call 112. Empowering and potentially life-saving.',
    instructions: { steps: [
      'Start with the most important lesson: if someone is hurt badly, tell a grown-up or call 112.',
      'Practise calling 112: know your address, stay calm, answer their questions.',
      'Small cuts: wash hands, rinse the cut with clean water, pat dry, apply a plaster.',
      'Bumps: hold something cold (frozen peas wrapped in a tea towel) on the bump.',
      'Nosebleed: sit upright, lean slightly forward, pinch the soft part of the nose for 10 minutes.',
      'Practise the recovery position on each other (look up a video together first).',
      'Where is your first aid kit at home? Go find it together and look at what\'s inside.',
      'Make a simple first aid poster for the kitchen with the key steps.'
    ]},
    category: 'life_skills',
    age_min: 5, age_max: 12,
    duration_minutes: 25,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'First aid kit', household_common: true },
      { name: 'Plasters', household_common: true },
      { name: 'Paper and markers for poster', household_common: true }
    ],
    learning_outcomes: ['First aid basics', 'Emergency response', 'Empathy', 'Confidence'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Sewing a Button',
    slug: 'sewing-a-button',
    description: 'Thread a needle, sew on a button, and feel incredibly proud of yourself. A timeless skill that builds fine motor control and independence.',
    instructions: { steps: [
      'Gather: a large button (4 holes), thick thread or yarn, a large blunt needle, and a piece of fabric or felt.',
      'Cut a piece of thread about 30cm long. Thread it through the needle (adults help younger children).',
      'Tie a knot at the end of the thread.',
      'Push the needle up through the fabric and through one hole of the button.',
      'Then down through the opposite hole and back through the fabric.',
      'Repeat 3-4 times through the same two holes. Then do the other two holes.',
      'To finish: push the needle through the fabric (not the button), wrap thread around under the button 3 times, push through and knot.',
      'Admire your work! Now try sewing a button onto an old shirt for real.'
    ]},
    category: 'life_skills',
    age_min: 6, age_max: 12,
    duration_minutes: 20,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Large buttons', household_common: true },
      { name: 'Thick thread or yarn', household_common: true },
      { name: 'Large blunt needle', household_common: true },
      { name: 'Fabric scraps or felt', household_common: true }
    ],
    learning_outcomes: ['Fine motor skills', 'Independence', 'Patience', 'Practical skills'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },

  // ─── CALM & MINDFUL (5) ──────────────────────────────
  {
    title: 'Breathing Buddies',
    slug: 'breathing-buddies',
    description: 'Lie down with a stuffed animal on your tummy and watch it rise and fall with your breath. The simplest, most effective mindfulness exercise for children.',
    instructions: { steps: [
      'Find a quiet spot. Lie down on your back on a soft surface.',
      'Place a small stuffed animal or toy on your tummy.',
      'Close your eyes (or look at the ceiling softly).',
      'Breathe in slowly through your nose — watch your buddy rise up.',
      'Breathe out slowly through your mouth — watch your buddy gently fall.',
      'Try to make your buddy move as slowly and smoothly as possible.',
      'Count together: breathe in for 4 counts, hold for 2, out for 4.',
      'Do 5-10 breaths. Notice how your body feels afterwards. Calmer? More relaxed?'
    ]},
    category: 'calm',
    age_min: 3, age_max: 8,
    duration_minutes: 10,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Small stuffed animal or soft toy', household_common: true }
    ],
    learning_outcomes: ['Breathing awareness', 'Self-regulation', 'Calm-down strategy', 'Body awareness'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Gratitude Jar',
    slug: 'gratitude-jar',
    description: 'Start a family gratitude practice. Each evening, everyone writes one thing they\'re grateful for on a slip of paper and drops it in the jar. Read them all at month\'s end.',
    instructions: { steps: [
      'Find a clean glass jar — a big one. Decorate it together if you like.',
      'Cut colourful paper into small strips.',
      'Each evening (before bed or after dinner), everyone writes one thing they\'re grateful for.',
      'For pre-writers: they tell you and you write it, or they draw a picture.',
      'Fold the paper and drop it in the jar.',
      'Examples: "I\'m grateful for the sunny walk we had." "I\'m grateful my friend shared their lunch."',
      'At the end of the month (or whenever the jar is full), open it and read them all together.',
      'It\'s amazing to see what you\'ve appreciated. Keep the jar going — it becomes a beautiful family ritual.'
    ]},
    category: 'calm',
    age_min: 3, age_max: 12,
    duration_minutes: 10,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Glass jar', household_common: true },
      { name: 'Coloured paper scraps', household_common: true },
      { name: 'Pencils or pens', household_common: true }
    ],
    learning_outcomes: ['Gratitude', 'Emotional literacy', 'Writing practice', 'Family connection'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Nature Sound Map',
    slug: 'nature-sound-map',
    description: 'Sit quietly outdoors, close your eyes, and map the sounds around you. Birds to the left, wind in the trees above, a car in the distance. A beautiful listening exercise.',
    instructions: { steps: [
      'Find a quiet outdoor spot: your garden, a park bench, a woodland clearing.',
      'Sit comfortably. Place a piece of paper on a clipboard or book, with a pencil.',
      'Draw an X in the centre of the paper — this is you.',
      'Close your eyes for 2 minutes. Just listen.',
      'When you hear a sound, open your eyes and mark it on the paper in the direction it came from.',
      'Use symbols: a musical note for birdsong, wavy lines for wind, a square for a car, etc.',
      'After 5 minutes, look at your sound map. What was the closest sound? The farthest?',
      'Compare maps with each other. Did you hear the same things? What did someone else notice that you missed?'
    ]},
    category: 'calm',
    age_min: 4, age_max: 12,
    duration_minutes: 15,
    location: 'outdoor',
    weather: ['dry', 'overcast', 'sunny'],
    season: ['spring', 'summer', 'autumn'],
    materials: [
      { name: 'Paper and pencil', household_common: true },
      { name: 'Clipboard or book to lean on', household_common: true }
    ],
    learning_outcomes: ['Active listening', 'Mindfulness', 'Observation', 'Spatial awareness'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Sensory Calm Box',
    slug: 'sensory-calm-box',
    description: 'Build a personalised calm-down box filled with sensory items: stress ball, lavender bag, smooth stone, glitter jar. A go-to toolkit for big feelings.',
    instructions: { steps: [
      'Find a small box, tin, or bag — this will be your calm box.',
      'Together, choose items that help you feel calm. Ideas:',
      'Touch: a smooth stone, a piece of soft fabric, a stress ball (fill a balloon with flour).',
      'Smell: a cotton ball with lavender oil, a sachet of herbs, a favourite hand cream.',
      'See: a glitter jar (fill a jar with water, glitter glue, and glitter — shake and watch it settle).',
      'Hear: a small bell, a shell to hold to your ear.',
      'Include a card with 3 breathing exercises written on it.',
      'Keep the box in a special place. When big feelings come, go to your calm box first.'
    ]},
    category: 'calm',
    age_min: 3, age_max: 10,
    duration_minutes: 30,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Small box or tin', household_common: true },
      { name: 'Smooth stone', household_common: true },
      { name: 'Soft fabric scrap', household_common: true },
      { name: 'Balloon and flour (for stress ball)', household_common: true },
      { name: 'Jar, water, and glitter', household_common: true }
    ],
    learning_outcomes: ['Emotional regulation', 'Sensory awareness', 'Self-care', 'Coping strategies'],
    energy_level: 'calm',
    mess_level: 'low',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Cloud Watching & Daydreaming',
    slug: 'cloud-watching-daydreaming',
    description: 'Sometimes the best activity is no activity at all. Lie on a blanket, watch the clouds, and let your mind wander. Protect boredom — it\'s where creativity begins.',
    instructions: { steps: [
      'Spread a blanket in the garden, park, or beach.',
      'Lie on your backs and look up at the sky.',
      'The only rule: no talking for the first 2 minutes. Just watch.',
      'After the silence, share what you see in the clouds. A dragon? A ship? A face?',
      'Take turns pointing and describing. "That one looks like a giant sleeping cat."',
      'Watch how the shapes change as the clouds move. The dragon becomes a mountain.',
      'Talk about where the clouds are going. What country will they be over tonight?',
      'Stay as long as you like. There\'s no goal here. Just being.'
    ]},
    category: 'calm',
    age_min: 3, age_max: 12,
    duration_minutes: 20,
    location: 'outdoor',
    weather: ['dry', 'partly_cloudy', 'overcast'],
    season: ['spring', 'summer', 'autumn'],
    materials: [
      { name: 'Blanket', household_common: true }
    ],
    learning_outcomes: ['Mindfulness', 'Imagination', 'Patience', 'Observation'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },

  // ─── SOCIAL & COMMUNITY (5) ──────────────────────────
  {
    title: 'Kindness Bingo',
    slug: 'kindness-bingo',
    description: 'Create a bingo card filled with kind acts. Tick them off over the week: hold a door, write a note, help with chores, say something kind to a stranger.',
    instructions: { steps: [
      'Draw a 3x3 or 4x4 bingo grid on paper.',
      'Together, fill each square with a kind act: "Hold a door for someone", "Write a thank you note", "Help with the washing up", "Compliment someone", "Share a toy".',
      'More ideas: "Pick up litter", "Make someone laugh", "Help carry shopping", "Let someone go first".',
      'Each person gets their own card (or share one as a family).',
      'Over the week, tick off each act as you complete it.',
      'Talk about how it felt to do each kind thing. How did the other person react?',
      'When someone gets a line (or full house), celebrate!',
      'Make a new card next week with different acts. Kindness becomes a habit.'
    ]},
    category: 'social',
    age_min: 4, age_max: 12,
    duration_minutes: 15,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Paper', household_common: true },
      { name: 'Pencils or markers', household_common: true }
    ],
    learning_outcomes: ['Empathy', 'Kindness', 'Social awareness', 'Habit building'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Letter to Grandparents',
    slug: 'letter-to-grandparents',
    description: 'Write a real letter to grandparents, an aunt, or a friend. Draw a picture, put it in an envelope, walk to the post box, and wait for a reply. Magic.',
    instructions: { steps: [
      'Decide who to write to: grandparents, cousins, a friend who moved away, or a pen pal.',
      'Start with "Dear..." and share your news. What have you been doing? What\'s your favourite thing this week?',
      'For younger children: draw a big, colourful picture and dictate a message for a grown-up to write.',
      'Include something fun: a joke, a riddle, a sticker, a pressed leaf.',
      'Fold it up. Put it in an envelope. Write the address (grown-up helps with this).',
      'Walk to the post box together. Let the child post it — this is a big moment!',
      'Wait for a reply. Check the letterbox every day. The anticipation is half the joy.',
      'When a reply comes, read it together and start the next letter.'
    ]},
    category: 'social',
    age_min: 3, age_max: 12,
    duration_minutes: 25,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Paper and pencils/crayons', household_common: true },
      { name: 'Envelope', household_common: true },
      { name: 'Stamp', household_common: true }
    ],
    learning_outcomes: ['Writing skills', 'Communication', 'Family connection', 'Patience'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Family Interview Night',
    slug: 'family-interview-night',
    description: 'Take turns interviewing each other with fun, interesting questions. What was your happiest memory? If you could have dinner with anyone, who would it be? Deepens family bonds.',
    instructions: { steps: [
      'Sit in a circle. Decide who is the interviewer first.',
      'Use fun questions: "What\'s your superpower?" "If you were an animal, which one?" "What\'s your earliest memory?"',
      'Deeper questions: "What are you most proud of?" "What would you change about the world?" "What makes you feel loved?"',
      'The interviewer asks, the interviewee answers, everyone listens without interrupting.',
      'After 3-4 questions, swap roles.',
      'Record answers in a notebook or on a phone — these are treasures.',
      'For younger children, use simpler questions: "What\'s your favourite colour/food/game?"',
      'Make it a monthly tradition. Compare answers over time — how do they change?'
    ]},
    category: 'social',
    age_min: 4, age_max: 12,
    duration_minutes: 20,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Notebook and pen (optional)', household_common: true }
    ],
    learning_outcomes: ['Listening skills', 'Emotional intelligence', 'Family bonding', 'Communication'],
    energy_level: 'calm',
    mess_level: 'none',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Neighbourhood Clean-Up Walk',
    slug: 'neighbourhood-clean-up-walk',
    description: 'Grab some bags and gloves and clean up litter on your road, in the park, or along the beach. A simple way to teach environmental responsibility and community pride.',
    instructions: { steps: [
      'Get a bin bag and rubber gloves (or use a litter picker if you have one).',
      'Choose a route: your road, the local park, a beach, or a walking trail.',
      'Talk about why litter is harmful: animals can eat it, it pollutes water, it makes places ugly.',
      'Set a target: can we fill one bag in 30 minutes?',
      'Sort as you go if possible: recyclables in one bag, general waste in another.',
      'Take a "before and after" photo of the area you cleaned.',
      'At the end, count or weigh what you collected.',
      'Wash hands thoroughly when you get home. Feel proud — you made your community better!'
    ]},
    category: 'social',
    age_min: 4, age_max: 12,
    duration_minutes: 30,
    location: 'outdoor',
    weather: ['dry', 'overcast', 'sunny'],
    season: ['spring', 'summer', 'autumn'],
    materials: [
      { name: 'Bin bags', household_common: true },
      { name: 'Rubber gloves', household_common: true }
    ],
    learning_outcomes: ['Environmental responsibility', 'Community pride', 'Teamwork', 'Categorisation'],
    energy_level: 'moderate',
    mess_level: 'low',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
  {
    title: 'Cultural Celebration Explorer',
    slug: 'cultural-celebration-explorer',
    description: 'Learn about a cultural celebration from around the world — Diwali, Chinese New Year, Eid, Hanukkah — and do an activity inspired by it. Builds empathy and curiosity.',
    instructions: { steps: [
      'Choose a celebration that\'s coming up or one that interests your family.',
      'Talk about where it comes from, who celebrates it, and why it matters.',
      'Diwali: make paper lanterns or rangoli patterns with coloured rice or chalk.',
      'Chinese New Year: make a paper dragon puppet, try eating with chopsticks.',
      'Eid: bake simple biscuits to "share with neighbours" (a key part of Eid tradition).',
      'Hanukkah: play dreidel (make one from card) and talk about the menorah.',
      'Irish celebrations too: make a St. Brigid\'s cross (1 Feb), learn about Samhain (31 Oct).',
      'Talk about what\'s similar between all these celebrations: gathering, food, light, family.'
    ]},
    category: 'social',
    age_min: 4, age_max: 12,
    duration_minutes: 40,
    location: 'indoor',
    weather: ['any'],
    season: ['spring', 'summer', 'autumn', 'winter'],
    materials: [
      { name: 'Paper and craft materials', household_common: true },
      { name: 'Coloured rice or chalk (optional)', household_common: true }
    ],
    learning_outcomes: ['Cultural awareness', 'Empathy', 'Global knowledge', 'Creativity'],
    energy_level: 'moderate',
    mess_level: 'low',
    screen_free: true, premium: false, created_by: 'system', published: true,
  },
];

async function seed() {
  console.log('Seeding activities...');

  // Clear existing activities
  const { error: deleteError } = await supabase.from('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('Error clearing activities:', deleteError);
  }

  // Insert in batches of 10
  for (let i = 0; i < activities.length; i += 10) {
    const batch = activities.slice(i, i + 10);
    const { error } = await supabase.from('activities').insert(batch);
    if (error) {
      console.error(`Error inserting batch ${i / 10 + 1}:`, error);
    } else {
      console.log(`Inserted batch ${i / 10 + 1} (${batch.length} activities)`);
    }
  }

  console.log(`Done! ${activities.length} activities seeded.`);
}

seed().catch(console.error);
