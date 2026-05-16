import EmployeeLayout from '@/layouts/employee-layout';
import { Head, Link } from '@inertiajs/react';
import { Users, FileText, AlertTriangle, Speaker, Calendar, ArrowRight } from 'lucide-react';

interface DashboardProps {
    employee: any;
    totalLeaves: number;
    pendingLeaves: number;
    payrollsCount: number;
    punishmentsCount: number;
    announcementsCount: number;
}

export default function Dashboard({
    employee,
    totalLeaves,
    pendingLeaves,
    payrollsCount,
    punishmentsCount,
    announcementsCount
}: DashboardProps) {
    return (
        <EmployeeLayout>
            <Head title="Employee Dashboard" />

            <div className="mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
                            Welcome back, {employee.name}! 👋
                        </h1>
                        <p className="mt-2 text-xl text-slate-500 dark:text-[#8b8fa8]">
                            Here's what's happening with your profile today.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center dark:bg-emerald-500/20">
                            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <span className="text-sm font-bold text-slate-600 dark:text-emerald-400">System Online</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.03] backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-xl dark:hover:border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#8b8fa8]">Total Leaves</p>
                            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">{totalLeaves}</p>
                            {pendingLeaves > 0 && (
                                <p className="mt-2 text-sm font-bold text-amber-600 dark:text-amber-400">{pendingLeaves} Pending Approval</p>
                            )}
                        </div>
                        <div className="rounded-2xl bg-blue-500/10 p-4 text-blue-600 ring-1 ring-blue-500/20 dark:text-blue-400">
                            <Calendar className="h-8 w-8" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.03] backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-xl dark:hover:border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#8b8fa8]">Payrolls</p>
                            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">{payrollsCount}</p>
                            <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">View salary slips</p>
                        </div>
                        <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                            <FileText className="h-8 w-8" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.03] backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-xl dark:hover:border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#8b8fa8]">Punishments</p>
                            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">{punishmentsCount}</p>
                            <p className="mt-2 text-sm font-bold text-red-600 dark:text-red-400">Records found</p>
                        </div>
                        <div className="rounded-2xl bg-red-500/10 p-4 text-red-600 ring-1 ring-red-500/20 dark:text-red-400">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.03] backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-xl dark:hover:border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#8b8fa8]">Broadcasts</p>
                            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">{announcementsCount}</p>
                            <p className="mt-2 text-sm font-bold text-purple-600 dark:text-purple-400">Latest updates</p>
                        </div>
                        <div className="rounded-2xl bg-purple-500/10 p-4 text-purple-600 ring-1 ring-purple-500/20 dark:text-purple-400">
                            <Speaker className="h-8 w-8" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.03] backdrop-blur-md overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Users className="h-40 w-40" />
                </div>
                
                <div className="relative z-10">
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-3xl font-bold text-slate-900 dark:text-white">Quick Actions</h2>
                    <p className="mt-2 text-lg text-slate-500 dark:text-[#8b8fa8]">Access frequently used tools instantly.</p>

                    <div className="mt-10 flex flex-wrap gap-4">
                        <Link href={route('employee.leaves')} className="flex items-center gap-2 rounded-2xl bg-purple-600 px-8 py-4 font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-purple-500 hover:scale-105 active:scale-95">
                            Apply for Leave <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link href={route('employee.attendance')} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-900 transition-all hover:bg-slate-50 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/10 dark:hover:border-white/20">
                            View Attendance History
                        </Link>
                    </div>
                </div>
            </div>
        </EmployeeLayout>
    );
}
