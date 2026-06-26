import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';
import NewsletterSignup from '../../components/NewsletterSignup';
import { POSTS } from './posts';

export const metadata: Metadata = {
  title: 'Blog - Family Activity Guides, Homeschool Tips & Irish Seasonal Ideas',
  description: 'Practical guides for Irish families: seasonal activity ideas, homeschooling in Ireland, outdoor learning, and making the most of wherever you live in Ireland.',
  alternates: { canonical: 'https://thehedge.ie/blog' },
};

const categories = ['All','Homeschool','Seasonal Guide','Early Years','Nature & Outdoors'];

// The home-education cluster is the heart of the journal: the high-intent pieces
// anxious Irish families search for. We surface them first, then everything else.
const HOMESCHOOL_ORDER = [
  'register-home-education-ireland-tusla',
  'aears-assessment-what-happens',
  'taking-child-out-of-school-ireland',
  'home-ed-approaches-structured-child-led',
  'home-educating-and-working',
  'tusla-aears-guide',
  'thinking-about-homeschooling-ireland',
];

function BlogCard({ p }: { p: typeof POSTS[number] }) {
  return (
    <article className="blog-card" itemScope itemType="https://schema.org/Article">
      <div className="blog-img-placeholder" style={{background:p.bg}}>
        <Icon id="leaf" size={32} color="rgba(255,255,255,0.15)" />
      </div>
      <div className="blog-content">
        <div className="blog-meta">
          <span className="blog-cat" itemProp="articleSection">{p.cat}</span>
          <span className="blog-date"><time itemProp="datePublished" dateTime={p.isoDate}>{p.date}</time></span>
          <span style={{fontSize:11,color:'var(--clay)'}}>{p.readTime}</span>
        </div>
        <h2 className="blog-title" itemProp="headline">{p.title.replace(p.titleEm, '')}<em>{p.titleEm}</em></h2>
        <p className="blog-excerpt" itemProp="description">{p.excerpt}</p>
        <Link href={`/blog/${p.slug}`} className="blog-read" aria-label={`Read: ${p.title}`}>
          Read article <Icon id="arrow-r" size={12} />
        </Link>
      </div>
    </article>
  );
}

export default function Blog() {
  const homeschoolPosts = HOMESCHOOL_ORDER
    .map(slug => POSTS.find(p => p.slug === slug))
    .filter((p): p is typeof POSTS[number] => Boolean(p));
  const otherPosts = POSTS
    .filter(p => !HOMESCHOOL_ORDER.includes(p.slug))
    .sort((a, b) => b.isoDate.localeCompare(a.isoDate));

  return (
    <>
      <Nav active="/blog" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">Guides &amp; ideas</span></div>
            <h1>The Hedge <em>journal</em></h1>
            <p className="page-hero-desc">Home education in Ireland, seasonal activity guides, and outdoor learning - calm, accurate, plain-English help for families, wherever you live in Ireland.</p>
          </div>
        </div>

        <section className="section" aria-labelledby="blog-title">
          <div className="container">
            {/* Categories */}
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:40}} role="navigation" aria-label="Blog categories">
              {categories.map((c,i) => (
                <span key={c} style={{padding:'7px 14px',borderRadius:4,border:i===0?'1.5px solid var(--forest)':'1px solid var(--stone)',background:i===0?'var(--forest)':'transparent',color:i===0?'var(--parchment)':'var(--clay)',fontSize:13,fontWeight:600,fontFamily:'var(--font-heading)'}}>{c}</span>
              ))}
            </div>

            {/* HOME EDUCATION HUB */}
            <div id="home-education">
              <div className="page-hero-eyebrow" style={{marginBottom:12}}><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">For home-educating families</span></div>
              <h2 className="section-title" id="blog-title" style={{marginBottom:12}}>Home education <em>in Ireland</em></h2>
              <p style={{fontFamily:'var(--font-serif)',fontSize:16,color:'var(--clay)',lineHeight:1.7,marginBottom:32,maxWidth:640}}>Registering with Tusla, the AEARS assessment, taking a child out of school, choosing your approach, and making the days fit around work. Plain-English, accurate, and on your side. Not affiliated with Tusla.</p>
              <div className="blog-grid">
                {homeschoolPosts.map(p => <BlogCard key={p.slug} p={p} />)}
              </div>
            </div>

            {otherPosts.length > 0 && (
              <div style={{marginTop:64}}>
                <h2 className="section-title" style={{marginBottom:32}}>More from the <em>journal</em></h2>
                <div className="blog-grid">
                  {otherPosts.map(p => <BlogCard key={p.slug} p={p} />)}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="section section-forest" aria-labelledby="nl-title">
          <div className="container" style={{maxWidth:600,textAlign:'center'}}>
            <div className="eyebrow eyebrow-sage" style={{justifyContent:'center'}}><div className="eyebrow-line" /><span className="eyebrow-text">Stay in the loop</span></div>
            <h2 className="section-title section-title-light" id="nl-title">New guides <em>every fortnight</em></h2>
            <p style={{fontFamily:'var(--font-serif)',fontSize:16,color:'rgba(189,212,176,0.75)',lineHeight:1.7,marginBottom:28}}>Seasonal activity ideas, homeschool guides, and platform updates for Irish families. No spam, ever.</p>
            <NewsletterSignup source="blog-newsletter" variant="light" buttonLabel="Subscribe" />
            <p style={{fontSize:11,color:'rgba(143,175,126,0.4)',marginTop:12}}>We&apos;ll never share your email.</p>
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
