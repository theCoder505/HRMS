import EmployeeLayout from '@/layouts/employee-layout';
import { Head } from '@inertiajs/react';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';

interface Punishment {
    id: number;
    employee_uid: string;
    title: string;
    punishment_reason: string;
    effective_from: string;
    effective_to: string;
    basic_salary: string;
    deduction_amount: string;
    created_at: string;
}

export default function Punishments({ punishments }: { punishments: Punishment[] }) {
    return (
        <EmployeeLayout>
            <Head title="Punishments" />
            
            <div className="mb-10">
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">Punishments</h1>
                <p className="mt-2 text-lg text-slate-500 dark:text-[#8b8fa8]">Records of disciplinary actions and salary deductions</p>
            </div>

            <div className="grid gap-6">
                {punishments.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-[#8b8fa8] backdrop-blur-md transition-colors">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No punishment records found.</p>
                    </div>
                ) : (
                    punishments.map((punishment) => (
                        <div key={punishment.id} className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm backdrop-blur-md transition-all hover:border-red-500/30 hover:bg-red-50/30 dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:bg-red-500/[0.02]">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="rounded-xl bg-red-500/10 p-2.5 text-red-600 ring-1 ring-red-500/20 dark:text-red-400">
                                            <AlertTriangle className="h-5 w-5" />
                                        </div>
                                        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                            {punishment.title}
                                        </h3>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 ring-1 ring-slate-200 dark:bg-white/5 dark:text-[#8b8fa8] dark:ring-white/10">
                                            Record ID: #{punishment.id}
                                        </span>
                                    </div>
                                    
                                    <div className="mt-6 space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 dark:text-[#5b5f78]">Disciplinary Reason</p>
                                            <p className="text-lg text-slate-700 leading-relaxed dark:text-[#8b8fa8]">
                                                {punishment.punishment_reason}
                                            </p>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-6 pt-2">
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#8b8fa8]">
                                                <Calendar className="h-4 w-4" />
                                                From: <span className="font-semibold text-slate-700 dark:text-white">{punishment.effective_from}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#8b8fa8]">
                                                <Clock className="h-4 w-4" />
                                                To: <span className="font-semibold text-slate-700 dark:text-white">{punishment.effective_to}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-left sm:text-right shrink-0 border-l border-slate-100 pl-8 dark:border-white/10">
                                    <p className="text-[10px] font-bold text-red-500/70 uppercase tracking-[0.2em] dark:text-red-400/70">Deduction Amount</p>
                                    <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-4xl font-bold text-red-600 mt-1 dark:text-red-400">
                                        ${punishment.deduction_amount}
                                    </p>
                                    <div className="mt-3 space-y-1">
                                        <p className="text-[11px] text-slate-400 dark:text-[#8b8fa8]">Affected Base Salary:</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-white">${punishment.basic_salary}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </EmployeeLayout>
    );
}
