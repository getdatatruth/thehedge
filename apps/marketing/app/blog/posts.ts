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
    slug: 'register-home-education-ireland-tusla',
    cat: 'Homeschool',
    date: '18 June 2026',
    isoDate: '2026-06-18',
    title: 'How to register for home education in Ireland: the Tusla process, step by step',
    titleEm: 'step by step',
    excerpt:
      'The transactional, plain-English walkthrough: your constitutional right, the Education (Welfare) Act 2000, how the application and assessment actually work, and a realistic sense of timelines.',
    description:
      'A step-by-step guide to registering for home education in Ireland: Article 42, the Education (Welfare) Act 2000, the Tusla application, the AEARS assessment, and likely timelines. Not affiliated with Tusla.',
    readTime: '11 min read',
    bg: 'linear-gradient(135deg,#1C3520,#3D6142)',
    body: [
      {
        type: 'callout',
        title: 'Before we start',
        text: 'The Hedge is not an official Tusla product and is not affiliated with Tusla. This is a plain-English explainer to help you find your bearings. For anything binding, read the current guidance on tusla.ie and citizensinformation.ie, and where you can, talk to families who have been through it recently.',
      },
      {
        type: 'p',
        text: 'Registering to home educate in Ireland sounds like a bureaucratic mountain, and at 11pm with a cup of tea going cold it can feel like one. In practice it is a defined process with a small number of clear steps. This guide walks through it in the order you will actually meet it, so you know what is coming and roughly when.',
      },
      { type: 'h2', text: 'First, your right to do this' },
      {
        type: 'p',
        text: 'Article 42 of the Irish Constitution recognises the family as the primary and natural educator of the child, and acknowledges the right of parents to provide that education in their homes. You do not need to be a qualified teacher. You do not need to recreate a classroom or follow the primary curriculum to the letter.',
      },
      {
        type: 'p',
        text: 'The everyday machinery comes from the Education (Welfare) Act 2000. It requires that a child receiving education outside a recognised school is placed on a register maintained by Tusla, the Child and Family Agency, and that the child is receiving a "certain minimum education" suitable to their age, ability, and aptitude. Registration is the legal step that puts your choice on a sound footing.',
      },
      { type: 'h2', text: 'The steps, in order' },
      {
        type: 'p',
        text: 'Every family is a little different, but the process tends to follow this arc:',
      },
      {
        type: 'ol',
        items: [
          'You apply to Tusla to have your child entered on the register of children receiving education outside a recognised school. Tusla provides the application form and current guidance on its website.',
          'Tusla acknowledges your application and, in the normal course, appoints an Authorised Person, the assessor who will carry out the assessment.',
          'You complete a preliminary questionnaire describing your educational approach, your child, and the resources you use. This is your chance to set the tone in your own words.',
          'An assessment meeting is arranged, usually in your home, where you talk through your approach and the assessor may meet your child. This is the AEARS assessment.',
          'The assessor prepares a report and a recommendation. Families who are genuinely educating their children are, in the ordinary way, registered.',
        ],
      },
      {
        type: 'callout',
        title: 'A note on AEARS',
        text: 'The assessment stage is known as AEARS, the Assessment of Education in Places other than Recognised Schools. It tends to sound more intimidating than it is. We have a separate, gentler guide to what the assessment itself is like, linked at the end.',
      },
      { type: 'h2', text: 'What the application asks of you' },
      {
        type: 'p',
        text: 'The paperwork is lighter than people fear. You are giving Tusla enough to understand who your child is and how learning happens in your home. Expect to cover, in broad strokes:',
      },
      {
        type: 'ul',
        items: [
          'Your child\'s details and your own, and confirmation that you are the parent or guardian.',
          'A description of your educational approach, whether that is structured, Charlotte Mason, Montessori-influenced, project-led, unschooling, or a blend.',
          'The areas of learning your child encounters over time, and the main resources, books, and activities you use.',
          'Any particular needs your child has, and how you are meeting them.',
        ],
      },
      { type: 'h2', text: 'A realistic word on timelines' },
      {
        type: 'p',
        text: 'Honest answer: it varies, and it is sensible to start sooner rather than later, particularly if you are taking a child out of school. From application to a completed assessment can run over a number of weeks to several months, depending on assessor availability in your area and the time of year. Tusla\'s current guidance is the place to check for any stated timeframes.',
      },
      {
        type: 'callout',
        title: 'If your child is currently in school',
        text: 'You can apply to register while the question of leaving school is still being sorted. Deregistration from the school and registration with Tusla are connected but separate steps. We cover the school side, and what to say to the school, in our gentle first-steps guide, linked below.',
      },
      { type: 'h2', text: 'Preparing without the panic' },
      {
        type: 'p',
        text: 'The single most calming thing you can do is keep a light, honest record of what your days actually look like, gathered as you go rather than reconstructed in a fortnight of dread. Useful things to have to hand:',
      },
      {
        type: 'ul',
        items: [
          'A loose record of what you have covered recently, grouped by area or theme.',
          'A handful of work samples: writing, drawings, projects, photos of things made, built, or grown.',
          'A short list of the books and resources you lean on most.',
          'Notes on outings and real-world learning: the library, the beach, the farm, the museum.',
        ],
      },
      {
        type: 'callout',
        title: 'Where The Hedge fits',
        text: 'The Hedge keeps a dated, curriculum-tagged log of the activities your family does, and exports it as a tidy PDF over any date range. It is a record-keeping aid built to help you organise the kind of evidence the process looks for. It does not register you with Tusla and it is not an official Tusla product.',
      },
      { type: 'h2', text: 'The official sources' },
      {
        type: 'p',
        text: 'For the binding detail, go straight to the source. Start at tusla.ie and search for home education or AEARS, where you will find the application form and the current Guidelines for the Assessment of Education in Places other than Recognised Schools. Citizens Information (citizensinformation.ie) has a clear plain-English overview of the legal position and the registration process.',
      },
      {
        type: 'p',
        text: 'The Home Education Network (HEN) is a long-standing Irish support organisation run by home-educating families, and one of the best places to find people who have come through registration recently and can tell you how it actually felt.',
      },
      { type: 'h2', text: 'The honest bottom line' },
      {
        type: 'p',
        text: 'Registration is a confirmation, not a contest. The process exists to record that your child is receiving a suitable education, in whatever style suits your family. Apply in good time, describe your approach in your own words, keep a light record as you go, and the rest tends to follow. You are allowed to do this, and you are allowed to do it calmly.',
      },
    ],
  },
  {
    slug: 'aears-assessment-what-happens',
    cat: 'Homeschool',
    date: '11 June 2026',
    isoDate: '2026-06-11',
    title: 'What actually happens in an AEARS assessment, and how to walk in calm',
    titleEm: 'walk in calm',
    excerpt:
      'A clear picture of the assessment meeting: the questionnaire, the conversation-not-inspection framing, who the assessor is, and how to prepare so you arrive settled rather than braced.',
    description:
      'What to expect in a Tusla AEARS home education assessment in Ireland: the questionnaire, the meeting, who the assessor is, and how to prepare and stay calm. Not affiliated with Tusla.',
    readTime: '10 min read',
    bg: 'linear-gradient(135deg,#2C4A2E,#4A7C4E)',
    body: [
      {
        type: 'callout',
        title: 'Before we start',
        text: 'The Hedge is not an official Tusla product and is not affiliated with Tusla. This is a plain-English explainer. The binding detail lives in the current guidance on tusla.ie, and the lived experience lives with families who have been through it, many of them reachable through the Home Education Network (HEN).',
      },
      {
        type: 'p',
        text: 'The letter arrives, a meeting is mentioned, and something in your stomach tightens. The word "assessment" does a lot of unhelpful work. So let us take the mystery out of it. Here is what an AEARS assessment is actually like, and how to arrive settled.',
      },
      { type: 'h2', text: 'What AEARS is, in one breath' },
      {
        type: 'p',
        text: 'AEARS stands for the Assessment of Education in Places other than Recognised Schools. It is the part of the Tusla registration process that confirms your child is receiving a "certain minimum education" suitable to their age, ability, and aptitude. It is not an inspection of your home, your parenting, or your tidiness. It is a check on the education, carried out by talking with you.',
      },
      { type: 'h2', text: 'Who the assessor is' },
      {
        type: 'p',
        text: 'Tusla appoints an Authorised Person to carry out the assessment. Many assessors are former teachers or inspectors with long experience of how children learn. They have usually met a wide range of home-educating families and have seen approaches very different from one another work well. They are not, in the ordinary way, there hoping to fail you.',
      },
      { type: 'h2', text: 'The questionnaire comes first' },
      {
        type: 'p',
        text: 'Before any meeting, you will typically complete a preliminary questionnaire. This is your opening, and it is worth taking your time over, because it sets the frame for everything after. In your own voice, it lets you explain:',
      },
      {
        type: 'ul',
        items: [
          'Your educational approach and why it suits your particular child.',
          'The areas of learning your child meets over time, and how.',
          'The books, materials, places, and rhythms you rely on.',
          'Where your child is now, and where they are heading next.',
        ],
      },
      {
        type: 'callout',
        title: 'Write it like you talk',
        text: 'You do not need education jargon. "We read together every morning, she narrates the story back, and we follow whatever she gets curious about" tells an assessor far more than a borrowed lesson plan ever could.',
      },
      { type: 'h2', text: 'The meeting itself' },
      {
        type: 'p',
        text: 'The assessment meeting is usually held in your home, at a time arranged with you. It is closer to a friendly professional conversation than an exam. You will talk through how learning happens in your family, and the assessor may spend a little time with your child, often just chatting, looking at something they have made, or hearing about what they love.',
      },
      {
        type: 'p',
        text: 'There is no test for your child to pass and no script for you to recite. The assessor is building a picture, and a relaxed, honest picture of a real learning life is exactly what they are looking for.',
      },
      { type: 'h2', text: 'What the assessor is actually looking for' },
      {
        type: 'p',
        text: 'Not a school in miniature. In practice it tends to come down to a handful of things:',
      },
      {
        type: 'ul',
        items: [
          'A coherent approach you can describe in your own words.',
          'Breadth over time: literacy and numeracy, the world around them, creativity, physical activity, and social development.',
          'Suitability to your particular child, their age, ability, and interests.',
          'Some evidence that the education is genuinely happening: a little work, a sense of your rhythm, the resources you use.',
        ],
      },
      { type: 'h2', text: 'How to prepare so you walk in calm' },
      {
        type: 'ol',
        items: [
          'Re-read your own questionnaire the day before, so your approach is fresh in your mind and you are not surprised by your own words.',
          'Gather a small, loose folder of evidence: a few work samples, a list of resources, photos of outings and projects. Enough to gesture at, not a thesis to defend.',
          'Talk to your child gently beforehand. Let them know a friendly visitor is coming to hear about the things they like learning. No coaching, no pressure.',
          'Tidy if it helps you feel ready, but know that nobody is grading your kitchen.',
          'Write down any questions you have for the assessor. It is a two-way conversation.',
        ],
      },
      {
        type: 'callout',
        title: 'Where The Hedge fits',
        text: 'The Hedge keeps a dated, curriculum-tagged log of what your family actually does and exports it as a tidy PDF. For many parents, having that record ready takes the edge off the meeting: the evidence is simply there. It is a record-keeping aid, not a registration service, and it is not an official Tusla product.',
      },
      { type: 'h2', text: 'Gentle answers to the worries' },
      { type: 'h3', text: '"What if I freeze and forget everything?"' },
      {
        type: 'p',
        text: 'You will not be quizzed at speed. It is a conversation, with pauses allowed. Your folder and your questionnaire are there to lean on, and the assessor is used to nervous parents.',
      },
      { type: 'h3', text: '"What if my child is shy or has a hard day?"' },
      {
        type: 'p',
        text: 'Assessors meet real children, including shy ones and tired ones. A child hiding behind your leg is not a mark against you. The assessment is about the education, not a performance.',
      },
      { type: 'h3', text: '"What if my approach is very informal?"' },
      {
        type: 'p',
        text: 'Informal does not mean inadequate. Interest-led and unschooling approaches are recognised. What matters is that you can describe how learning happens and show that it is, in fact, happening.',
      },
      { type: 'h2', text: 'After the meeting' },
      {
        type: 'p',
        text: 'The assessor prepares a report and a recommendation, which feeds into Tusla\'s decision on registration. Families who are genuinely educating their children are, in the ordinary way, registered. If anything is queried, it is usually to clarify rather than to refuse.',
      },
      { type: 'h2', text: 'The honest bottom line' },
      {
        type: 'p',
        text: 'An AEARS assessment is a conversation about a life you are already living. You know your child better than anyone in the room. Prepare lightly, speak plainly, and let the ordinary, real shape of your learning days do the talking. That is enough, because it is true.',
      },
    ],
  },
  {
    slug: 'taking-child-out-of-school-ireland',
    cat: 'Homeschool',
    date: '4 June 2026',
    isoDate: '2026-06-04',
    title: 'Taking your child out of school in Ireland: a gentle first-steps guide',
    titleEm: 'first-steps guide',
    excerpt:
      'The trigger-event piece. What the legal position actually is, how deregistration works, what to tell the school, and how to move at a pace that protects everyone, especially your child.',
    description:
      'A calm, practical guide to taking your child out of school to home educate in Ireland: the legal position, deregistration, what to tell the school, and registering with Tusla. Not affiliated with Tusla.',
    readTime: '9 min read',
    bg: 'linear-gradient(135deg,#3D6142,#5E8B52)',
    body: [
      {
        type: 'callout',
        title: 'Before we start',
        text: 'The Hedge is not an official Tusla product and is not affiliated with Tusla. This is a plain-English explainer, not legal advice. For the binding detail, read the current guidance on tusla.ie and citizensinformation.ie, and lean on the Home Education Network (HEN) for lived experience.',
      },
      {
        type: 'p',
        text: 'Most families do not arrive at home education through a calm cost-benefit analysis. They arrive because something is not working. A child who used to skip into school now cries at the gate. A long, grinding struggle that the system cannot seem to meet. If that is where you are, the first thing to say is: you are allowed to stop, and you are allowed to do it gently.',
      },
      { type: 'h2', text: 'The legal position, plainly' },
      {
        type: 'p',
        text: 'You do not need a school\'s permission to home educate. Article 42 of the Constitution recognises your right to educate your child at home, and the Education (Welfare) Act 2000 sets out that a child educated outside a recognised school is placed on a register held by Tusla. Your responsibility is to your child\'s education and to that registration, not to the school as gatekeeper.',
      },
      {
        type: 'p',
        text: 'In practice there are two threads: telling the school your child is leaving, and registering with Tusla to home educate. They are connected, but they are separate, and you do not have to have every form completed before you act in your child\'s interest.',
      },
      { type: 'h2', text: 'What to tell the school' },
      {
        type: 'p',
        text: 'You are not required to justify your decision or to win an argument. A short, courteous letter or email to the principal stating that you are withdrawing your child to home educate is enough. Keep it brief and warm:',
      },
      {
        type: 'ul',
        items: [
          'State clearly that you are withdrawing your child from the school to provide education at home.',
          'Give the date from which this applies.',
          'Thank them, if you can, for their care of your child. You may cross paths again.',
          'Keep a copy for your own records.',
        ],
      },
      {
        type: 'callout',
        title: 'You do not owe a debate',
        text: 'Some schools are warmly supportive, others less familiar with home education. Either way, you are informing them of a decision, not requesting approval. A calm, factual note closes the loop without inviting an argument.',
      },
      { type: 'h2', text: 'How deregistration actually works' },
      {
        type: 'p',
        text: 'When a child leaves a school, the school removes them from its rolls and there is an attendance and welfare framework in the background, overseen by Tusla, that tracks children of school age. This is why registering to home educate matters: it places your child on the correct register as receiving education outside a recognised school, so the system understands their situation.',
      },
      {
        type: 'p',
        text: 'The sensible order for most families is to begin the Tusla application around the same time as you withdraw from school, so there is no long gap where your child appears to be simply absent. Tusla\'s current guidance sets out the application, and Citizens Information explains the welfare and attendance side in plain English.',
      },
      { type: 'h2', text: 'A note on timing and pressure' },
      {
        type: 'p',
        text: 'If your child is in genuine distress, you are allowed to prioritise their wellbeing while the paperwork follows. Equally, where things are not acute, there is no harm in lining up the Tusla application first so the transition is seamless. There is no single correct sequence that fits every family. Use your judgement and document what you do.',
      },
      { type: 'h2', text: 'The decompression most families need' },
      {
        type: 'p',
        text: 'If your child is leaving school bruised, the most common advice from experienced home educators is to slow right down before you speed up. A period of decompression, where you do very little formal work and a lot of reading aloud, baking, walking, and following curiosity, lets everyone reset. Learning does not stop. It often quietly deepens once the pressure lifts.',
      },
      {
        type: 'callout',
        title: 'Where The Hedge fits',
        text: 'In those early, tender weeks, The Hedge can offer one gentle, age-right idea a day rather than a daunting curriculum, and it quietly logs what you do so that, when you come to register, the evidence is already there. It is a calm companion and a record-keeping aid, not a registration service, and not an official Tusla product.',
      },
      { type: 'h2', text: 'Where to get your footing' },
      {
        type: 'ul',
        items: [
          'tusla.ie for the application and the official home education guidance.',
          'citizensinformation.ie for a clear overview of the law, attendance, and registration.',
          'The Home Education Network (HEN) for community, local groups, and families who have just done what you are about to do.',
        ],
      },
      { type: 'h2', text: 'The honest bottom line' },
      {
        type: 'p',
        text: 'Taking a child out of school can feel enormous, and it is a real decision. But it is also a decision thousands of Irish families have made, legally and well. Inform the school plainly, register with Tusla in good time, give everyone room to breathe, and trust that a calmer kind of learning is genuinely within reach.',
      },
    ],
  },
  {
    slug: 'home-ed-approaches-structured-child-led',
    cat: 'Homeschool',
    date: '28 May 2026',
    isoDate: '2026-05-28',
    title: 'Choosing your home-ed approach: structured, child-led, or a gentle mix',
    titleEm: 'a gentle mix',
    excerpt:
      'Charlotte Mason, Montessori, unschooling, structured school-at-home, and an Aistear-flavoured early years, all in an Irish context, and why most families happily end up somewhere in the middle.',
    description:
      'A plain-English guide to home education approaches in an Irish context: structured, Charlotte Mason, Montessori, unschooling, and Aistear-flavoured early years, and how to find the mix that suits your child.',
    readTime: '10 min read',
    bg: 'linear-gradient(135deg,#6B4F35,#9E7B5A)',
    body: [
      {
        type: 'p',
        text: 'One of the quiet anxieties of starting out is the feeling that you must choose a Method, capital M, before you are allowed to begin. You do not. Most Irish home-educating families drift into an approach that suits their particular children, borrow freely across styles, and change it again as the years go on. This is a map of the territory, not a set of instructions.',
      },
      {
        type: 'callout',
        title: 'There is no approved method',
        text: 'Irish law asks that your child receives a suitable education, not that you follow any named philosophy. Structured, child-led, or anything in between can meet that standard. The approaches below are tools, not tests.',
      },
      { type: 'h2', text: 'Structured, or school-at-home' },
      {
        type: 'p',
        text: 'Timetables, set subjects, and often a bought curriculum. This is the most familiar starting point for families coming straight out of school, because it feels solid and recognisable. It can be reassuring while you find your feet, and easy to evidence.',
      },
      {
        type: 'p',
        text: 'The thing to watch is that recreating school at the kitchen table can also recreate the very stresses you left. Many families begin here and then loosen the grip as their confidence grows.',
      },
      { type: 'h2', text: 'Charlotte Mason' },
      {
        type: 'p',
        text: 'A gentle, literature-rich approach built on "living books" rather than textbooks, short focused lessons, narration (the child telling back what they have heard), nature study, and an unhurried respect for the child. It suits families who love reading aloud and the outdoors, and it travels well in the Irish landscape and weather.',
      },
      { type: 'h2', text: 'Montessori-influenced' },
      {
        type: 'p',
        text: 'Prepared environments, beautiful hands-on materials, and a strong trust in the child\'s own pace and concentration. Few home educators run a textbook Montessori classroom, but its principles, ordered spaces, real tools, and following the child\'s focus, shape many homes, especially with younger children.',
      },
      { type: 'h2', text: 'Project or interest-led' },
      {
        type: 'p',
        text: 'Learning organised around whatever your child is gripped by right now: dinosaurs, castles, rockets, horses, the sea. A single deep interest can carry reading, writing, maths, history, and science along in its wake. It keeps motivation high and is wonderful for children who burn bright on a topic.',
      },
      { type: 'h2', text: 'Unschooling' },
      {
        type: 'p',
        text: 'The trust that a rich environment and a curious child will produce learning without a formal curriculum. Less "doing nothing" than people imagine, and more a deliberate weaving of learning into real life: cooking, conversations, libraries, trips, and projects the child chooses. It asks a lot of the parent in attention and confidence, and many families find it the most natural fit over time.',
      },
      {
        type: 'callout',
        title: 'A reassurance for nervous parents',
        text: 'Informal does not mean inadequate. Interest-led and unschooling approaches are recognised in Ireland. What matters is that you can describe how learning happens and show that it is genuinely happening.',
      },
      { type: 'h2', text: 'The early years: an Aistear flavour' },
      {
        type: 'p',
        text: 'For under-sixes, you do not really need a "method" at all. Aistear, Ireland\'s early childhood curriculum framework, simply names what good early childhood has always looked like: play, warm relationships, and real experiences. Its four themes, Well-being, Identity and Belonging, Communicating, and Exploring and Thinking, are a gentle lens rather than a syllabus.',
      },
      {
        type: 'p',
        text: 'In practice that means following your child\'s play, talking a lot, getting outside, letting them do real things around the home, and reading together every day. Most of an Irish early-years home education is exactly this, and it is plenty.',
      },
      { type: 'h2', text: 'How to actually choose' },
      {
        type: 'p',
        text: 'Less choosing, more noticing. Watch how your particular child learns and let the evidence guide you:',
      },
      {
        type: 'ol',
        items: [
          'When does the day go well? More of that is usually the answer.',
          'Does your child thrive on routine or wilt under it? Lean structured or lean free accordingly.',
          'What lights them up? Build outward from a real interest before reaching for a curriculum.',
          'Start lighter than feels comfortable. It is far easier to add structure than to claw back trust.',
          'Trial it for a term. You are allowed to change your mind, and most families do, more than once.',
        ],
      },
      { type: 'h2', text: 'How The Hedge adapts to your stance' },
      {
        type: 'p',
        text: 'The Hedge is built to meet your family where it is rather than push a single method. You tell it the shape that suits you, more structured or more child-led, and it adjusts the ideas it offers accordingly, age-right and tagged to the Aistear themes for your little ones and the NCCA strands as they grow. It shows your coverage at a glance without dictating your week, and logs what you do so your records keep themselves.',
      },
      {
        type: 'p',
        text: 'Whatever blend you land on, hold it lightly. The best home-ed approach is the one your real children are actually thriving in this season, and that is allowed to keep changing.',
      },
    ],
  },
  {
    slug: 'home-educating-and-working',
    cat: 'Homeschool',
    date: '21 May 2026',
    isoDate: '2026-05-21',
    title: 'Home educating and working: making the days actually fit',
    titleEm: 'actually fit',
    excerpt:
      'The practical reality nobody tells you about: rhythms over timetables, the both-parents question, working in the gaps, and how little formal time young children genuinely need.',
    description:
      'A practical guide to home educating while working in Ireland: realistic daily rhythms, the both-parents question, working around young children, and why home education needs less formal time than school.',
    readTime: '9 min read',
    bg: 'linear-gradient(135deg,#1C3520,#3D6142)',
    body: [
      {
        type: 'p',
        text: 'The question that stops many families before they start is not "is it legal" or "could we do it", but "how on earth would we afford it, with someone needing to work". It is the right question to ask honestly, around the kitchen table, before you commit. Here is the practical reality, without rose-tint.',
      },
      { type: 'h2', text: 'First, the freeing truth about time' },
      {
        type: 'p',
        text: 'A school day is long because it is managing thirty children, transitions, queues, and admin. One-to-one or one-to-three at home is enormously more efficient. For young children especially, the actual focused learning in a home day can be surprisingly short, with the rest of the richness coming from play, reading, outings, and real life. You are not trying to fill six hours. That reframing alone makes the working question far less impossible than it first looks.',
      },
      { type: 'h2', text: 'Rhythms, not timetables' },
      {
        type: 'p',
        text: 'Most working home-ed families abandon the school-style timetable quickly in favour of a rhythm: a loose, repeatable shape to the day that flexes around real life. A rhythm survives a bad night\'s sleep and a work deadline in a way a rigid schedule never does.',
      },
      {
        type: 'ul',
        items: [
          'Anchor the day with a few fixed points: breakfast together, a morning read-aloud, a walk, a shared meal.',
          'Cluster focused learning into a short, reliable window when everyone is fresh, often the morning.',
          'Let the afternoons breathe: play, projects, screens within reason, time with you when you can give it.',
          'Protect one or two non-negotiables and hold the rest loosely.',
        ],
      },
      { type: 'h2', text: 'The both-parents question' },
      {
        type: 'p',
        text: 'There is no single arrangement that fits every household, and it is worth naming the common shapes openly:',
      },
      {
        type: 'ul',
        items: [
          'One parent steps back from paid work, fully or partly, while the other earns. The most traditional pattern, and still common.',
          'Both parents work part-time or flexibly, and split the home-ed days between them.',
          'One or both work from home, with learning clustered around calls and deep-work blocks.',
          'Shift work or self-employment is used deliberately to free up weekday hours.',
          'Grandparents, co-ops, and home-ed friends share the load on set days.',
        ],
      },
      {
        type: 'callout',
        title: 'Money, honestly',
        text: 'Home education itself can be done on very little, especially with a good library nearby. The real cost is usually the reshaping of one or both parents\' working lives. That is a household conversation worth having with eyes open, and there is no shame in trialling it for a term to see how the finances and the days truly feel.',
      },
      { type: 'h2', text: 'Working in the gaps with young children' },
      {
        type: 'p',
        text: 'If you need to do some work while the children are around, a few patterns recur among families who make it work:',
      },
      {
        type: 'ol',
        items: [
          'Front-load the connection. A solid hour of reading, talking, and one-to-one early often buys a calmer, more independent stretch afterwards.',
          'Build independent rhythms: an "invitation" laid out on the table, an audiobook, a long absorbing project, quiet bins of materials they return to.',
          'Use the edges of the day: early mornings, nap times, evenings, and a supportive partner\'s hours.',
          'Lower the bar without guilt on heavy work days. A nature walk and a film is still a perfectly good day.',
          'Lean on community. A weekly home-ed meet-up or a swap with another family can free a reliable work block.',
        ],
      },
      {
        type: 'callout',
        title: 'Where The Hedge fits',
        text: 'On the days you are stretched thin, The Hedge offers one gentle, age-right idea rather than a planning burden, and it logs what you did so your records build themselves in the background. It is designed to lighten the mental load of the working home-ed parent, not add to it.',
      },
      { type: 'h2', text: 'A word on the hard days' },
      {
        type: 'p',
        text: 'There will be days when work and home education collide and nobody covers themselves in glory. That is not failure, it is family life. The aim is not a flawless schedule but a sustainable rhythm that, taken over weeks and months, gives your children a rich education and you a working life you can actually hold.',
      },
      { type: 'h2', text: 'The honest bottom line' },
      {
        type: 'p',
        text: 'Home educating while working is demanding, and plenty of Irish families do it well, in arrangements as varied as the families themselves. Start by letting go of the six-hour school day in your head, build a rhythm rather than a timetable, have the money and roles conversation openly, and give yourself permission to adjust as you go. It is meant to feel like a breath, not a battle, for you as much as for your children.',
      },
    ],
  },
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
