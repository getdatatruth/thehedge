import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { Icon } from '../../../components/Icons';
import NewsletterSignup from '../../../components/NewsletterSignup';
import { POSTS, getPost, type Block } from '../posts';

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return { title: 'Article not found' };
  }
  const url = `https://thehedge.ie/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.isoDate,
    },
  };
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case 'h2':
      return (
        <h2
          key={i}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px,4vw,34px)',
            fontWeight: 300,
            color: 'var(--ink)',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            margin: '40px 0 16px',
          }}
        >
          {block.text}
        </h2>
      );
    case 'h3':
      return (
        <h3
          key={i}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '28px 0 10px',
          }}
        >
          {block.text}
        </h3>
      );
    case 'p':
      return (
        <p
          key={i}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(16px,2.5vw,19px)',
            color: 'var(--clay)',
            lineHeight: 1.75,
            marginBottom: 18,
          }}
        >
          {block.text}
        </p>
      );
    case 'ul':
      return (
        <ul key={i} style={{ margin: '0 0 22px', paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {block.items.map((it, j) => (
            <li
              key={j}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(15px,2.4vw,18px)',
                color: 'var(--clay)',
                lineHeight: 1.65,
                listStyleType: 'disc',
              }}
            >
              {it}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={i} style={{ margin: '0 0 22px', paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {block.items.map((it, j) => (
            <li
              key={j}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(15px,2.4vw,18px)',
                color: 'var(--clay)',
                lineHeight: 1.65,
                listStyleType: 'decimal',
              }}
            >
              {it}
            </li>
          ))}
        </ol>
      );
    case 'callout':
      return (
        <aside
          key={i}
          style={{
            background: 'var(--linen)',
            border: '1px solid var(--stone)',
            borderLeft: '3px solid var(--terracotta)',
            borderRadius: 12,
            padding: '20px 22px',
            margin: '24px 0',
          }}
        >
          {block.title && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--terracotta)',
                marginBottom: 8,
              }}
            >
              {block.title}
            </div>
          )}
          <div style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.65 }}>{block.text}</div>
        </aside>
      );
    case 'quote':
      return (
        <blockquote
          key={i}
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(18px,3vw,22px)',
            color: 'var(--moss)',
            lineHeight: 1.6,
            borderLeft: '3px solid var(--sage)',
            paddingLeft: 20,
            margin: '28px 0',
          }}
        >
          {block.text}
        </blockquote>
      );
    default:
      return null;
  }
}

export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `https://thehedge.ie/blog/${post.slug}`;

  // Real Article JSON-LD. No fabricated ratings or reviews.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.isoDate,
    dateModified: post.isoDate,
    articleSection: post.cat,
    inLanguage: 'en-IE',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Person', name: "Adam O'Flynn" },
    publisher: {
      '@type': 'Organization',
      name: 'The Hedge',
      url: 'https://thehedge.ie',
    },
  };

  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav active="/blog" />
      <main className="page-pad">
        {/* HERO */}
        <div className="page-hero" style={{ background: post.bg }}>
          <div className="container" style={{ maxWidth: 800 }}>
            <Link
              href="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--sage)',
                marginBottom: 18,
              }}
            >
              <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
                <Icon id="arrow-r" size={12} />
              </span>
              All articles
            </Link>
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                marginBottom: 16,
                fontSize: 12,
                color: 'rgba(200,220,185,0.85)',
              }}
            >
              <span style={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--sage)' }}>
                {post.cat}
              </span>
              <span>·</span>
              <time dateTime={post.isoDate}>{post.date}</time>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
            <h1>{post.title}</h1>
            <p className="page-hero-desc" style={{ marginTop: 14 }}>{post.excerpt}</p>
          </div>
        </div>

        {/* BODY */}
        <section className="section">
          <div className="container" style={{ maxWidth: 760 }}>
            <article>{post.body.map((b, i) => renderBlock(b, i))}</article>

            {/* In-article CTA */}
            <div
              style={{
                marginTop: 44,
                padding: '28px 26px',
                background: 'var(--forest)',
                borderRadius: 16,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(22px,4vw,30px)',
                  fontWeight: 300,
                  color: 'var(--parchment)',
                  lineHeight: 1.1,
                  marginBottom: 10,
                }}
              >
                A calmer way to learn together
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 16,
                  color: 'rgba(189,212,176,0.8)',
                  lineHeight: 1.6,
                  marginBottom: 20,
                  maxWidth: 480,
                  margin: '0 auto 20px',
                }}
              >
                The Hedge suggests activities suited to your children, the season, and your local weather, and keeps a tidy log as you go. Free to start.
              </p>
              <Link href="https://app.thehedge.ie/signup" className="btn-light" style={{ display: 'inline-flex' }}>
                Start free today <Icon id="arrow-r" size={16} />
              </Link>
            </div>

            {/* Homeschool-focused capture */}
            <div
              style={{
                marginTop: 20,
                padding: '26px 24px',
                background: 'var(--linen)',
                border: '1px solid var(--stone)',
                borderRadius: 16,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
                Get the home education guides
              </div>
              <p style={{ fontSize: 14, color: 'var(--clay)', lineHeight: 1.6, marginBottom: 14 }}>
                Plain-English notes on AEARS, the NCCA strands, and Aistear at home, sent now and then. No spam, ever.
              </p>
              <NewsletterSignup source={`article:${post.slug}`} variant="footer" buttonLabel="Send me the guides" />
            </div>
          </div>
        </section>

        {/* RELATED */}
        {related.length > 0 && (
          <section className="section section-linen">
            <div className="container">
              <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Keep reading</span></div>
              <h2 className="section-title" style={{ marginBottom: 28 }}>More from the <em>journal</em></h2>
              <div className="blog-grid">
                {related.map((p) => (
                  <article key={p.slug} className="blog-card">
                    <div className="blog-img-placeholder" style={{ background: p.bg }}>
                      <Icon id="leaf" size={32} color="rgba(255,255,255,0.15)" />
                    </div>
                    <div className="blog-content">
                      <div className="blog-meta">
                        <span className="blog-cat">{p.cat}</span>
                        <span className="blog-date">{p.date}</span>
                      </div>
                      <h3 className="blog-title">{p.title}</h3>
                      <p className="blog-excerpt">{p.excerpt}</p>
                      <Link href={`/blog/${p.slug}`} className="blog-read">
                        Read article <Icon id="arrow-r" size={12} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
