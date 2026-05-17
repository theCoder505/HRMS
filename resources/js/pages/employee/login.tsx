import InputError from '@/components/input-error';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { type SharedData } from '@/types';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
    const { name, settings } = usePage<SharedData>().props;

    const appName = (name as string) || 'PeopleOS';

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('employee.login'), { onFinish: () => reset('password') });
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            <Head title={`Employee Login — ${appName}`} />

            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />

            <div className="flex min-h-screen">
                {/* --- Left Column: Hero Section (Desktop Only) --- */}
                <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex">
                    {/* Background Pattern/Image */}
                    <div className="absolute inset-0 z-0 opacity-40">
                         <img 
                            src="/login_bg_abstract_1778893425343.png" 
                            alt="Background" 
                            className="h-full w-full object-cover scale-110 animate-pulse-slow"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-pink-950 via-purple-950/80 to-indigo-900/40" />
                    </div>

                    {/* Logo & Branding */}
                    <Link href='/' className="relative z-10 flex items-center gap-3">
                        <div className="flex h-16 items-center justify-center rounded-2xl shadow">
                            <img src={"/" + settings?.brand_logo || "/assets/logo.png"} alt={settings?.brand_name || appName} className="h-12 w-full object-contain" />
                        </div>
                    </Link>

                    {/* Hero Content */}
                    <div className="relative z-10 mb-20 max-w-lg">
                        <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            Empowering your <span className="text-indigo-400">workforce</span> journey.
                        </h2>
                        <p className="mt-6 text-lg leading-relaxed text-slate-400">
                            Streamline your work life, manage your attendance, and access your payroll details all in one place. Welcome back to the heart of our company.
                        </p>
                    </div>

                    {/* Footer Info */}
                    <div className="relative z-10 flex items-center gap-6 text-sm font-medium text-slate-500">
                        <span>© {new Date().getFullYear()} {settings?.brand_name || appName}</span>
                        <div className="h-1 w-1 rounded-full bg-slate-700" />
                        <Link href={route('about')} className="hover:text-indigo-400 transition-colors">About</Link>
                        <div className="h-1 w-1 rounded-full bg-slate-700" />
                        <Link href={route('privacy.policy')} className="hover:text-indigo-400 transition-colors">Privacy</Link>
                        <div className="h-1 w-1 rounded-full bg-slate-700" />
                        <Link href={route('terms.conditions')} className="hover:text-indigo-400 transition-colors">Terms</Link>
                    </div>


                </div>

                {/* --- Right Column: Login Form --- */}
                <div className="flex w-full flex-col justify-center bg-white p-8 sm:p-12 md:p-16 lg:w-1/2 xl:p-24">
                    <div className="mx-auto w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="mb-10 lg:hidden">
                             <div className="flex items-center gap-3">
                                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 overflow-hidden p-1">
                                     <img src={settings?.brand_icon || "/assets/hrms_icon.png"} alt={settings?.brand_name || appName} className="h-full w-full object-contain brightness-0 invert" />
                                 </div>
                                 <span className="text-lg font-bold tracking-tight text-slate-900">{settings?.brand_name || appName}</span>
                             </div>
                         </div>

                        <div className="mb-10">
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                Employee Login
                            </h1>
                            <p className="mt-2 text-slate-500">
                                Enter your credentials to access your portal
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold tracking-wide text-slate-700" htmlFor="email">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        autoFocus
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="name@company.com"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none ring-offset-2 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold tracking-wide text-slate-700" htmlFor="password">
                                        Password
                                    </label>
                                    <Link href={route('password.request')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm font-medium text-slate-900 outline-none ring-offset-2 transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember Me & Submit */}
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="remember" className="ml-2 block text-sm font-medium text-slate-600">
                                    Keep me signed in
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white shadow-xl transition-all hover:bg-slate-800 hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {processing ? 'Authenticating...' : 'Sign In'}
                                    {!processing && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
                                </span>
                                {processing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                    </div>
                                )}
                            </button>
                        </form>

                        {/* Switch Portal */}
                        <div className="mt-10 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center">
                            <p className="text-sm font-medium text-slate-600">
                                Managing the team? 
                                <Link href={route('hrm.login')} className="ml-1 font-bold text-indigo-600 hover:text-indigo-500 transition-colors inline-flex items-center gap-1">
                                    Admin Dashboard <ArrowRight size={14} />
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.4; transform: scale(1.1); }
                    50% { opacity: 0.6; transform: scale(1.15); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 10s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

