import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import FAQ from '../../components/FAQ';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

export const metadata: Metadata = {
  title: 'How The Hedge Works - It Learns Your Family First',
  description: 'The Hedge starts with a warm conversation at the Kitchen Table, writes your family its own Framework, then builds learning around it: Today, Plan, Keep, Belong and Ask.',
  alternates: { canonical: 'https://thehedge.ie/how-it-works' },
};

const steps = [
  {
    n: '01', id: 'users',
    title: 'Sit down at the Kitchen Table',
    time: 'A warm conversation, not a form',
    body: "Before anything else, The Hedge gets to know you. The Kitchen Table is a calm, consultative chat - it asks about your children, your days, what matters to you and how you like to learn. No long forms, no boxes to wrestle with. Just a conversation, the way you would have with a friend who happened to know a lot about learning.",
    details: ["A real chat, not a checklist", "Ages 2-12, however many children you have", "Tell it as little or as much as you like", "You can pick the conversation back up any time"],
  },
  {
    n: '02', id: 'leaf',
    title: 'Read back your Family Framework',
    time: 'Your family, reflected to you',
    body: "Out of that conversation, The Hedge writes you your own Family Framework - your values, your rhythm, your approach to learning, set down in plain words. It is the bit families tell us stops them in their tracks: seeing themselves described clearly, and feeling understood. From here on, everything The Hedge offers is built around this, not around a generic template.",
    details: ["Your values and approach, in plain language", "Tune it whenever life shifts", "Quietly shapes every suggestion that follows", "Yours to keep, private to your family"],
  },
  {
    n: '03', id: 'spark',
    title: 'Live it day to day: Today, Plan, Keep, Belong',
    time: 'The Framework, working for you',
    body: "With your Framework in place, the rest of The Hedge simply fits. Today gives you ideas that suit this family on this morning. Plan holds a real timetable or a gentle rhythm, whichever your stance. Keep records what you do and quietly builds your AEARS evidence. Belong connects you to other families in your county. It should feel like a breath, not a battle.",
    details: ["Today: ideas that fit your children, here and now", "Plan: a timetable, or a gentle rhythm for child-led days", "Keep: your record and AEARS evidence build themselves", "Belong: your local county community"],
  },
  {
    n: '04', id: 'book',
    title: 'Ask, whenever you need a hand',
    time: 'A calm companion, on tap',
    body: "Some days you just want to ask someone. Ask is a calm AI companion that knows your Family Framework, so its answers fit your family rather than the average one. Stuck for an idea, unsure how something connects to the curriculum, wondering how to adapt for a tricky day - ask it plainly. It is honest about what it is, and it never pretends to be a teacher you have hired.",
    details: ["Answers shaped by your Family Framework", "Ideas, curriculum links, gentle adaptations", "Clear about being an AI, not a person", "There when you want it, never in the way"],
  },
];

const faqs = [
  { q: "Is the Kitchen Table just another sign-up form?", a: "No. It is a real conversation. The Hedge asks about your family the way a thoughtful friend would, and you answer in your own words. There is no rush and nothing to get wrong. Out of it comes your Family Framework, which is what makes everything else fit you rather than feel generic." },
  { q: "What is the Family Framework, exactly?", a: "It is a short, plain-language portrait of your family - your values, your rhythm and your approach to learning - written for you from the Kitchen Table conversation. The Hedge uses it to shape Today, Plan, Keep and Ask. You can read it back, edit it, and update it as your family changes." },
  { q: "We are child-led and do not want a rigid timetable. Does that work?", a: "Yes. Plan adapts to your stance. If you want a structured timetable, it gives you one. If your days are more child-led, it offers a gentle rhythm instead - a loose shape rather than a schedule. The Framework tells it which you prefer." },
  { q: "How does The Hedge help with AEARS evidence?", a: "As you mark things done in Keep, The Hedge builds a searchable record of what your family has explored and learned. For homeschooling families that record doubles as evidence you can draw on for AEARS, so the paperwork largely keeps itself rather than landing on you all at once." },
  { q: "Is Ask actually a teacher?", a: "No, and we will never pretend it is. Ask is a calm AI companion that knows your Family Framework, so its answers suit your family. It is genuinely useful for ideas, curriculum links and adapting on hard days, but it is honest about being software, not a person." },
];

export default function HowItWorks() {
  return (
    <>
      <Nav active="/how-it-works" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">How it works</span></div>
            <h1>It learns your <em>family first</em></h1>
            <p className="page-hero-desc">The Hedge does not hand you a generic plan. It starts with a warm conversation, writes your family its own Framework, then builds the learning around you - day by day.</p>
          </div>
        </div>

        {/* STEPS */}
        <section className="section" aria-labelledby="steps-title">
          <div className="container">
            <h2 className="section-title" id="steps-title" style={{ marginBottom: 48 }}>From conversation to <em>a life that fits</em></h2>
            <div style={{ display: 'grid', gap: 0 }}>
              {steps.map((s) => (
                <div key={s.n} style={{ display: 'grid', gap: 24, padding: '48px 0', borderBottom: '1px solid var(--stone)', gridTemplateColumns: '1fr' }} aria-label={`Step ${s.n}: ${s.title}`}>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px,8vw,80px)', fontWeight: 300, color: 'var(--stone)', lineHeight: 1, flexShrink: 0, minWidth: '1ch' }}>{s.n}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(61,97,66,0.08)', borderRadius: 4, padding: '4px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: 12 }}>{s.time}</div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 400, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.1 }}>{s.title}</h3>
                      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(15px,2vw,17px)', color: 'var(--clay)', lineHeight: 1.7, marginBottom: 20 }}>{s.body}</p>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {s.details.map(d => (
                          <li key={d} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, color: 'var(--umber)' }}>
                            <Icon id="check" size={14} color="var(--moss)" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT YOU GET */}
        <section className="section section-linen" aria-labelledby="wug-title">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Why it feels different</span></div>
            <h2 className="section-title" id="wug-title">Built around you, <em>not the average family</em></h2>
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', marginTop: 32 }}>
              {[
                { id: 'leaf', title: 'It knows your family first', body: "The Kitchen Table conversation and your Family Framework come before any suggestion, so nothing feels generic or off the shelf." },
                { id: 'cal', title: 'It adapts to your stance', body: "A real timetable for structured days, or a gentle rhythm for child-led ones. Plan bends to how your family actually lives." },
                { id: 'book', title: 'Your AEARS evidence builds itself', body: "Keep turns the things you already do into a searchable record, so homeschooling paperwork stops piling up and starts looking after itself." },
                { id: 'spark', title: 'Calm, not chaos', body: "Today offers a few ideas that fit, not a firehose. Learning that feels like a breath, not a battle." },
                { id: 'users', title: 'Belong to your county', body: "Quiet, local community with other Irish families nearby - the people who get what your days are actually like." },
                { id: 'sun', title: 'Honest and private', body: "Solo-built in Ireland, your data kept in the EU, and no invented reviews or made-up numbers. What you see is what it is." },
              ].map(c => (
                <div key={c.title} style={{ background: 'white', borderRadius: 14, padding: '24px 20px', border: '1px solid var(--stone)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(61,97,66,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Icon id={c.id} size={18} color="var(--moss)" />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 7 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--clay)', lineHeight: 1.65 }}>{c.body}</div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--umber)', lineHeight: 1.7, marginTop: 28, maxWidth: 640 }}>
              Underneath it all sits a deep library - 520 curriculum-aligned activities, ideas for every county, and a sense of season and weather - but you never have to wade through it. The Framework does the choosing for you.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" aria-labelledby="hiw-faq-title">
          <div className="container" style={{ maxWidth: 760 }}>
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Questions</span></div>
            <h2 className="section-title" id="hiw-faq-title">A few more <em>answers</em></h2>
            <FAQ items={faqs} />
          </div>
        </section>

        <div className="cta-band">
          <div className="container">
            <h2>Pull up a <em>chair?</em></h2>
            <p>Start at the Kitchen Table, meet your Family Framework, and let The Hedge build learning around you. Free to begin.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup" className="btn-light">Start at the Kitchen Table <Icon id="arrow-r" size={16} /></Link>
              <Link href="/pricing" className="btn-ghost" style={{ color: 'var(--mist)' }}>See pricing</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
