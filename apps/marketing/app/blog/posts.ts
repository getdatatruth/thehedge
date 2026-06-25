// Single source of truth for the blog. The index page and the [slug] page both
// read from POSTS, so there are no phantom slugs.

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'callout'; title?: string; text: string }
  | { type: 'quote'; text: string };

export interface Post {
  slug: string;
  cat: string;
  date: string; // human readable, e.g. "12 March 2026"
  isoDate: string; // ISO 8601 for metadata + JSON-LD
  title: string;
  titleEm: string; // the trailing fragment rendered in italic on the index
  excerpt: string;
  description: string; // SEO meta description
  readTime: string;
  bg: string; // gradient for the card + hero
  body: Block[];
}

const SIGNATURE: Block[] = [];

export const POSTS: Post[] = [
  {
    slug: 'tusla-aears-guide',
    cat: 'Homeschool',
    date: '5 March 2026',
    isoDate: '2026-03-05',
    title: 'Tusla AEARS: what Irish homeschoolers actually need to submit',
    titleEm: 'AEARS',
    excerpt:
      "The AEARS process can feel mysterious, especially for families new to home education. Here is a clear, plain-English guide to what an assessment looks at and how to prepare without the stress.",
    description:
      'A plain-English guide to Tusla AEARS home education assessment in Ireland: what assessors look at, how to prepare your evidence, and where the official Tusla guidance lives. Not affiliated with Tusla.',
    readTime: '12 min read',
    bg: 'linear-gradient(135deg,#1C3520,#3D6142)',
    body: [
      {
        type: 'callout',
        title: 'Before we start',
        text: 'The Hedge is not an official Tusla product and is not affiliated with Tusla. This is a plain-English explainer to help you get your bearings. Always read the current guidance on tusla.ie and, where you can, talk to other home-educating families who have been through it.',
      },
      {
        type: 'p',
        text: 'If you are home educating in Ireland, or thinking about it, AEARS is the part that tends to keep parents up at night. The good news is that it is far more humane than its acronym suggests. Once you understand what it is actually for, the dread tends to lift.',
      },
      { type: 'h2', text: 'What AEARS actually is' },
      {
        type: 'p',
        text: 'AEARS stands for the Assessment of Education in Places other than Recognised Schools. It is the process by which Tusla, the Child and Family Agency, assesses applications from parents who wish to educate their children outside the recognised school system.',
      },
      {
        type: 'p',
        text: 'The legal backbone comes from Article 42 of the Constitution, which recognises the family as the primary educator, and from the Education (Welfare) Act 2000, which sets out the registration process. In short: home education is a legitimate, constitutionally protected choice in Ireland. AEARS is the mechanism that registers it, not a hurdle designed to discourage it.',
      },
      {
        type: 'p',
        text: 'The standard the assessment uses is a "certain minimum education". It is deliberately not the same as replicating school at the kitchen table. The question an assessor is answering is whether your child is receiving an education suitable to their age, ability, and aptitude.',
      },
      { type: 'h2', text: 'The shape of the process' },
      {
        type: 'p',
        text: 'Every family is different, but most applications follow a recognisable arc:',
      },
      {
        type: 'ol',
        items: [
          'You apply to Tusla to have your child placed on the register of children receiving education outside a recognised school.',
          'Tusla appoints an Authorised Person, an assessor, to carry out the AEARS assessment.',
          'You complete a preliminary questionnaire describing your educational approach, your child, and the resources you use.',
          'An assessment meeting is arranged, usually in your home, where you talk through your approach and the assessor may meet your child.',
          'The assessor prepares a report and a recommendation. Most families who are genuinely educating their children are registered.',
        ],
      },
      {
        type: 'callout',
        title: 'It is a conversation, not an inspection',
        text: 'Many assessors are former teachers or inspectors, and the meeting is closer to a friendly professional chat than an exam. You are explaining how learning happens in your home, not defending a lesson plan.',
      },
      { type: 'h2', text: 'What an assessor is actually looking for' },
      {
        type: 'p',
        text: 'The assessment is not looking for a school in miniature. It is looking for evidence that a real, suitable education is happening. In practice, that tends to come down to a handful of things:',
      },
      {
        type: 'ul',
        items: [
          'A coherent approach. You can describe how your child learns, whether that is structured, Charlotte Mason, Montessori-influenced, project-based, unschooling, or a blend. There is no single approved method.',
          'Breadth. Your child is encountering a reasonable range of areas over time: literacy and numeracy, the world around them, creativity, physical activity, and social development.',
          'Suitability. The education fits your particular child, their age, their ability, and their interests.',
          'Some evidence. Not a mountain of paperwork, but enough to show the education is genuinely taking place: examples of work, a sense of your rhythm, books and materials you use, places you go.',
        ],
      },
      { type: 'h2', text: 'Pulling your evidence together' },
      {
        type: 'p',
        text: 'You do not need a filing cabinet. What helps most is a simple, honest record of what your days actually look like, gathered as you go rather than reconstructed in a panic the week before. Useful things to keep:',
      },
      {
        type: 'ul',
        items: [
          'A loose record of what you have covered over recent months, by area or theme.',
          'A handful of work samples: writing, drawings, projects, photos of things made or built.',
          'A list of the main resources and books you lean on.',
          'Notes on outings and real-world learning: the beach, the museum, the farm, the library.',
          'For each child, a short description of where they are and where they are heading next.',
        ],
      },
      {
        type: 'callout',
        title: 'Where The Hedge fits',
        text: 'The Hedge keeps a dated, curriculum-tagged log of the activities your family does, and can export it as a tidy PDF over any date range. It is a record-keeping aid designed to help you organise the kind of evidence an AEARS assessment looks for. It does not register you with Tusla and it is not an official Tusla product.',
      },
      { type: 'h2', text: 'Common worries, gently answered' },
      { type: 'h3', text: '"My approach is informal. Will that count?" ' },
      {
        type: 'p',
        text: 'Informal does not mean inadequate. Unschooling and interest-led approaches are recognised. What matters is that you can articulate how learning happens and show that it is, in fact, happening.',
      },
      { type: 'h3', text: '"What if my child is behind in something?"' },
      {
        type: 'p',
        text: 'Children are uneven, and assessors know this. The standard is suitability to your child, not a national average on a given Tuesday. Being able to say "here is where she is, and here is what we are doing about it" is far stronger than pretending everything is uniform.',
      },
      { type: 'h3', text: '"Do I have to follow the NCCA curriculum?"' },
      {
        type: 'p',
        text: 'No. You are not required to replicate the primary curriculum. That said, many families find the NCCA strands a useful map of the territory, a way to check they are not accidentally neglecting a whole area. The Hedge tags activities to those strands so you can see your coverage at a glance, without it dictating your week.',
      },
      { type: 'h2', text: 'The official sources' },
      {
        type: 'p',
        text: 'For anything binding, go to the source. Tusla publishes guidelines for the assessment and the application forms on its website. Start at tusla.ie and search for home education or AEARS, and read the current Guidelines for the Assessment of Education in Places other than Recognised Schools.',
      },
      {
        type: 'p',
        text: 'The Home Education Network (HEN) is also a long-standing Irish support organisation run by home-educating families, and a good place to find people who have been through the process recently.',
      },
      { type: 'h2', text: 'The honest bottom line' },
      {
        type: 'p',
        text: 'AEARS exists to confirm that your child is getting a suitable education, not to catch you out. Families who are genuinely educating their children, in whatever style suits them, are the ones it is designed to register. Keep a light, honest record as you go, be able to describe your approach in your own words, and the rest tends to follow.',
      },
    ],
  },
  {
    slug: 'thinking-about-homeschooling-ireland',
    cat: 'Homeschool',
    date: '26 February 2026',
    isoDate: '2026-02-26',
    title: 'Thinking about home educating in Ireland? Start here',
    titleEm: 'Start here',
    excerpt:
      'Home education is legal and more common in Ireland than many people realise. Here is a calm, practical starting guide for families weighing it up, with no pressure either way.',
    description:
      'A calm starter guide to home education in Ireland: is it legal, how to begin, what registration involves, and how to find your feet. For families thinking it through, with no pressure either way.',
    readTime: '9 min read',
    bg: 'linear-gradient(135deg,#2C4A2E,#4A7C4E)',
    body: [
      {
        type: 'p',
        text: 'Maybe school is not working for one of your children. Maybe you have always felt drawn to a slower, more home-grown kind of learning. Maybe you are just curious. Whatever brought you here, the first thing worth saying is this: home education in Ireland is a normal, legal choice, and you are allowed to take your time deciding.',
      },
      { type: 'h2', text: 'Yes, it is legal' },
      {
        type: 'p',
        text: 'Article 42 of the Irish Constitution recognises the family as the primary and natural educator of the child. You have the right to educate your children at home. There is no requirement to be a qualified teacher, to follow a set timetable, or to recreate a classroom.',
      },
      {
        type: 'p',
        text: 'What is required is that your child receives a certain minimum education suitable to their age, ability, and aptitude, and that they are placed on the register held by Tusla through the AEARS process. That registration is a one-time assessment, not a constant inspection.',
      },
      {
        type: 'callout',
        title: 'A note on AEARS',
        text: 'AEARS is the assessment that registers your child as receiving education outside a recognised school. It tends to sound more intimidating than it is. We have written a separate plain-English guide to it, linked at the end of this piece.',
      },
      { type: 'h2', text: 'You do not have to decide everything at once' },
      {
        type: 'p',
        text: 'A common mistake is to feel you must choose a "method" before you begin. In reality, most families drift into an approach that suits their particular children, and it changes over the years. The big families of approaches you will hear about include:',
      },
      {
        type: 'ul',
        items: [
          'Structured or school-at-home: timetables, set subjects, often a bought curriculum. Reassuring for families coming straight out of school.',
          'Charlotte Mason: living books, narration, nature study, short focused lessons.',
          'Montessori-influenced: prepared environments, hands-on materials, child-led pace.',
          'Project or interest-led: learning organised around what the child is gripped by right now.',
          'Unschooling: trusting that a rich environment and a curious child produce learning without a formal curriculum.',
        ],
      },
      {
        type: 'p',
        text: 'Almost everyone ends up somewhere in the middle, borrowing what works and quietly dropping what does not.',
      },
      { type: 'h2', text: 'A gentle first month' },
      {
        type: 'p',
        text: 'If you are coming out of school, the most common advice from experienced families is to slow down before you speed up. A period of decompression, where you do very little formal work and a lot of reading aloud, baking, walking, and following curiosity, lets everyone reset. Learning does not stop during this time. It often deepens.',
      },
      {
        type: 'ol',
        items: [
          'Read the current home education guidance on tusla.ie so you know the lie of the land.',
          'Connect with other home educators. The Home Education Network (HEN) and local groups are invaluable for honest, lived-experience advice.',
          'Notice how your children actually learn. What holds their attention? When does the day go well?',
          'Start a light record of what you do. Not for show, just so you can see the shape of your weeks.',
          'Resist buying a vanload of resources. A library card and a kitchen table go a long way.',
        ],
      },
      { type: 'h2', text: 'What about socialisation and the rest of it' },
      {
        type: 'p',
        text: 'It is the question every home-educating family is asked, usually by someone at a checkout. In practice, home-educated children in Ireland tend to be sociable across a wide range of ages, through HEN events, sports, clubs, scouts, music, and friendships in the community. The worry is real, but it is solvable, and most families find their tribe within the first year.',
      },
      { type: 'h2', text: 'Money and time, honestly' },
      {
        type: 'p',
        text: 'Home education can be done on very little, especially with a good library nearby. The bigger cost is usually time and the reshaping of one parent\'s working life. It is worth talking through as a household before you commit, with eyes open. There is no shame in trialling it for a term and changing your mind.',
      },
      { type: 'h2', text: 'How The Hedge can help' },
      {
        type: 'p',
        text: 'The Hedge is built for Irish families, including those educating at home. It suggests activities suited to your children, the season, and your local weather, tags them to the NCCA strands so you can see your coverage, and keeps a dated log you can export for your records. It is a calm companion, not a curriculum to obey.',
      },
      {
        type: 'p',
        text: 'Whatever you decide, decide it gently. The fact that you are reading this carefully is a good sign all on its own.',
      },
    ],
  },
  {
    slug: 'irish-spring-activity-guide',
    cat: 'Seasonal Guide',
    date: '12 March 2026',
    isoDate: '2026-03-12',
    title: 'The complete Irish spring activity guide for young children',
    titleEm: 'spring',
    excerpt:
      "When the days lengthen and the first primroses appear in the hedgerows, Ireland comes alive with things to do with young children. Here is a season's worth, rooted in the Irish year.",
    description:
      'Spring activities for young children in Ireland: early-years nature, St Brigid and the turning year, lambing, gardening, and gentle outdoor learning rooted in the Irish seasons and Aistear.',
    readTime: '8 min read',
    bg: 'linear-gradient(135deg,#3D6142,#5E8B52)',
    body: [
      {
        type: 'p',
        text: 'Spring in Ireland does not arrive with a bang. It seeps in. A stretch in the evenings, a few brave snowdrops, the smell of the ground waking up. For young children, this slow unfurling is a gift, because it can be noticed daily, in small ways, right outside the door.',
      },
      {
        type: 'p',
        text: 'This guide leans on the spirit of Aistear, the early childhood curriculum framework, which trusts that young children learn best through play, real experiences, and warm relationships. Nothing here needs a worksheet.',
      },
      { type: 'h2', text: 'The turning of the year: Imbolc and St Brigid' },
      {
        type: 'p',
        text: 'The Irish spring traditionally opens around the first of February, with Imbolc and the feast of St Brigid, now a public holiday. It is a lovely anchor for young children: the year is turning, the light is coming back.',
      },
      {
        type: 'ul',
        items: [
          'Make a St Brigid\'s cross from rushes or pipe cleaners, talking about why it marks the start of spring.',
          'Light a candle at dinner and name one thing each person is looking forward to as the days grow longer.',
          'Plant a few seeds indoors to mark the season. Broad beans in a jar let children watch roots appear.',
        ],
      },
      { type: 'h2', text: 'Nature on the doorstep' },
      {
        type: 'p',
        text: 'You do not need wild countryside. A footpath, a park, or a back garden holds plenty when you slow down to a toddler\'s pace.',
      },
      {
        type: 'ul',
        items: [
          'Hunt for the first signs of spring: snowdrops, crocuses, then primroses and daffodils. Keep a tally on the fridge.',
          'Listen for birdsong getting busier. The dawn chorus builds through spring.',
          'Watch for frogspawn in still water from late February. A jar on the windowsill (returned to its pond) is pure wonder.',
          'Collect catkins from hazel and willow. Tap one over dark paper to see the pollen dust.',
        ],
      },
      {
        type: 'callout',
        title: 'A weather-aware tip',
        text: 'Irish spring is famously changeable. The Hedge checks your local forecast and suggests indoor or outdoor activities to match, so a sudden squall does not derail the morning. Good rain gear turns most "bad" days into the best adventures.',
      },
      { type: 'h2', text: 'Lambing and the farming year' },
      {
        type: 'p',
        text: 'Spring is lambing season across much of rural Ireland. Open farms and community farms often welcome families in March and April. For younger children, the sight of a newborn lamb finding its feet is a first lesson in life cycles that no book can match.',
      },
      {
        type: 'ul',
        items: [
          'Visit an open farm and talk about babies and mothers, big and small, fast and slow.',
          'At home, sort farm animals into families, or sing the old songs about hens, ducks, and lambs.',
          'Bake something with eggs and talk about where they come from.',
        ],
      },
      { type: 'h2', text: 'Getting growing' },
      {
        type: 'p',
        text: 'Gardening with young children is gloriously low-stakes. Mud is the point. A windowbox or a single pot is enough.',
      },
      {
        type: 'ul',
        items: [
          'Sow fast, forgiving seeds: cress on a windowsill, nasturtiums, sunflowers in a pot.',
          'Grow something you can eat. Lettuce, radishes, and strawberries reward small gardeners quickly.',
          'Keep a "garden diary" of drawings rather than words, one a week, to watch the change.',
        ],
      },
      { type: 'h2', text: 'Indoor days that still feel like spring' },
      {
        type: 'p',
        text: 'For the inevitable wet weeks:',
      },
      {
        type: 'ul',
        items: [
          'Bring spring inside: a jar of twigs that will leaf or blossom on the windowsill.',
          'Make potato or leaf prints in fresh greens and yellows.',
          'Read seasonal picture books and act out the story of a seed becoming a flower.',
        ],
      },
      { type: 'h2', text: 'The quiet point of it all' },
      {
        type: 'p',
        text: 'None of this is about cramming learning into spring. It is about being outside more, noticing together, and letting the season set the rhythm. The counting, the new words, the early science, all of it rides along quietly underneath. That is exactly how young children are built to learn.',
      },
    ],
  },
  {
    slug: 'aistear-at-home',
    cat: 'Early Years',
    date: '19 February 2026',
    isoDate: '2026-02-19',
    title: 'Aistear at home: the early-years framework, in plain English',
    titleEm: 'in plain English',
    excerpt:
      'Aistear is Ireland\'s curriculum framework for the early years, and far less complicated than it sounds. Here is what it actually means for life with a young child at home.',
    description:
      'A plain-English guide to Aistear, Ireland\'s early childhood curriculum framework, and how its four themes translate into everyday play and learning at home with under-sixes.',
    readTime: '7 min read',
    bg: 'linear-gradient(135deg,#6B4F35,#9E7B5A)',
    body: [
      {
        type: 'p',
        text: 'If you have a young child in Ireland, you will hear the word Aistear sooner or later. It can sound like jargon. It is not. At heart, Aistear simply puts a respectful name to what good early childhood has always looked like: play, relationships, and real experiences.',
      },
      { type: 'h2', text: 'What Aistear is' },
      {
        type: 'p',
        text: 'Aistear, the Irish word for journey, is Ireland\'s curriculum framework for children from birth to six, developed by the NCCA. It is a framework, not a syllabus. It does not tell you what to teach on a Tuesday. It describes what matters in early learning and trusts the adults around the child to bring it to life.',
      },
      { type: 'h2', text: 'The four themes, unpacked' },
      {
        type: 'p',
        text: 'Aistear is built around four themes. Read them as four lenses on the same rich childhood, not four boxes to tick.',
      },
      { type: 'h3', text: '1. Well-being' },
      {
        type: 'p',
        text: 'A child who feels secure, valued, and physically well is a child who is free to learn. At home this is the easy part and the most important: warmth, routine, time outdoors, rest, and the sense of being loved and capable.',
      },
      { type: 'h3', text: '2. Identity and Belonging' },
      {
        type: 'p',
        text: 'Children build a sense of who they are and where they fit. Family stories, photos, traditions, knowing the names of cousins and neighbours, helping with real jobs around the house, all of this is the work of this theme.',
      },
      { type: 'h3', text: '3. Communicating' },
      {
        type: 'p',
        text: 'Long before formal reading, children communicate constantly: through talk, gesture, art, music, and play. Reading aloud, singing, naming things on a walk, and listening properly to a small person\'s long story all feed this.',
      },
      { type: 'h3', text: '4. Exploring and Thinking' },
      {
        type: 'p',
        text: 'Children are natural scientists and problem-solvers. Pouring water, building, sorting, asking "why", and being allowed to figure things out for themselves is early maths, science, and reasoning in disguise.',
      },
      {
        type: 'callout',
        title: 'The reassuring part',
        text: 'You are almost certainly doing Aistear already. Naming it just helps you notice the gaps and lean into the parts your child loves.',
      },
      { type: 'h2', text: 'What it looks like on an ordinary morning' },
      {
        type: 'p',
        text: 'A child helps measure flour for pancakes (Exploring and Thinking, plus early maths), chats about which is their favourite (Communicating), feels proud to have helped feed the family (Identity and Belonging), and the whole calm ritual settles everyone (Well-being). One activity, all four themes, no planning required.',
      },
      { type: 'h2', text: 'Bringing more of it home, gently' },
      {
        type: 'ul',
        items: [
          'Follow the child. Aistear is built on the idea that children learn through their own play and interests. Notice what grips them and offer more of it.',
          'Talk, a lot. Narrate the day, ask real questions, and leave space for the answers.',
          'Get outside. Nature feeds every one of the four themes at once.',
          'Let them do real things. Sweeping, watering, stirring, and carrying are learning, and they tell a child they belong.',
          'Read together every day. It is the single highest-value habit of the early years.',
        ],
      },
      { type: 'h2', text: 'How The Hedge uses Aistear' },
      {
        type: 'p',
        text: 'For your under-sixes, The Hedge draws on the Aistear themes when it suggests activities, so a morning idea is not random but quietly balanced across well-being, belonging, communicating, and thinking. As your child moves towards primary age, it shifts to the NCCA primary strands. You get gentle, age-right ideas without having to hold the framework in your head.',
      },
      {
        type: 'p',
        text: 'That is really the whole point of Aistear at home: not to formalise early childhood, but to give you confidence that the ordinary, playful, loving days are exactly the curriculum your child needs.',
      },
    ],
  },
];

void SIGNATURE;

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function allSlugs(): string[] {
  return POSTS.map((p) => p.slug);
}
