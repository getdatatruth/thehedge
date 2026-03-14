require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function check() {
  const outcomes = await sql`SELECT outcome_code, outcome_text, stage FROM curriculum_outcomes WHERE country = 'IE' ORDER BY outcome_code`;
  const activities = await sql`SELECT title, curriculum_tags FROM activities WHERE published = true AND curriculum_tags IS NOT NULL`;

  const coveredCodes = new Set();
  const qualityCounts = { strong: 0, moderate: 0, weak: 0 };

  for (const a of activities) {
    let tags = a.curriculum_tags;
    if (typeof tags === 'string') tags = JSON.parse(tags);
    if (tags && tags.outcome_codes) {
      for (const code of tags.outcome_codes) coveredCodes.add(code);
    }
    if (tags && tags.educator_quality) {
      qualityCounts[tags.educator_quality] = (qualityCounts[tags.educator_quality] || 0) + 1;
    }
  }

  const gaps = outcomes.filter(o => !coveredCodes.has(o.outcome_code));

  console.log('Total outcomes:', outcomes.length);
  console.log('Covered:', coveredCodes.size);
  console.log('Gaps remaining:', gaps.length);
  if (gaps.length > 0) {
    for (const g of gaps) console.log('  MISSING:', g.outcome_code, '-', g.outcome_text);
  } else {
    console.log('  FULL CURRICULUM COVERAGE!');
  }
  console.log('');
  console.log('Quality: strong=' + qualityCounts.strong + ', moderate=' + qualityCounts.moderate + ', weak=' + (qualityCounts.weak || 0));
  console.log('Activities with curriculum tags:', activities.length);

  await sql.end();
}
check();
