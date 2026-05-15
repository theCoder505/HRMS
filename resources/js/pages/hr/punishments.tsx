import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import FlashMessage from '../FlashMessage';

interface EmployeeOption {
    employee_uid: string;
    name: string;
    email: string;
    img: string | null;
    job_title: string;
    salary: string;
}

interface PunishmentRecord {
    id: number;
    employee_uid: string;
    employee?: {
        name: string;
        email: string;
        img: string | null;
        job_title: string;
        salary: string;
    };
    title: string;
    punishment_reason: string;
    effective_from: string;
    effective_to: string;
    basic_salary: string;
    deduction_amount: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    punishments: PunishmentRecord[];
    employees: EmployeeOption[];
}

const PER_PAGE = 10;

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

function Avatar({ img, name, size = 'md' }: { img: string | null; name: string; size?: 'sm' | 'md' | 'lg' }) {
    const sizeCls = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base' }[size];
    return img ? (
        <img src={`/${img}`} alt={name} className={`${sizeCls} rounded-full object-cover shadow ring-white dark:ring-slate-800`} />
    ) : (
        <div
            className={`${sizeCls} flex items-center justify-center rounded-full bg-rose-100 font-bold text-rose-600 dark:bg-rose-900/50 dark:text-rose-300`}
        >
            {initials(name)}
        </div>
    );
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
    return (
        <span className="ml-1 inline-flex flex-col gap-px">
            <svg
                className={`h-2 w-2 ${active && dir === 'asc' ? 'opacity-100' : 'opacity-25 dark:opacity-40'}`}
                viewBox="0 0 8 4"
                fill="currentColor"
            >
                <path d="M4 0l4 4H0z" />
            </svg>
            <svg
                className={`h-2 w-2 ${active && dir === 'desc' ? 'opacity-100' : 'opacity-25 dark:opacity-40'}`}
                viewBox="0 0 8 4"
                fill="currentColor"
            >
                <path d="M4 4L0 0h8z" />
            </svg>
        </span>
    );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                {label}
                {required && <span className="ml-0.5 text-red-500 dark:text-red-400">*</span>}
            </label>
            {children}
        </div>
    );
}

const inputCls =
    'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-500';
const selectCls = inputCls;

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Punishments', href: '/hrm/punishments' }];

type ModalMode = 'add' | 'edit' | 'view';

function getEmpName(p: PunishmentRecord, employees: EmployeeOption[]): string {
    return p.employee?.name ?? employees.find((e) => e.employee_uid === p.employee_uid)?.name ?? p.employee_uid;
}
function getEmpEmail(p: PunishmentRecord, employees: EmployeeOption[]): string {
    return p.employee?.email ?? employees.find((e) => e.employee_uid === p.employee_uid)?.email ?? '';
}
function getEmpImg(p: PunishmentRecord, employees: EmployeeOption[]): string | null {
    return p.employee?.img ?? employees.find((e) => e.employee_uid === p.employee_uid)?.img ?? null;
}
function getEmpJobTitle(p: PunishmentRecord, employees: EmployeeOption[]): string {
    return p.employee?.job_title ?? employees.find((e) => e.employee_uid === p.employee_uid)?.job_title ?? '';
}

export default function Punishments({ punishments, employees }: Props) {
    /* ── table state ── */
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<keyof PunishmentRecord>('created_at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);

    /* ── modal ── */
    const [open, setOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('add');
    const [editTarget, setEditTarget] = useState<PunishmentRecord | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    /* ── delete confirm ── */
    const [deleteTarget, setDeleteTarget] = useState<PunishmentRecord | null>(null);
    const deleteDialogRef = useRef<HTMLDialogElement>(null);

    /* ── form fields ── */
    const [selectedUid, setSelectedUid] = useState('');
    const [title, setTitle] = useState('');
    const [reason, setReason] = useState('');
    const [effectiveFrom, setEffectiveFrom] = useState('');
    const [effectiveTo, setEffectiveTo] = useState('');
    const [basicSalary, setBasicSalary] = useState('');
    const [deductionAmount, setDeductionAmount] = useState('');

    const selectedEmp = useMemo(() => employees.find((e) => e.employee_uid === selectedUid) ?? null, [employees, selectedUid]);

    /* ── open/close dialogs ── */
    useEffect(() => {
        if (open) dialogRef.current?.showModal();
        else dialogRef.current?.close();
    }, [open]);

    useEffect(() => {
        if (deleteTarget) deleteDialogRef.current?.showModal();
        else deleteDialogRef.current?.close();
    }, [deleteTarget]);

    function resetForm() {
        setSelectedUid('');
        setTitle('');
        setReason('');
        setEffectiveFrom('');
        setEffectiveTo('');
        setBasicSalary('');
        setDeductionAmount('');
    }

    function openAdd() {
        resetForm();
        setEditTarget(null);
        setModalMode('add');
        setOpen(true);
    }

    function openView(p: PunishmentRecord) {
        setEditTarget(p);
        setModalMode('view');
        setSelectedUid(p.employee_uid);
        setTitle(p.title);
        setReason(p.punishment_reason);
        setEffectiveFrom(p.effective_from);
        setEffectiveTo(p.effective_to);
        setBasicSalary(p.basic_salary);
        setDeductionAmount(p.deduction_amount);
        setOpen(true);
    }

    function openEdit(p: PunishmentRecord) {
        setEditTarget(p);
        setModalMode('edit');
        setSelectedUid(p.employee_uid);
        setTitle(p.title);
        setReason(p.punishment_reason);
        setEffectiveFrom(p.effective_from);
        setEffectiveTo(p.effective_to);
        setBasicSalary(p.basic_salary);
        setDeductionAmount(p.deduction_amount);
        setOpen(true);
    }

    /* auto-fill basic salary when employee selected in add mode */
    useEffect(() => {
        if (modalMode !== 'add' || !selectedEmp) return;
        setBasicSalary(selectedEmp.salary ?? '');
    }, [selectedEmp, modalMode]);

    /* deduction percentage calc */
    const deductionPct = useMemo(() => {
        const base = parseFloat(basicSalary);
        const ded = parseFloat(deductionAmount);
        if (!isNaN(base) && !isNaN(ded) && base > 0) return ((ded / base) * 100).toFixed(2);
        return null;
    }, [basicSalary, deductionAmount]);

    /* ── submit (add) ── */
    function handleAdd() {
        if (!selectedEmp) return;
        setSubmitting(true);
        router.post(
            route('hr.punishments.store'),
            {
                employee_uid: selectedUid,
                title,
                punishment_reason: reason,
                effective_from: effectiveFrom,
                effective_to: effectiveTo,
                basic_salary: basicSalary,
                deduction_amount: deductionAmount,
            },
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

    /* ── submit (edit) ── */
    function handleUpdate() {
        if (!editTarget) return;
        setSubmitting(true);
        router.put(
            route('hr.punishments.update', editTarget.id),
            {
                employee_uid: selectedUid,
                title,
                punishment_reason: reason,
                effective_from: effectiveFrom,
                effective_to: effectiveTo,
                basic_salary: basicSalary,
                deduction_amount: deductionAmount,
            },
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

    /* ── delete ── */
    function handleDelete() {
        if (!deleteTarget) return;
        router.delete(route('hr.punishments.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    }

    /* ── table filter/sort/paginate ── */
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return punishments.filter((p) => {
            const name = getEmpName(p, employees).toLowerCase();
            return name.includes(q) || p.employee_uid.toLowerCase().includes(q) || p.title.toLowerCase().includes(q);
        });
    }, [punishments, search, employees]);

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

    function toggleSort(key: keyof PunishmentRecord) {
        if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(key);
            setSortDir('desc');
        }
    }

    type ColKey = 'employee_uid' | 'title' | 'effective_from' | 'effective_to' | 'basic_salary' | 'deduction_amount' | 'created_at';
    const cols: { key: ColKey; label: string }[] = [
        { key: 'employee_uid', label: 'Employee' },
        { key: 'title', label: 'Punishment' },
        { key: 'effective_from', label: 'From' },
        { key: 'effective_to', label: 'To' },
        { key: 'basic_salary', label: 'Basic Salary' },
        { key: 'deduction_amount', label: 'Deduction' },
        { key: 'created_at', label: 'Recorded' },
    ];

    const isViewOnly = modalMode === 'view';

    const addDisabled = submitting || !selectedEmp || !title || !reason || !effectiveFrom || !effectiveTo || !basicSalary || !deductionAmount;

    const editDisabled = submitting || !title || !reason || !effectiveFrom || !effectiveTo || !basicSalary || !deductionAmount;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Punishments" />
            <FlashMessage />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* ── Page header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Punishments</h1>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Record and manage employee disciplinary actions.</p>
                    </div>
                    <button
                        onClick={openAdd}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add Punishment
                    </button>
                </div>

                {/* ── Toolbar ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-xs">
                        <svg
                            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
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
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-300 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:ring-slate-600"
                        />
                    </div>
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* ── Table ── */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                    <table className="min-w-full divide-y divide-slate-100 text-sm dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-800/80">
                            <tr>
                                {cols.map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={() => toggleSort(col.key as keyof PunishmentRecord)}
                                        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase select-none hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                    >
                                        <span className="inline-flex items-center">
                                            {col.label}
                                            <SortIcon active={sortKey === col.key} dir={sortDir} />
                                        </span>
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={cols.length + 1} className="py-16 text-center text-slate-400 dark:text-slate-500">
                                        No punishment records found.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((p) => {
                                    const empName = getEmpName(p, employees);
                                    const empImg = getEmpImg(p, employees);
                                    const pct = (() => {
                                        const base = parseFloat(p.basic_salary);
                                        const ded = parseFloat(p.deduction_amount);
                                        if (!isNaN(base) && !isNaN(ded) && base > 0) return ((ded / base) * 100).toFixed(1);
                                        return null;
                                    })();
                                    return (
                                        <tr key={p.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-700/50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar img={empImg} name={empName} size="sm" />
                                                    <div>
                                                        <p className="font-medium text-slate-800 dark:text-slate-200">{empName}</p>
                                                        <p className="font-mono text-xs text-slate-400 dark:text-slate-500">{p.employee_uid}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-800 dark:text-slate-200">{p.title}</p>
                                                <p
                                                    className="max-w-[180px] truncate text-xs text-slate-400 dark:text-slate-500"
                                                    title={p.punishment_reason}
                                                >
                                                    {p.punishment_reason}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(p.effective_from)}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(p.effective_to)}</td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                ৳ {parseFloat(p.basic_salary).toLocaleString('en-US')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-semibold text-rose-700 dark:text-rose-400">
                                                    ৳ {parseFloat(p.deduction_amount).toLocaleString('en-US')}
                                                </span>
                                                {pct && (
                                                    <span className="ml-1.5 inline-block rounded-full bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-800">
                                                        -{pct}%
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">{formatDate(p.created_at)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* View */}
                                                    <button
                                                        onClick={() => openView(p)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                                                        title="View Details"
                                                    >
                                                        <svg
                                                            className="h-3.5 w-3.5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                            <circle cx="12" cy="12" r="3" />
                                                        </svg>
                                                        View
                                                    </button>
                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => openEdit(p)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                                        title="Edit"
                                                    >
                                                        <svg
                                                            className="h-3.5 w-3.5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => setDeleteTarget(p)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50"
                                                        title="Delete"
                                                    >
                                                        <svg
                                                            className="h-3.5 w-3.5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                            <path d="M10 11v6M14 11v6" />
                                                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                        <span>
                            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
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
                                                    ? 'border-rose-600 bg-rose-600 text-white dark:border-rose-500 dark:bg-rose-500'
                                                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ),
                                )}
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Add / Edit / View Modal ── */}
            <dialog
                ref={dialogRef}
                onClose={() => setOpen(false)}
                className="m-auto w-full max-w-2xl rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
            >
                <div className="flex max-h-[92vh] flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-800">
                    {/* Modal header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-700">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                {modalMode === 'add' && 'Add Punishment'}
                                {modalMode === 'edit' && 'Edit Punishment'}
                                {modalMode === 'view' && 'Punishment Details'}
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {modalMode === 'add' && 'Select an employee and fill in the punishment details.'}
                                {modalMode === 'edit' && 'Update the punishment record below.'}
                                {modalMode === 'view' && 'Read-only view of this punishment record.'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {modalMode === 'view' && editTarget && (
                                <button
                                    onClick={() => openEdit(editTarget)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Edit
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                        {/* Employee selector (add) or card (edit/view) */}
                        {modalMode === 'add' ? (
                            <Field label="Select Employee" required>
                                <select value={selectedUid} onChange={(e) => setSelectedUid(e.target.value)} className={selectCls}>
                                    <option value="">— Choose an employee —</option>
                                    {employees.map((e) => (
                                        <option key={e.employee_uid} value={e.employee_uid}>
                                            {e.employee_uid} · {e.name} — {e.job_title}
                                        </option>
                                    ))}
                                </select>
                                {selectedEmp && (
                                    <div className="mt-3 flex items-center gap-4 rounded-xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100 dark:bg-rose-950/50 dark:ring-rose-800">
                                        <Avatar img={selectedEmp.img} name={selectedEmp.name} size="lg" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmp.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedEmp.email}</p>
                                            <p className="mt-0.5 font-mono text-xs text-slate-400 dark:text-slate-500">{selectedEmp.employee_uid}</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Current salary</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                ৳ {parseFloat(selectedEmp.salary || '0').toLocaleString('en-US')}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{selectedEmp.job_title}</p>
                                        </div>
                                    </div>
                                )}
                            </Field>
                        ) : (
                            editTarget && (
                                <div className="flex items-center gap-4 rounded-xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100 dark:bg-rose-950/50 dark:ring-rose-800">
                                    <Avatar img={getEmpImg(editTarget, employees)} name={getEmpName(editTarget, employees)} size="lg" />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{getEmpName(editTarget, employees)}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{getEmpEmail(editTarget, employees)}</p>
                                        <p className="mt-0.5 font-mono text-xs text-slate-400 dark:text-slate-500">{editTarget.employee_uid}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-xs text-slate-400 dark:text-slate-500">Job title</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {getEmpJobTitle(editTarget, employees)}
                                        </p>
                                    </div>
                                </div>
                            )
                        )}

                        {/* Show the rest of the form when employee is chosen (add) or always (edit/view) */}
                        {((modalMode === 'add' && selectedEmp) || modalMode !== 'add') && (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                                    <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
                                        Punishment Details
                                    </span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                                </div>

                                <Field label="Title" required={!isViewOnly}>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Written Warning"
                                        className={inputCls}
                                        readOnly={isViewOnly}
                                    />
                                </Field>

                                <Field label="Reason" required={!isViewOnly}>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Describe the reason for this punishment…"
                                        rows={3}
                                        className={`${inputCls} resize-none`}
                                        readOnly={isViewOnly}
                                    />
                                </Field>

                                <div className="flex items-center gap-3">
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                                    <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">Duration</span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Effective From" required={!isViewOnly}>
                                        <input
                                            type="date"
                                            value={effectiveFrom}
                                            onChange={(e) => setEffectiveFrom(e.target.value)}
                                            className={inputCls}
                                            readOnly={isViewOnly}
                                        />
                                    </Field>
                                    <Field label="Effective To" required={!isViewOnly}>
                                        <input
                                            type="date"
                                            value={effectiveTo}
                                            onChange={(e) => setEffectiveTo(e.target.value)}
                                            className={inputCls}
                                            readOnly={isViewOnly}
                                        />
                                    </Field>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                                    <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
                                        Salary Deduction
                                    </span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <Field label="Basic Salary" required={!isViewOnly}>
                                        <div className="relative">
                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-500">
                                                ৳
                                            </span>
                                            <input
                                                type="text"
                                                value={basicSalary}
                                                onChange={(e) => setBasicSalary(e.target.value)}
                                                placeholder="0.00"
                                                className={`${inputCls} pl-7`}
                                                readOnly={isViewOnly}
                                            />
                                        </div>
                                    </Field>
                                    <Field label="Deduction Amount" required={!isViewOnly}>
                                        <div className="relative">
                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-500">
                                                ৳
                                            </span>
                                            <input
                                                type="text"
                                                value={deductionAmount}
                                                onChange={(e) => setDeductionAmount(e.target.value)}
                                                placeholder="0.00"
                                                className={`${inputCls} pl-7`}
                                                readOnly={isViewOnly}
                                            />
                                        </div>
                                    </Field>
                                    <Field label="Deduction %">
                                        <div className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">
                                            {deductionPct ? (
                                                <span>-{deductionPct}%</span>
                                            ) : (
                                                <span className="font-normal text-slate-400 dark:text-slate-500">Auto-calculated</span>
                                            )}
                                        </div>
                                    </Field>
                                </div>
                            </>
                        )}
                    </div>

                    {!isViewOnly && (
                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-700">
                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={modalMode === 'add' ? handleAdd : handleUpdate}
                                disabled={modalMode === 'add' ? addDisabled : editDisabled}
                                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-600"
                            >
                                {submitting && (
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                    </svg>
                                )}
                                {submitting ? 'Saving…' : modalMode === 'add' ? 'Confirm Punishment' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </dialog>

            {/* ── Delete confirm dialog ── */}
            <dialog
                ref={deleteDialogRef}
                onClose={() => setDeleteTarget(null)}
                className="m-auto w-full max-w-sm rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm"
            >
                <div className="rounded-2xl bg-white p-6 dark:bg-slate-800">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
                        <svg className="h-6 w-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 9v4M12 17h.01" />
                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        </svg>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Delete Punishment Record?</h3>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                        This will permanently remove the punishment record for{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {deleteTarget ? getEmpName(deleteTarget, employees) : ''}
                        </span>
                        . This action cannot be undone.
                    </p>
                    <div className="mt-5 flex justify-end gap-2">
                        <button
                            onClick={() => setDeleteTarget(null)}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </dialog>
        </AppLayout>
    );
}
