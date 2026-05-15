import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import FlashMessage from '../FlashMessage';

interface Leave {
    id: number;
    employee_uid: string;
    employee_name: string;
    employee_email: string;
    employee_img: string | null;
    title: string;
    leave_reson: string;
    leave_from_date: string;
    leave_to_date: string;
    type: 'paid' | 'unpaid';
    deduction_type: 'percent' | 'fixed';
    deduction_amount: string;
    approval: '0' | '1' | 0 | 1;
    created_at: string;
}

interface Props {
    leaves: Leave[];
}

const PER_PAGE = 10;

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function daysBetween(from: string, to: string) {
    return Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1);
}
function initials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

function StatusBadge({ approval }: { approval: Leave['approval'] }) {
    const ok = Number(approval) === 1;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                ok
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800/50'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800/50'
            } ring-1 ${ok ? 'ring-emerald-200 dark:ring-emerald-800/50' : 'ring-amber-200 dark:ring-amber-800/50'}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {ok ? 'Approved' : 'Pending'}
        </span>
    );
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
    return (
        <span className="ml-1 inline-flex flex-col gap-px">
            <svg className={`h-2 w-2 ${active && dir === 'asc' ? 'opacity-100' : 'opacity-25'}`} viewBox="0 0 8 4" fill="currentColor">
                <path d="M4 0l4 4H0z" />
            </svg>
            <svg className={`h-2 w-2 ${active && dir === 'desc' ? 'opacity-100' : 'opacity-25'}`} viewBox="0 0 8 4" fill="currentColor">
                <path d="M4 4L0 0h8z" />
            </svg>
        </span>
    );
}

function Avatar({ img, name }: { img: string | null; name: string }) {
    return img ? (
        <img src={`/${img}`} alt={name} className="h-14 w-14 rounded-full object-cover shadow ring-2 ring-white dark:ring-gray-800" />
    ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-base font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {initials(name)}
        </div>
    );
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Leave Requests', href: '/hrm/leave-requests' }];

export default function LeaveRequests({ leaves }: Props) {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<keyof Leave>('created_at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Leave | null>(null);
    const [approval, setApproval] = useState<'0' | '1'>('0');
    const [leaveType, setLeaveType] = useState<'paid' | 'unpaid'>('paid');
    const [dedType, setDedType] = useState<'percent' | 'fixed'>('fixed');
    const [dedAmt, setDedAmt] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    function openModal(leave: Leave) {
        setSelected(leave);
        setApproval(String(leave.approval) as '0' | '1');
        setLeaveType(leave.type);
        setDedType(leave.deduction_type);
        setDedAmt(leave.deduction_amount);
        setOpen(true);
    }

    useEffect(() => {
        if (open) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [open]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return leaves.filter(
            (l) => l.employee_name.toLowerCase().includes(q) || l.title.toLowerCase().includes(q) || l.employee_uid.toLowerCase().includes(q),
        );
    }, [leaves, search]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            const av = String(a[sortKey] ?? '');
            const bv = String(b[sortKey] ?? '');
            return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        });
    }, [filtered, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
    const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    useEffect(() => setPage(1), [search, sortKey, sortDir]);

    function toggleSort(key: keyof Leave) {
        if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(key);
            setSortDir('desc');
        }
    }

    function handleSubmit() {
        if (!selected) return;
        setSubmitting(true);
        router.put(
            route('hr.leaves.update'),
            { id: selected.id, approval, type: leaveType, deduction_type: dedType, deduction_amount: dedAmt },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    setSubmitting(false);
                },
                onError: () => setSubmitting(false),
            },
        );
    }

    const cols: { key: keyof Leave; label: string }[] = [
        { key: 'employee_name', label: 'Employee' },
        { key: 'title', label: 'Title' },
        { key: 'leave_from_date', label: 'From' },
        { key: 'leave_to_date', label: 'To' },
        { key: 'type', label: 'Type' },
        { key: 'approval', label: 'Status' },
        { key: 'created_at', label: 'Requested' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Requests" />
            <FlashMessage />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Leave Requests</h1>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Review and manage employee leave applications.</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-xs">
                        <svg
                            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search name, UID or title…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-gray-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-gray-600"
                        />
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                {cols.map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={() => toggleSort(col.key)}
                                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase select-none hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <span className="inline-flex items-center">
                                            {col.label}
                                            <SortIcon active={sortKey === col.key} dir={sortDir} />
                                        </span>
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={cols.length + 1} className="py-16 text-center text-gray-400 dark:text-gray-500">
                                        No leave requests found.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((leave) => (
                                    <tr key={leave.id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/50">
                                        {/* Employee — name + UID in one column */}
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{leave.employee_name}</p>
                                            <p className="font-mono text-xs text-gray-400 dark:text-gray-500">{leave.employee_uid}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="block max-w-[160px] truncate font-medium text-gray-800 dark:text-gray-200">
                                                {leave.title}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(leave.leave_from_date)}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(leave.leave_to_date)}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    leave.type === 'paid'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800/50'
                                                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 dark:ring-orange-800/50'
                                                } ring-1 ${leave.type === 'paid' ? 'ring-blue-200 dark:ring-blue-800/50' : 'ring-orange-200 dark:ring-orange-800/50'}`}
                                            >
                                                {leave.type === 'paid' ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge approval={leave.approval} />
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">{formatDate(leave.created_at)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => openModal(leave)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>
                            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                                ← Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                .reduce<(number | '…')[]>((acc, p, i, arr) => {
                                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) =>
                                    p === '…' ? (
                                        <span key={`e${i}`} className="px-2 py-1.5 text-xs">
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p as number)}
                                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                                                page === p
                                                    ? 'border-gray-800 bg-gray-800 text-white dark:border-gray-600 dark:bg-gray-700'
                                                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ),
                                )}
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <dialog
                ref={dialogRef}
                onClose={() => setOpen(false)}
                className="m-auto w-full max-w-lg rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-gray-900/50 backdrop:backdrop-blur-sm dark:backdrop:bg-black/70"
            >
                {selected && (
                    <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white dark:bg-gray-900">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
                            <div>
                                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Review Leave Request</h2>
                                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Set type, deduction and decision, then save.</p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="ml-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                            <div className="flex items-center gap-4 rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-gray-100 dark:bg-gray-800/50 dark:ring-gray-700">
                                <Avatar img={selected.employee_img} name={selected.employee_name} />
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{selected.employee_name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{selected.employee_email}</p>
                                    <p className="mt-0.5 font-mono text-xs text-gray-400 dark:text-gray-500">{selected.employee_uid}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 text-sm">
                                <div className="col-span-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                                    <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">Title</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{selected.title}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                                    <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">From</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(selected.leave_from_date)}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                                    <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">To</p>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(selected.leave_to_date)}</p>
                                </div>
                                <div className="col-span-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                                    <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">
                                        Reason · {daysBetween(selected.leave_from_date, selected.leave_to_date)} day(s)
                                    </p>
                                    <p className="leading-relaxed text-gray-700 dark:text-gray-300">{selected.leave_reson}</p>
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Leave Type</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['paid', 'unpaid'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setLeaveType(t)}
                                            className={`rounded-xl border-2 py-2.5 text-sm font-semibold transition-all ${
                                                leaveType === t
                                                    ? t === 'paid'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                                                        : 'border-orange-500 bg-orange-50 text-orange-700 dark:border-orange-600 dark:bg-orange-950/50 dark:text-orange-400'
                                                    : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            {t === 'paid' ? '💰 Paid' : '⏸ Unpaid'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {leaveType === 'unpaid' && (
                                <div className="space-y-3 rounded-xl border border-orange-100 bg-orange-50/60 p-4 dark:border-orange-900/30 dark:bg-orange-950/30">
                                    <p className="text-sm font-semibold text-orange-800 dark:text-orange-400">Deduction Settings</p>
                                    <div>
                                        <p className="mb-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                            Deduction Type
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(['fixed', 'percent'] as const).map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setDedType(t)}
                                                    className={`rounded-lg border py-2 text-sm font-semibold transition-all ${
                                                        dedType === t
                                                            ? 'border-orange-400 bg-orange-100 text-orange-800 dark:border-orange-600 dark:bg-orange-950/50 dark:text-orange-400'
                                                            : 'border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500'
                                                    }`}
                                                >
                                                    {t === 'fixed' ? '৳ Fixed' : '% Percentage'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                            {dedType === 'fixed' ? 'Amount (৳)' : 'Percentage (%)'}
                                        </p>
                                        <div className="relative">
                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold text-gray-400 dark:text-gray-500">
                                                {dedType === 'fixed' ? '৳' : '%'}
                                            </span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={dedAmt}
                                                onChange={(e) => setDedAmt(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-8 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-orange-800"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Decision</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setApproval('1')}
                                        className={`flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold transition-all ${
                                            approval === '1'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path d="m20 6-11 11-5-5" />
                                        </svg>
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setApproval('0')}
                                        className={`flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-sm font-semibold transition-all ${
                                            approval === '0'
                                                ? 'border-red-500 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-950/50 dark:text-red-400'
                                                : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path d="M18 6 6 18M6 6l12 12" />
                                        </svg>
                                        Deny
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4 dark:border-gray-800">
                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                                    approval === '1'
                                        ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800'
                                        : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
                                }`}
                            >
                                {submitting && (
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                    </svg>
                                )}
                                {submitting ? 'Saving…' : approval === '1' ? 'Approve Leave' : 'Deny Leave'}
                            </button>
                        </div>
                    </div>
                )}
            </dialog>
        </AppLayout>
    );
}
