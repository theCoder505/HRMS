import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import { SharedData } from '@/types';

interface TermsConditionsProps {
    data: string;
}

export default function TermsConditions() {
    const { data, settings } = usePage<SharedData & TermsConditionsProps>().props;
    const termsContent = data || 'Content coming soon...';

    return (
        <div className="min-h-screen bg-[#05060a] text-[#f0f0ff] font-sans selection:bg-[#6c63ff]/30 selection:text-white">
            <Head title="Terms & Conditions — PeopleOS" />

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
                    background: linear-gradient(135deg, #ff6b6b 0%, #6c63ff 100%);
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
                    color: #ff6b6b;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                    transition: color 0.2s;
                }
                .dynamic-content a:hover { color: #6c63ff; }

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
                    border-left: 3px solid #ff6b6b;
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
                    background: rgba(255, 107, 107, 0.12);
                    border-radius: 4px;
                    padding: 0.15rem 0.4rem;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 0.875rem;
                    color: #ff6b6b;
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
                    background: rgba(255, 107, 107, 0.08);
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
                        Terms & <span className="gradient-text">Conditions</span>
                    </h1>
                </div>

                <div className="glass-card p-8 md:p-12 leading-relaxed">
                    <div
                        className="dynamic-content"
                        dangerouslySetInnerHTML={{ __html: termsContent }}
                    />

                    <div className="pt-10 mt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-sm text-[#8b8fa8]">
                            © {new Date().getFullYear()} {settings?.brand_name || 'PeopleOS'}. All rights reserved.
                        </div>
                        <div className="flex gap-6">
                            <Link href="/about" className="text-sm font-medium text-[#6c63ff] hover:underline">
                                About Us
                            </Link>
                            <Link href="/privacy-policy" className="text-sm font-medium text-[#6c63ff] hover:underline">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}