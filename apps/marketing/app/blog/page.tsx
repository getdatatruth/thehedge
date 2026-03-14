import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

export const metadata: Metadata = {
  title: 'Blog - Family Activity Guides, Homeschool Tips & Irish Seasonal Ideas',
  description: 'Practical guides for Irish families: seasonal activity ideas, homeschooling in Ireland, outdoor learning, and making the most of wherever you live in Ireland.',
  alternates: { canonical: 'https://thehedge.ie/blog' },
};

const posts = [
  {
    cat: 'Seasonal Guide',
    date: '12 March 2026',
    title: 'The complete Irish spring activity guide',
    titleEm: 'spring',
    excerpt: "When the days start to lengthen and the first primroses appear in the hedgerows, Ireland comes alive with possibilities for families. Here's everything you can do with children this spring - from lambing season to St. Brigid's Day crafts.",
    readTime: '8 min read',
    slug: 'irish-spring-activity-guide',
    bg: 'linear-gradient(135deg,#2C4A2E,#4A7C4E)',
  },
  {
    cat: 'Homeschool',
    date: '5 March 2026',
    title: 'Tusla AEARS: what Irish homeschoolers actually need to submit',
    titleEm: 'AEARS',
    excerpt: "The AEARS process can feel mysterious - especially for families new to home education. We've put together a clear, plain-English guide to exactly what evidence Tusla assessors look for and how to prepare it without stress.",
    readTime: '12 min read',
    slug: 'tusla-aears-guide',
    bg: 'linear-gradient(135deg,#1C3520,#3D6142)',
  },
  {
    cat: 'Nature & Outdoors',
    date: '28 Feb 2026',
    title: '30 outdoor activities for Irish children this March',
    titleEm: 'March',
    excerpt: "March is underrated. The evenings are getting longer, the countryside is waking up, and there's still enough cold in the air to make it feel like an adventure. Here are 30 activities you can do with children across Ireland this month.",
    readTime: '10 min read',
    slug: '30-outdoor-activities-march',
    bg: 'linear-gradient(135deg,#3D6142,#5E8B52)',
  },
  {
    cat: 'Science',
    date: '21 Feb 2026',
    title: 'Kitchen science experiments that actually work',
    titleEm: 'actually work',
    excerpt: "We tested 40 kitchen science experiments with children aged 4–12 across Ireland. Half of them were disappointingly boring or required ingredients nobody has. Here are the 12 that genuinely delighted children - and why they work.",
    readTime: '9 min read',
    slug: 'kitchen-science-experiments',
    bg: 'linear-gradient(135deg,#C4623A,#9E4A2A)',
  },
  {
    cat: 'Arts & Creativity',
    date: '14 Feb 2026',
    title: "Nature journalling with children: a beginner's guide",
    titleEm: "beginner's guide",
    excerpt: "Nature journalling is one of the most sustainable creative habits you can give a child. It costs almost nothing, works in any season, and produces something genuinely beautiful. Here's how to start - even if neither you nor your child can draw.",
    readTime: '7 min read',
    slug: 'nature-journalling-beginners-guide',
    bg: 'linear-gradient(135deg,#6B4F35,#9E7B5A)',
  },
  {
    cat: 'Irish Language',
    date: '8 Feb 2026',
    title: "Bringing Irish into everyday family life (without it feeling like homework)",
    titleEm: 'everyday',
    excerpt: "For most Irish families, the language lives inside school gates and rarely escapes. But Irish is full of beautiful words for the natural world - and learning them together, in context, is far more effective than any worksheet.",
    readTime: '8 min read',
    slug: 'irish-language-family-life',
    bg: 'linear-gradient(135deg,#1A1612,#3D2B1F)',
  },
];

const categories = ['All','Seasonal Guides','Homeschool','Nature & Outdoors','Science','Arts & Creativity','Irish Language','Food & Cooking'];

export default function Blog() {
  return (
    <>
      <Nav active="/blog" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">Guides &amp; ideas</span></div>
            <h1>The Hedge <em>journal</em></h1>
            <p className="page-hero-desc">Seasonal activity guides, homeschooling in Ireland, outdoor learning, and practical ideas for making family life richer - wherever you live in Ireland.</p>
          </div>
        </div>

        <section className="section" aria-labelledby="blog-title">
          <div className="container">
            {/* Categories */}
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:40}} role="navigation" aria-label="Blog categories">
              {categories.map((c,i) => (
                <button key={c} style={{padding:'7px 14px',borderRadius:4,border:i===0?'1.5px solid var(--forest)':'1px solid var(--stone)',background:i===0?'var(--forest)':'transparent',color:i===0?'var(--parchment)':'var(--clay)',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'var(--font-heading)'}}>{c}</button>
              ))}
            </div>

            <h2 className="section-title" id="blog-title" style={{marginBottom:32}}>Latest <em>articles</em></h2>
            <div className="blog-grid">
              {posts.map(p => (
                <article key={p.slug} className="blog-card" itemScope itemType="https://schema.org/Article">
                  <div className="blog-img-placeholder" style={{background:p.bg}}>
                    <Icon id="leaf" size={32} color="rgba(255,255,255,0.15)" />
                  </div>
                  <div className="blog-content">
                    <div className="blog-meta">
                      <span className="blog-cat" itemProp="articleSection">{p.cat}</span>
                      <span className="blog-date"><time itemProp="datePublished">{p.date}</time></span>
                      <span style={{fontSize:11,color:'var(--clay)'}}>{p.readTime}</span>
                    </div>
                    <h2 className="blog-title" itemProp="headline">{p.title.replace(p.titleEm, '')}<em>{p.titleEm}</em></h2>
                    <p className="blog-excerpt" itemProp="description">{p.excerpt}</p>
                    <Link href={`/blog/${p.slug}`} className="blog-read" aria-label={`Read: ${p.title}`}>
                      Read article <Icon id="arrow-r" size={12} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="section section-forest" aria-labelledby="nl-title">
          <div className="container" style={{maxWidth:600,textAlign:'center'}}>
            <div className="eyebrow eyebrow-sage" style={{justifyContent:'center'}}><div className="eyebrow-line" /><span className="eyebrow-text">Stay in the loop</span></div>
            <h2 className="section-title section-title-light" id="nl-title">New guides <em>every fortnight</em></h2>
            <p style={{fontFamily:'var(--font-serif)',fontSize:16,color:'rgba(189,212,176,0.75)',lineHeight:1.7,marginBottom:28}}>Seasonal activity ideas, homeschool guides, and platform updates - delivered to Irish families every fortnight. No spam, ever.</p>
            <div style={{display:'flex',gap:10,flexDirection:'column',maxWidth:440,margin:'0 auto'}}>
              <input type="email" placeholder="your@email.ie" style={{background:'rgba(245,240,228,0.08)',border:'1px solid rgba(245,240,228,0.15)',color:'var(--parchment)',borderRadius:4,padding:'14px 18px',fontSize:14,fontFamily:'var(--font-heading)',outline:'none',width:'100%'}} />
              <button style={{background:'var(--sage)',color:'var(--forest)',border:'none',borderRadius:4,padding:'14px 22px',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'var(--font-heading)'}}>Subscribe - it&apos;s free</button>
            </div>
            <p style={{fontSize:11,color:'rgba(143,175,126,0.4)',marginTop:12}}>Unsubscribe any time. We&apos;ll never share your email.</p>
          </div>
        </section>

        <div className="cta-band">
          <div className="container">
            <h2>Put the ideas into <em>practice</em></h2>
            <p>The Hedge delivers personalised activity ideas for your family every morning - based on your children, your weather, and your world.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup" className="btn-light">Start free today <Icon id="arrow-r" size={16} /></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
