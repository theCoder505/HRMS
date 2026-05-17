import EmployeeLayout from '@/layouts/employee-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Trash2, Plus, X, Calendar, BadgeDollarSign, Tag } from 'lucide-react';
import Swal from 'sweetalert2';

interface Leave {
    id: number;
    title: string;
    leave_reson: string;
    leave_from_date: string;
    leave_to_date: string;
    type: string | null;
    deduction_type: 'percent' | 'fixed' | null;
    deduction_amount: number | null;
    approval: number;
    created_at: string;
    updated_at: string;
}

export default function Leaves({ leaves }: { leaves: Leave[] }) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        leave_reson: '',
        leave_from_date: '',
        leave_to_date: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('employee.leaves.store'), {
            onSuccess: () => {
                reset();
                setShowForm(false);
                Swal.fire({
                    title: 'Submitted!',
                    text: 'Your leave request has been sent for approval.',
                    icon: 'success',
                    background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                });
            },
        });
    };

    const deleteRequest = (id: number) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('employee.leaves.destroy', id), {
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Your request has been removed.',
                            icon: 'success',
                            background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
                            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                        });
                    },
                });
            }
        });
    };

    const isDeletable = (leave: Leave) => {
        return leave.approval === 0 && leave.created_at === leave.updated_at;
    };

    const formatDeduction = (leave: Leave) => {
        if (!leave.deduction_amount) return null;
        if (leave.deduction_type === 'percent') return `${leave.deduction_amount}%`;
        if (leave.deduction_type === 'fixed') return `৳${leave.deduction_amount}`;
        return `${leave.deduction_amount}`;
    };

    return (
        <EmployeeLayout>
            <Head title="Leave Appeals" />

            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        className="text-3xl font-bold tracking-tight text-slate-900 transition-colors dark:text-white"
                    >
                        Leave Appeals
                    </h1>
                    <p className="mt-2 text-lg text-slate-500 dark:text-[#8b8fa8]">Manage your time-off requests</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white shadow-lg transition-all ${
                        showForm
                            ? 'bg-slate-500 hover:bg-slate-600'
                            : 'bg-purple-600 shadow-purple-500/20 hover:bg-purple-500 hover:shadow-purple-500/40'
                    }`}
                >
                    {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    {showForm ? 'Cancel' : 'New Appeal'}
                </button>
            </div>

            {/* ── Request Form ── */}
            {showForm && (
                <div className="mb-10 max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm backdrop-blur-md transition-colors dark:border-white/[0.07] dark:bg-white/[0.03]">
                    <h2
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        className="mb-6 text-xl font-bold text-slate-900 dark:text-white"
                    >
                        New Leave Request
                    </h2>
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-[#c8c8d8]">Subject</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white dark:placeholder-[#5b5f78]"
                                required
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-[#c8c8d8]">From Date</label>
                                <input
                                    type="date"
                                    value={data.leave_from_date}
                                    onChange={(e) => setData('leave_from_date', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 [color-scheme:dark] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                                    required
                                />
                                {errors.leave_from_date && <p className="mt-1 text-sm text-red-500">{errors.leave_from_date}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-[#c8c8d8]">To Date</label>
                                <input
                                    type="date"
                                    value={data.leave_to_date}
                                    onChange={(e) => setData('leave_to_date', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 [color-scheme:dark] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
                                    required
                                />
                                {errors.leave_to_date && <p className="mt-1 text-sm text-red-500">{errors.leave_to_date}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-[#c8c8d8]">Reason</label>
                            <textarea
                                value={data.leave_reson}
                                onChange={(e) => setData('leave_reson', e.target.value)}
                                rows={4}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white dark:placeholder-[#5b5f78]"
                                required
                            />
                            {errors.leave_reson && <p className="mt-1 text-sm text-red-500">{errors.leave_reson}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-xl bg-purple-600 px-8 py-3 font-semibold text-white transition-all hover:bg-purple-500 disabled:opacity-50 sm:w-auto"
                        >
                            Submit Request
                        </button>
                    </form>
                </div>
            )}

            {/* ── Table ── */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm backdrop-blur-md transition-colors dark:border-white/[0.07] dark:bg-white/[0.03]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-white/[0.07]">
                        <thead className="bg-slate-50 dark:bg-white/[0.03]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8b8fa8]">Subject</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8b8fa8]">Dates</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8b8fa8]">Reason</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8b8fa8]">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8b8fa8]">Deduction</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8b8fa8]">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#8b8fa8]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-transparent dark:divide-white/[0.05]">
                            {leaves.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-[#8b8fa8]">
                                        No leave requests found.
                                    </td>
                                </tr>
                            ) : (
                                leaves.map((leave) => {
                                    const deduction = formatDeduction(leave);
                                    return (
                                        <tr key={leave.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">

                                            {/* Subject */}
                                            <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                {leave.title}
                                            </td>

                                            {/* Dates */}
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600 dark:text-[#8b8fa8]">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 opacity-50" />
                                                    {leave.leave_from_date}
                                                    <span className="mx-1 opacity-40">→</span>
                                                    {leave.leave_to_date}
                                                </div>
                                            </td>

                                            {/* Reason */}
                                            <td className="max-w-[180px] truncate px-6 py-4 text-sm text-slate-500 dark:text-[#8b8fa8]">
                                                {leave.leave_reson}
                                            </td>

                                            {/* Type */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {leave.type ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-500/20 dark:bg-sky-500/10 dark:text-sky-400">
                                                        <Tag className="h-3 w-3" />
                                                        {leave.type}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-white/10">—</span>
                                                )}
                                            </td>

                                            {/* Deduction */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {deduction ? (
                                                    <div className="flex gap-2">
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
                                                            <BadgeDollarSign className="h-3 w-3" />
                                                            {deduction}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 capitalize">
                                                            {leave.deduction_type}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-white/10">—</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {leave.approval === 1 ? (
                                                    <span className="inline-flex rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                        Approved
                                                    </span>
                                                ) : leave.approval === 2 ? (
                                                    <span className="inline-flex rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                                                        Denied
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                {isDeletable(leave) && (
                                                    <button
                                                        onClick={() => deleteRequest(leave.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-white/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                                                        title="Delete Request"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </EmployeeLayout>
    );
}