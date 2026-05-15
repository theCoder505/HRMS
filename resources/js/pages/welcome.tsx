import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

// ── tiny icon helpers (inline SVG, no extra deps) ──────────────────────────
const Icon = ({ d, size = 20 }: { d: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

const icons = {
    users:    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    calendar: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18',
    chart:    'M18 20V10M12 20V4M6 20v-6',
    shield:   'M12 2l7 4v6c0 5-3.5 9.74-7 11-3.5-1.26-7-6-7-11V6z',
    zap:      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    globe:    'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z',
    check:    'M20 6L9 17l-5-5',
    arrow:    'M5 12h14M12 5l7 7-7 7',
    star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    payroll:  'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    clock:    'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2',
};

// ── data ────────────────────────────────────────────────────────────────────
const features = [
    { icon: icons.users,    title: 'People Management',    desc: 'Centralize employee records, org charts, and team structures in one elegant hub.' },
    { icon: icons.payroll,  title: 'Payroll & Benefits',   desc: 'Automate salary runs, tax filings, and benefits enrollment without the spreadsheet chaos.' },
    { icon: icons.calendar, title: 'Leave & Attendance',   desc: 'Track time-off requests, shift schedules, and attendance with smart conflict detection.' },
    { icon: icons.chart,    title: 'Performance Reviews',  desc: 'Run 360° feedback cycles and OKR tracking that employees actually look forward to.' },
    { icon: icons.zap,      title: 'Onboarding Flows',     desc: 'Cut day-one admin from hours to minutes with automated checklists and e-signatures.' },
    { icon: icons.shield,   title: 'Compliance & Audit',   desc: 'Stay ahead of labour laws with built-in policy templates and real-time audit trails.' },
];

const stats = [
    { value: '14 k+', label: 'Companies onboarded' },
    { value: '98 %',  label: 'Payroll accuracy' },
    { value: '4× ',   label: 'Faster onboarding' },
    { value: '24 / 7',label: 'Support available' },
];

const testimonials = [
    { name: 'Layla Hassan',   role: 'Head of People, NovaTech',  body: 'PeopleOS replaced four separate tools. Our HR team went from firefighting to actually building culture.' },
    { name: 'Carlos Reyes',   role: 'COO, Meridian Logistics',   body: 'Payroll used to take two full days. Now it\'s a Tuesday-morning click. I can\'t overstate how much that matters.' },
    { name: 'Priya Nair',     role: 'HR Director, Bloom Health', body: 'The compliance module alone saved us from a very expensive audit. Worth every penny and then some.' },
];

const plans = [
    { name: 'Starter',    price: '$6',  per: 'per employee / mo', cta: 'Start free',      highlight: false, perks: ['Up to 50 employees', 'Core HR & Payroll', 'Email support'] },
    { name: 'Growth',     price: '$14', per: 'per employee / mo', cta: 'Start free trial', highlight: true,  perks: ['Unlimited employees', 'Performance & OKRs', 'Priority support', 'Advanced analytics'] },
    { name: 'Enterprise', price: 'Custom', per: 'tailored pricing', cta: 'Talk to sales',  highlight: false, perks: ['Everything in Growth', 'Dedicated CSM', 'SSO & SAML', 'SLA guarantee'] },
];

// ── component ───────────────────────────────────────────────────────────────
export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="PeopleOS — Modern HR Platform">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=syne:400,600,700,800|dm-sans:400,500" rel="stylesheet" />
            </Head>

            <style>{`
                :root {
                    --ink:    #0d0f14;
                    --paper:  #f7f6f2;
                    --cream:  #edeae0;
                    --accent: #d4500a;
                    --muted:  #6b6b6b;
                    --card:   #ffffff;
                    --border: #e2dfd6;
                }
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
                body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); }
                h1,h2,h3,h4,h5 { font-family: 'Syne', sans-serif; }

                /* nav */
                .nav { position: sticky; top: 0; z-index: 50; background: rgba(247,246,242,.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 clamp(1.5rem,6vw,5rem); display: flex; align-items: center; justify-content: space-between; height: 64px; }
                .nav-logo { font-family:'Syne',sans-serif; font-weight:800; font-size:1.25rem; letter-spacing:-.02em; }
                .nav-logo span { color: var(--accent); }
                .nav-links { display:flex; align-items:center; gap:2rem; }
                .nav-links a { font-size:.875rem; font-weight:500; color:var(--ink); text-decoration:none; opacity:.7; transition:opacity .2s; }
                .nav-links a:hover { opacity:1; }
                .btn { display:inline-flex; align-items:center; gap:.5rem; font-family:'Syne',sans-serif; font-weight:600; font-size:.875rem; border-radius:6px; padding:.6rem 1.4rem; cursor:pointer; transition:all .2s; text-decoration:none; border:none; }
                .btn-primary { background:var(--ink); color:#fff; }
                .btn-primary:hover { background:var(--accent); }
                .btn-outline { background:transparent; color:var(--ink); border:1.5px solid var(--ink); }
                .btn-outline:hover { background:var(--ink); color:#fff; }
                .btn-accent  { background:var(--accent); color:#fff; }
                .btn-accent:hover  { background:#b8420a; }

                /* hero */
                .hero { padding: clamp(5rem,12vw,9rem) clamp(1.5rem,6vw,5rem) clamp(4rem,8vw,7rem); max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:center; }
                @media(max-width:768px){ .hero { grid-template-columns:1fr; } .hero-visual { display:none; } }
                .hero-eyebrow { display:inline-flex; align-items:center; gap:.5rem; font-size:.8rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--accent); background:rgba(212,80,10,.08); padding:.35rem .9rem; border-radius:99px; margin-bottom:1.5rem; }
                .hero h1 { font-size:clamp(2.5rem,5vw,4rem); font-weight:800; line-height:1.08; letter-spacing:-.03em; margin-bottom:1.5rem; }
                .hero h1 em { font-style:normal; color:var(--accent); }
                .hero p { font-size:1.1rem; color:var(--muted); line-height:1.7; max-width:460px; margin-bottom:2.5rem; }
                .hero-actions { display:flex; gap:1rem; flex-wrap:wrap; }
                .hero-visual { background:var(--ink); border-radius:16px; overflow:hidden; aspect-ratio:4/3; display:flex; flex-direction:column; padding:1.5rem; gap:.75rem; }
                .dash-bar { background:rgba(255,255,255,.07); border-radius:8px; height:14px; }
                .dash-bar.w80 { width:80%; }
                .dash-bar.w60 { width:60%; }
                .dash-bar.w40 { width:40%; }
                .dash-card { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:1rem; flex:1; }
                .dash-cards { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; flex:1; }
                .dash-num { font-family:'Syne',sans-serif; font-size:1.6rem; font-weight:800; color:#fff; }
                .dash-lbl { font-size:.7rem; color:rgba(255,255,255,.4); margin-top:.25rem; }
                .dash-sparkline { margin-top:.75rem; height:36px; display:flex; align-items:flex-end; gap:3px; }
                .dash-bar-v { background: var(--accent); border-radius:3px 3px 0 0; flex:1; opacity:.7; }
                .dash-bar-v.hi { opacity:1; }

                /* stats */
                .stats { background:var(--ink); color:#fff; }
                .stats-inner { max-width:1200px; margin:0 auto; padding:4rem clamp(1.5rem,6vw,5rem); display:grid; grid-template-columns:repeat(4,1fr); gap:2rem; }
                @media(max-width:640px){ .stats-inner { grid-template-columns:repeat(2,1fr); } }
                .stat-value { font-family:'Syne',sans-serif; font-size:2.5rem; font-weight:800; color:#fff; }
                .stat-label { font-size:.85rem; color:rgba(255,255,255,.5); margin-top:.35rem; }

                /* section shared */
                .section { max-width:1200px; margin:0 auto; padding:clamp(4rem,8vw,7rem) clamp(1.5rem,6vw,5rem); }
                .section-label { font-size:.75rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--accent); margin-bottom:.75rem; }
                .section-title { font-size:clamp(1.8rem,3.5vw,2.8rem); font-weight:800; letter-spacing:-.025em; line-height:1.12; margin-bottom:1rem; }
                .section-sub { font-size:1rem; color:var(--muted); max-width:520px; line-height:1.7; }

                /* features */
                .features-grid { margin-top:3.5rem; display:grid; grid-template-columns:repeat(3,1fr); gap:1.5px; background:var(--border); border:1.5px solid var(--border); border-radius:14px; overflow:hidden; }
                @media(max-width:900px){ .features-grid { grid-template-columns:repeat(2,1fr); } }
                @media(max-width:580px){ .features-grid { grid-template-columns:1fr; } }
                .feat-card { background:var(--card); padding:2rem; transition:background .2s; }
                .feat-card:hover { background:#fffdf8; }
                .feat-icon { width:44px; height:44px; background:rgba(212,80,10,.1); border-radius:10px; display:grid; place-items:center; color:var(--accent); margin-bottom:1.25rem; }
                .feat-title { font-family:'Syne',sans-serif; font-weight:700; font-size:1rem; margin-bottom:.5rem; }
                .feat-desc { font-size:.875rem; color:var(--muted); line-height:1.65; }

                /* testimonials */
                .testi-bg { background:var(--cream); }
                .testi-grid { margin-top:3rem; display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
                @media(max-width:800px){ .testi-grid { grid-template-columns:1fr; } }
                .testi-card { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:1.75rem; }
                .testi-stars { display:flex; gap:3px; color:var(--accent); margin-bottom:1rem; }
                .testi-body { font-size:.9rem; line-height:1.7; color:var(--ink); margin-bottom:1.5rem; }
                .testi-author { display:flex; align-items:center; gap:.75rem; }
                .testi-avatar { width:38px; height:38px; border-radius:50%; background:var(--ink); display:grid; place-items:center; font-family:'Syne',sans-serif; font-weight:700; font-size:.85rem; color:#fff; flex-shrink:0; }
                .testi-name { font-weight:600; font-size:.875rem; }
                .testi-role { font-size:.78rem; color:var(--muted); }

                /* pricing */
                .pricing-grid { margin-top:3.5rem; display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; align-items:start; }
                @media(max-width:800px){ .pricing-grid { grid-template-columns:1fr; } }
                .price-card { background:var(--card); border:1.5px solid var(--border); border-radius:14px; padding:2rem; }
                .price-card.hi { background:var(--ink); border-color:var(--ink); color:#fff; }
                .price-name { font-family:'Syne',sans-serif; font-weight:700; font-size:.95rem; letter-spacing:.05em; text-transform:uppercase; margin-bottom:1.25rem; }
                .price-card.hi .price-name { color:rgba(255,255,255,.6); }
                .price-amount { font-family:'Syne',sans-serif; font-weight:800; font-size:2.6rem; letter-spacing:-.03em; line-height:1; }
                .price-per { font-size:.8rem; color:var(--muted); margin-top:.3rem; margin-bottom:1.75rem; }
                .price-card.hi .price-per { color:rgba(255,255,255,.45); }
                .price-perks { list-style:none; display:flex; flex-direction:column; gap:.75rem; margin-bottom:2rem; }
                .price-perks li { display:flex; align-items:center; gap:.6rem; font-size:.875rem; }
                .price-card.hi .price-perks li { color:rgba(255,255,255,.8); }
                .perk-dot { width:18px; height:18px; border-radius:50%; background:rgba(212,80,10,.12); display:grid; place-items:center; color:var(--accent); flex-shrink:0; }
                .price-card.hi .perk-dot { background:rgba(255,255,255,.12); color:#fff; }

                /* cta banner */
                .cta-wrap { padding:0 clamp(1.5rem,6vw,5rem) clamp(4rem,8vw,7rem); }
                .cta-banner { background:var(--ink); border-radius:20px; padding:clamp(3rem,6vw,5rem) clamp(2rem,6vw,5rem); display:flex; align-items:center; justify-content:space-between; gap:2rem; flex-wrap:wrap; }
                .cta-text h2 { font-size:clamp(1.6rem,3vw,2.4rem); font-weight:800; letter-spacing:-.025em; color:#fff; }
                .cta-text p { font-size:.95rem; color:rgba(255,255,255,.5); margin-top:.6rem; }

                /* footer */
                footer { border-top:1px solid var(--border); padding:2rem clamp(1.5rem,6vw,5rem); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
                .foot-copy { font-size:.8rem; color:var(--muted); }

                /* animations */
                @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
                .fade-up { animation: fadeUp .6s ease both; }
                .delay-1 { animation-delay:.1s; }
                .delay-2 { animation-delay:.2s; }
                .delay-3 { animation-delay:.3s; }
            `}</style>

            {/* ── NAV ── */}
            <nav className="nav">
                <div className="nav-logo">People<span>OS</span></div>
                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    <a href="#testimonials">Reviews</a>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {auth.user ? (
                        <Link href={route('dashboard')} className="btn btn-primary">Dashboard</Link>
                    ) : (
                        <>
                            <Link href={route('hrm.login')} className="btn btn-outline">Log in</Link>
                            <Link href={route('hrm.login')} className="btn btn-primary">Get started</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* ── HERO ── */}
            <div className="hero">
                <div>
                    <div className="hero-eyebrow fade-up">
                        <Icon d={icons.zap} size={14} />
                        The modern HR platform
                    </div>
                    <h1 className="fade-up delay-1">
                        HR that works as fast as <em>your team</em>
                    </h1>
                    <p className="fade-up delay-2">
                        PeopleOS brings payroll, performance, onboarding, and compliance into one calm, clear interface — so your HR team can focus on people, not paperwork.
                    </p>
                    <div className="hero-actions fade-up delay-3">
                        <Link href={route('hrm.login')} className="btn btn-accent" style={{ fontSize: '1rem', padding: '.75rem 1.75rem' }}>
                            Start for free <Icon d={icons.arrow} size={16} />
                        </Link>
                        <a href="#features" className="btn btn-outline" style={{ fontSize: '1rem', padding: '.75rem 1.75rem' }}>See features</a>
                    </div>
                </div>

                {/* mini dashboard illustration */}
                <div className="hero-visual">
                    <div className="dash-bar w80" />
                    <div className="dash-bar w60" />
                    <div className="dash-cards">
                        {[
                            { n: '247', l: 'Employees' },
                            { n: '98%', l: 'Payroll accuracy' },
                            { n: '12', l: 'Open positions' },
                            { n: '4.8', l: 'Team satisfaction' },
                        ].map(({ n, l }) => (
                            <div className="dash-card" key={l}>
                                <div className="dash-num">{n}</div>
                                <div className="dash-lbl">{l}</div>
                                <div className="dash-sparkline">
                                    {[40, 55, 35, 70, 60, 80, 90].map((h, i) => (
                                        <div key={i} className={`dash-bar-v${i === 6 ? ' hi' : ''}`} style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="dash-bar w40" />
                </div>
            </div>

            {/* ── STATS ── */}
            <div className="stats">
                <div className="stats-inner">
                    {stats.map(({ value, label }) => (
                        <div key={label}>
                            <div className="stat-value">{value}</div>
                            <div className="stat-label">{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── FEATURES ── */}
            <div id="features">
                <div className="section">
                    <div className="section-label">Features</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 className="section-title">Everything HR.<br />Nothing extra.</h2>
                        <p className="section-sub">One platform to hire, pay, review, and retain — without juggling a dozen tabs.</p>
                    </div>
                    <div className="features-grid">
                        {features.map(({ icon, title, desc }) => (
                            <div className="feat-card" key={title}>
                                <div className="feat-icon"><Icon d={icon} size={20} /></div>
                                <div className="feat-title">{title}</div>
                                <div className="feat-desc">{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── TESTIMONIALS ── */}
            <div id="testimonials" className="testi-bg">
                <div className="section">
                    <div className="section-label">Customer stories</div>
                    <h2 className="section-title">Trusted by people teams<br />at every scale</h2>
                    <div className="testi-grid">
                        {testimonials.map(({ name, role, body }) => (
                            <div className="testi-card" key={name}>
                                <div className="testi-stars">
                                    {[...Array(5)].map((_, i) => <Icon key={i} d={icons.star} size={14} />)}
                                </div>
                                <p className="testi-body">"{body}"</p>
                                <div className="testi-author">
                                    <div className="testi-avatar">{name[0]}</div>
                                    <div>
                                        <div className="testi-name">{name}</div>
                                        <div className="testi-role">{role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── PRICING ── */}
            <div id="pricing">
                <div className="section">
                    <div className="section-label">Pricing</div>
                    <h2 className="section-title">Simple, honest pricing</h2>
                    <p className="section-sub">No setup fees. No per-module upsells. Pay for what your team actually needs.</p>
                    <div className="pricing-grid">
                        {plans.map(({ name, price, per, cta, highlight, perks }) => (
                            <div className={`price-card${highlight ? ' hi' : ''}`} key={name}>
                                <div className="price-name">{name}</div>
                                <div className="price-amount">{price}</div>
                                <div className="price-per">{per}</div>
                                <ul className="price-perks">
                                    {perks.map(p => (
                                        <li key={p}>
                                            <span className="perk-dot"><Icon d={icons.check} size={10} /></span>
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={route('hrm.login')}
                                    className={`btn ${highlight ? 'btn-accent' : 'btn-outline'}`}
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    {cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CTA BANNER ── */}
            <div className="cta-wrap">
                <div className="cta-banner">
                    <div className="cta-text">
                        <h2>Ready to simplify HR?</h2>
                        <p>Join 14,000+ companies. No credit card required to start.</p>
                    </div>
                    <Link href={route('hrm.login')} className="btn btn-accent" style={{ fontSize: '1rem', padding: '.85rem 2rem', whiteSpace: 'nowrap' }}>
                        Get started free <Icon d={icons.arrow} size={16} />
                    </Link>
                </div>
            </div>

            {/* ── FOOTER ── */}
            <footer>
                <div className="nav-logo" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
                    People<span style={{ color: 'var(--accent)' }}>OS</span>
                </div>
                <div className="foot-copy">© {new Date().getFullYear()} PeopleOS. All rights reserved.</div>
            </footer>
        </>
    );
}