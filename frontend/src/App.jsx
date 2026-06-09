import React, { useState, useEffect } from 'react';
import {
  BrowserRouter, Link, NavLink, Routes, Route,
  useNavigate, Navigate, useLocation, useParams
} from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from './api';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

const CAT = {
  Environment: { bg: 'linear-gradient(135deg,#bbf7d0,#6ee7b7)', icon: '🌿' },
  Community:   { bg: 'linear-gradient(135deg,#bfdbfe,#93c5fd)', icon: '🤝' },
  Business:    { bg: 'linear-gradient(135deg,#fde68a,#fbbf24)', icon: '🏪' },
  Health:      { bg: 'linear-gradient(135deg,#fecaca,#f87171)', icon: '💚' },
  Education:   { bg: 'linear-gradient(135deg,#e9d5ff,#c084fc)', icon: '📚' },
};

// ─── Layout ───────────────────────────────────────────────────────────────────
function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() { logout(); setOpen(false); navigate('/'); }

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-spark">✦</span> SocialSpark
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/campaigns">Campaigns</NavLink>
          <NavLink to="/about">About</NavLink>
          {user && <NavLink to="/submit">Post Campaign</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-greeting">Hi, {user.fullName.split(' ')[0]} 👋</span>
              <button className="btn-nav-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline-light">Login</Link>
              <Link to="/register" className="btn btn-green">Sign Up</Link>
            </>
          )}
        </div>
        <button className="hamburger" onClick={() => setOpen(o => !o)}>{open ? '✕' : '☰'}</button>
      </div>
      {open && (
        <div className="mobile-menu">
          <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/campaigns" onClick={() => setOpen(false)}>Campaigns</NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)}>About</NavLink>
          {user && <NavLink to="/submit" onClick={() => setOpen(false)}>Post Campaign</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" onClick={() => setOpen(false)}>Admin Dashboard</NavLink>}
          {user
            ? <button className="mobile-logout-btn" onClick={handleLogout}>Logout</button>
            : <>
                <NavLink to="/login" onClick={() => setOpen(false)}>Login</NavLink>
                <NavLink to="/register" onClick={() => setOpen(false)}>Sign Up</NavLink>
              </>
          }
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo"><span className="brand-spark">✦</span> SocialSpark</div>
            <p>Connecting communities with causes that matter.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/campaigns">Campaigns</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/submit">Post a Campaign</Link></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/help">Help Centre</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SocialSpark. Built for communities.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Campaign Card ────────────────────────────────────────────────────────────
function CampaignCard({ campaign }) {
  const s = CAT[campaign.category] || CAT.Community;
  return (
    <article className="campaign-card">
      <div className="campaign-image" style={{ background: s.bg }}>
        <span className="campaign-cat-icon">{s.icon}</span>
      </div>
      <div className="campaign-content">
        <span className="badge">{campaign.category}</span>
        <h3>{campaign.title}</h3>
        <p>{campaign.description}</p>
        {campaign.authorName && (
          <p className="campaign-author">Posted by {campaign.authorName}</p>
        )}
        <Link to={`/campaign/${campaign._id}`} className="btn-outline-blue">Learn More →</Link>
      </div>
    </article>
  );
}

// ─── Campaign Detail ──────────────────────────────────────────────────────────
function CampaignDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.campaigns().then(all => {
      setCampaign(all.find(c => c._id === id) || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <AppLayout><div className="container" style={{padding:'80px 0'}}><p className="loading-text">Loading...</p></div></AppLayout>;
  if (!campaign) return <NotFoundPage />;
  const s = CAT[campaign.category] || CAT.Community;

  return (
    <AppLayout>
      <div className="campaign-detail-hero" style={{ background: s.bg }}>
        <div className="container">
          <span style={{fontSize:56}}>{s.icon}</span>
          <span className="badge" style={{display:'block',width:'fit-content',margin:'12px 0'}}>{campaign.category}</span>
          <h1 style={{fontSize:40,margin:'0 0 10px',color:'#1e293b'}}>{campaign.title}</h1>
          {campaign.authorName && <p style={{color:'#475569'}}>Posted by <strong>{campaign.authorName}</strong></p>}
        </div>
      </div>
      <section className="section">
        <div className="container" style={{maxWidth:740}}>
          <div className="detail-card">
            <h2>About this campaign</h2>
            <p style={{lineHeight:1.8,color:'#334155',fontSize:16,marginTop:12}}>{campaign.description}</p>
            <div className="detail-actions">
              {user
                ? <Link to="/submit" className="btn btn-green">Support this — Post your own campaign</Link>
                : <Link to="/register" className="btn btn-green">Join to support this cause</Link>
              }
              <Link to="/campaigns" className="btn-outline-blue">← Back to campaigns</Link>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomePage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  useEffect(() => { api.campaigns().then(d => setCampaigns(d.slice(0,3))).catch(()=>{}); }, []);

  return (
    <AppLayout>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Social awareness platform</p>
            <h1>Support causes that matter in your community</h1>
            <p className="hero-text">Browse campaigns, post your own cause, and give small local businesses a place to be seen.</p>
            <div className="hero-buttons">
              <Link to="/campaigns" className="btn btn-green">Explore Campaigns</Link>
              {user
                ? <Link to="/submit" className="btn btn-light">Post a Campaign</Link>
                : <Link to="/register" className="btn btn-light">Create Account</Link>
              }
            </div>
          </div>
          <div className="hero-card-wrap">
            <div className="hero-card">
              <div className="hero-stats-grid">
                <div className="stat-box stat-green"><p>Campaigns</p><h3>6+</h3></div>
                <div className="stat-box stat-blue"><p>Members</p><h3>138+</h3></div>
                <div className="stat-box stat-purple"><p>Categories</p><h3>5</h3></div>
                <div className="stat-box stat-amber"><p>Cities</p><h3>1</h3></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <div className="section-heading" style={{textAlign:'center'}}>
            <p className="eyebrow green-text">How it works</p>
            <h2>Three simple steps</h2>
          </div>
          <div className="card-grid three-col" style={{marginTop:32}}>
            {[
              {icon:'🔍',step:'01',title:'Browse Causes',text:'Explore campaigns across five categories — find causes that matter to you.'},
              {icon:'👤',step:'02',title:'Create an Account',text:'Sign up free as a community member or small business owner.'},
              {icon:'📢',step:'03',title:'Post Your Campaign',text:'Submit your cause. Once approved by our team it goes live for the community.'},
            ].map(f => (
              <div key={f.step} className="how-card">
                <div className="how-icon">{f.icon}</div>
                <div className="how-step">{f.step}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:12}}>
            <div>
              <p className="eyebrow green-text">Featured</p>
              <h2>Featured campaigns</h2>
            </div>
            <Link to="/campaigns" className="btn-outline-blue">View all →</Link>
          </div>
          <div className="card-grid three-col" style={{marginTop:24}}>
            {campaigns.map(c => <CampaignCard key={c._id} campaign={c} />)}
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <div className="container cta-inner">
          <div>
            <h2>Have a cause you care about?</h2>
            <p>Post your campaign and reach hundreds of people in your community.</p>
          </div>
          {user
            ? <Link to="/submit" className="btn btn-green btn-lg">Post a Campaign</Link>
            : <Link to="/register" className="btn btn-green btn-lg">Get Started — It's Free</Link>
          }
        </div>
      </section>
    </AppLayout>
  );
}

// ─── Campaigns ────────────────────────────────────────────────────────────────
function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const categories = ['All','Environment','Community','Business','Health','Education'];

  useEffect(() => {
    setLoading(true);
    api.campaigns(category).then(d => setCampaigns(d)).catch(()=>{}).finally(()=>setLoading(false));
  }, [category]);

  return (
    <AppLayout>
      <div className="page-hero">
        <div className="container">
          <p className="eyebrow">Browse</p>
          <h1>Community campaigns</h1>
          <p className="page-hero-sub">Discover approved causes in your local area.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="category-pills">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`pill ${category===c?'pill-active':''}`}>
                {CAT[c] && <span style={{marginRight:4}}>{CAT[c].icon}</span>}{c}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="card-grid three-col" style={{marginTop:28}}>
              {[1,2,3].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img"/>
                  <div className="skeleton-body">
                    <div className="skeleton-line"/><div className="skeleton-line short"/><div className="skeleton-line"/>
                  </div>
                </div>
              ))}
            </div>
          ) : campaigns.length > 0 ? (
            <div className="card-grid three-col" style={{marginTop:28}}>
              {campaigns.map(c => <CampaignCard key={c._id} campaign={c} />)}
            </div>
          ) : (
            <div className="empty-state">
              <p style={{fontSize:40}}>😔</p>
              <p>No campaigns in this category yet.</p>
              <Link to="/submit" className="btn btn-green" style={{marginTop:16}}>Be the first to post one</Link>
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <AppLayout>
      <div className="page-hero">
        <div className="container">
          <p className="eyebrow">Our story</p>
          <h1>About SocialSpark</h1>
          <p className="page-hero-sub">Built by students, for communities.</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{maxWidth:760}}>
          <div className="prose-card">
            <h2>What is SocialSpark?</h2>
            <p>SocialSpark is a community-facing social awareness web application built to connect residents with local campaigns and causes. The platform gives everyday users a place to discover and support campaigns they care about, while giving small businesses a simple space to promote their services.</p>
            <h2>Our mission</h2>
            <p>We believe communities are stronger when people are informed and connected. SocialSpark makes it easy to discover what's happening locally, share causes you care about, and rally support from the people around you.</p>
            <h2>Who is it for?</h2>
            <ul>
              <li><strong>Community members</strong> — discover and support local campaigns</li>
              <li><strong>Small business owners</strong> — promote services and events to a local audience</li>
              <li><strong>Campaign organisers</strong> — share your cause and recruit supporters</li>
            </ul>
            <h2>How campaigns work</h2>
            <p>Anyone can register and submit a campaign. All submissions are reviewed by our admin team before going live to ensure the platform stays relevant and trustworthy.</p>
            <div style={{marginTop:28}}>
              <Link to="/register" className="btn btn-green" style={{marginRight:12}}>Join SocialSpark</Link>
              <Link to="/campaigns" className="btn-outline-blue">Browse Campaigns</Link>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQPage() {
  const [open, setOpen] = useState(null);
  const faqs = [
    {q:'Is SocialSpark free to use?', a:'Yes, SocialSpark is completely free for all users — community members, small businesses, and campaign organisers.'},
    {q:'How do I post a campaign?', a:'Create an account, log in, then click "Post Campaign" in the navigation. Fill in your campaign details and submit. Your campaign will be reviewed and published once approved.'},
    {q:'How long does approval take?', a:'Most campaigns are reviewed within 24 to 48 hours. Your campaign will appear on the Campaigns page once approved.'},
    {q:'Can small businesses post campaigns?', a:'Absolutely. When registering, select "Small business owner" as your account type. You can then post campaigns to promote services, events, or offers.'},
    {q:'What categories are available?', a:'Campaigns can be posted under five categories: Environment, Community, Business, Health, and Education.'},
    {q:'What happens if my campaign is rejected?', a:'If your campaign does not meet our community guidelines it may be rejected. You are welcome to revise and resubmit.'},
    {q:'How do I contact the SocialSpark team?', a:'Use our Contact Us page. We aim to respond within 2 business days.'},
  ];
  return (
    <AppLayout>
      <div className="page-hero">
        <div className="container">
          <p className="eyebrow">Help</p>
          <h1>Frequently asked questions</h1>
          <p className="page-hero-sub">Everything you need to know about SocialSpark.</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{maxWidth:740}}>
          <div className="faq-list">
            {faqs.map((f,i) => (
              <div key={i} className={`faq-item ${open===i?'faq-open':''}`}>
                <button className="faq-question" onClick={() => setOpen(open===i?null:i)}>
                  <span>{f.q}</span><span className="faq-chevron">{open===i?'▲':'▼'}</span>
                </button>
                {open===i && <div className="faq-answer"><p>{f.a}</p></div>}
              </div>
            ))}
          </div>
          <div className="faq-cta">
            <p>Still have questions?</p>
            <Link to="/contact" className="btn btn-blue">Contact Us</Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

// ─── Help ─────────────────────────────────────────────────────────────────────
function HelpPage() {
  return (
    <AppLayout>
      <div className="page-hero">
        <div className="container">
          <p className="eyebrow">Support</p>
          <h1>Help Centre</h1>
          <p className="page-hero-sub">Step-by-step guides to get started.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="card-grid three-col">
            {[
              {icon:'👤',title:'Getting started',steps:['Go to the Register page','Enter your name, email and password','Choose Community member or Small business owner','Click Create Account']},
              {icon:'📢',title:'Posting a campaign',steps:['Log in to your account','Click Post Campaign in the nav','Fill in title, description and category','Click Submit Campaign','Wait for admin approval (24–48 hrs)']},
              {icon:'🔍',title:'Finding campaigns',steps:['Click Campaigns in the nav','Use the category filter pills','Click Learn More for full details','Share the campaign with others']},
            ].map(card => (
              <div key={card.title} className="help-card">
                <div className="help-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <ol>{card.steps.map((s,i) => <li key={i}>{s}</li>)}</ol>
              </div>
            ))}
          </div>
          <div className="help-bottom">
            <p>Can't find what you're looking for?</p>
            <Link to="/faq" className="btn-outline-blue" style={{marginRight:12}}>Read the FAQ</Link>
            <Link to="/contact" className="btn btn-blue">Contact us</Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

// ─── Privacy ──────────────────────────────────────────────────────────────────
function PrivacyPage() {
  return (
    <AppLayout>
      <div className="page-hero">
        <div className="container">
          <p className="eyebrow">Legal</p>
          <h1>Privacy Policy</h1>
          <p className="page-hero-sub">Last updated: {new Date().toLocaleDateString('en-AU',{year:'numeric',month:'long',day:'numeric'})}</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{maxWidth:760}}>
          <div className="prose-card">
            <h2>What information we collect</h2>
            <p>When you register, we collect your full name, email address, and a securely hashed password. We never store plain text passwords.</p>
            <h2>How we use your information</h2>
            <p>Your information is used solely to operate SocialSpark — to authenticate your account and display your name when you post campaigns. We do not sell or share your personal information.</p>
            <h2>Cookies and local storage</h2>
            <p>SocialSpark uses browser localStorage to store your authentication token so you remain logged in. No third-party tracking cookies are used.</p>
            <h2>Data security</h2>
            <p>All passwords are hashed using bcrypt. Your data is stored on MongoDB Atlas with encryption at rest.</p>
            <h2>Your rights</h2>
            <p>You may request deletion of your account at any time by contacting us via the <Link to="/contact" className="text-link">Contact Us</Link> page.</p>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function ContactPage() {
  const [form, setForm] = useState({name:'',email:'',message:''});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  function onChange(e) { setForm(p=>({...p,[e.target.name]:e.target.value})); }
  function onSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name='Name is required.';
    if (!form.email.trim()) errs.email='Email is required.';
    if (!form.message.trim()) errs.message='Message is required.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitted(true);
  }
  return (
    <AppLayout>
      <div className="page-hero">
        <div className="container">
          <p className="eyebrow">Get in touch</p>
          <h1>Contact Us</h1>
          <p className="page-hero-sub">We'd love to hear from you.</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{maxWidth:640}}>
          {submitted ? (
            <div className="success-box">
              <div className="success-icon">✓</div>
              <h2>Message sent!</h2>
              <p>Thanks for reaching out. We'll get back to you within 2 business days.</p>
              <Link to="/" className="btn btn-blue" style={{marginTop:20}}>Back to Home</Link>
            </div>
          ) : (
            <div className="submit-card">
              <form onSubmit={onSubmit} className="auth-form">
                <div className="form-group">
                  <label>Your name</label>
                  <input name="name" value={form.name} onChange={onChange} placeholder="Enter your name" className={errors.name?'input-error':''} />
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>
                <div className="form-group">
                  <label>Email address</label>
                  <input name="email" type="email" value={form.email} onChange={onChange} placeholder="Enter your email" className={errors.email?'input-error':''} />
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea name="message" value={form.message} onChange={onChange} placeholder="How can we help?" rows={5} className={errors.message?'input-error':''} />
                  {errors.message && <p className="error-text">{errors.message}</p>}
                </div>
                <button type="submit" className="btn btn-blue full-width">Send Message</button>
              </form>
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}

// ─── Submit Campaign ──────────────────────────────────────────────────────────
function SubmitCampaignPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({title:'',description:'',category:'Environment'});
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const categories = ['Environment','Community','Business','Health','Education'];
  function onChange(e) { setForm(p=>({...p,[e.target.name]:e.target.value})); }
  async function onSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title='Title is required.';
    if (!form.description.trim()) errs.description='Description is required.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true); setApiError('');
    try { await api.createCampaign(form); setSuccess(true); }
    catch(err) { setApiError(err.message); }
    finally { setLoading(false); }
  }
  if (success) return (
    <AppLayout>
      <section className="section">
        <div className="container success-box">
          <div className="success-icon">✓</div>
          <h1>Campaign submitted!</h1>
          <p>Your campaign is pending admin review. It will appear publicly once approved — usually within 24–48 hours.</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:24,flexWrap:'wrap'}}>
            <Link to="/campaigns" className="btn btn-blue">View Campaigns</Link>
            <button className="btn-outline-blue" onClick={() => {setSuccess(false);setForm({title:'',description:'',category:'Environment'});}}>Submit Another</button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
  return (
    <AppLayout>
      <div className="page-hero">
        <div className="container">
          <p className="eyebrow">{user?.role==='business'?'Business promotion':'Community campaign'}</p>
          <h1>Post a campaign</h1>
          <p className="page-hero-sub">Your campaign will be reviewed before going live.</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{maxWidth:700}}>
          <div className="submit-card">
            {apiError && <p className="error-text api-error">{apiError}</p>}
            <form onSubmit={onSubmit} className="auth-form">
              <div className="form-group">
                <label>Campaign title</label>
                <input name="title" value={form.title} onChange={onChange} placeholder="e.g. Clean Up Canberra Parks" className={errors.title?'input-error':''} />
                {errors.title && <p className="error-text">{errors.title}</p>}
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={onChange} placeholder="Describe your campaign and how people can get involved..." rows={5} className={errors.description?'input-error':''} />
                {errors.description && <p className="error-text">{errors.description}</p>}
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={onChange}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="submit-note">
                <span>📋</span>
                <p>All campaigns are reviewed by our team before appearing publicly. This usually takes 24–48 hours.</p>
              </div>
              <button type="submit" className="btn btn-green full-width" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Campaign'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboardPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    api.pendingCampaigns().then(d=>setCampaigns(d)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  async function handleApprove(id) {
    await api.approveCampaign(id);
    setActionMsg('✓ Campaign approved and is now live.');
    setCampaigns(p => p.filter(c => c._id !== id));
  }
  async function handleReject(id) {
    await api.rejectCampaign(id);
    setActionMsg('✕ Campaign rejected.');
    setCampaigns(p => p.filter(c => c._id !== id));
  }

  return (
    <AppLayout>
      <div className="page-hero">
        <div className="container">
          <p className="eyebrow">Admin</p>
          <h1>Admin Dashboard</h1>
          <p className="page-hero-sub">Review and approve or reject submitted campaigns.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          {actionMsg && (
            <div className="action-msg">
              <p>{actionMsg}</p>
              <button onClick={() => setActionMsg('')} className="action-msg-close">×</button>
            </div>
          )}
          <div className="admin-stats">
            <div className="admin-stat-box"><h3>{campaigns.length}</h3><p>Pending review</p></div>
          </div>
          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : campaigns.length === 0 ? (
            <div className="empty-state">
              <p style={{fontSize:48,marginBottom:12}}>🎉</p>
              <p>All caught up — no pending campaigns!</p>
              <Link to="/campaigns" className="btn btn-blue" style={{marginTop:16}}>View live campaigns</Link>
            </div>
          ) : (
            <div className="admin-grid">
              {campaigns.map(c => {
                const s = CAT[c.category] || CAT.Community;
                return (
                  <div key={c._id} className="admin-card">
                    <div className="admin-card-img" style={{background:s.bg}}>
                      <span style={{fontSize:36}}>{s.icon}</span>
                    </div>
                    <div className="admin-card-body">
                      <div className="admin-card-header">
                        <span className="badge badge-pending">Pending</span>
                        <span className="admin-category">{c.category}</span>
                      </div>
                      <h3>{c.title}</h3>
                      <p>{c.description}</p>
                      <div className="admin-meta">
                        <span>By: <strong>{c.authorName||'Unknown'}</strong></span>
                        <span className={`role-tag role-${c.authorRole}`}>{c.authorRole}</span>
                      </div>
                      <div className="admin-actions">
                        <button className="btn btn-green" onClick={() => handleApprove(c._id)}>✓ Approve</button>
                        <button className="btn btn-reject" onClick={() => handleReject(c._id)}>✕ Reject</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <AppLayout>
      <section className="auth-section">
        <div className="auth-card">
          <div className="auth-left">
            <div className="auth-left-logo"><span className="brand-spark">✦</span> SocialSpark</div>
            <h2>Connect with your community</h2>
            <p>Support local causes, meet like-minded people, and help small businesses thrive.</p>
            <div className="auth-features">
              <div className="auth-feature">✓ Free to join</div>
              <div className="auth-feature">✓ Post campaigns</div>
              <div className="auth-feature">✓ Support local causes</div>
            </div>
          </div>
          <div className="auth-right">
            <h1>{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
            {children}
            {footer && <div className="auth-footer">{footer}</div>}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

function Field({ label, type='text', name, value, onChange, error, placeholder, as }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      {as === 'select' ? (
        <select id={name} name={name} value={value} onChange={onChange}>
          <option value="user">Community member</option>
          <option value="business">Small business owner</option>
        </select>
      ) : (
        <input id={name} type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder} className={error ? 'input-error' : ''} />
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({email:'',password:''});
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  function onChange(e) { setForm(p=>({...p,[e.target.name]:e.target.value})); }
  async function onSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.email.trim()) errs.email='Email is required.';
    else if (!form.email.includes('@')) errs.email='Enter a valid email.';
    if (!form.password) errs.password='Password is required.';
    else if (form.password.length<6) errs.password='Must be at least 6 characters.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true); setApiError('');
    try { await login(form.email, form.password); navigate('/campaigns'); }
    catch(err) { setApiError(err.message); }
    finally { setLoading(false); }
  }
  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your SocialSpark account."
      footer={<>Don't have an account? <Link to="/register" className="text-link">Create one here</Link>.</>}>
      <form onSubmit={onSubmit} className="auth-form">
        {apiError && <p className="error-text api-error">{apiError}</p>}
        <Field label="Email address" type="email" name="email" value={form.email} onChange={onChange} error={errors.email} placeholder="Enter your email" />
        <Field label="Password" type="password" name="password" value={form.password} onChange={onChange} error={errors.password} placeholder="Enter your password" />
        <button type="submit" className="btn btn-blue full-width" disabled={loading}>{loading?'Logging in...':'Log In'}</button>
      </form>
    </AuthLayout>
  );
}

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({fullName:'',email:'',password:'',confirm:'',role:'user'});
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  function onChange(e) { setForm(p=>({...p,[e.target.name]:e.target.value})); }
  async function onSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.fullName.trim()) errs.fullName='Full name is required.';
    if (!form.email.trim()) errs.email='Email is required.';
    else if (!form.email.includes('@')) errs.email='Enter a valid email.';
    if (!form.password) errs.password='Password is required.';
    else if (form.password.length<6) errs.password='Must be at least 6 characters.';
    if (!form.confirm) errs.confirm='Please confirm your password.';
    else if (form.confirm!==form.password) errs.confirm='Passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true); setApiError('');
    try { await register(form.fullName, form.email, form.password, form.role); navigate('/campaigns'); }
    catch(err) { setApiError(err.message); }
    finally { setLoading(false); }
  }
  return (
    <AuthLayout title="Create your account" subtitle="Join SocialSpark and start making a difference."
      footer={<>Already have an account? <Link to="/login" className="text-link">Log in here</Link>.</>}>
      <form onSubmit={onSubmit} className="auth-form">
        {apiError && <p className="error-text api-error">{apiError}</p>}
        <Field label="Full name" name="fullName" value={form.fullName} onChange={onChange} error={errors.fullName} placeholder="Enter your full name" />
        <Field label="Email address" type="email" name="email" value={form.email} onChange={onChange} error={errors.email} placeholder="Enter your email" />
        <Field label="I am a..." name="role" value={form.role} onChange={onChange} as="select" />
        <Field label="Password" type="password" name="password" value={form.password} onChange={onChange} error={errors.password} placeholder="Create a password" />
        <Field label="Confirm password" type="password" name="confirm" value={form.confirm} onChange={onChange} error={errors.confirm} placeholder="Confirm your password" />
        <button type="submit" className="btn btn-green full-width" disabled={loading}>{loading?'Creating account...':'Create Account'}</button>
      </form>
    </AuthLayout>
  );
}

function LogoutPage() {
  const { logout } = useAuth();
  useEffect(() => { logout(); }, []);
  return (
    <AuthLayout title="You've been logged out" subtitle="Your session has been cleared."
      footer={<Link to="/login" className="text-link">Log back in</Link>}>
      <div className="logout-box">
        <p>Thanks for using SocialSpark. Come back anytime to explore campaigns and support your community.</p>
      </div>
    </AuthLayout>
  );
}

function NotFoundPage() {
  return (
    <AppLayout>
      <div className="not-found">
        <div className="container">
          <p style={{fontSize:80,marginBottom:16}}>🔍</p>
          <p className="eyebrow green-text">404</p>
          <h1>Page not found</h1>
          <p>The page you are looking for does not exist.</p>
          <Link to="/" className="btn btn-blue" style={{marginTop:24}}>Back to Home</Link>
        </div>
      </div>
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/campaigns"    element={<CampaignsPage />} />
          <Route path="/campaign/:id" element={<CampaignDetailPage />} />
          <Route path="/about"        element={<AboutPage />} />
          <Route path="/faq"          element={<FAQPage />} />
          <Route path="/help"         element={<HelpPage />} />
          <Route path="/privacy"      element={<PrivacyPage />} />
          <Route path="/contact"      element={<ContactPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/logout"       element={<LogoutPage />} />
          <Route path="/submit"       element={<ProtectedRoute><SubmitCampaignPage /></ProtectedRoute>} />
          <Route path="/admin"        element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="*"             element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
