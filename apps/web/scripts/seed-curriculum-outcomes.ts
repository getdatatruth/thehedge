import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CurriculumOutcome {
  country: string;
  curriculum_area: string;
  stage: string;
  strand: string;
  outcome_code: string;
  outcome_text: string;
}

const outcomes: CurriculumOutcome[] = [
  // ═══════════════════════════════════════════════════════════
  // AISTEAR THEMES — Early Childhood (ages 0-6)
  // ═══════════════════════════════════════════════════════════

  // ─── Well-being ────────────────────────────────────────────
  {
    country: 'IE', curriculum_area: 'Aistear: Well-being', stage: 'early_childhood',
    strand: 'Strong psychologically and physically',
    outcome_code: 'WB-01',
    outcome_text: 'Children will be able to express their feelings and manage their emotions with growing confidence.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Well-being', stage: 'early_childhood',
    strand: 'Strong psychologically and physically',
    outcome_code: 'WB-02',
    outcome_text: 'Children will develop increasing independence in daily routines and self-care.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Well-being', stage: 'early_childhood',
    strand: 'Healthy as possible',
    outcome_code: 'WB-03',
    outcome_text: 'Children will make healthy choices about food, exercise, and rest with support.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Well-being', stage: 'early_childhood',
    strand: 'Healthy as possible',
    outcome_code: 'WB-04',
    outcome_text: 'Children will develop gross motor skills through active play, running, climbing, and balancing.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Well-being', stage: 'early_childhood',
    strand: 'Healthy as possible',
    outcome_code: 'WB-05',
    outcome_text: 'Children will develop fine motor skills through drawing, cutting, threading, and manipulating small objects.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Well-being', stage: 'early_childhood',
    strand: 'Creative and spiritual',
    outcome_code: 'WB-06',
    outcome_text: 'Children will express themselves creatively through art, music, movement, and imaginative play.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Well-being', stage: 'early_childhood',
    strand: 'Creative and spiritual',
    outcome_code: 'WB-07',
    outcome_text: 'Children will experience wonder and awe in the natural world.',
  },

  // ─── Identity & Belonging ─────────────────────────────────
  {
    country: 'IE', curriculum_area: 'Aistear: Identity & Belonging', stage: 'early_childhood',
    strand: 'Strong self-identities',
    outcome_code: 'IB-01',
    outcome_text: 'Children will have a positive sense of who they are and feel valued for who they are.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Identity & Belonging', stage: 'early_childhood',
    strand: 'Strong self-identities',
    outcome_code: 'IB-02',
    outcome_text: 'Children will recognise and celebrate their own abilities, strengths, and uniqueness.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Identity & Belonging', stage: 'early_childhood',
    strand: 'Sense of group identity',
    outcome_code: 'IB-03',
    outcome_text: 'Children will develop a sense of belonging to their family, community, and peer group.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Identity & Belonging', stage: 'early_childhood',
    strand: 'Connected to family and community',
    outcome_code: 'IB-04',
    outcome_text: 'Children will understand and appreciate their own cultural heritage and traditions.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Identity & Belonging', stage: 'early_childhood',
    strand: 'Connected to family and community',
    outcome_code: 'IB-05',
    outcome_text: 'Children will develop an awareness and respect for the diversity of people and cultures around them.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Identity & Belonging', stage: 'early_childhood',
    strand: 'Democratic dispositions',
    outcome_code: 'IB-06',
    outcome_text: 'Children will take turns, share, and cooperate with others in play and group activities.',
  },

  // ─── Communicating ─────────────────────────────────────────
  {
    country: 'IE', curriculum_area: 'Aistear: Communicating', stage: 'early_childhood',
    strand: 'Communicate creatively',
    outcome_code: 'CO-01',
    outcome_text: 'Children will use art, music, drama, and movement to express ideas and feelings.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Communicating', stage: 'early_childhood',
    strand: 'Communicate creatively',
    outcome_code: 'CO-02',
    outcome_text: 'Children will share their experiences and stories through creative play and narrative.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Communicating', stage: 'early_childhood',
    strand: 'Use language',
    outcome_code: 'CO-03',
    outcome_text: 'Children will use an expanding vocabulary to describe objects, events, and feelings.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Communicating', stage: 'early_childhood',
    strand: 'Use language',
    outcome_code: 'CO-04',
    outcome_text: 'Children will listen actively and respond to stories, rhymes, and conversations.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Communicating', stage: 'early_childhood',
    strand: 'Explore symbols',
    outcome_code: 'CO-05',
    outcome_text: 'Children will develop an awareness of print and its uses in everyday life.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Communicating', stage: 'early_childhood',
    strand: 'Explore symbols',
    outcome_code: 'CO-06',
    outcome_text: 'Children will begin to experiment with mark-making and emergent writing.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Communicating', stage: 'early_childhood',
    strand: 'Use ICT',
    outcome_code: 'CO-07',
    outcome_text: 'Children will explore and use age-appropriate technology as a tool for learning.',
  },

  // ─── Exploring & Thinking ──────────────────────────────────
  {
    country: 'IE', curriculum_area: 'Aistear: Exploring & Thinking', stage: 'early_childhood',
    strand: 'Make sense of things',
    outcome_code: 'ET-01',
    outcome_text: 'Children will use their senses to explore and investigate the world around them.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Exploring & Thinking', stage: 'early_childhood',
    strand: 'Make sense of things',
    outcome_code: 'ET-02',
    outcome_text: 'Children will observe, ask questions, and make predictions about their environment.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Exploring & Thinking', stage: 'early_childhood',
    strand: 'Play',
    outcome_code: 'ET-03',
    outcome_text: 'Children will engage in sustained, focused play, both alone and with others.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Exploring & Thinking', stage: 'early_childhood',
    strand: 'Creative',
    outcome_code: 'ET-04',
    outcome_text: 'Children will develop creative thinking by experimenting with materials, ideas, and processes.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Exploring & Thinking', stage: 'early_childhood',
    strand: 'Learn with confidence',
    outcome_code: 'ET-05',
    outcome_text: 'Children will develop problem-solving skills and strategies to tackle new challenges.',
  },
  {
    country: 'IE', curriculum_area: 'Aistear: Exploring & Thinking', stage: 'early_childhood',
    strand: 'Learn with confidence',
    outcome_code: 'ET-06',
    outcome_text: 'Children will develop mathematical concepts through sorting, classifying, comparing, and counting.',
  },

  // ═══════════════════════════════════════════════════════════
  // NCCA PRIMARY CURRICULUM — Junior Classes (ages 4-8)
  // ═══════════════════════════════════════════════════════════

  // ─── Language: English ─────────────────────────────────────
  {
    country: 'IE', curriculum_area: 'Language', stage: 'primary_junior',
    strand: 'Oral Language',
    outcome_code: 'EN-OL-01',
    outcome_text: 'Pupils will develop confidence in speaking and listening through discussion, storytelling, and role-play.',
  },
  {
    country: 'IE', curriculum_area: 'Language', stage: 'primary_junior',
    strand: 'Oral Language',
    outcome_code: 'EN-OL-02',
    outcome_text: 'Pupils will listen to and retell stories, identifying key characters and events.',
  },
  {
    country: 'IE', curriculum_area: 'Language', stage: 'primary_junior',
    strand: 'Reading',
    outcome_code: 'EN-RD-01',
    outcome_text: 'Pupils will develop phonological awareness, recognising sounds, rhymes, and syllables in words.',
  },
  {
    country: 'IE', curriculum_area: 'Language', stage: 'primary_junior',
    strand: 'Reading',
    outcome_code: 'EN-RD-02',
    outcome_text: 'Pupils will read a range of texts with growing fluency and understanding.',
  },
  {
    country: 'IE', curriculum_area: 'Language', stage: 'primary_junior',
    strand: 'Writing',
    outcome_code: 'EN-WR-01',
    outcome_text: 'Pupils will write for a variety of purposes, including recounting experiences and creating stories.',
  },
  {
    country: 'IE', curriculum_area: 'Language', stage: 'primary_junior',
    strand: 'Writing',
    outcome_code: 'EN-WR-02',
    outcome_text: 'Pupils will develop handwriting skills and begin to use basic punctuation and spelling conventions.',
  },

  // ─── Language: Irish ───────────────────────────────────────
  {
    country: 'IE', curriculum_area: 'Language', stage: 'primary_junior',
    strand: 'Irish - Oral Language',
    outcome_code: 'GA-OL-01',
    outcome_text: 'Pupils will learn and use common Irish greetings, phrases, and vocabulary in daily routines.',
  },
  {
    country: 'IE', curriculum_area: 'Language', stage: 'primary_junior',
    strand: 'Irish - Oral Language',
    outcome_code: 'GA-OL-02',
    outcome_text: 'Pupils will participate in simple conversations and respond to instructions in Irish.',
  },

  // ─── Mathematics ───────────────────────────────────────────
  {
    country: 'IE', curriculum_area: 'Mathematics', stage: 'primary_junior',
    strand: 'Number',
    outcome_code: 'MA-NU-01',
    outcome_text: 'Pupils will count, read, write, and order numbers, developing a sense of place value.',
  },
  {
    country: 'IE', curriculum_area: 'Mathematics', stage: 'primary_junior',
    strand: 'Number',
    outcome_code: 'MA-NU-02',
    outcome_text: 'Pupils will solve addition and subtraction problems using concrete materials and mental strategies.',
  },
  {
    country: 'IE', curriculum_area: 'Mathematics', stage: 'primary_junior',
    strand: 'Algebra',
    outcome_code: 'MA-AL-01',
    outcome_text: 'Pupils will recognise, describe, and extend patterns in numbers, shapes, and sequences.',
  },
  {
    country: 'IE', curriculum_area: 'Mathematics', stage: 'primary_junior',
    strand: 'Shape & Space',
    outcome_code: 'MA-SS-01',
    outcome_text: 'Pupils will identify, name, and describe 2D shapes and 3D objects in the environment.',
  },
  {
    country: 'IE', curriculum_area: 'Mathematics', stage: 'primary_junior',
    strand: 'Measures',
    outcome_code: 'MA-ME-01',
    outcome_text: 'Pupils will estimate and measure length, weight, capacity, and time using non-standard and standard units.',
  },
  {
    country: 'IE', curriculum_area: 'Mathematics', stage: 'primary_junior',
    strand: 'Data',
    outcome_code: 'MA-DA-01',
    outcome_text: 'Pupils will collect, sort, and organise data and represent it using simple charts and graphs.',
  },

  // ─── SESE: Science ─────────────────────────────────────────
  {
    country: 'IE', curriculum_area: 'SESE', stage: 'primary_junior',
    strand: 'Science - Living Things',
    outcome_code: 'SC-LT-01',
    outcome_text: 'Pupils will observe and identify living things in their local environment, classifying plants and animals.',
  },
  {
    country: 'IE', curriculum_area: 'SESE', stage: 'primary_junior',
    strand: 'Science - Living Things',
    outcome_code: 'SC-LT-02',
    outcome_text: 'Pupils will investigate the life cycles of common plants and animals.',
  },
  {
    country: 'IE', curriculum_area: 'SESE', stage: 'primary_junior',
    strand: 'Science - Materials',
    outcome_code: 'SC-MA-01',
    outcome_text: 'Pupils will explore and compare the properties of everyday materials (hard, soft, rough, smooth, transparent).',
  },
  {
    country: 'IE', curriculum_area: 'SESE', stage: 'primary_junior',
    strand: 'Science - Energy & Forces',
    outcome_code: 'SC-EF-01',
    outcome_text: 'Pupils will explore forces (push, pull, magnetism) and their effects on objects through hands-on experiments.',
  },
  {
    country: 'IE', curriculum_area: 'SESE', stage: 'primary_junior',
    strand: 'Science - Environmental Awareness',
    outcome_code: 'SC-EA-01',
    outcome_text: 'Pupils will develop an awareness of how to care for and protect the local environment.',
  },

  // ─── SESE: History ─────────────────────────────────────────
  {
    country: 'IE', curriculum_area: 'SESE', stage: 'primary_junior',
    strand: 'History - Myself and My Family',
    outcome_code: 'HI-MF-01',
    outcome_text: 'Pupils will develop a sense of personal and family history through stories, photos, and artefacts.',
  },
  {
    country: 'IE', curriculum_area: 'SESE', stage: 'primary_junior',
    strand: 'History - Local Studies',
    outcome_code: 'HI-LS-01',
    outcome_text: 'Pupils will explore the history of their local area, identifying features and changes over time.',
  },

  // ─── SESE: Geography ──────────────────────────────────────
  {
    country: 'IE', curriculum_area: 'SESE', stage: 'primary_junior',
    strand: 'Geography - Natural Environments',
    outcome_code: 'GE-NE-01',
    outcome_text: 'Pupils will observe and describe weather patterns and seasonal changes in their locality.',
  },
  {
    country: 'IE', curriculum_area: 'SESE', stage: 'primary_junior',
    strand: 'Geography - Human Environments',
    outcome_code: 'GE-HE-01',
    outcome_text: 'Pupils will explore the human and natural features of their local environment through fieldwork.',
  },

  // ─── Arts Education: Visual Arts ───────────────────────────
  {
    country: 'IE', curriculum_area: 'Arts Education', stage: 'primary_junior',
    strand: 'Visual Arts - Drawing',
    outcome_code: 'VA-DR-01',
    outcome_text: 'Pupils will draw from observation, memory, and imagination using a variety of media.',
  },
  {
    country: 'IE', curriculum_area: 'Arts Education', stage: 'primary_junior',
    strand: 'Visual Arts - Paint & Colour',
    outcome_code: 'VA-PC-01',
    outcome_text: 'Pupils will experiment with colour mixing, painting techniques, and a range of materials.',
  },
  {
    country: 'IE', curriculum_area: 'Arts Education', stage: 'primary_junior',
    strand: 'Visual Arts - Construction',
    outcome_code: 'VA-CO-01',
    outcome_text: 'Pupils will create 3D constructions using found, natural, and recycled materials.',
  },
  {
    country: 'IE', curriculum_area: 'Arts Education', stage: 'primary_junior',
    strand: 'Visual Arts - Print',
    outcome_code: 'VA-PR-01',
    outcome_text: 'Pupils will make prints using objects, textures, and simple printmaking techniques.',
  },

  // ─── Arts Education: Music ─────────────────────────────────
  {
    country: 'IE', curriculum_area: 'Arts Education', stage: 'primary_junior',
    strand: 'Music - Performing',
    outcome_code: 'MU-PE-01',
    outcome_text: 'Pupils will sing songs, chants, and rhymes with expression and a developing sense of pitch and rhythm.',
  },
  {
    country: 'IE', curriculum_area: 'Arts Education', stage: 'primary_junior',
    strand: 'Music - Listening & Responding',
    outcome_code: 'MU-LR-01',
    outcome_text: 'Pupils will listen to, identify, and respond to sounds and music in their environment.',
  },

  // ─── Arts Education: Drama ─────────────────────────────────
  {
    country: 'IE', curriculum_area: 'Arts Education', stage: 'primary_junior',
    strand: 'Drama',
    outcome_code: 'DR-01',
    outcome_text: 'Pupils will explore real and imaginary situations through role-play, improvisation, and dramatic play.',
  },

  // ─── Physical Education ────────────────────────────────────
  {
    country: 'IE', curriculum_area: 'Physical Education', stage: 'primary_junior',
    strand: 'Games',
    outcome_code: 'PE-GA-01',
    outcome_text: 'Pupils will develop fundamental movement skills (running, jumping, throwing, catching) through structured games.',
  },
  {
    country: 'IE', curriculum_area: 'Physical Education', stage: 'primary_junior',
    strand: 'Gymnastics',
    outcome_code: 'PE-GY-01',
    outcome_text: 'Pupils will perform basic gymnastic actions including balancing, rolling, and climbing.',
  },
  {
    country: 'IE', curriculum_area: 'Physical Education', stage: 'primary_junior',
    strand: 'Dance',
    outcome_code: 'PE-DA-01',
    outcome_text: 'Pupils will explore movement and create simple dance sequences responding to music and rhythm.',
  },
  {
    country: 'IE', curriculum_area: 'Physical Education', stage: 'primary_junior',
    strand: 'Outdoor & Adventure',
    outcome_code: 'PE-OA-01',
    outcome_text: 'Pupils will participate in outdoor challenges and orienteering activities, developing teamwork and navigation skills.',
  },
  {
    country: 'IE', curriculum_area: 'Physical Education', stage: 'primary_junior',
    strand: 'Athletics',
    outcome_code: 'PE-AT-01',
    outcome_text: 'Pupils will practise running, jumping, and throwing with developing control and coordination.',
  },

  // ─── SPHE ──────────────────────────────────────────────────
  {
    country: 'IE', curriculum_area: 'SPHE', stage: 'primary_junior',
    strand: 'Myself',
    outcome_code: 'SP-MY-01',
    outcome_text: 'Pupils will develop self-awareness, recognising their own feelings and learning how to manage them.',
  },
  {
    country: 'IE', curriculum_area: 'SPHE', stage: 'primary_junior',
    strand: 'Myself',
    outcome_code: 'SP-MY-02',
    outcome_text: 'Pupils will practise personal safety skills and develop strategies for keeping safe.',
  },
  {
    country: 'IE', curriculum_area: 'SPHE', stage: 'primary_junior',
    strand: 'Myself & Others',
    outcome_code: 'SP-MO-01',
    outcome_text: 'Pupils will develop social skills including making friends, cooperating, and resolving conflicts peacefully.',
  },
  {
    country: 'IE', curriculum_area: 'SPHE', stage: 'primary_junior',
    strand: 'Myself & Others',
    outcome_code: 'SP-MO-02',
    outcome_text: 'Pupils will develop empathy and an understanding of the feelings and perspectives of others.',
  },
  {
    country: 'IE', curriculum_area: 'SPHE', stage: 'primary_junior',
    strand: 'Myself & the Wider World',
    outcome_code: 'SP-MW-01',
    outcome_text: 'Pupils will develop an understanding of citizenship, rules, fairness, and responsibility within their community.',
  },

  // ═══════════════════════════════════════════════════════════
  // NCCA PRIMARY CURRICULUM — Senior Classes (ages 8-12)
  // ═══════════════════════════════════════════════════════════

  // ─── Language: English (Senior) ────────────────────────────
  {
    country: 'IE', curriculum_area: 'Language', stage: 'primary_senior',
    strand: 'Oral Language',
    outcome_code: 'EN-OL-S01',
    outcome_text: 'Pupils will present ideas, argue a point, and engage in extended discussion with growing confidence.',
  },
  {
    country: 'IE', curriculum_area: 'Language', stage: 'primary_senior',
    strand: 'Reading',
    outcome_code: 'EN-RD-S01',
    outcome_text: 'Pupils will read a wide range of fiction and non-fiction texts, making inferences and evaluating content critically.',
  },
  {
    country: 'IE', curriculum_area: 'Language', stage: 'primary_senior',
    strand: 'Writing',
    outcome_code: 'EN-WR-S01',
    outcome_text: 'Pupils will write in a variety of genres (narrative, report, persuasive, poetry) with attention to structure, grammar, and editing.',
  },

  // ─── Language: Irish (Senior) ──────────────────────────────
  {
    country: 'IE', curriculum_area: 'Language', stage: 'primary_senior',
    strand: 'Irish - Oral Language',
    outcome_code: 'GA-OL-S01',
    outcome_text: 'Pupils will engage in conversations on familiar topics in Irish, with increasing fluency and accuracy.',
  },

  // ─── Mathematics (Senior) ─────────────────────────────────
  {
    country: 'IE', curriculum_area: 'Mathematics', stage: 'primary_senior',
    strand: 'Number',
    outcome_code: 'MA-NU-S01',
    outcome_text: 'Pupils will work with fractions, decimals, and percentages, and apply the four operations to larger numbers.',
  },
  {
    country: 'IE', curriculum_area: 'Mathematics', stage: 'primary_senior',
    strand: 'Algebra',
    outcome_code: 'MA-AL-S01',
    outcome_text: 'Pupils will explore equations, variables, and relationships, representing them in tables and graphs.',
  },
  {
    country: 'IE', curriculum_area: 'Mathematics', stage: 'primary_senior',
    strand: 'Shape & Space',
    outcome_code: 'MA-SS-S01',
    outcome_text: 'Pupils will classify 2D shapes and 3D objects by their properties and explore symmetry, angles, and transformations.',
  },
  {
    country: 'IE', curriculum_area: 'Mathematics', stage: 'primary_senior',
    strand: 'Measures',
    outcome_code: 'MA-ME-S01',
    outcome_text: 'Pupils will measure and calculate area, perimeter, volume, and time using standard metric units.',
  },
  {
    country: 'IE', curriculum_area: 'Mathematics', stage: 'primary_senior',
    strand: 'Data',
    outcome_code: 'MA-DA-S01',
    outcome_text: 'Pupils will collect, represent, and interpret data using bar charts, line graphs, and pie charts, and understand probability.',
  },

  // ─── SESE (Senior) ────────────────────────────────────────
  {
    country: 'IE', curriculum_area: 'SESE', stage: 'primary_senior',
    strand: 'Science - Living Things',
    outcome_code: 'SC-LT-S01',
    outcome_text: 'Pupils will investigate plant and animal habitats, food chains, and adaptation to environments.',
  },
  {
    country: 'IE', curriculum_area: 'SESE', stage: 'primary_senior',
    strand: 'Science - Energy & Forces',
    outcome_code: 'SC-EF-S01',
    outcome_text: 'Pupils will design and carry out fair tests, exploring electricity, magnetism, light, and sound.',
  },
  {
    country: 'IE', curriculum_area: 'SESE', stage: 'primary_senior',
    strand: 'History - Early People & Ancient Societies',
    outcome_code: 'HI-EP-S01',
    outcome_text: 'Pupils will study life in early Ireland and ancient civilisations, using evidence from artefacts and sites.',
  },
  {
    country: 'IE', curriculum_area: 'SESE', stage: 'primary_senior',
    strand: 'Geography - Environmental Awareness',
    outcome_code: 'GE-EA-S01',
    outcome_text: 'Pupils will investigate environmental issues, sustainability, and the impact of human activity on the landscape.',
  },

  // ─── Arts Education (Senior) ───────────────────────────────
  {
    country: 'IE', curriculum_area: 'Arts Education', stage: 'primary_senior',
    strand: 'Visual Arts - Drawing',
    outcome_code: 'VA-DR-S01',
    outcome_text: 'Pupils will develop drawing skills using perspective, tone, and texture to represent subjects from observation.',
  },
  {
    country: 'IE', curriculum_area: 'Arts Education', stage: 'primary_senior',
    strand: 'Music - Composing',
    outcome_code: 'MU-CO-S01',
    outcome_text: 'Pupils will compose and perform their own short musical pieces using instruments and voice.',
  },
  {
    country: 'IE', curriculum_area: 'Arts Education', stage: 'primary_senior',
    strand: 'Drama',
    outcome_code: 'DR-S01',
    outcome_text: 'Pupils will create and perform drama pieces, developing character, tension, and narrative structure.',
  },

  // ─── Physical Education (Senior) ───────────────────────────
  {
    country: 'IE', curriculum_area: 'Physical Education', stage: 'primary_senior',
    strand: 'Games',
    outcome_code: 'PE-GA-S01',
    outcome_text: 'Pupils will develop game-specific skills, tactics, and sportsmanship in team and individual sports.',
  },
  {
    country: 'IE', curriculum_area: 'Physical Education', stage: 'primary_senior',
    strand: 'Outdoor & Adventure',
    outcome_code: 'PE-OA-S01',
    outcome_text: 'Pupils will participate in orienteering, hiking, and environmental challenges, developing leadership and resilience.',
  },
  {
    country: 'IE', curriculum_area: 'Physical Education', stage: 'primary_senior',
    strand: 'Aquatics',
    outcome_code: 'PE-AQ-S01',
    outcome_text: 'Pupils will develop water confidence and basic swimming strokes in a safe aquatic environment.',
  },

  // ─── SPHE (Senior) ────────────────────────────────────────
  {
    country: 'IE', curriculum_area: 'SPHE', stage: 'primary_senior',
    strand: 'Myself',
    outcome_code: 'SP-MY-S01',
    outcome_text: 'Pupils will develop a positive self-image and strategies for managing change, challenges, and emotional well-being.',
  },
  {
    country: 'IE', curriculum_area: 'SPHE', stage: 'primary_senior',
    strand: 'Myself & Others',
    outcome_code: 'SP-MO-S01',
    outcome_text: 'Pupils will develop skills in assertive communication, conflict resolution, and respecting different viewpoints.',
  },
  {
    country: 'IE', curriculum_area: 'SPHE', stage: 'primary_senior',
    strand: 'Myself & the Wider World',
    outcome_code: 'SP-MW-S01',
    outcome_text: 'Pupils will explore media literacy, digital citizenship, and their rights and responsibilities as citizens.',
  },
];

async function seed() {
  console.log(`Seeding ${outcomes.length} curriculum outcomes...`);

  // Clear existing Irish curriculum outcomes first
  const { error: deleteError } = await supabase
    .from('curriculum_outcomes')
    .delete()
    .eq('country', 'IE');

  if (deleteError) {
    console.error('Failed to clear existing outcomes:', deleteError.message);
    process.exit(1);
  }

  // Insert in batches of 20
  const batchSize = 20;
  let inserted = 0;

  for (let i = 0; i < outcomes.length; i += batchSize) {
    const batch = outcomes.slice(i, i + batchSize);
    const { error } = await supabase
      .from('curriculum_outcomes')
      .insert(batch);

    if (error) {
      console.error(`Failed to insert batch at index ${i}:`, error.message);
      process.exit(1);
    }

    inserted += batch.length;
    console.log(`  Inserted ${inserted}/${outcomes.length}`);
  }

  console.log('Done! Curriculum outcomes seeded successfully.');
  console.log(`  Aistear themes: ${outcomes.filter(o => o.curriculum_area.startsWith('Aistear')).length} outcomes`);
  console.log(`  Primary junior: ${outcomes.filter(o => o.stage === 'primary_junior').length} outcomes`);
  console.log(`  Primary senior: ${outcomes.filter(o => o.stage === 'primary_senior').length} outcomes`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
