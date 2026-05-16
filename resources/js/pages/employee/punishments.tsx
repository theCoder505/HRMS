import EmployeeLayout from '@/layouts/employee-layout';
import { Head } from '@inertiajs/react';

interface Punishment {
    id: number;
    title: string;
    punishment_reason: string;
    effective_from: string;
    effective_to: string;
    basic_salary: number;
    deduction_amount: number;
    created_at: string;
}

export default function Punishments({ punishments }: { punishments: Punishment[] }) {
    return (
        <EmployeeLayout>
            <Head title="My Punishments" />

            <div className="mb-8">
                <h1 className="font-['Syne',sans-serif] text-3xl font-extrabold tracking-tight">Disciplinary Actions</h1>
                <p className="mt-2 text-lg text-gray-600">View all disciplinary actions issued to you</p>
            </div>

            {punishments.length === 0 ? (
                <div className="rounded-xl border border-[#e2dfd6] bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                        <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">All clear!</p>
                    <p className="mt-1 text-sm text-gray-500">No disciplinary actions on record.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {punishments.map((p) => {
                        const pct = p.basic_salary > 0 ? ((p.deduction_amount / p.basic_salary) * 100).toFixed(1) : null;
                        return (
                            <div key={p.id} className="rounded-xl border border-red-200 bg-white shadow-sm overflow-hidden">
                                <div className="flex items-start justify-between gap-4 p-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="rounded-full bg-red-100 p-2">
                                                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-2.694-.834-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold font-['Syne',sans-serif] text-gray-900">{p.title}</h3>
                                        </div>

                                        <p className="text-gray-600 mb-4 leading-relaxed">{p.punishment_reason}</p>

                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="rounded-lg bg-gray-50 p-3">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Effective From</p>
                                                <p className="mt-1 font-semibold text-gray-800">
                                                    {new Date(p.effective_from).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 p-3">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Effective To</p>
                                                <p className="mt-1 font-semibold text-gray-800">
                                                    {new Date(p.effective_to).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-red-50 p-3">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-red-500">Deduction</p>
                                                <p className="mt-1 font-bold text-red-700 font-['Syne',sans-serif] text-lg">
                                                    ${Number(p.deduction_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                                {pct && <p className="text-xs text-red-500 mt-0.5">{pct}% of basic</p>}
                                            </div>
                                            <div className="rounded-lg bg-gray-50 p-3">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Basic Salary</p>
                                                <p className="mt-1 font-semibold text-gray-800">
                                                    ${Number(p.basic_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-red-100 bg-red-50/50 px-6 py-3">
                                    <p className="text-xs text-gray-500">
                                        Issued on {new Date(p.created_at).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </EmployeeLayout>
    );
}
