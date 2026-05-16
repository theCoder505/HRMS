import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import { SharedData } from '@/types';

export default function TermsConditions() {
    const { settings } = usePage<SharedData>().props;
    const termsContent = settings?.terms_conditions || 'Content coming soon...';

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

                .dynamic-content h1, .dynamic-content h2, .dynamic-content h3 { font-family: 'Space Grotesk', sans-serif; color: white; margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 700; }
                .dynamic-content h1 { font-size: 2rem; }
                .dynamic-content h2 { font-size: 1.5rem; }
                .dynamic-content p { margin-bottom: 1.25rem; }
                .dynamic-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
                .dynamic-content li { margin-bottom: 0.5rem; }
            `}</style>

            {/* Navigation */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-[#05060a]/80 backdrop-blur-md border-b border-white/5">
                <Link href="/" className="flex items-center gap-2">
                    <img src={settings?.brand_logo || "/assets/logo.png"} alt={settings?.brand_name || "PeopleOS"} className="h-8 object-contain" />
                </Link>
                <Link href="/" className="text-sm font-medium text-[#8b8fa8] hover:text-white transition-colors">
                    Back to Home
                </Link>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Space_Grotesk']">
                        Terms & <span className="gradient-text">Conditions</span>
                    </h1>
                    <p className="text-[#8b8fa8]">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>

                <div className="glass-card p-8 md:p-12 leading-relaxed text-[#d1d1e0]">
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

