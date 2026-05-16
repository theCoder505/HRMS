import EmployeeLayout from '@/layouts/employee-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

interface Payroll {
    id: number;
    employee_uid: string;
    basic_salary: number;
    net_amount: number;
    payment_includes: string[];
    salary_month: string;
    salary_year: string;
    note: string | null;
    created_at: string;
}

const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
];

export default function Payrolls({ payrolls }: { payrolls: Payroll[] }) {
    const [expanded, setExpanded] = useState<number | null>(null);

    const toggle = (id: number) => setExpanded(expanded === id ? null : id);

    return (
        <EmployeeLayout>
            <Head title="My Payrolls" />

            <div className="mb-8">
                <h1 className="font-['Syne',sans-serif] text-3xl font-extrabold tracking-tight">My Payrolls</h1>
                <p className="mt-2 text-lg text-gray-600">View all your salary slips and payment details</p>
            </div>

            {payrolls.length === 0 ? (
                <div className="rounded-xl border border-[#e2dfd6] bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <p className="text-lg font-medium text-gray-600">No payroll records found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {payrolls.map((payroll) => (
                        <div key={payroll.id} className="rounded-xl border border-[#e2dfd6] bg-white shadow-sm overflow-hidden">
                            {/* Header row */}
                            <button
                                onClick={() => toggle(payroll.id)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-[#f7f6f2] transition-colors"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="rounded-lg bg-[#d4500a]/10 px-4 py-2">
                                        <p className="font-['Syne',sans-serif] text-sm font-bold text-[#d4500a] uppercase">
                                            {payroll.salary_month ? monthNames[parseInt(payroll.salary_month) - 1] : '—'}
                                        </p>
                                        <p className="text-xs text-[#d4500a]/70">{payroll.salary_year}</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold font-['Syne',sans-serif]">
                                            ${Number(payroll.net_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            <span className="ml-2 text-sm font-normal text-gray-500">net pay</span>
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Basic: ${Number(payroll.basic_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                            Number(payroll.net_amount) >= Number(payroll.basic_salary)
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                        {Number(payroll.net_amount) >= Number(payroll.basic_salary) ? 'No Deduction' : 'Deducted'}
                                    </span>
                                    <svg
                                        className={`h-5 w-5 text-gray-400 transition-transform ${expanded === payroll.id ? 'rotate-180' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {/* Expanded details */}
                            {expanded === payroll.id && (
                                <div className="border-t border-[#e2dfd6] bg-[#fafafa] px-6 py-5">
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Basic Salary</p>
                                            <p className="mt-1 text-xl font-bold font-['Syne',sans-serif]">
                                                ${Number(payroll.basic_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Net Pay</p>
                                            <p className="mt-1 text-xl font-bold font-['Syne',sans-serif] text-emerald-600">
                                                ${Number(payroll.net_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Difference</p>
                                            <p className={`mt-1 text-xl font-bold font-['Syne',sans-serif] ${Number(payroll.net_amount) - Number(payroll.basic_salary) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                ${(Number(payroll.net_amount) - Number(payroll.basic_salary)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>

                                        {payroll.payment_includes && payroll.payment_includes.length > 0 && (
                                            <div className="sm:col-span-2 lg:col-span-3">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Payment Includes</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {payroll.payment_includes.map((item) => (
                                                        <span key={item} className="inline-flex rounded-md bg-[#0d0f14]/10 px-2 py-1 text-xs font-semibold capitalize text-[#0d0f14]">
                                                            {item.replace(/_/g, ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {payroll.note && (
                                            <div className="sm:col-span-2 lg:col-span-3">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Note</p>
                                                <p className="text-sm text-gray-700 rounded-md bg-white border border-[#e2dfd6] p-3">{payroll.note}</p>
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Issued On</p>
                                            <p className="mt-1 text-sm font-medium text-gray-700">
                                                {new Date(payroll.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </EmployeeLayout>
    );
}
