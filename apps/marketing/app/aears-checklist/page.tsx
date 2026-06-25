import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import ChecklistPrint from '../../components/ChecklistPrint';

export const metadata: Metadata = {
  title: 'AEARS Readiness Checklist & Home-Ed First-Steps Guide | The Hedge',
  description:
    'A calm, printable AEARS readiness checklist for Irish home-educating families. Registration steps, the evidence to gather, what the assessment conversation covers, and where the official Tusla guidance lives. Not affiliated with Tusla.',
  alternates: { canonical: 'https://thehedge.ie/aears-checklist' },
  keywords: [
    'AEARS checklist',
    'AEARS Ireland',
    'Tusla home education',
    'homeschool Ireland checklist',
    'home education assessment Ireland',
    'NCCA homeschool',
  ],
};

// Registration / first-steps. Mirrors the arc described in our AEARS journal
// guide and the public Tusla AEARS process - kept deliberately plain and
// non-binding, with the official sources linked at the foot of the page.
const firstSteps: { title: string; body: string }[] = [
  {
    title: 'Apply to be placed on the register',
    body: 'Apply to Tusla to have your child entered on the register of children receiving education outside a recognised school. This is your starting point, not an exam.',
  },
  {
    title: 'An Authorised Person is appointed',
    body: 'Tusla appoints an assessor (the Authorised Person) to carry out the AEARS assessment. Many are former teachers or inspectors.',
  },
  {
    title: 'Complete the preliminary questionnaire',
    body: 'You describe your educational approach, your child, and the resources you use. Write in your own words - it does not need to read like a school policy.',
  },
  {
    title: 'The assessment meeting is arranged',
    body: 'Usually in your home, at a time that suits you. You talk through your approach, and the assessor may meet your child.',
  },
  {
    title: 'The report and recommendation',
    body: 'The assessor prepares a report. Families who are genuinely educating their children are, in the ordinary course, registered.',
  },
];

// The evidence kit. Each item is something a parent can tick off as gathered.
const evidenceSections: { heading: string; intro: string; items: string[] }[] = [
  {
    heading: 'A description of your approach',
    intro:
      'A short, honest account of how learning actually happens in your home. There is no single approved method.',
    items: [
      'A paragraph or two naming your style - structured, Charlotte Mason, Montessori-influenced, project-led, unschooling, or a blend.',
      'A sense of your weekly rhythm: what a typical few days look like.',
      'Why this approach suits your particular child.',
    ],
  },
  {
    heading: 'Dated learning logs',
    intro:
      'A light, running record of what you have covered, gathered as you go rather than reconstructed in a panic the week before.',
    items: [
      'A loose record of themes and areas covered over recent months, with rough dates.',
      'Notes on outings and real-world learning: the beach, the museum, the farm, the library.',
      'A short note, per child, of where they are now and where they are heading next.',
    ],
  },
  {
    heading: 'Samples of work',
    intro: 'Not a mountain of paperwork. A handful of pieces that show learning is genuinely happening.',
    items: [
      'A few pieces of writing at different points in time.',
      'Drawings, paintings, or craft.',
      'Photos of projects, models, baking, building, or experiments.',
      'Anything your child is proud of - their voice matters here.',
    ],
  },
  {
    heading: 'Curriculum coverage across areas',
    intro:
      'You are not required to replicate the NCCA primary curriculum, but the strands are a useful map for checking you have not accidentally left a whole area untouched.',
    items: [
      'Literacy and language (English, and Irish if you choose).',
      'Numeracy and mathematics.',
      'The world around them: science, history, geography (SESE).',
      'Creativity: art, music, drama.',
      'Physical activity and the outdoors.',
      'Social and personal development (SPHE).',
    ],
  },
  {
    heading: 'Your resources and supports',
    intro: 'A simple list of what you lean on. This shows the education is resourced and intentional.',
    items: [
      'The main books, programmes, and materials you use.',
      'Clubs, classes, groups, or co-ops your child attends.',
      'Library, community, and online resources you draw on.',
    ],
  },
];

// What the conversation tends to cover - to settle nerves before the meeting.
const conversationPoints: string[] = [
  'How your child learns, and why your approach suits them.',
  'The breadth of what they are encountering over time, not on any single day.',
  'How you keep a sense of progress and notice when something needs more attention.',
  'How your child is doing socially and emotionally, in their own way.',
  'What you are planning next, and how you adapt when something is not working.',
];

export default function AearsChecklist() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'AEARS Readiness Checklist for Irish Home Educators',
    description:
      'How to prepare for the Tusla AEARS assessment in Ireland: register, gather dated learning logs and work samples, cover the curriculum areas, and walk into the assessment conversation calmly. Not affiliated with Tusla.',
    inLanguage: 'en-IE',
    totalTime: 'P3M',
    publisher: { '@type': 'Organization', name: 'The Hedge', url: 'https://thehedge.ie' },
    step: firstSteps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Page-scoped styles: print-friendly layout, plus on-screen checklist look.
          Class names are prefixed `aears-` so nothing leaks into other pages. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
.aears-wrap{max-width:820px;margin:0 auto;padding:0 20px}
.aears-doc{background:#fff;border:1px solid var(--stone);border-radius:16px;padding:40px 32px;margin:-48px auto 0;position:relative;z-index:2}
.aears-kicker{font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--clay);margin:34px 0 10px}
.aears-h2{font-family:var(--font-display);font-size:clamp(24px,4vw,34px);font-weight:300;color:var(--ink);letter-spacing:-0.01em;line-height:1.1;margin:34px 0 6px}
.aears-h2:first-of-type{margin-top:6px}
.aears-h3{font-family:var(--font-display);font-size:19px;font-weight:500;color:var(--forest);margin:22px 0 6px}
.aears-lede{font-family:var(--font-serif);font-size:17px;color:var(--clay);line-height:1.7;margin-bottom:6px}
.aears-p{font-family:var(--font-serif);font-size:15.5px;color:var(--umber);line-height:1.7;margin:0 0 14px}
.aears-steps{counter-reset:aears;list-style:none;margin:6px 0 8px;padding:0;display:flex;flex-direction:column;gap:14px}
.aears-steps li{counter-increment:aears;position:relative;padding-left:48px}
.aears-steps li::before{content:counter(aears);position:absolute;left:0;top:0;width:32px;height:32px;border-radius:50%;background:var(--forest);color:var(--parchment);font-family:var(--font-heading);font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center}
.aears-steps .st-t{font-family:var(--font-heading);font-weight:700;font-size:15px;color:var(--ink);margin-bottom:2px}
.aears-steps .st-b{font-family:var(--font-serif);font-size:14.5px;color:var(--clay);line-height:1.6}
.aears-check{list-style:none;margin:6px 0 10px;padding:0;display:flex;flex-direction:column;gap:9px}
.aears-check li{position:relative;padding-left:30px;font-family:var(--font-serif);font-size:15px;color:var(--umber);line-height:1.55}
.aears-check li::before{content:'';position:absolute;left:0;top:2px;width:16px;height:16px;border:1.5px solid var(--fern);border-radius:4px;background:#fff}
.aears-callout{background:var(--linen);border:1px solid var(--stone);border-left:3px solid var(--terracotta);border-radius:12px;padding:18px 20px;margin:20px 0}
.aears-callout .co-t{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--terracotta);margin-bottom:8px}
.aears-callout .co-b{font-family:var(--font-serif);font-size:14.5px;color:var(--ink);line-height:1.65}
.aears-reassure{background:var(--forest);border-radius:14px;padding:26px 24px;margin:26px 0}
.aears-reassure .re-t{font-family:var(--font-display);font-size:22px;font-weight:300;color:var(--parchment);margin-bottom:8px}
.aears-reassure .re-b{font-family:var(--font-serif);font-size:15px;color:rgba(200,220,185,0.85);line-height:1.7}
.aears-sources a{color:var(--moss);text-decoration:underline;text-underline-offset:2px}
.aears-cta{background:var(--linen);border:1px solid var(--stone);border-radius:16px;padding:30px 28px;margin:30px 0 0;text-align:center}
.aears-actions{display:flex;gap:12px;flex-wrap:wrap;margin:18px 0 4px}
.aears-fine{font-size:12px;color:var(--clay);line-height:1.6;margin-top:24px;border-top:1px solid var(--stone);padding-top:18px}

@media print {
  .no-print{display:none !important}
  body{background:#fff !important}
  .aears-hero{background:#fff !important;padding:0 0 8px !important;color:var(--ink) !important}
  .aears-hero *{color:var(--ink) !important}
  .aears-doc{border:none !important;margin:0 !important;padding:0 !important;box-shadow:none !important}
  .aears-wrap{max-width:100% !important;padding:0 !important}
  .aears-reassure{background:#fff !important;border:1px solid #ccc !important}
  .aears-reassure .re-t{color:var(--forest) !important}
  .aears-reassure .re-b{color:#333 !important}
  .aears-steps li::before{background:#333 !important;color:#fff !important}
  .aears-cta{border:1px solid #ccc !important}
  .aears-h2,.aears-h3{break-after:avoid}
  .aears-steps li,.aears-check li,.aears-callout{break-inside:avoid}
  a{color:#000 !important;text-decoration:underline}
  @page{margin:18mm}
}
`,
        }}
      />

      <div className="no-print">
        <Nav active="/homeschool" />
      </div>

      <main className="page-pad">
        {/* Hero */}
        <div className="page-hero aears-hero">
          <div className="container aears-wrap" style={{ maxWidth: 820 }}>
            <div className="page-hero-eyebrow no-print">
              <div className="page-hero-eyebrow-line" />
              <span className="page-hero-eyebrow-text">Free guide for home educators</span>
            </div>
            <h1>
              Your AEARS readiness <em>checklist</em>
            </h1>
            <p className="page-hero-desc" style={{ marginTop: 14 }}>
              A calm, plain-English guide to preparing for your Tusla AEARS assessment in Ireland. Read it
              here, print it, or save it as a PDF and keep it by the kettle. You have got this.
            </p>
          </div>
        </div>

        {/* The document */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="aears-wrap">
            <div className="aears-doc">
              <div className="aears-actions no-print">
                <ChecklistPrint />
                <Link href="/blog/tusla-aears-guide" className="btn-ghost">
                  Read the full AEARS guide
                </Link>
              </div>

              <div className="aears-callout">
                <div className="co-t">Before we start</div>
                <div className="co-b">
                  The Hedge is not an official Tusla product and is not affiliated with Tusla. This is a
                  plain-English aid to help you get your bearings. Always read the current guidance on
                  tusla.ie, and check the latest forms and standards directly with Tusla before you apply.
                </div>
              </div>

              <p className="aears-lede">
                AEARS stands for the Assessment of Education in Places other than Recognised Schools. It is
                the process by which Tusla, the Child and Family Agency, registers children educated outside
                the recognised school system. Home education is a legitimate, constitutionally protected
                choice in Ireland. The assessment exists to confirm a suitable education is happening, not to
                catch you out.
              </p>

              {/* First steps */}
              <h2 className="aears-h2">First steps: getting registered</h2>
              <p className="aears-p">Most applications follow a recognisable arc. Tick each step as you go.</p>
              <ol className="aears-steps">
                {firstSteps.map((s) => (
                  <li key={s.title}>
                    <div className="st-t">{s.title}</div>
                    <div className="st-b">{s.body}</div>
                  </li>
                ))}
              </ol>

              <div className="aears-callout">
                <div className="co-t">It is a conversation, not an inspection</div>
                <div className="co-b">
                  The meeting is closer to a friendly professional chat than an exam. You are explaining how
                  learning happens in your home, not defending a lesson plan.
                </div>
              </div>

              {/* Evidence kit */}
              <h2 className="aears-h2">Your evidence kit</h2>
              <p className="aears-p">
                You do not need a filing cabinet. What helps most is a simple, honest record of what your days
                actually look like. Gather a little under each heading below.
              </p>

              {evidenceSections.map((sec) => (
                <div key={sec.heading}>
                  <h3 className="aears-h3">{sec.heading}</h3>
                  <p className="aears-p" style={{ marginBottom: 8 }}>
                    {sec.intro}
                  </p>
                  <ul className="aears-check">
                    {sec.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* The conversation */}
              <h2 className="aears-h2">What the assessment conversation covers</h2>
              <p className="aears-p">
                Every assessor is different, but the meeting tends to circle the same gentle questions. None of
                them have a single right answer. Speaking honestly about your own child is always stronger than
                pretending everything is uniform.
              </p>
              <ul className="aears-check">
                {conversationPoints.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>

              {/* Reassurance */}
              <div className="aears-reassure">
                <div className="re-t">You have got this</div>
                <div className="re-b">
                  Children are uneven, and assessors know this. The standard is suitability to your child, not
                  a national average on a given Tuesday. Keep a light, honest record as you go, be able to
                  describe your approach in your own words, and the rest tends to follow. Learning that feels
                  like a breath, not a battle - for the assessment too.
                </div>
              </div>

              {/* Official sources */}
              <h2 className="aears-h2">The official sources</h2>
              <p className="aears-p aears-sources">
                For anything binding, go straight to the source. Tusla publishes the application forms and the
                current Guidelines for the Assessment of Education in Places other than Recognised Schools at{' '}
                <a href="https://www.tusla.ie" target="_blank" rel="noopener noreferrer">
                  tusla.ie
                </a>
                . For a plain-English overview of your rights and the registration process, see{' '}
                <a
                  href="https://www.citizensinformation.ie"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  citizensinformation.ie
                </a>
                . The Home Education Network (HEN), run by home-educating families, is a good place to find
                people who have been through the process recently.
              </p>

              {/* CTA */}
              <div className="aears-cta no-print">
                <h2 className="aears-h2" style={{ marginTop: 0 }}>
                  Let The Hedge keep the record for you
                </h2>
                <p className="aears-p" style={{ maxWidth: 560, margin: '0 auto 18px' }}>
                  The Hedge keeps a dated, curriculum-tagged log of what your family does, and exports it as a
                  tidy PDF over any date range - the kind of evidence an AEARS assessment looks for. Start free
                  at the Kitchen Table and let the record build itself.
                </p>
                <Link
                  href="https://app.thehedge.ie/signup?plan=educator"
                  className="btn-primary"
                  style={{ display: 'inline-flex' }}
                >
                  Start free at the Kitchen Table
                </Link>
              </div>

              <p className="aears-fine">
                The Hedge is a record-keeping and planning aid for home-educating families. It does not
                register you with Tusla, is not an official Tusla product, and is not affiliated with Tusla.
                This checklist is general guidance, not legal advice. Always confirm the current requirements
                with Tusla before applying.
              </p>
            </div>
          </div>
        </section>
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </>
  );
}
