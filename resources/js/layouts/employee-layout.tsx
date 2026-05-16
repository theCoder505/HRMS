import { usePage, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { type SharedData } from '@/types';
import { useAppearance } from '@/hooks/use-appearance';
import { Sun, Moon, Monitor, LogOut, Menu, X } from 'lucide-react';

const NAV_LINKS = [
    { name: 'Dashboard',      href: (r: typeof route) => r('employee.dashboard'),      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Attendance',     href: (r: typeof route) => r('employee.attendance'),     icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Leaves',         href: (r: typeof route) => r('employee.leaves'),         icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Payrolls',       href: (r: typeof route) => r('employee.payrolls'),       icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
    { name: 'Holidays',       href: (r: typeof route) => r('employee.holidays'),       icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
    { name: 'Announcements',  href: (r: typeof route) => r('employee.announcements'),  icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
    { name: 'Punishments',    href: (r: typeof route) => r('employee.punishments'),    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-2.694-.834-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z' },
    { name: 'My Profile',     href: (r: typeof route) => r('employee.profile'),        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

function NavIcon({ d }: { d: string }) {
    return (
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} />
        </svg>
    );
}

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const { auth, name } = usePage<SharedData>().props;
    const { appearance, updateAppearance } = useAppearance();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const [mobileOpen, setMobileOpen] = useState(false);

    const appName = (name as string) || 'PeopleOS';
    const employee = (auth as any)?.employee;

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
             className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#05060a] dark:text-[#f0f0ff]">

            {/* Google Fonts */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />

            {/* Ambient orbs */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40 dark:opacity-100">
                <div className="absolute -left-48 -top-48 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[120px] dark:bg-purple-600/20" />
                <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-red-500/10 blur-[100px] dark:bg-red-500/15" />
            </div>

            {/* ── TOP NAV ── */}
            <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl transition-colors dark:border-white/[0.06] dark:bg-[#05060a]/80 sm:px-6 lg:px-8">
                {/* Logo */}
                <div className="flex items-center gap-4">
                    <Link href={route('employee.dashboard')} className="flex items-center gap-2.5 shrink-0">
                        <img src="/assets/hrms_icon.png" alt={appName} className="h-8 w-8 object-contain" />
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                              className="hidden text-base font-bold tracking-tight sm:block text-slate-900 dark:text-white">
                            {appName}
                            <span className="ml-1.5 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-purple-600 align-middle dark:bg-purple-500/15 dark:text-purple-400">
                                Employee
                            </span>
                        </span>
                    </Link>
                </div>

                {/* Desktop nav links */}
                <div className="hidden items-center gap-1 lg:flex">
                    {NAV_LINKS.map((link) => {
                        const href = link.href(route);
                        const active = currentPath === new URL(href, 'http://x').pathname;
                        return (
                            <Link key={link.name} href={href}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                    active
                                        ? 'bg-slate-200/50 text-slate-900 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/10'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-[#8b8fa8] dark:hover:bg-white/[0.05] dark:hover:text-white'
                                }`}>
                                <NavIcon d={link.icon} />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Theme Toggle */}
                    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/[0.05] ring-1 ring-slate-200 dark:ring-white/10">
                        <button 
                            onClick={() => updateAppearance('light')}
                            className={`p-1.5 rounded-lg transition-all ${appearance === 'light' ? 'bg-white shadow-sm text-amber-500' : 'text-slate-500 hover:text-slate-900 dark:text-[#8b8fa8] dark:hover:text-white'}`}
                            title="Light Mode"
                        >
                            <Sun className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => updateAppearance('dark')}
                            className={`p-1.5 rounded-lg transition-all ${appearance === 'dark' ? 'bg-slate-800 shadow-sm text-purple-400 dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-[#8b8fa8] dark:hover:text-white'}`}
                            title="Dark Mode"
                        >
                            <Moon className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => updateAppearance('system')}
                            className={`p-1.5 rounded-lg transition-all ${appearance === 'system' ? 'bg-white shadow-sm text-blue-500 dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-[#8b8fa8] dark:hover:text-white'}`}
                            title="System Mode"
                        >
                            <Monitor className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="hidden h-6 w-px bg-slate-200 dark:bg-white/10 sm:block" />

                    <Link
                        href={route('employee.logout')}
                        method="post"
                        as="button"
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-500/40 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-[#f0f0ff] dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </Link>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-[#8b8fa8] dark:hover:text-white lg:hidden"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </nav>

            {/* Mobile slide-down nav */}
            {mobileOpen && (
                <div className="fixed inset-x-0 top-16 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl transition-colors dark:border-white/[0.06] dark:bg-[#05060a]/95 lg:hidden">
                    <div className="grid grid-cols-2 gap-1 p-4 sm:grid-cols-3">
                        {NAV_LINKS.map((link) => {
                            const href = link.href(route);
                            const active = currentPath === new URL(href, 'http://x').pathname;
                            return (
                                <Link key={link.name} href={href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                                        active
                                            ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/10'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-[#8b8fa8] dark:hover:bg-white/[0.05] dark:hover:text-white'
                                    }`}>
                                    <NavIcon d={link.icon} />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Page content */}
            <main className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
