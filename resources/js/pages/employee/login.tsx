import InputError from '@/components/input-error';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { type SharedData } from '@/types';

export default function Login() {
    const { name } = usePage<SharedData>().props;
    const appName = (name as string) || 'PeopleOS';

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('employee.login'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title={`Employee Login — ${appName}`} />

            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />

            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Plus Jakarta Sans', sans-serif; background: #05060a; color: #f0f0ff; }
            `}</style>

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05060a] p-4">
                {/* Orbs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-green-500/15 blur-[120px]" />
                    <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[100px]" />
                </div>

                <div className="relative z-10 w-full max-w-md">
                    {/* Card */}
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-md">
                        {/* Logo */}
                        <div className="mb-8 flex flex-col items-center gap-3">
                            <Link href="/">
                                <img src="/assets/hrms_icon.png" alt={appName} className="h-14 w-14 object-contain" />
                            </Link>
                            <div className="text-center">
                                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    className="text-2xl font-bold tracking-tight text-white">
                                    Employee Portal
                                </h1>
                                <p className="mt-1 text-sm text-[#8b8fa8]">
                                    Sign in to <span className="text-[#f0f0ff]">{appName}</span>
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-[#c8c8d8]" htmlFor="email">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoFocus
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="you@company.com"
                                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-[#5b5f78] outline-none transition focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-[#c8c8d8]" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-3 pr-12 text-sm text-white placeholder-[#5b5f78] outline-none transition focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5b5f78] transition hover:text-[#c8c8d8]"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition hover:bg-green-400 disabled:opacity-60"
                            >
                                {processing && (
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                    </svg>
                                )}
                                {processing ? 'Signing in…' : 'Sign in'}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-[#8b8fa8]">
                            HR Admin?{' '}
                            <Link href={route('hrm.login')} className="font-semibold text-purple-400 hover:text-purple-300 transition">
                                Login here
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="mt-6 text-center text-xs text-[#5b5f78]">
                        © {new Date().getFullYear()} {appName}. All rights reserved.
                    </p>
                </div>
            </div>
        </>
    );
}
