import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import { SharedData } from '@/types';

interface AboutProps {
    data: string;
}

export default function About() {
    const { data, settings } = usePage<SharedData & AboutProps>().props;
    const aboutContent = data || 'Content coming soon...';

    return (
        <div className="min-h-screen bg-[#05060a] text-[#f0f0ff] font-sans selection:bg-[#6c63ff]/30 selection:text-white">
            <Head title="About Us — PeopleOS" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');

                body {
                    background: #05060a;
                    color: #f0f0ff;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                }

                .gradient-text {
                    background: linear-gradient(135deg, #43e97b 0%, #6c63ff 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                /* ── Dynamic content reset & styles ── */
                .dynamic-content {
                    white-space: normal;
                    word-break: break-word;
                    line-height: 1.8;
                }

                .dynamic-content h1,
                .dynamic-content h2,
                .dynamic-content h3,
                .dynamic-content h4,
                .dynamic-content h5,
                .dynamic-content h6 {
                    font-family: 'Space Grotesk', sans-serif;
                    color: #ffffff;
                    font-weight: 700;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                    line-height: 1.3;
                }

                .dynamic-content h1 { font-size: 1.875rem; }
                .dynamic-content h2 { font-size: 1.5rem; }
                .dynamic-content h3 { font-size: 1.25rem; }
                .dynamic-content h4 { font-size: 1.1rem; }

                .dynamic-content p {
                    margin-bottom: 1.25rem;
                    color: #d1d1e0;
                }

                .dynamic-content ul,
                .dynamic-content ol {
                    padding-left: 1.75rem;
                    margin-bottom: 1.25rem;
                    color: #d1d1e0;
                }

                .dynamic-content ul { list-style-type: disc; }
                .dynamic-content ol { list-style-type: decimal; }

                .dynamic-content li {
                    margin-bottom: 0.5rem;
                    line-height: 1.7;
                }

                .dynamic-content a {
                    color: #6c63ff;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                    transition: color 0.2s;
                }
                .dynamic-content a:hover { color: #43e97b; }

                .dynamic-content strong,
                .dynamic-content b {
                    color: #ffffff;
                    font-weight: 600;
                }

                .dynamic-content em,
                .dynamic-content i {
                    font-style: italic;
                    color: #c4c4d8;
                }

                .dynamic-content blockquote {
                    border-left: 3px solid #6c63ff;
                    padding-left: 1.25rem;
                    margin: 1.5rem 0;
                    color: #a0a0c0;
                    font-style: italic;
                }

                .dynamic-content pre {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 1rem 1.25rem;
                    overflow-x: auto;
                    white-space: pre-wrap;
                    word-break: break-word;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 0.875rem;
                    margin-bottom: 1.25rem;
                    color: #c4c4d8;
                }

                .dynamic-content code {
                    background: rgba(108, 99, 255, 0.15);
                    border-radius: 4px;
                    padding: 0.15rem 0.4rem;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 0.875rem;
                    color: #a78bfa;
                }

                .dynamic-content pre code {
                    background: transparent;
                    padding: 0;
                    color: inherit;
                }

                .dynamic-content hr {
                    border: none;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    margin: 2rem 0;
                }

                .dynamic-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1.25rem;
                    font-size: 0.9rem;
                }

                .dynamic-content th,
                .dynamic-content td {
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 0.6rem 0.9rem;
                    text-align: left;
                }

                .dynamic-content th {
                    background: rgba(108, 99, 255, 0.1);
                    color: #ffffff;
                    font-weight: 600;
                }

                .dynamic-content img {
                    max-width: 100%;
                    border-radius: 10px;
                    margin: 1rem 0;
                }
            `}</style>

            {/* Navigation */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-[#05060a]/80 backdrop-blur-md border-b border-white/5">
                <Link href="/" className="flex items-center gap-2">
                    <img
                        src={settings?.brand_logo || '/assets/logo.png'}
                        alt={settings?.brand_name || 'PeopleOS'}
                        className="h-8 object-contain"
                    />
                </Link>
                <Link href="/" className="text-sm font-medium text-[#8b8fa8] hover:text-white transition-colors">
                    ← Back to Home
                </Link>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Space_Grotesk']">
                        About <span className="gradient-text">Us</span>
                    </h1>
                </div>

                <div className="glass-card p-8 md:p-12 leading-relaxed">
                    <div
                        className="dynamic-content"
                        dangerouslySetInnerHTML={{ __html: aboutContent }}
                    />

                    <div className="pt-10 mt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col gap-2">
                            <div className="text-sm text-[#8b8fa8]">
                                © {new Date().getFullYear()} {settings?.brand_name || 'PeopleOS'}. All rights reserved.
                            </div>
                            {settings?.location && (
                                <div className="text-xs text-[#5c5f7a] max-w-xs">
                                    {settings.location}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-4">
                            <div className="flex gap-4">
                                {settings?.facebook && (
                                    <a href={settings.facebook} target="_blank" rel="noreferrer" className="text-[#8b8fa8] hover:text-[#6c63ff] transition-colors">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                                    </a>
                                )}
                                {settings?.twitter && (
                                    <a href={settings.twitter} target="_blank" rel="noreferrer" className="text-[#8b8fa8] hover:text-[#6c63ff] transition-colors">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                                    </a>
                                )}
                                {settings?.instagram && (
                                    <a href={settings.instagram} target="_blank" rel="noreferrer" className="text-[#8b8fa8] hover:text-[#6c63ff] transition-colors">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                                    </a>
                                )}
                                {settings?.linkedin && (
                                    <a href={settings.linkedin} target="_blank" rel="noreferrer" className="text-[#8b8fa8] hover:text-[#6c63ff] transition-colors">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                                    </a>
                                )}
                            </div>
                            <div className="flex gap-6">
                                <Link href="/privacy-policy" className="text-sm font-medium text-[#6c63ff] hover:underline">
                                    Privacy Policy
                                </Link>
                                <Link href="/terms-conditions" className="text-sm font-medium text-[#6c63ff] hover:underline">
                                    Terms & Conditions
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}