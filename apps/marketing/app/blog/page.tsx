import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

export const metadata: Metadata = {
  title: 'Blog — Family Learning Guides for Irish Families',
  description: 'Practical guides, seasonal activity ideas, homeschooling advice, and Irish family life. Written by The Hedge team and Irish families across all 32 counties.',
  alternates: { canonical: 'https://thehedge.ie/blog' },
};

const featured = {
  slug: 'aears-assessment-guide-ireland',
  cat: 'Homeschool',
  date: 'October 2025',
  title: 'The Complete Guide to AEARS Assessments in Ireland',
  excerpt: 'Everything Irish homeschooling families need to know about the Tusla AEARS assessment process — what assessors look for, how to prepare your learning log, and how The Hedge makes it easier.',
  readTime: '12 min read',
  gradient: 'linear-gradient(135deg, #1C3520, #3D6142)',
};

const articles = [
  { slug: 'winter-activities-ireland', cat: 'Seasonal', date: 'Nov 2025', title: '40 Winter Activities for Irish Families', excerpt: 'From storm-watching on the Burren to making sloe gin jam in the kitchen — our favourite winter activities for Irish families when the days are short.', readTime: '8 min', gradient: 'linear-gradient(135deg, #2a4a5e, #3d7a8a)' },
  { slug: 'homeschool-ireland-beginners', cat: 'Homeschool', date: 'Oct 2025', title: "Starting to Homeschool in Ireland: A Beginner's Guide", excerpt: "The practical, honest guide we wish we'd had when we started. Tusla notification, AEARS, curriculum choices, and finding your community.", readTime: '15 min', gradient: 'linear-gradient(135deg, #3D6142, #5E8B52)' },
  { slug: 'screen-free-weekends', cat: 'Family Life', date: 'Oct 2025', title: 'How to Plan a Screen-Free Weekend (Without the Meltdowns)', excerpt: "Honest advice from families who've done it. What works, what doesn't, and how The Hedge makes screen-free weekends genuinely enjoyable for everyone.", readTime: '6 min', gradient: 'linear-gradient(135deg, #8B6B4A, #C4623A)' },
  { slug: 'nature-journalling-kids', cat: 'Activities', date: 'Sep 2025', title: "Nature Journalling with Children: A Beginner's Guide", excerpt: 'Nature journalling is one of the richest, simplest activities you can do with children of any age. Here\'s how to start — and keep going.', readTime: '7 min', gradient: 'linear-gradient(135deg, #1C3520, #5E8B52)' },
  { slug: 'irish-seasons-activities', cat: 'Irish Heritage', date: 'Sep 2025', title: 'The Four Seasons of the Irish Year: Activities for Each', excerpt: 'Samhain, Imbolc, Bealtaine, Lúnasa — the original Irish calendar offers a rich framework for family learning rooted in the land.', readTime: '10 min', gradient: 'linear-gradient(135deg, #C9922E, #8B6B4A)' },
  { slug: 'outdoor-learning-wet-weather', cat: 'Practical', date: 'Aug 2025', title: 'Outdoor Learning in Irish Weather (Yes, Even the Rain)', excerpt: "You can't wait for perfect weather in Ireland — you'd wait forever. Here's how to make outdoor learning work in drizzle, mist, and full-on Atlantic rain.", readTime: '9 min', gradient: 'linear-gradient(135deg, #2a3a5e, #3D6142)' },
];

const categories = ['All','Seasonal','Homeschool','Activities','Irish Heritage','Family Life','Practical'];

export default function Blog() {
  return (
    <>
      <Nav active="/blog" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">Guides & ideas</span></div>
            <h1>The Hedge <em>journal</em></h1>
            <p className="page-hero-desc">Practical guides, seasonal ideas, and honest writing about family learning in Ireland. No fluff, no American templates.</p>
          </div>
        </div>

        <section className="section" aria-labelledby="featured-heading">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Featured article</span></div>
            <h2 className="section-title" id="featured-heading" style={{marginBottom:24}}>Essential <em>reading</em></h2>
            <Link href={`/blog/${featured.slug}`} className="blog-card" style={{display:'block',borderRadius:20,overflow:'hidden',textDecoration:'none'}}>
              <div style={{height:220,background:featured.gradient,display:'flex',alignItems:'flex-end',padding:'28px 32px'}}>
                <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',background:'rgba(245,240,228,0.15)',color:'var(--parchment)',padding:'4px 10px',borderRadius:3}}>{featured.cat}</span>
              </div>
              <div style={{padding:'28px 28px 32px'}}>
                <div style={{display:'flex',gap:12,marginBottom:12}}>
                  <span style={{fontSize:11,color:'var(--clay)'}}>{featured.date}</span>
                  <span style={{fontSize:11,color:'var(--clay)'}}>· {featured.readTime}</span>
                </div>
                <h3 style={{fontFamily:'var(--font-display)',fontSize:'clamp(22px,4vw,34px)',fontWeight:400,color:'var(--ink)',lineHeight:1.15,marginBottom:12}}>{featured.title}</h3>
                <p style={{fontSize:14,color:'var(--clay)',lineHeight:1.65,marginBottom:16}}>{featured.excerpt}</p>
                <span style={{fontSize:13,fontWeight:600,color:'var(--forest)',display:'flex',alignItems:'center',gap:5}}>Read article <Icon id="arrow-r" size={14} /></span>
              </div>
            </Link>
          </div>
        </section>

        <section className="section section-linen" aria-labelledby="all-posts-heading">
          <div className="container">
            <h2 className="section-title" id="all-posts-heading" style={{marginBottom:28}}>All <em>articles</em></h2>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:32}} role="list" aria-label="Blog categories">
              {categories.map((c,i) => (
                <span key={c} style={{padding:'7px 16px',borderRadius:4,border:`1px solid ${i===0?'var(--forest)':'var(--stone)'}`,background:i===0?'var(--forest)':'transparent',color:i===0?'var(--parchment)':'var(--clay)',fontSize:13,fontWeight:i===0?700:500,display:'inline-block'}}>
                  {c}
                </span>
              ))}
            </div>
            <div className="blog-grid">
              {articles.map(a => (
                <Link key={a.slug} href={`/blog/${a.slug}`} className="blog-card">
                  <div className="blog-img-placeholder" style={{background:a.gradient,height:160}} />
                  <div className="blog-content">
                    <div className="blog-meta">
                      <span className="blog-cat">{a.cat}</span>
                      <span className="blog-date">{a.date} · {a.readTime}</span>
                    </div>
                    <h3 className="blog-title">{a.title}</h3>
                    <p className="blog-excerpt">{a.excerpt}</p>
                    <span className="blog-read">Read article <Icon id="arrow-r" size={13} /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="cta-band">
          <div className="container">
            <h2>Put the ideas <em>into practice</em></h2>
            <p>The Hedge turns these ideas into personalised daily plans for your family, automatically.</p>
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
