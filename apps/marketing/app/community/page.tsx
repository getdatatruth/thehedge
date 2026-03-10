import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

export const metadata: Metadata = {
  title: 'Community — Irish Family Learning Groups by County',
  description: 'Connect with The Hedge families in your county. Share activities, local tips, and seasonal ideas with other Irish families who love outdoor learning.',
  alternates: { canonical: 'https://thehedge.ie/community' },
};

const posts = [
  { name: 'Siobhán M.', county: 'Cork', topic: 'Nature', when: '2h ago', body: 'Took the kids to Lough Hyne for the first time after The Hedge suggested it. Completely magical — we found three types of anemone and the kids are now obsessed with marine biology.', replies: 14 },
  { name: 'Pádraig O.', county: 'Kerry', topic: 'Homeschool', when: '5h ago', body: 'Just sent off our AEARS log for this year — used The Hedge PDF export for the first time. The assessor replied within 24 hours saying it was the most thorough log she\'d received. 🌿', replies: 31 },
  { name: 'Áine B.', county: 'Galway', topic: 'Recipe', when: '1d ago', body: 'Made the seaweed bread activity from last week\'s plan. My 7 year old is now insisting we do it every Sunday. We\'ve started collecting different seaweeds from the beach to compare flavours.', replies: 8 },
  { name: 'Tomás F.', county: 'Clare', topic: 'Tip', when: '2d ago', body: 'Pro tip for wet-weather weeks: combine the "indoor volcano" science activity with the "letter to a scientist" writing activity. Kids write a letter explaining their experiment results. Covers SESE + English in one go.', replies: 22 },
];

const counties = ['Antrim','Armagh','Carlow','Cavan','Clare','Cork','Derry','Donegal','Down','Dublin','Fermanagh','Galway','Kerry','Kildare','Kilkenny','Laois','Leitrim','Limerick','Longford','Louth','Mayo','Meath','Monaghan','Offaly','Roscommon','Sligo','Tipperary','Tyrone','Waterford','Westmeath','Wexford','Wicklow'];

export default function Community() {
  return (
    <>
      <Nav active="/community" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">You&apos;re not alone</span></div>
            <h1>A community of <em>Irish families</em></h1>
            <p className="page-hero-desc">2,400+ families across all 32 counties, sharing what works, what&apos;s magical, and what to do on a wet Tuesday in January.</p>
          </div>
        </div>

        <section className="section section-forest" aria-labelledby="feed-heading">
          <div className="container">
            <div className="eyebrow eyebrow-sage"><div className="eyebrow-line" /><span className="eyebrow-text">From the community this week</span></div>
            <h2 className="section-title section-title-light" id="feed-heading" style={{marginBottom:32}}>What families are <em>sharing</em></h2>
            <div className="post-feed">
              {posts.map((p, i) => (
                <div className="post" key={i}>
                  <div className="post-hd">
                    <div className="post-au">
                      <div className="post-av"><span style={{fontSize:10,fontWeight:700,color:'var(--sage)'}}>{p.name[0]}</span></div>
                      <div>
                        <div className="post-name">{p.name}</div>
                        <div className="post-when">{p.county} · {p.when}</div>
                      </div>
                    </div>
                    <span className="post-topic">{p.topic}</span>
                  </div>
                  <p className="post-body">{p.body}</p>
                  <div className="post-rep"><Icon id="msg" size={12} color="var(--sage)" />{p.replies} replies</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:28,textAlign:'center'}}>
              <Link href="https://app.thehedge.ie/signup" className="btn-light">Join the community <Icon id="arrow-r" size={16} /></Link>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="counties-heading">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">All 32 counties</span></div>
            <h2 className="section-title" id="counties-heading">Find your <em>county group</em></h2>
            <p className="section-body" style={{maxWidth:560}}>Every county has its own group — for sharing local walks, beaches, events, and activities that only make sense if you know the place.</p>
            <div className="counties">
              {counties.map(c => (
                <Link key={c} href={`https://app.thehedge.ie/community/${c.toLowerCase()}`} className={`ctag ${c==='Cork'?'ctag-a':''}`}>{c}</Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-linen" aria-labelledby="values-heading">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Our community values</span></div>
            <h2 className="section-title" id="values-heading">A kind, <em>generous space</em></h2>
            <div className="feat-trio" style={{marginTop:32}}>
              {[
                { id:'heart', title:'Judgment-free', body:'Whether you homeschool, unschool, go mainstream, or muddle through — you\'re welcome here. We don\'t compare or compete. We share.' },
                { id:'clover', title:'Rooted in Ireland', body:'This is a community for Irish families. Our references, our seasons, our language, and our humour are distinctly Irish.' },
                { id:'shield', title:'Private by default', body:'The community is only accessible to Hedge members. No public profiles, no data sharing. A private, safe space for families.' },
              ].map(v => (
                <div key={v.id} style={{padding:'28px 24px',background:'var(--parchment)',borderRadius:16,border:'1px solid var(--stone)'}}>
                  <div style={{width:42,height:42,borderRadius:11,background:'rgba(61,97,66,0.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
                    <Icon id={v.id} size={20} color="var(--moss)" />
                  </div>
                  <div style={{fontSize:16,fontWeight:700,color:'var(--ink)',marginBottom:8}}>{v.title}</div>
                  <div style={{fontSize:13,color:'var(--clay)',lineHeight:1.65}}>{v.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="cta-band">
          <div className="container">
            <h2>Find your <em>people</em></h2>
            <p>Join 2,400+ Irish families already sharing, learning, and growing together.</p>
            <div className="actions">
              <Link href="https://app.thehedge.ie/signup" className="btn-light">Join for free <Icon id="arrow-r" size={16} /></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
