import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Welcome() {
    const { auth, name, settings } = usePage<SharedData>().props;
    const appName = settings?.brand_name || (name as string) || 'PeopleOS';
    const [menuOpen, setMenuOpen] = useState(false);

    // Close menu on resize to desktop
    useEffect(() => {
        const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    return (
        <>
            <Head title={`${appName} — Modern HR Platform`}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
                :root {
                    --bg: #05060a;
                    --bg2: #0c0e16;
                    --surface: #111420;
                    --border: rgba(255,255,255,.07);
                    --accent: #6c63ff;
                    --accent2: #ff6b6b;
                    --accent3: #43e97b;
                    --text: #f0f0ff;
                    --muted: #8b8fa8;
                    --card: rgba(255,255,255,.03);
                }
                body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; }
                h1,h2,h3,h4 { font-family: 'Space Grotesk', sans-serif; }

                /* ── GRAIN OVERLAY ── */
                body::before {
                    content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
                    background-size: 200px; opacity: 0.4;
                }

                /* ── GLOW ORBS ── */
                .orb { position: fixed; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; }
                .orb-1 { width: 600px; height: 600px; top: -200px; left: -200px; background: radial-gradient(circle, rgba(108,99,255,.25) 0%, transparent 70%); }
                .orb-2 { width: 500px; height: 500px; bottom: -100px; right: -100px; background: radial-gradient(circle, rgba(255,107,107,.2) 0%, transparent 70%); }
                .orb-3 { width: 400px; height: 400px; top: 40%; left: 50%; transform: translateX(-50%); background: radial-gradient(circle, rgba(67,233,123,.12) 0%, transparent 70%); }

                /* ── NAV ── */
                .nav {
                    position: sticky; top: 0; z-index: 100;
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0 clamp(1.25rem, 6vw, 5rem); height: 68px;
                    background: rgba(5,6,10,.85); backdrop-filter: blur(20px);
                    border-bottom: 1px solid var(--border);
                }
                .nav-logo { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.3rem; letter-spacing: -.03em; flex-shrink: 0; }
                .nav-logo span { background: linear-gradient(135deg, #6c63ff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

                /* Desktop nav links */
                .nav-links { display: flex; gap: 2rem; }
                .nav-links a { font-size: .875rem; font-weight: 500; color: var(--muted); text-decoration: none; transition: color .2s; }
                .nav-links a:hover { color: var(--text); }
                .nav-actions { display: flex; gap: .75rem; }

                /* ── HAMBURGER ── */
                .hamburger {
                    display: none; flex-direction: column; justify-content: center; align-items: center;
                    width: 40px; height: 40px; gap: 5px; cursor: pointer;
                    background: transparent; border: 1px solid var(--border); border-radius: 10px;
                    transition: border-color .2s, background .2s; flex-shrink: 0;
                }
                .hamburger:hover { border-color: rgba(255,255,255,.2); background: rgba(255,255,255,.05); }
                .hamburger span {
                    display: block; width: 18px; height: 1.5px;
                    background: var(--muted); border-radius: 2px;
                    transition: transform .3s ease, opacity .3s ease, width .3s ease;
                    transform-origin: center;
                }
                .hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); background: var(--text); }
                .hamburger.open span:nth-child(2) { opacity: 0; width: 0; }
                .hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); background: var(--text); }

                /* ── MOBILE MENU OVERLAY ── */
                .mobile-menu {
                    display: none; position: fixed; inset: 68px 0 0 0; z-index: 99;
                    background: rgba(5,6,10,.97); backdrop-filter: blur(24px);
                    flex-direction: column; padding: 2rem clamp(1.25rem,6vw,3rem);
                    border-top: 1px solid var(--border);
                    animation: slideDown .25s ease both;
                    overflow-y: auto;
                }
                .mobile-menu.open { display: flex; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }

                .mobile-nav-links { display: flex; flex-direction: column; gap: .25rem; margin-bottom: 2rem; }
                .mobile-nav-links a {
                    font-size: 1.15rem; font-weight: 600; color: var(--muted); text-decoration: none;
                    padding: .85rem 0; border-bottom: 1px solid var(--border);
                    transition: color .2s;
                }
                .mobile-nav-links a:last-child { border-bottom: none; }
                .mobile-nav-links a:hover { color: var(--text); }
                .mobile-nav-actions { display: flex; flex-direction: column; gap: .75rem; }
                .mobile-nav-actions .btn { justify-content: center; font-size: 1rem; padding: .85rem 1.5rem; }

                /* Responsive: show hamburger, hide desktop links */
                @media (max-width: 767px) {
                    .nav-links, .nav-actions { display: none; }
                    .hamburger { display: flex; }
                }

                /* ── BUTTONS ── */
                .btn { display: inline-flex; align-items: center; gap: .5rem; font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: .875rem; border-radius: 10px; padding: .6rem 1.4rem; cursor: pointer; transition: all .25s; text-decoration: none; border: none; white-space: nowrap; }
                .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
                .btn-ghost:hover { border-color: rgba(255,255,255,.2); color: var(--text); background: rgba(255,255,255,.05); }
                .btn-primary { background: var(--accent); color: #fff; box-shadow: 0 0 24px rgba(108,99,255,.4); }
                .btn-primary:hover { background: #7c75ff; box-shadow: 0 0 32px rgba(108,99,255,.6); transform: translateY(-1px); }

                /* ── HERO ── */
                .hero-wrap { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: clamp(5rem,12vw,10rem) clamp(1.5rem,6vw,5rem) clamp(4rem,8vw,8rem); text-align: center; }
                .hero-badge { display: inline-flex; align-items: center; gap: .5rem; font-size: .78rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #a78bfa; background: rgba(108,99,255,.12); border: 1px solid rgba(108,99,255,.25); padding: .4rem 1rem; border-radius: 99px; margin-bottom: 2rem; }
                .hero-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #6c63ff; animation: pulse 2s infinite; }
                @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(108,99,255,.6); } 50% { box-shadow: 0 0 0 8px rgba(108,99,255,0); } }

                .hero-title { font-size: clamp(2.8rem, 7vw, 5.5rem); font-weight: 700; line-height: 1.05; letter-spacing: -.04em; margin-bottom: 1.75rem; }
                .hero-title .grad { background: linear-gradient(135deg, #a78bfa 0%, #6c63ff 40%, #ff6b6b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                .hero-sub { font-size: clamp(1rem, 2vw, 1.2rem); color: var(--muted); line-height: 1.75; max-width: 560px; margin: 0 auto 3rem; }
                .hero-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 4rem; }
                .btn-lg { font-size: 1rem; padding: .8rem 2rem; border-radius: 12px; }

                /* ── GLOWING DIVIDER ── */
                .glow-line { width: 200px; height: 1px; background: linear-gradient(90deg, transparent, #6c63ff, transparent); margin: 0 auto 4rem; }

                /* ── PORTAL CARDS ── */
                .portals { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; max-width: 900px; margin: 0 auto 6rem; }
                @media(max-width:600px) { .portals { grid-template-columns: 1fr; } }
                .portal-card {
                    position: relative; overflow: hidden; border-radius: 20px;
                    border: 1px solid var(--border); padding: 2.5rem;
                    background: var(--card); backdrop-filter: blur(8px);
                    transition: all .3s; text-decoration: none; color: var(--text);
                }
                .portal-card::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity .3s; background: linear-gradient(135deg, rgba(108,99,255,.1), transparent); }
                .portal-card:hover { border-color: rgba(108,99,255,.4); transform: translateY(-4px); box-shadow: 0 24px 60px rgba(0,0,0,.4); }
                .portal-card:hover::before { opacity: 1; }
                .portal-card.emp::before { background: linear-gradient(135deg, rgba(67,233,123,.1), transparent); }
                .portal-card.emp:hover { border-color: rgba(67,233,123,.4); }
                .portal-icon { width: 56px; height: 56px; border-radius: 14px; display: grid; place-items: center; margin-bottom: 1.5rem; font-size: 1.5rem; }
                .portal-icon.hr { background: rgba(108,99,255,.15); color: #a78bfa; }
                .portal-icon.emp { background: rgba(67,233,123,.12); color: #43e97b; }
                .portal-title { font-family: 'Space Grotesk', sans-serif; font-size: 1.3rem; font-weight: 700; margin-bottom: .5rem; }
                .portal-desc { font-size: .9rem; color: var(--muted); line-height: 1.6; margin-bottom: 1.75rem; }
                .portal-cta { display: inline-flex; align-items: center; gap: .5rem; font-size: .875rem; font-weight: 600; }
                .portal-cta.hr { color: #a78bfa; }
                .portal-cta.emp { color: #43e97b; }
                .portal-cta svg { transition: transform .2s; }
                .portal-card:hover .portal-cta svg { transform: translateX(4px); }

                /* ── STATS STRIP ── */
                .stats-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin-bottom: 6rem; }
                @media(max-width:640px) { .stats-strip { grid-template-columns: repeat(2,1fr); } }
                .stat-cell { background: var(--surface); padding: 2rem 1.5rem; text-align: center; }
                .stat-val { font-family: 'Space Grotesk', sans-serif; font-size: 2.2rem; font-weight: 700; background: linear-gradient(135deg, #fff 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                .stat-lbl { font-size: .8rem; color: var(--muted); margin-top: .4rem; font-weight: 500; }

                /* ── FEATURES ── */
                .section { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 0 clamp(1.5rem,6vw,5rem) 6rem; }
                .section-eye { font-size: .75rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #a78bfa; margin-bottom: .75rem; }
                .section-title { font-size: clamp(2rem,4vw,3rem); font-weight: 700; letter-spacing: -.03em; margin-bottom: 1rem; }
                .section-sub { font-size: 1rem; color: var(--muted); max-width: 500px; line-height: 1.7; margin-bottom: 3.5rem; }
                .feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
                @media(max-width:900px) { .feat-grid { grid-template-columns: repeat(2,1fr); } }
                @media(max-width:580px) { .feat-grid { grid-template-columns: 1fr; } }
                .feat-cell { background: var(--surface); padding: 2rem; transition: background .2s; }
                .feat-cell:hover { background: rgba(108,99,255,.06); }
                .feat-dot { width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center; margin-bottom: 1.2rem; background: rgba(108,99,255,.12); color: #a78bfa; }
                .feat-name { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 1rem; margin-bottom: .5rem; }
                .feat-desc { font-size: .875rem; color: var(--muted); line-height: 1.65; }

                /* ── TESTIMONIALS ── */
                .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; }
                @media(max-width:800px) { .testi-grid { grid-template-columns: 1fr; } }
                .testi-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.75rem; }
                .stars { display: flex; gap: 3px; color: #fbbf24; margin-bottom: 1rem; font-size: .85rem; }
                .testi-body { font-size: .9rem; color: rgba(255,255,255,.8); line-height: 1.7; margin-bottom: 1.5rem; }
                .testi-author { display: flex; gap: .75rem; align-items: center; }
                .testi-av { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg,#6c63ff,#a78bfa); display: grid; place-items: center; font-weight: 700; font-size: .85rem; flex-shrink: 0; }
                .testi-name { font-weight: 600; font-size: .875rem; }
                .testi-role { font-size: .78rem; color: var(--muted); }

                /* ── CTA BANNER ── */
                .cta-banner-wrap { padding: 0 clamp(1.5rem,6vw,5rem) 6rem; position: relative; z-index: 1; }
                .cta-banner {
                    border-radius: 24px; padding: clamp(2.5rem,5vw,5rem) clamp(1.5rem,4vw,3rem);
                    background: linear-gradient(135deg, #1a1040 0%, #0f1a30 50%, #1a1040 100%);
                    border: 1px solid rgba(108,99,255,.3);
                    box-shadow: 0 0 80px rgba(108,99,255,.15);
                    display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap;
                }
                .cta-banner h2 { font-family: 'Space Grotesk',sans-serif; font-size: clamp(1.6rem,3vw,2.4rem); font-weight: 700; letter-spacing: -.03em; }
                .cta-banner p { color: var(--muted); margin-top: .5rem; }

                /* ── FOOTER ── */
                footer {
                    border-top: 1px solid var(--border);
                    padding: 2.5rem clamp(1.25rem,6vw,5rem);
                    position: relative; z-index: 1;
                }
                .footer-inner {
                    display: flex; align-items: center; justify-content: space-between;
                    flex-wrap: wrap; gap: 1.5rem;
                }
                .footer-left { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
                .footer-links { display: flex; gap: 1.25rem; flex-wrap: wrap; }
                .footer-links a { font-size: .8rem; color: var(--muted); text-decoration: none; transition: color .2s; white-space: nowrap; }
                .footer-links a:hover { color: var(--text); }
                .footer-right { display: flex; flex-direction: column; align-items: flex-end; gap: .6rem; }
                .footer-socials { display: flex; gap: .85rem; }
                .footer-socials a { color: var(--muted); transition: color .2s; display: grid; place-items: center; }
                .footer-socials a:hover { color: var(--text); }
                .footer-copy { font-size: .78rem; color: var(--muted); }

                @media(max-width: 640px) {
                    .footer-inner { flex-direction: column; align-items: flex-start; gap: 1.75rem; }
                    .footer-left { flex-direction: column; align-items: flex-start; gap: 1rem; }
                    .footer-right { align-items: flex-start; }
                }

                /* ── ANIMATIONS ── */
                @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
                .fu { animation: fadeUp .7s ease both; }
                .d1 { animation-delay: .1s; } .d2 { animation-delay: .2s; } .d3 { animation-delay: .3s; } .d4 { animation-delay: .45s; }
            `}</style>

            {/* Orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            {/* ── NAV ── */}
            <nav className="nav">
                <div className="nav-logo">
                    <img
                        src={settings?.brand_logo || '/assets/logo.png'}
                        alt={settings?.brand_name || appName}
                        style={{ height: '32px', objectFit: 'contain', verticalAlign: 'middle', filter: 'brightness(0) invert(1)', opacity: '0.7' }}
                    />
                </div>

                {/* Desktop links */}
                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#testimonials">Reviews</a>
                    <Link href={route('about')}>About Us</Link>
                </div>

                {/* Desktop actions */}
                <div className="nav-actions">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="btn btn-primary">HR Dashboard</Link>
                    ) : (auth as any).employee ? (
                        <Link href={route('employee.dashboard')} className="btn btn-primary">Employee Dashboard</Link>
                    ) : (
                        <>
                            <Link href={route('employee.login')} className="btn btn-ghost">Employee Portal</Link>
                            <Link href={route('hrm.login')} className="btn btn-primary">HR Login</Link>
                        </>
                    )}
                </div>

                {/* Hamburger (mobile only) */}
                <button
                    className={`hamburger${menuOpen ? ' open' : ''}`}
                    onClick={() => setMenuOpen(o => !o)}
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                >
                    <span /><span /><span />
                </button>
            </nav>

            {/* ── MOBILE MENU ── */}
            <div className={`mobile-menu${menuOpen ? ' open' : ''}`} role="dialog" aria-label="Navigation menu">
                <div className="mobile-nav-links">
                    <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
                    <a href="#testimonials" onClick={() => setMenuOpen(false)}>Reviews</a>
                    <Link href={route('about')} onClick={() => setMenuOpen(false)}>About Us</Link>
                </div>
                <div className="mobile-nav-actions">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="btn btn-primary" onClick={() => setMenuOpen(false)}>HR Dashboard</Link>
                    ) : (auth as any).employee ? (
                        <Link href={route('employee.dashboard')} className="btn btn-primary" onClick={() => setMenuOpen(false)}>Employee Dashboard</Link>
                    ) : (
                        <>
                            <Link href={route('employee.login')} className="btn btn-primary" onClick={() => setMenuOpen(false)}>Employee Portal</Link>
                            <Link href={route('hrm.login')} className="btn btn-ghost" onClick={() => setMenuOpen(false)}>HR Login</Link>
                        </>
                    )}
                </div>
            </div>

            {/* ── HERO ── */}
            <div className="hero-wrap">
                <div className="hero-badge fu"><span />Next-gen HR platform</div>
                <h1 className="hero-title fu d1">
                    The operating system<br />for your <span className="grad">people team</span>
                </h1>
                <p className="hero-sub fu d2">
                    Payroll, attendance, leaves, performance and more — unified in one beautiful, fast platform that your team will actually love to use.
                </p>
                <div className="hero-actions fu d3">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="btn btn-primary btn-lg">
                            Go to Dashboard
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </Link>
                    ) : (auth as any).employee ? (
                        <Link href={route('employee.dashboard')} className="btn btn-primary btn-lg">
                            Go to Dashboard
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </Link>
                    ) : (
                        <>
                            <Link href={route('employee.login')} className="btn btn-primary btn-lg">
                                Employee Portal
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </Link>
                            <Link href={route('hrm.login')} className="btn btn-ghost btn-lg">HR Login</Link>
                        </>
                    )}
                </div>

                {/* Stats strip */}
                <div className="stats-strip fu d4">
                    {[
                        { v: '14k+', l: 'Companies onboarded' },
                        { v: '98%', l: 'Payroll accuracy' },
                        { v: '4×', l: 'Faster onboarding' },
                        { v: '24/7', l: 'Support available' },
                    ].map(({ v, l }) => (
                        <div className="stat-cell" key={l}>
                            <div className="stat-val">{v}</div>
                            <div className="stat-lbl">{l}</div>
                        </div>
                    ))}
                </div>

                {/* Portal access cards */}
                <div className="glow-line" />
                <div className="portals">
                    <Link href={route('employee.login')} className="portal-card emp">
                        <div className="portal-icon emp">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <div className="portal-title">Employee Portal</div>
                        <div className="portal-desc">Access your salary slips, attendance logs, leave requests, announcements and more from one place.</div>
                        <div className="portal-cta emp">
                            Access portal
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </div>
                    </Link>
                    <Link href={route('hrm.login')} className="portal-card">
                        <div className="portal-icon hr">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div className="portal-title">HR Administration</div>
                        <div className="portal-desc">Manage employees, run payroll, approve leaves, track attendance and configure your organization.</div>
                        <div className="portal-cta hr">
                            Admin login
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </div>
                    </Link>
                </div>
            </div>

            {/* ── FEATURES ── */}
            <div id="features" className="section">
                <div className="section-eye">Features</div>
                <h2 className="section-title">Everything HR.<br />Nothing extra.</h2>
                <p className="section-sub">One platform to hire, pay, review, and retain — without juggling a dozen tabs.</p>
                <div className="feat-grid">
                    {[
                        { icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', title: 'People Management', desc: 'Centralize employee records, org charts, and team structures in one elegant hub.' },
                        { icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', title: 'Payroll & Benefits', desc: 'Automate salary runs, deductions and bonus releases without the spreadsheet chaos.' },
                        { icon: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18', title: 'Leave & Attendance', desc: 'Track time-off requests, shift schedules, and attendance with smart conflict detection.' },
                        { icon: 'M18 20V10M12 20V4M6 20v-6', title: 'Performance Reviews', desc: 'Run feedback cycles and tracking that employees actually look forward to.' },
                        { icon: 'M12 2l7 4v6c0 5-3.5 9.74-7 11-3.5-1.26-7-6-7-11V6z', title: 'Compliance & Audit', desc: 'Stay ahead of labour laws with built-in policy templates and real-time audit trails.' },
                        { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', title: 'Instant Onboarding', desc: 'Cut day-one admin from hours to minutes with automated checklists.' },
                    ].map(({ icon, title, desc }) => (
                        <div className="feat-cell" key={title}>
                            <div className="feat-dot">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d={icon} />
                                </svg>
                            </div>
                            <div className="feat-name">{title}</div>
                            <div className="feat-desc">{desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── TESTIMONIALS ── */}
            <div id="testimonials" className="section">
                <div className="section-eye">Customer stories</div>
                <h2 className="section-title">Trusted by people teams<br />at every scale</h2>
                <div className="testi-grid">
                    {[
                        { name: 'Layla Hassan', role: 'Head of People, NovaTech', body: 'PeopleOS replaced four separate tools. Our HR team went from firefighting to actually building culture.' },
                        { name: 'Carlos Reyes', role: 'COO, Meridian Logistics', body: "Payroll used to take two full days. Now it's a Tuesday-morning click. I can't overstate how much that matters." },
                        { name: 'Priya Nair', role: 'HR Director, Bloom Health', body: 'The compliance module alone saved us from a very expensive audit. Worth every penny and then some.' },
                    ].map(({ name, role, body }) => (
                        <div className="testi-card" key={name}>
                            <div className="stars">{'★★★★★'}</div>
                            <p className="testi-body">"{body}"</p>
                            <div className="testi-author">
                                <div className="testi-av">{name[0]}</div>
                                <div>
                                    <div className="testi-name">{name}</div>
                                    <div className="testi-role">{role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── CTA BANNER ── */}
            <div className="cta-banner-wrap">
                <div className="cta-banner">
                    <div>
                        <h2>Ready to simplify HR?</h2>
                        <p>Join thousands of companies already running on PeopleOS.</p>
                    </div>
                    <Link href={route('employee.login')} className="btn btn-primary btn-lg">
                        Get started
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                </div>
            </div>

            {/* ── FOOTER ── */}
            <footer>
                <div className="footer-inner">
                    <div className="footer-left">
                        <div className="nav-logo">
                            <img
                                src={settings?.brand_logo || '/assets/logo.png'}
                                alt={settings?.brand_name || appName}
                                style={{ height: '28px', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.7 }}
                            />
                        </div>
                        <div className="footer-links">
                            <Link href={route('about')}>About Us</Link>
                            <Link href={route('privacy.policy')}>Privacy Policy</Link>
                            <Link href={route('terms.conditions')}>Terms & Conditions</Link>
                        </div>
                    </div>

                    <div className="footer-right">
                        {settings?.contact_email && (
                            <a href={`mailto:${settings.contact_email}`} className="footer-copy" style={{ textDecoration: 'none' }}>
                                {settings.contact_email}
                            </a>
                        )}
                        {(settings?.facebook || settings?.twitter || settings?.instagram || settings?.linkedin) && (
                            <div className="footer-socials">
                                {settings?.facebook && (
                                    <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                        </svg>
                                    </a>
                                )}
                                {settings?.twitter && (
                                    <a href={settings.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                                        </svg>
                                    </a>
                                )}
                                {settings?.instagram && (
                                    <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                        </svg>
                                    </a>
                                )}
                                {settings?.linkedin && (
                                    <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                            <rect x="2" y="9" width="4" height="12" />
                                            <circle cx="4" cy="4" r="2" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        )}
                        <div className="footer-copy">
                            © {new Date().getFullYear()} {settings?.brand_name || 'PeopleOS'}. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}