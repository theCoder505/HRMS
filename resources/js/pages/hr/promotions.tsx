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
    department: number | null;
    branch: number | null;
    role: number | null;
    outlet: number | null;
    salary: string;
}

interface Lookup {
    id: number;
    name: string;
}
interface RoleLookup extends Lookup {
    department_id: number | null;
}
interface OutletLookup extends Lookup {
    branch_id: number | null;
}

interface PromotionRecord {
    id: number;
    employee_uid: string;
    employee_name: string;
    employee_img: string | null;
    employee_email: string;
    job_title: string;
    department: number | null;
    branch: number | null;
    role: number | null;
    outlet: number | null;
    old_salary: string;
    new_salary: string;
    increment_percentage: string | null;
    increment_amount: string | null;
    execution_date: string;
    promotion_report: string;
    created_at: string;
}

interface Props {
    promotions: PromotionRecord[];
    departments: Lookup[];
    branches: Lookup[];
    roles: RoleLookup[];
    outlets: OutletLookup[];
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

function lookupName(list: Lookup[], id: number | null): string {
    if (!id) return '—';
    return list.find((l) => l.id === id)?.name ?? '—';
}

function Avatar({ img, name, size = 'md' }: { img: string | null; name: string; size?: 'sm' | 'md' | 'lg' }) {
    const sizeCls = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base' }[size];
    const bgCls = 'bg-indigo-100 dark:bg-indigo-900/50';
    const textCls = 'text-indigo-600 dark:text-indigo-300';
    const ringCls = 'ring-white dark:ring-slate-800';

    return img ? (
        <img src={`/${img}`} alt={name} className={`${sizeCls} rounded-full object-cover shadow ${ringCls}`} />
    ) : (
        <div className={`${sizeCls} flex items-center justify-center rounded-full ${bgCls} font-bold ${textCls}`}>{initials(name)}</div>
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
    'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-500';
const selectCls = inputCls;

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Promotions', href: '/hrm/promotions' }];

type ModalMode = 'add' | 'edit' | 'view';

export default function Promotions({ promotions, departments, branches, roles, outlets, employees }: Props) {
    /* ── table state ── */
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<keyof PromotionRecord>('created_at');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);

    /* ── modal ── */
    const [open, setOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('add');
    const [editTarget, setEditTarget] = useState<PromotionRecord | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    /* ── delete confirm ── */
    const [deleteTarget, setDeleteTarget] = useState<PromotionRecord | null>(null);
    const deleteDialogRef = useRef<HTMLDialogElement>(null);

    /* ── employee select ── */
    const [selectedUid, setSelectedUid] = useState('');
    const selectedEmp = useMemo(() => employees.find((e) => e.employee_uid === selectedUid) ?? null, [employees, selectedUid]);

    /* ── form fields ── */
    const [jobTitle, setJobTitle] = useState('');
    const [department, setDepartment] = useState('');
    const [branch, setBranch] = useState('');
    const [role, setRole] = useState('');
    const [outlet, setOutlet] = useState('');
    const [newSalary, setNewSalary] = useState('');
    const [incPct, setIncPct] = useState('');
    const [incAmt, setIncAmt] = useState('');
    const [execDate, setExecDate] = useState('');
    const [reportFile, setReportFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

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
        setJobTitle('');
        setDepartment('');
        setBranch('');
        setRole('');
        setOutlet('');
        setNewSalary('');
        setIncPct('');
        setIncAmt('');
        setExecDate('');
        setReportFile(null);
        if (fileRef.current) fileRef.current.value = '';
    }

    function openAdd() {
        resetForm();
        setEditTarget(null);
        setModalMode('add');
        setOpen(true);
    }

    function openView(p: PromotionRecord) {
        setEditTarget(p);
        setModalMode('view');
        // prefill for display
        setSelectedUid(p.employee_uid);
        setJobTitle(p.job_title);
        setDepartment(p.department ? String(p.department) : '');
        setBranch(p.branch ? String(p.branch) : '');
        setRole(p.role ? String(p.role) : '');
        setOutlet(p.outlet ? String(p.outlet) : '');
        setNewSalary(p.new_salary);
        setIncPct(p.increment_percentage ?? '');
        setIncAmt(p.increment_amount ?? '');
        setExecDate(p.execution_date);
        setOpen(true);
    }

    function openEdit(p: PromotionRecord) {
        setEditTarget(p);
        setModalMode('edit');
        setSelectedUid(p.employee_uid);
        setJobTitle(p.job_title);
        setDepartment(p.department ? String(p.department) : '');
        setBranch(p.branch ? String(p.branch) : '');
        setRole(p.role ? String(p.role) : '');
        setOutlet(p.outlet ? String(p.outlet) : '');
        setNewSalary(p.new_salary);
        setIncPct(p.increment_percentage ?? '');
        setIncAmt(p.increment_amount ?? '');
        setExecDate(p.execution_date);
        setReportFile(null);
        if (fileRef.current) fileRef.current.value = '';
        setOpen(true);
    }

    useEffect(() => {
        if (modalMode !== 'add' || !selectedEmp) return;
        setJobTitle(selectedEmp.job_title ?? '');
        setDepartment(selectedEmp.department ? String(selectedEmp.department) : '');
        setBranch(selectedEmp.branch ? String(selectedEmp.branch) : '');
        setRole(selectedEmp.role ? String(selectedEmp.role) : '');
        setOutlet(selectedEmp.outlet ? String(selectedEmp.outlet) : '');
        setNewSalary(selectedEmp.salary ?? '');
    }, [selectedEmp, modalMode]);

    const existingPromotion = useMemo(() => {
        if (modalMode !== 'add' || !selectedUid) return null;
        return promotions.find((p) => p.employee_uid === selectedUid) ?? null;
    }, [promotions, selectedUid, modalMode]);

    const filteredRoles = useMemo(() => (department ? roles.filter((r) => r.department_id === Number(department)) : roles), [roles, department]);

    const filteredOutlets = useMemo(() => (branch ? outlets.filter((o) => o.branch_id === Number(branch)) : outlets), [outlets, branch]);

    useEffect(() => {
        if (!role) return;
        if (department && !filteredRoles.some((r) => r.id === Number(role))) {
            setRole('');
        }
    }, [department, filteredRoles, role]);

    useEffect(() => {
        if (!outlet) return;
        if (branch && !filteredOutlets.some((o) => o.id === Number(outlet))) {
            setOutlet('');
        }
    }, [branch, filteredOutlets, outlet]);

    const oldSalary = (modalMode === 'edit' || modalMode === 'view') && editTarget ? editTarget.old_salary : (selectedEmp?.salary ?? '0');

    useEffect(() => {
        if (modalMode === 'view') return;
        if (!newSalary) return;
        const oldS = parseFloat(oldSalary);
        const newS = parseFloat(newSalary);
        if (!isNaN(oldS) && !isNaN(newS) && oldS > 0) {
            const amt = newS - oldS;
            setIncAmt(amt.toFixed(2));
            setIncPct(((amt / oldS) * 100).toFixed(2));
        }
    }, [newSalary, oldSalary, modalMode]);

    /* ── submit (add) ── */
    function handleAdd() {
        if (!selectedEmp || !reportFile) return;
        setSubmitting(true);
        const form = new FormData();
        form.append('employee_uid', selectedEmp.employee_uid);
        form.append('job_title', jobTitle);
        form.append('department', department);
        form.append('branch', branch);
        form.append('role', role);
        form.append('outlet', outlet);
        form.append('old_salary', selectedEmp.salary);
        form.append('new_salary', newSalary);
        form.append('increment_percentage', incPct);
        form.append('increment_amount', incAmt);
        form.append('execution_date', execDate);
        form.append('promotion_report', reportFile);

        router.post(route('hr.promotions.store'), form, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setSubmitting(false);
            },
            onError: () => setSubmitting(false),
        });
    }

    /* ── submit (edit) ── */
    function handleUpdate() {
        if (!editTarget) return;
        setSubmitting(true);
        const form = new FormData();
        form.append('_method', 'PUT');
        form.append('employee_uid', selectedUid);
        form.append('job_title', jobTitle);
        form.append('department', department);
        form.append('branch', branch);
        form.append('role', role);
        form.append('outlet', outlet);
        form.append('old_salary', editTarget.old_salary);
        form.append('new_salary', newSalary);
        form.append('increment_percentage', incPct);
        form.append('increment_amount', incAmt);
        form.append('execution_date', execDate);
        if (reportFile) form.append('promotion_report', reportFile);

        router.post(route('hr.promotions.update', editTarget.id), form, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setSubmitting(false);
            },
            onError: () => setSubmitting(false),
        });
    }

    /* ── delete ── */
    function handleDelete() {
        if (!deleteTarget) return;
        router.delete(route('hr.promotions.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    }

    /* ── table filter/sort/paginate ── */
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return promotions.filter(
            (p) => p.employee_name.toLowerCase().includes(q) || p.employee_uid.toLowerCase().includes(q) || p.job_title.toLowerCase().includes(q),
        );
    }, [promotions, search]);

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

    function toggleSort(key: keyof PromotionRecord) {
        if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(key);
            setSortDir('desc');
        }
    }

    const cols: { key: keyof PromotionRecord; label: string }[] = [
        { key: 'employee_name', label: 'Employee' },
        { key: 'job_title', label: 'New Title' },
        { key: 'old_salary', label: 'Old Salary' },
        { key: 'new_salary', label: 'New Salary' },
        { key: 'execution_date', label: 'Effective' },
        { key: 'created_at', label: 'Recorded' },
    ];

    const isViewOnly = modalMode === 'view';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Promotions" />
            <FlashMessage />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* ── Page header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Promotions</h1>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Record and track employee promotions.</p>
                    </div>
                    <button
                        onClick={openAdd}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Promote Employee
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
                                        onClick={() => toggleSort(col.key)}
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
                                        No promotion records found.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((p) => (
                                    <tr key={p.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-700/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar img={p.employee_img} name={p.employee_name} size="sm" />
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-slate-200">{p.employee_name}</p>
                                                    <p className="font-mono text-xs text-slate-400 dark:text-slate-500">{p.employee_uid}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-800 dark:text-slate-200">{p.job_title}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">{lookupName(departments, p.department)}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                            ৳ {parseFloat(p.old_salary).toLocaleString('en-US')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                                ৳ {parseFloat(p.new_salary).toLocaleString('en-US')}
                                            </span>
                                            {p.increment_percentage && (
                                                <span className="ml-1.5 inline-block rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800">
                                                    +{p.increment_percentage}%
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(p.execution_date)}</td>
                                        <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">{formatDate(p.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* View report */}
                                                <a
                                                    href={`/storage/${p.promotion_report}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                                                    title="View Report"
                                                >
                                                    <svg
                                                        className="h-3.5 w-3.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                    </svg>
                                                    Report
                                                </a>
                                                {/* View details */}
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

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
                                                    ? 'border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500'
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
                                {modalMode === 'add' && 'Promote Employee'}
                                {modalMode === 'edit' && 'Edit Promotion'}
                                {modalMode === 'view' && 'Promotion Details'}
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {modalMode === 'add' && 'Select an employee, update their role and salary, then save.'}
                                {modalMode === 'edit' && 'Update the promotion details below.'}
                                {modalMode === 'view' && 'Read-only view of this promotion record.'}
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

                                {existingPromotion && (
                                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/50">
                                        <div className="flex items-start gap-3">
                                            <svg
                                                className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 9v4M12 17h.01" />
                                                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                            </svg>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                                                    Promotion record already exists
                                                </p>
                                                <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                                                    <span className="font-medium">{selectedEmp?.name}</span> was promoted to{' '}
                                                    <span className="font-medium">{existingPromotion.job_title}</span> on{' '}
                                                    {formatDate(existingPromotion.execution_date)}. You cannot add a duplicate — please update the
                                                    existing record instead.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setOpen(false);
                                                setTimeout(() => openEdit(existingPromotion), 50);
                                            }}
                                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-amber-900/30"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                            Edit existing promotion record
                                        </button>
                                    </div>
                                )}

                                {selectedEmp && !existingPromotion && (
                                    <div className="mt-3 flex items-center gap-4 rounded-xl bg-indigo-50 px-4 py-3 ring-1 ring-indigo-100 dark:bg-indigo-950/50 dark:ring-indigo-800">
                                        <Avatar img={selectedEmp.img} name={selectedEmp.name} size="lg" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedEmp.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedEmp.email}</p>
                                            <p className="mt-0.5 font-mono text-xs text-slate-400 dark:text-slate-500">{selectedEmp.employee_uid}</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-xs text-slate-400 dark:text-slate-500">Current salary</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                ৳ {parseFloat(selectedEmp.salary).toLocaleString('en-US')}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{selectedEmp.job_title}</p>
                                        </div>
                                    </div>
                                )}
                            </Field>
                        ) : (
                            editTarget && (
                                <div className="flex items-center gap-4 rounded-xl bg-indigo-50 px-4 py-3 ring-1 ring-indigo-100 dark:bg-indigo-950/50 dark:ring-indigo-800">
                                    <Avatar img={editTarget.employee_img} name={editTarget.employee_name} size="lg" />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{editTarget.employee_name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{editTarget.employee_email}</p>
                                        <p className="mt-0.5 font-mono text-xs text-slate-400 dark:text-slate-500">{editTarget.employee_uid}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-xs text-slate-400 dark:text-slate-500">Old salary</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            ৳ {parseFloat(editTarget.old_salary).toLocaleString('en-US')}
                                        </p>
                                    </div>
                                </div>
                            )
                        )}

                        {((selectedEmp && !existingPromotion) || modalMode !== 'add') && (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                                    <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
                                        Position Details
                                    </span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                                </div>

                                <Field label="Job Title" required={!isViewOnly}>
                                    <input
                                        type="text"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        placeholder="e.g. Senior Engineer"
                                        className={inputCls}
                                        readOnly={isViewOnly}
                                    />
                                </Field>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Department">
                                        {isViewOnly ? (
                                            <div className={`${inputCls} bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400`}>
                                                {lookupName(departments, editTarget?.department ?? null)}
                                            </div>
                                        ) : (
                                            <select value={department} onChange={(e) => setDepartment(e.target.value)} className={selectCls}>
                                                <option value="">— Select —</option>
                                                {departments.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </Field>
                                    <Field label="Branch">
                                        {isViewOnly ? (
                                            <div className={`${inputCls} bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400`}>
                                                {lookupName(branches, editTarget?.branch ?? null)}
                                            </div>
                                        ) : (
                                            <select value={branch} onChange={(e) => setBranch(e.target.value)} className={selectCls}>
                                                <option value="">— Select —</option>
                                                {branches.map((b) => (
                                                    <option key={b.id} value={b.id}>
                                                        {b.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Role">
                                        {isViewOnly ? (
                                            <div className={`${inputCls} bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400`}>
                                                {lookupName(roles, editTarget?.role ?? null)}
                                            </div>
                                        ) : (
                                            <select
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                className={selectCls}
                                                disabled={!department}
                                            >
                                                <option value="">{department ? '— Select role —' : '— Select department first —'}</option>
                                                {filteredRoles.map((r) => (
                                                    <option key={r.id} value={r.id}>
                                                        {r.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </Field>
                                    <Field label="Outlet">
                                        {isViewOnly ? (
                                            <div className={`${inputCls} bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400`}>
                                                {lookupName(outlets, editTarget?.outlet ?? null)}
                                            </div>
                                        ) : (
                                            <select
                                                value={outlet}
                                                onChange={(e) => setOutlet(e.target.value)}
                                                className={selectCls}
                                                disabled={!branch}
                                            >
                                                <option value="">{branch ? '— Select outlet —' : '— Select branch first —'}</option>
                                                {filteredOutlets.map((o) => (
                                                    <option key={o.id} value={o.id}>
                                                        {o.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </Field>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                                    <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">Salary</span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <Field label="Old Salary">
                                        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                            <span className="font-semibold text-slate-400 dark:text-slate-500">৳</span>
                                            <span>{parseFloat(oldSalary || '0').toLocaleString('en-US')}</span>
                                        </div>
                                    </Field>
                                    <Field label="New Salary" required={!isViewOnly}>
                                        <div className="relative">
                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-500">
                                                ৳
                                            </span>
                                            <input
                                                type={isViewOnly ? 'button' : 'text'}
                                                min="0"
                                                step="0.01"
                                                value={newSalary}
                                                onChange={(e) => setNewSalary(e.target.value)}
                                                placeholder="0.00"
                                                className={`${inputCls} pl-7 text-left`}
                                                readOnly={isViewOnly}
                                            />
                                        </div>
                                    </Field>
                                    <Field label="Increment">
                                        <div className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                                            {incPct && incAmt ? (
                                                <span>
                                                    +{incPct}% / ৳{parseFloat(incAmt).toLocaleString('en-US')}
                                                </span>
                                            ) : (
                                                <span className="font-normal text-slate-400 dark:text-slate-500">Auto-calculated</span>
                                            )}
                                        </div>
                                    </Field>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                                    <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
                                        Documentation
                                    </span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Effective Date" required={!isViewOnly}>
                                        <input
                                            type="date"
                                            value={execDate}
                                            onChange={(e) => setExecDate(e.target.value)}
                                            className={inputCls}
                                            readOnly={isViewOnly}
                                        />
                                    </Field>
                                    <Field
                                        label={modalMode === 'edit' ? 'Replace Report (optional)' : 'Promotion Report'}
                                        required={modalMode === 'add'}
                                    >
                                        {isViewOnly ? (
                                            editTarget && (
                                                <a
                                                    href={`/storage/${editTarget.promotion_report}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                                                >
                                                    <svg
                                                        className="h-3.5 w-3.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                    </svg>
                                                    View Current Report
                                                </a>
                                            )
                                        ) : (
                                            <>
                                                <input
                                                    ref={fileRef}
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    onChange={(e) => setReportFile(e.target.files?.[0] ?? null)}
                                                    className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:file:bg-indigo-950/50 dark:file:text-indigo-400 dark:hover:file:bg-indigo-900/50"
                                                />
                                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">JPG, PNG or PDF · max 5 MB</p>
                                                {modalMode === 'edit' && editTarget && (
                                                    <a
                                                        href={`/storage/${editTarget.promotion_report}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-500 hover:underline dark:text-indigo-400"
                                                    >
                                                        View current report ↗
                                                    </a>
                                                )}
                                            </>
                                        )}
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
                                disabled={
                                    submitting ||
                                    (modalMode === 'add' &&
                                        (!selectedEmp || !!existingPromotion || !jobTitle || !newSalary || !execDate || !reportFile)) ||
                                    (modalMode === 'edit' && (!jobTitle || !newSalary || !execDate))
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                            >
                                {submitting && (
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                    </svg>
                                )}
                                {submitting ? 'Saving…' : modalMode === 'add' ? 'Confirm Promotion' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            </dialog>

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
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Delete Promotion Record?</h3>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                        This will permanently remove the promotion record for{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{deleteTarget?.employee_name}</span>. This action cannot be
                        undone.
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
