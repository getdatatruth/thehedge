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

const categories = ['All','Seasonal Guide','Homeschool','Early Years','Nature & Outdoors'];

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
                <span key={c} style={{padding:'7px 14px',borderRadius:4,border:i===0?'1.5px solid var(--forest)':'1px solid var(--stone)',background:i===0?'var(--forest)':'transparent',color:i===0?'var(--parchment)':'var(--clay)',fontSize:13,fontWeight:600,fontFamily:'var(--font-heading)'}}>{c}</span>
              ))}
            </div>

            <h2 className="section-title" id="blog-title" style={{marginBottom:32}}>Latest <em>articles</em></h2>
            <div className="blog-grid">
              {POSTS.map(p => (
                <article key={p.slug} className="blog-card" itemScope itemType="https://schema.org/Article">
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
              ))}
            </div>
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
