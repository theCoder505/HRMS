import EmployeeLayout from '@/layouts/employee-layout';
import { Head } from '@inertiajs/react';
import { Calendar, Info } from 'lucide-react';

interface Holiday {
    id: number;
    title: string;
    reason: string;
    start_date: string;
    end_date: string;
}

export default function Holidays({ holidays }: { holidays: Holiday[] }) {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const upcoming = holidays.filter(h => h.end_date >= todayStr).sort((a, b) => a.start_date.localeCompare(b.start_date));
    const past = holidays.filter(h => h.end_date < todayStr).sort((a, b) => b.start_date.localeCompare(a.start_date));

    return (
        <EmployeeLayout>
            <Head title="Company Holidays" />
            
            <div className="mb-10">
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">Company Holidays</h1>
                <p className="mt-2 text-lg text-slate-500 dark:text-[#8b8fa8]">Calendar of scheduled time-offs and events</p>
            </div>

            <div className="space-y-16">
                {/* Upcoming Holidays */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-xl font-bold text-slate-900 uppercase tracking-wider dark:text-white">Upcoming Holidays</h2>
                    </div>
                    
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {upcoming.length === 0 ? (
                            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 dark:border-white/10 dark:text-[#8b8fa8]">
                                No upcoming holidays scheduled.
                            </div>
                        ) : (
                            upcoming.map((holiday) => (
                                <div key={holiday.id} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm backdrop-blur-md transition-all hover:border-emerald-500/30 hover:bg-emerald-50/30 dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:bg-emerald-500/[0.02]">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                        <div className="text-right">
                                            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-xl font-bold text-slate-900 dark:text-white">
                                                {holiday.start_date === holiday.end_date 
                                                    ? new Date(holiday.start_date).getDate() 
                                                    : `${new Date(holiday.start_date).getDate()}-${new Date(holiday.end_date).getDate()}`
                                                }
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-[#8b8fa8]">
                                                {new Date(holiday.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors dark:text-white dark:group-hover:text-emerald-400">{holiday.title}</h3>
                                    <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-white/5">
                                        <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-slate-600 leading-relaxed dark:text-[#8b8fa8]">{holiday.reason}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-[11px] font-medium text-slate-400 dark:border-white/5 dark:text-[#5b5f78]">
                                        <span>Duration:</span>
                                        <span className="text-slate-600 dark:text-[#8b8fa8]">
                                            {Math.ceil((new Date(holiday.end_date).getTime() - new Date(holiday.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} Day(s)
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Past Holidays */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-white/20" />
                        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-xl font-bold text-slate-400 uppercase tracking-wider dark:text-[#8b8fa8]">Past Holidays</h2>
                    </div>
                    
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {past.length === 0 ? (
                            <p className="text-slate-400 italic text-sm dark:text-[#8b8fa8]">No past records available.</p>
                        ) : (
                            past.map((holiday) => (
                                <div key={holiday.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 opacity-60 transition-all hover:opacity-100 dark:border-white/[0.05] dark:bg-white/[0.01]">
                                    <div className="text-sm font-semibold text-slate-700 dark:text-white mb-1">{holiday.title}</div>
                                    <p className="text-xs text-slate-400 dark:text-[#8b8fa8]">
                                        {new Date(holiday.start_date).toLocaleDateString()}
                                        {holiday.start_date !== holiday.end_date && ` - ${new Date(holiday.end_date).toLocaleDateString()}`}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </EmployeeLayout>
    );
}
