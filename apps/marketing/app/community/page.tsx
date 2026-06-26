import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { Icon } from '../../components/Icons';

export const metadata: Metadata = {
  title: 'Community - Connect with Irish Families | The Hedge',
  description: 'Join The Hedge community. County-based groups, homeschool networks, and seasonal activity sharing for Irish families learning together.',
  alternates: { canonical: 'https://thehedge.ie/community' },
};

const ideas = [
  { topic:'Nature', body:"Rock pool identification on a calm morning - bring a bucket, a guide, and let the children name everything they find. Brilliant for a coastal county." },
  { topic:'Homeschool', body:"Keep a simple weekly learning log as you go. When AEARS season comes round, an organised, dated record takes the dread out of the paperwork.", forest:true },
  { topic:'Winter activities', body:"Shadow tracking science: mark a shadow on the ground every hour through the day. Cheap, screen-free, and quietly fascinating for small scientists." },
  { topic:'Irish language', body:"Try the ainmhithe (animals) activities as Gaeilge. Learning a few words in context - madra rua for fox - sticks far better than any worksheet." },
];

const counties = ['Antrim','Armagh','Carlow','Cavan','Clare','Cork','Derry','Donegal','Down','Dublin','Fermanagh','Galway','Kerry','Kildare','Kilkenny','Laois','Leitrim','Limerick','Longford','Louth','Mayo','Meath','Monaghan','Offaly','Roscommon','Sligo','Tipperary','Tyrone','Waterford','Westmeath','Wexford','Wicklow'];

export default function Community() {
  return (
    <>
      <Nav active="/community" />
      <main className="page-pad">
        <div className="page-hero">
          <div className="container">
            <div className="page-hero-eyebrow"><div className="page-hero-eyebrow-line" /><span className="page-hero-eyebrow-text">Families across Ireland</span></div>
            <h1>The families of <em>The Hedge</em></h1>
            <p className="page-hero-desc">From Donegal to Cork, from apartment balconies to West Clare farms. The Hedge is for Irish families learning and exploring together. We are just getting started, and the community is yours to help build.</p>
          </div>
        </div>

        <section className="section section-dark" aria-labelledby="community-title">
          <div className="container">
            <div style={{display:'grid',gap:48}}>
              <div>
                <div className="eyebrow eyebrow-sage"><div className="eyebrow-line" /><span className="eyebrow-text">County groups</span></div>
                <h2 className="section-title section-title-light" id="community-title">Families near <em>you</em></h2>
                <p className="section-body section-body-light" style={{marginBottom:28}}>A group for every county, ready for the families who join. Share activities that work for your local landscape, meet up for nature walks, swap homeschool resources.</p>
                <div className="counties">
                  {counties.map((c,i) => (
                    <span key={c} className={`ctag ${i < 4 ? 'ctag-a' : ''}`}>{c}</span>
                  ))}
                </div>
                <Link href="https://app.thehedge.ie/signup" className="btn-light" style={{marginTop:8,display:'inline-flex'}}>Join your county group <Icon id="arrow-r" size={14} /></Link>
              </div>

              <div>
                <div className="eyebrow eyebrow-sage"><div className="eyebrow-line" /><span className="eyebrow-text">Ideas to share</span></div>
                <h2 className="section-title section-title-light" style={{marginBottom:28}}>The kind of thing <em>we swap</em></h2>
                <div className="post-feed">
                  {ideas.map(p => (
                    <div key={p.topic} className="post">
                      <div className="post-hd">
                        <div className="post-au">
                          <div className="post-av" style={{fontSize:9,fontWeight:700,color:'var(--sage)'}}>
                            <Icon id="leaf" size={12} color="var(--sage)" />
                          </div>
                          <div>
                            <div className="post-name">A Hedge idea</div>
                            <div className="post-when">Try it this week</div>
                          </div>
                        </div>
                        <span className="post-topic">{p.topic}</span>
                      </div>
                      <p className="post-body">{p.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-linen" aria-labelledby="groups-title">
          <div className="container">
            <div className="eyebrow"><div className="eyebrow-line" /><span className="eyebrow-text">Special interest groups</span></div>
            <h2 className="section-title" id="groups-title">Find your <em>people</em></h2>
            <div style={{display:'grid',gap:14,gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',marginTop:32}}>
              {[
                { id:'book', title:'Homeschool Network', body:'For home-educating families across Ireland. Share AEARS tips, curriculum ideas, and co-op opportunities.', badge:'New' },
                { id:'leaf', title:'Nature & Outdoors', body:'Families who prioritise time outside. Identification guides, foraging walks, seasonal challenges, and citizen science projects.', badge:'New' },
                { id:'palette', title:'Arts & Making', body:'For families who make things. Craft-alongs, exhibition sharing, technique tips, and the therapeutic chaos of art with small children.', badge:'New' },
                { id:'flask', title:'Science Families', body:"Kitchen scientists, garden experimenters, and parents who can't stop asking 'but why?' alongside their children.", badge:'New' },
              ].map(g => (
                <div key={g.title} style={{background:'white',borderRadius:14,padding:'24px 20px',border:'1px solid var(--stone)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                    <div style={{width:38,height:38,borderRadius:9,background:'rgba(61,97,66,0.08)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <Icon id={g.id} size={18} color="var(--moss)" />
                    </div>
                    <span style={{fontSize:10,fontWeight:700,background:'rgba(61,97,66,0.08)',color:'var(--moss)',padding:'3px 8px',borderRadius:3}}>{g.badge}</span>
                  </div>
                  <div style={{fontSize:15,fontWeight:700,color:'var(--ink)',marginBottom:7}}>{g.title}</div>
                  <div style={{fontSize:13,color:'var(--clay)',lineHeight:1.65,marginBottom:14}}>{g.body}</div>
                  <Link href="https://app.thehedge.ie/signup" style={{fontSize:12,fontWeight:700,color:'var(--forest)',display:'flex',alignItems:'center',gap:4}}>
                    Join group <Icon id="arrow-r" size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="cta-band">
          <div className="container">
            <h2>Join your county&apos;s <em>community</em></h2>
            <p>Create a free account and find families near you who are doing exactly what you&apos;re trying to do.</p>
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
