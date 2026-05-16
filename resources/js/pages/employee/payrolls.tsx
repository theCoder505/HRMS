import EmployeeLayout from '@/layouts/employee-layout';
import { Head } from '@inertiajs/react';
import { ChevronDown, FileText, Download } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

interface Payroll {
    id: number;
    employee_uid: string;
    basic_salary: string;
    allowance: string;
    punishment_deduction: string;
    net_salary: string;
    month: string;
    year: string;
    created_at: string;
}

export default function Payrolls({ payrolls }: { payrolls: Payroll[] }) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const handleDownload = () => {
        Swal.fire({
            title: 'Generating PDF...',
            text: 'Your salary slip is being prepared.',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false,
            background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        });
    };

    return (
        <EmployeeLayout>
            <Head title="My Payrolls" />
            
            <div className="mb-10">
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Payrolls</h1>
                <p className="mt-2 text-lg text-slate-500 dark:text-[#8b8fa8]">View and download your monthly salary slips</p>
            </div>

            <div className="grid gap-6">
                {payrolls.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-[#8b8fa8] backdrop-blur-md">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No payroll records found.</p>
                    </div>
                ) : (
                    payrolls.map((payroll) => (
                        <div key={payroll.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm backdrop-blur-md transition-all hover:border-slate-300 dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:border-white/10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 p-6 border-b border-slate-100 gap-4 dark:bg-white/[0.02] dark:border-white/[0.07]">
                                <div>
                                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-xl font-bold text-slate-900 dark:text-white">
                                        Payroll for {payroll.month} {payroll.year}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1 dark:text-[#8b8fa8]">Generated on {new Date(payroll.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] dark:text-[#8b8fa8]">Net Salary</p>
                                        <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                            ${payroll.net_salary}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setExpandedId(expandedId === payroll.id ? null : payroll.id)}
                                        className="rounded-xl bg-slate-100 p-2.5 text-slate-600 transition-all hover:bg-slate-200 ring-1 ring-slate-200 dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/10 dark:ring-white/10"
                                    >
                                        <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${expandedId === payroll.id ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {expandedId === payroll.id && (
                                <div className="p-8 grid gap-8 md:grid-cols-2 bg-transparent animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 dark:text-[#8b8fa8]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                            Earnings
                                        </h4>
                                        <div className="space-y-4 rounded-xl bg-slate-50 p-5 border border-slate-100 dark:bg-white/[0.02] dark:border-white/[0.05]">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 dark:text-[#8b8fa8]">Basic Salary</span>
                                                <span className="text-slate-900 font-medium dark:text-white">${payroll.basic_salary}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 dark:text-[#8b8fa8]">Allowances</span>
                                                <span className="text-emerald-600 font-medium dark:text-emerald-400">+${payroll.allowance || '0.00'}</span>
                                            </div>
                                            <div className="border-t border-slate-200 pt-4 flex justify-between font-bold dark:border-white/[0.07]">
                                                <span className="text-slate-900 dark:text-white">Gross Salary</span>
                                                <span className="text-slate-900 dark:text-white">${(parseFloat(payroll.basic_salary) + parseFloat(payroll.allowance || '0')).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 dark:text-[#8b8fa8]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                            Deductions
                                        </h4>
                                        <div className="space-y-4 rounded-xl bg-slate-50 p-5 border border-slate-100 dark:bg-white/[0.02] dark:border-white/[0.05]">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 dark:text-[#8b8fa8]">Punishments</span>
                                                <span className="text-red-500 font-medium">-${payroll.punishment_deduction || '0.00'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 dark:text-[#8b8fa8]">Tax / PF / Others</span>
                                                <span className="text-red-500 font-medium">-$0.00</span>
                                            </div>
                                            <div className="border-t border-slate-200 pt-4 flex justify-between font-bold dark:border-white/[0.07]">
                                                <span className="text-slate-900 dark:text-white">Total Deductions</span>
                                                <span className="text-red-500">-${payroll.punishment_deduction || '0.00'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 mt-4 rounded-2xl bg-emerald-50 p-6 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                                        <div>
                                            <p className="text-emerald-700 text-[10px] font-bold uppercase tracking-[0.15em] dark:text-emerald-400/70">Final Net Payout</p>
                                            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-4xl font-bold text-slate-900 mt-1 dark:text-white">
                                                ${payroll.net_salary}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={handleDownload}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] dark:bg-emerald-500 dark:shadow-emerald-500/25 dark:hover:bg-emerald-400"
                                        >
                                            <Download className="h-5 w-5" />
                                            Download Slip (PDF)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </EmployeeLayout>
    );
}
