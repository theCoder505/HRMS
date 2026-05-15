import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import FlashMessage from '@/pages/FlashMessage';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowUpDown,
    Banknote,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Gift,
    Hourglass,
    LogOut,
    MinusCircle,
    Pencil,
    Plus,
    Search,
    Timer,
    Trash2,
    TrendingDown,
    TrendingUp,
    User,
    Users,
    XCircle,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface EmployeeMini {
    employee_uid: string;
    name: string;
    img: string | null;
    job_title: string | null;
    department: number | null;
    branch: number | null;
    outlet: number | null;
    clock_in_time: string | null;
    clock_out_time: string | null;
    office_days: string[] | null;
    weekend: string[] | null;
    join_date: string | null;
    salary: string;
}

interface AttendanceRecord {
    id: number;
    employee_uid: string;
    attend_date: string;
    clock_in_time: string | null;
    clock_out_time: string | null;
}

interface LeaveRecord {
    id: number;
    employee_uid: string;
    title: string;
    leave_reson: string;
    leave_from_date: string;
    leave_to_date: string;
    type: 'paid' | 'unpaid';
    deduction_type: 'percent' | 'fixed';
    deduction_amount: string;
    approval: '0' | '1' | 0 | 1;
}

interface PunishmentRecord {
    id: number;
    employee_uid: string;
    title: string;
    punishment_reason: string;
    effective_from: string;
    effective_to: string;
    basic_salary: string;
    deduction_amount: string;
}

interface Holiday {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
}

interface PayrollRecord {
    id: number;
    employee_uid: string;
    payment_includes: string[];
    basic_salary: string;
    net_amount: string;
    salary_month: number;
    salary_year: number;
    note: string | null;
    created_at: string;
    updated_at: string;
    employee: {
        name: string;
        img: string | null;
        job_title: string | null;
        salary: string;
        join_date: string | null;
    } | null;
}

interface Props {
    payrolls: PayrollRecord[];
    employees: EmployeeMini[];
    attendance: AttendanceRecord[];
    leaves: LeaveRecord[];
    punishments: PunishmentRecord[];
    holidays: Holiday[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const zeroPad = (n: number) => String(n).padStart(2, '0');

function fmtDate(d: Date): string {
    return `${d.getFullYear()}-${zeroPad(d.getMonth() + 1)}-${zeroPad(d.getDate())}`;
}
function getDayName(date: string): string {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });
}
function datesInRange(from: string, to: string): string[] {
    const out: string[] = [];
    const [fy, fm, fd] = from.split('-').map(Number);
    const [ty, tm, td] = to.split('-').map(Number);
    const cur = new Date(fy, fm - 1, fd);
    const end = new Date(ty, tm - 1, td);
    while (cur <= end) {
        out.push(fmtDate(cur));
        cur.setDate(cur.getDate() + 1);
    }
    return out;
}
function toMinutes(time: string | null | undefined): number | null {
    if (!time) return null;
    const p = time.split(':');
    if (p.length < 2) return null;
    return +p[0] * 60 + +p[1];
}
function fmtMins(mins: number): string {
    return `${Math.floor(Math.abs(mins) / 60)}h ${Math.abs(mins) % 60}m`;
}
function localLabel(date: string, opts?: Intl.DateTimeFormatOptions): string {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', opts);
}
function isHoliday(date: string, holidays: Holiday[]): Holiday | null {
    const [cy, cm, cd] = date.split('-').map(Number);
    const check = new Date(cy, cm - 1, cd);
    for (const h of holidays) {
        const [sy, sm, sd] = h.start_date.split('-').map(Number);
        const [ey, em, ed] = h.end_date.split('-').map(Number);
        if (check >= new Date(sy, sm - 1, sd) && check <= new Date(ey, em - 1, ed)) return h;
    }
    return null;
}

/** Returns a short "Mon YYYY" label, e.g. "Apr 2025" */
function salaryMonthLabel(month: number, year: number): string {
    return `${MONTHS[month - 1].slice(0, 3)} ${year}`;
}

/** True if employee joined AFTER the first day of the given month/year */
function joinedAfterMonth(joinDate: string | null, month: number, year: number): boolean {
    if (!joinDate) return false;
    const [jy, jm, jd] = joinDate.split('-').map(Number);
    const join = new Date(jy, jm - 1, jd);
    const monthStart = new Date(year, month - 1, 1);
    return join > monthStart;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const PAYMENT_INCLUDES_OPTIONS = [
    { value: 'regular', label: 'Regular Salary', color: 'bg-blue-100 text-blue-700' },
    { value: 'bonus', label: 'Bonus', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'overtime', label: 'Overtime', color: 'bg-cyan-100 text-cyan-700' },
    { value: 'other', label: 'Other', color: 'bg-purple-100 text-purple-700' },
    { value: 'late_deduction', label: 'Late Deduction', color: 'bg-amber-100 text-amber-700' },
    { value: 'leave_deduction', label: 'Leave Deduction', color: 'bg-orange-100 text-orange-700' },
    { value: 'punishment', label: 'Punishment', color: 'bg-red-100 text-red-700' },
];

// ── Month Stats ───────────────────────────────────────────────────────────────

interface MonthStats {
    presentDays: number;
    absentDays: number;
    lateDays: number;
    lateMinutes: number;
    earlyOutDays: number;
    earlyOutMinutes: number;
    overtimeMinutes: number;
    weekendDays: number;
    holidayDays: number;
    workedMinutes: number;
    scheduledMinutes: number;
    totalWorkingDays: number;
    departedDays: number;
}

function computeMonthStats(emp: EmployeeMini, year: number, month: number, attendance: AttendanceRecord[], holidays: Holiday[]): MonthStats {
    const from = fmtDate(new Date(year, month - 1, 1));
    const to = fmtDate(new Date(year, month, 0));
    const dates = datesInRange(from, to);

    const recMap = new Map<string, AttendanceRecord>();
    attendance.filter((a) => a.employee_uid === emp.employee_uid).forEach((a) => recMap.set(a.attend_date, a));

    let presentDays = 0,
        absentDays = 0,
        lateDays = 0,
        lateMinutes = 0;
    let earlyOutDays = 0,
        earlyOutMinutes = 0,
        overtimeMinutes = 0;
    let weekendDays = 0,
        holidayDays = 0,
        workedMinutes = 0,
        scheduledMinutes = 0,
        departedDays = 0;

    const schedIn = toMinutes(emp.clock_in_time);
    const schedOut = toMinutes(emp.clock_out_time);
    if (schedIn !== null && schedOut !== null) scheduledMinutes = (schedOut - schedIn) * dates.length;

    for (const date of dates) {
        if (emp.join_date) {
            const [jy, jm, jd] = emp.join_date.split('-').map(Number);
            const [ay, am, ad] = date.split('-').map(Number);
            if (new Date(ay, am - 1, ad) < new Date(jy, jm - 1, jd)) continue;
        }
        const hol = isHoliday(date, holidays);
        if (hol) {
            holidayDays++;
            continue;
        }
        const dayName = getDayName(date);
        const isWknd = (emp.weekend ?? []).some((d) => d.toLowerCase().startsWith(dayName.toLowerCase().slice(0, 3)));
        if (isWknd) {
            weekendDays++;
            continue;
        }

        const rec = recMap.get(date);
        const aIn = toMinutes(rec?.clock_in_time);
        const aOut = toMinutes(rec?.clock_out_time);
        if (!rec || (!rec.clock_in_time && !rec.clock_out_time)) {
            absentDays++;
            continue;
        }

        const late = aIn !== null && schedIn !== null ? Math.max(0, aIn - schedIn) : 0;
        const earlyOut = aOut !== null && schedOut !== null ? Math.max(0, schedOut - aOut) : 0;
        const ot = aOut !== null && schedOut !== null ? Math.max(0, aOut - schedOut) : 0;
        const worked = aIn !== null && aOut !== null ? aOut - aIn : 0;

        if (late > 0) {
            lateDays++;
            lateMinutes += late;
        } else if (aOut) {
            departedDays++;
        } else {
            presentDays++;
        }
        if (earlyOut > 0) {
            earlyOutDays++;
            earlyOutMinutes += earlyOut;
        }
        overtimeMinutes += ot;
        workedMinutes += worked;
    }

    return {
        presentDays,
        absentDays,
        lateDays,
        lateMinutes,
        earlyOutDays,
        earlyOutMinutes,
        overtimeMinutes,
        weekendDays,
        holidayDays,
        workedMinutes,
        scheduledMinutes,
        totalWorkingDays: presentDays + absentDays + lateDays + departedDays + earlyOutDays,
        departedDays,
    };
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function EmpAvatar({ img, name, size = 8 }: { img: string | null; name: string; size?: number }) {
    return (
        <div className={`h-${size} w-${size} bg-muted shrink-0 overflow-hidden rounded-full border`}>
            {img ? (
                <img src={`/${img}`} alt={name} className="h-full w-full object-cover" />
            ) : (
                <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                    <User className="h-4 w-4" />
                </div>
            )}
        </div>
    );
}

function PIBadge({ type }: { type: string }) {
    const opt = PAYMENT_INCLUDES_OPTIONS.find((o) => o.value === type);
    if (!opt) return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{type}</span>;
    return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${opt.color}`}>{opt.label}</span>;
}

// ── Employee Analysis Panel ───────────────────────────────────────────────────

interface AnalysisProps {
    emp: EmployeeMini;
    year: number;
    month: number;
    attendance: AttendanceRecord[];
    leaves: LeaveRecord[];
    punishments: PunishmentRecord[];
    holidays: Holiday[];
}

function EmployeeAnalysis({ emp, year, month, attendance, leaves, punishments, holidays }: AnalysisProps) {
    const stats = useMemo(() => computeMonthStats(emp, year, month, attendance, holidays), [emp, year, month, attendance, holidays]);

    const empLeaves = useMemo(() => {
        const monthStr = `${year}-${zeroPad(month)}`;
        return leaves.filter(
            (l) => l.employee_uid === emp.employee_uid && (l.leave_from_date.startsWith(monthStr) || l.leave_to_date.startsWith(monthStr)),
        );
    }, [leaves, emp, year, month]);

    const empPunishments = useMemo(() => {
        const from = `${year}-${zeroPad(month)}-01`;
        const to = `${year}-${zeroPad(month)}-${zeroPad(new Date(year, month, 0).getDate())}`;
        return punishments.filter((p) => p.employee_uid === emp.employee_uid && p.effective_from <= to && p.effective_to >= from);
    }, [punishments, emp, year, month]);

    const approvedUnpaidLeaves = empLeaves.filter((l) => Number(l.approval) === 1 && l.type === 'unpaid');
    const totalPunishmentDeduction = empPunishments.reduce((sum, p) => sum + parseFloat(p.deduction_amount), 0);

    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                    Attendance — {MONTHS[month - 1]} {year}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: 'Present', value: stats.presentDays, color: 'text-emerald-600', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
                        { label: 'Absent', value: stats.absentDays, color: 'text-red-600', icon: <XCircle className="h-3.5 w-3.5" /> },
                        { label: 'Late Days', value: stats.lateDays, color: 'text-amber-600', icon: <Timer className="h-3.5 w-3.5" /> },
                        { label: 'Late Time', value: fmtMins(stats.lateMinutes), color: 'text-amber-600', icon: <Clock className="h-3.5 w-3.5" /> },
                        { label: 'Early Out', value: stats.earlyOutDays, color: 'text-orange-600', icon: <Hourglass className="h-3.5 w-3.5" /> },
                        {
                            label: 'Overtime',
                            value: fmtMins(stats.overtimeMinutes),
                            color: 'text-blue-600',
                            icon: <TrendingUp className="h-3.5 w-3.5" />,
                        },
                        { label: 'Departed', value: stats.departedDays, color: 'text-blue-500', icon: <LogOut className="h-3.5 w-3.5" /> },
                        { label: 'Weekends', value: stats.weekendDays, color: 'text-slate-500', icon: <MinusCircle className="h-3.5 w-3.5" /> },
                        { label: 'Holidays', value: stats.holidayDays, color: 'text-purple-600', icon: <Gift className="h-3.5 w-3.5" /> },
                    ].map((s) => (
                        <div key={s.label} className="bg-muted/40 flex items-center gap-2 rounded-lg p-2">
                            <span className={s.color}>{s.icon}</span>
                            <div>
                                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-muted-foreground text-xs">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {empLeaves.length > 0 && (
                <div>
                    <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">Leave Requests</h4>
                    <div className="space-y-1.5">
                        {empLeaves.map((l) => (
                            <div key={l.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs">
                                <div>
                                    <span className="font-medium">{l.title}</span>
                                    <span className="text-muted-foreground ml-2">
                                        {localLabel(l.leave_from_date)} – {localLabel(l.leave_to_date)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={`rounded-full px-2 py-0.5 font-semibold ${l.type === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}
                                    >
                                        {l.type}
                                    </span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 font-semibold ${Number(l.approval) === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                                    >
                                        {Number(l.approval) === 1 ? 'Approved' : 'Pending'}
                                    </span>
                                    {l.type === 'unpaid' && Number(l.approval) === 1 && (
                                        <span className="font-semibold text-red-600">
                                            -{l.deduction_type === 'fixed' ? `৳${l.deduction_amount}` : `${l.deduction_amount}%`}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {empPunishments.length > 0 && (
                <div>
                    <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">Active Punishments</h4>
                    <div className="space-y-1.5">
                        {empPunishments.map((p) => (
                            <div
                                key={p.id}
                                className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/50 px-3 py-2 text-xs dark:border-red-900/30 dark:bg-red-950/20"
                            >
                                <div>
                                    <span className="font-medium text-red-800 dark:text-red-300">{p.title}</span>
                                    <span className="text-muted-foreground ml-2">
                                        {localLabel(p.effective_from)} – {localLabel(p.effective_to)}
                                    </span>
                                </div>
                                <span className="font-bold text-red-600">-৳{parseFloat(p.deduction_amount).toLocaleString()}</span>
                            </div>
                        ))}
                        <p className="text-right text-xs font-semibold text-red-600">Total deduction: ৳{totalPunishmentDeduction.toLocaleString()}</p>
                    </div>
                </div>
            )}

            <div className="bg-muted/30 space-y-1.5 rounded-xl border p-3 text-sm">
                <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">Salary Reference</h4>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Basic Salary</span>
                    <span className="font-bold">৳{parseFloat(emp.salary || '0').toLocaleString()}</span>
                </div>
                {approvedUnpaidLeaves.length > 0 && (
                    <div className="flex justify-between text-orange-600">
                        <span>Leave Deductions</span>
                        <span>- (see leaves)</span>
                    </div>
                )}
                {totalPunishmentDeduction > 0 && (
                    <div className="flex justify-between text-red-600">
                        <span>Punishment Deductions</span>
                        <span className="font-semibold">-৳{totalPunishmentDeduction.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between border-t pt-1.5 font-semibold text-blue-600">
                    <span>Overtime ({fmtMins(stats.overtimeMinutes)})</span>
                    <span>+ (set manually)</span>
                </div>
            </div>
        </div>
    );
}

// ── Breadcrumbs ───────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Payrolls', href: '/hrm/payrolls' }];

// ── Main Component ────────────────────────────────────────────────────────────

export default function Payrolls({ payrolls, employees, attendance, leaves, punishments, holidays }: Props) {
    const thisYear = new Date().getFullYear();
    const thisMonth = new Date().getMonth() + 1;
    const prevMonth = thisMonth === 1 ? 12 : thisMonth - 1;
    const prevMonthYear = thisMonth === 1 ? thisYear - 1 : thisYear;

    // ── Tab state
    const [tab, setTab] = useState<'prev-month' | 'current-year' | 'custom' | 'employee'>('prev-month');
    const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [selectedEmpUid, setSelectedEmpUid] = useState('');

    // Table state
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('salary_year');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(50);

    // ── Bulk bonus dialog
    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulkType, setBulkType] = useState<'percent' | 'fixed'>('percent');
    const [bulkAmount, setBulkAmount] = useState('');
    const [bulkNote, setBulkNote] = useState('');
    const [bulkBonusYear, setBulkBonusYear] = useState(prevMonthYear);
    const [bulkBonusMonth, setBulkBonusMonth] = useState(prevMonth);
    const [bulkSubmitting, setBulkSubmitting] = useState(false);

    // ── Add/Edit dialog
    const [addOpen, setAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<PayrollRecord | null>(null);
    const [selectedEmp, setSelectedEmp] = useState<EmployeeMini | null>(null);
    const [salaryMonth, setSalaryMonth] = useState(prevMonth);
    const [salaryYear, setSalaryYear] = useState(prevMonthYear);
    const [paymentIncludes, setPaymentIncludes] = useState<string[]>(['regular']);
    const [basicSalary, setBasicSalary] = useState('');
    const [netAmount, setNetAmount] = useState('');
    const [note, setNote] = useState('');
    const [addSubmitting, setAddSubmitting] = useState(false);
    const [dialogError, setDialogError] = useState<string | null>(null);

    // ── Delete dialog
    const [deleteTarget, setDeleteTarget] = useState<PayrollRecord | null>(null);

    // ── Bulk release dialog
    const [bulkReleaseOpen, setBulkReleaseOpen] = useState(false);
    const [bulkReleaseYear, setBulkReleaseYear] = useState(prevMonthYear);
    const [bulkReleaseMonth, setBulkReleaseMonth] = useState(prevMonth);
    const [bulkReleaseSubmitting, setBulkReleaseSubmitting] = useState(false);

    // ── Client-side guards ────────────────────────────────────────────────────

    /** Existing payroll for same employee + salary_month + salary_year */
    function existingPayroll(uid: string, month: number, year: number): PayrollRecord | null {
        return payrolls.find((p) => p.employee_uid === uid && p.salary_month === month && p.salary_year === year) ?? null;
    }

    /** Validate join date and duplicate for the add dialog */
    function validateAddDialog(emp: EmployeeMini, month: number, year: number): string | null {
        if (joinedAfterMonth(emp.join_date, month, year)) {
            const [jy, jm, jd] = (emp.join_date as string).split('-').map(Number);
            const joinStr = new Date(jy, jm - 1, jd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            return `${emp.name} joined on ${joinStr} and is not eligible for ${MONTHS[month - 1]} ${year} salary.`;
        }
        if (existingPayroll(emp.employee_uid, month, year)) {
            return `A payroll record already exists for ${emp.name} in ${MONTHS[month - 1]} ${year}. Use the edit button on that record instead.`;
        }
        return null;
    }

    // ── Tab filtering (now uses salary_month / salary_year, not created_at) ──

    const filteredByTab = useMemo((): PayrollRecord[] => {
        if (tab === 'prev-month') {
            return payrolls.filter((p) => p.salary_month === prevMonth && p.salary_year === prevMonthYear);
        }
        if (tab === 'current-year') {
            let filtered = payrolls.filter((p) => p.salary_year === thisYear);
            if (selectedMonths.length > 0) {
                filtered = filtered.filter((p) => selectedMonths.includes(p.salary_month));
            }
            return filtered;
        }
        if (tab === 'custom') {
            // custom range still uses created_at (the date the record was entered)
            if (!customFrom || !customTo) return payrolls;
            return payrolls.filter((p) => p.created_at >= customFrom && p.created_at <= customTo + 'T23:59:59');
        }
        if (tab === 'employee') {
            if (!selectedEmpUid) return [];
            return payrolls.filter((p) => p.employee_uid === selectedEmpUid);
        }
        return payrolls;
    }, [tab, payrolls, prevMonth, prevMonthYear, thisYear, selectedMonths, customFrom, customTo, selectedEmpUid]);

    // Search + sort
    const processedPayrolls = useMemo(() => {
        let data = filteredByTab;
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(
                (p) =>
                    (p.employee?.name ?? '').toLowerCase().includes(q) ||
                    p.employee_uid.toLowerCase().includes(q) ||
                    (p.note ?? '').toLowerCase().includes(q) ||
                    salaryMonthLabel(p.salary_month, p.salary_year).toLowerCase().includes(q),
            );
        }
        return [...data].sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            if (sortField === 'salary_month') {
                const av = a.salary_year * 100 + a.salary_month;
                const bv = b.salary_year * 100 + b.salary_month;
                return (av - bv) * dir;
            }
            if (sortField === 'net_amount') return (parseFloat(a.net_amount) - parseFloat(b.net_amount)) * dir;
            if (sortField === 'basic_salary') return (parseFloat(a.basic_salary) - parseFloat(b.basic_salary)) * dir;
            if (sortField === 'name') return (a.employee?.name ?? '').localeCompare(b.employee?.name ?? '') * dir;
            if (sortField === 'created_at') return a.created_at.localeCompare(b.created_at) * dir;
            return 0;
        });
    }, [filteredByTab, search, sortField, sortDir]);

    const totalPages = Math.max(1, Math.ceil(processedPayrolls.length / perPage));
    const pageRows = processedPayrolls.slice((page - 1) * perPage, page * perPage);

    const stats = useMemo(() => {
        const total = filteredByTab.reduce((s, p) => s + parseFloat(p.net_amount), 0);
        const count = filteredByTab.length;
        const avgSalary = count > 0 ? total / count : 0;
        const uniqueEmps = new Set(filteredByTab.map((p) => p.employee_uid)).size;
        return { total, count, avgSalary, uniqueEmps };
    }, [filteredByTab]);

    const empTotal = useMemo(() => {
        if (tab !== 'employee' || !selectedEmpUid) return 0;
        return payrolls.filter((p) => p.employee_uid === selectedEmpUid).reduce((s, p) => s + parseFloat(p.net_amount), 0);
    }, [tab, selectedEmpUid, payrolls]);

    function handleSort(field: string) {
        if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortField(field);
            setSortDir('asc');
        }
        setPage(1);
    }

    // ── Dialog helpers ────────────────────────────────────────────────────────

    function openAdd() {
        setEditTarget(null);
        setSelectedEmp(null);
        setPaymentIncludes(['regular']);
        setBasicSalary('');
        setNetAmount('');
        setNote('');
        setSalaryMonth(prevMonth);
        setSalaryYear(prevMonthYear);
        setDialogError(null);
        setAddOpen(true);
    }

    function openEdit(p: PayrollRecord) {
        setEditTarget(p);
        const emp = employees.find((e) => e.employee_uid === p.employee_uid) ?? null;
        setSelectedEmp(emp);
        setPaymentIncludes(Array.isArray(p.payment_includes) ? p.payment_includes : []);
        setBasicSalary(p.basic_salary);
        setNetAmount(p.net_amount);
        setNote(p.note ?? '');
        setSalaryMonth(p.salary_month);
        setSalaryYear(p.salary_year);
        setDialogError(null);
        setAddOpen(true);
    }

    function handleEmpSelect(uid: string) {
        const emp = employees.find((e) => e.employee_uid === uid) ?? null;
        setSelectedEmp(emp);
        if (emp) {
            setBasicSalary(emp.salary);
            setDialogError(validateAddDialog(emp, salaryMonth, salaryYear));
        } else {
            setDialogError(null);
        }
    }

    function handleSalaryMonthChange(month: number) {
        setSalaryMonth(month);
        if (selectedEmp && !editTarget) setDialogError(validateAddDialog(selectedEmp, month, salaryYear));
    }

    function handleSalaryYearChange(year: number) {
        setSalaryYear(year);
        if (selectedEmp && !editTarget) setDialogError(validateAddDialog(selectedEmp, salaryMonth, year));
    }

    function togglePI(val: string) {
        setPaymentIncludes((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));
    }

    function submitPayroll(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedEmp && !editTarget) return;

        // Final client-side guard before submit
        if (!editTarget && selectedEmp) {
            const err = validateAddDialog(selectedEmp, salaryMonth, salaryYear);
            if (err) {
                setDialogError(err);
                return;
            }
        }

        setAddSubmitting(true);
        setDialogError(null);

        if (editTarget) {
            router.put(
                route('hr.payrolls.update', editTarget.id),
                {
                    payment_includes: paymentIncludes,
                    basic_salary: basicSalary,
                    net_amount: netAmount,
                    note,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setAddOpen(false);
                        setAddSubmitting(false);
                    },
                    onError: () => setAddSubmitting(false),
                },
            );
        } else {
            router.post(
                route('hr.payrolls.store'),
                {
                    employee_uid: selectedEmp?.employee_uid,
                    payment_includes: paymentIncludes,
                    basic_salary: basicSalary,
                    net_amount: netAmount,
                    salary_month: salaryMonth,
                    salary_year: salaryYear,
                    note,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setAddOpen(false);
                        setAddSubmitting(false);
                    },
                    onError: (errs) => {
                        const msg = (errs as Record<string, string>)?.salary_month ?? null;
                        setDialogError(msg);
                        setAddSubmitting(false);
                    },
                },
            );
        }
    }

    function submitDelete() {
        if (!deleteTarget) return;
        router.delete(route('hr.payrolls.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    }

    function submitBulkRelease(e: React.FormEvent) {
        e.preventDefault();
        setBulkReleaseSubmitting(true);
        router.post(
            route('hr.payrolls.bulk'),
            {
                year: bulkReleaseYear,
                month: bulkReleaseMonth,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setBulkReleaseOpen(false);
                    setBulkReleaseSubmitting(false);
                },
                onError: () => setBulkReleaseSubmitting(false),
            },
        );
    }

    function submitBulkBonus(e: React.FormEvent) {
        e.preventDefault();
        setBulkSubmitting(true);
        router.post(
            route('hr.payrolls.bulk-bonus'),
            {
                type: bulkType,
                amount: bulkAmount,
                note: bulkNote,
                bonus_year: bulkBonusYear,
                bonus_month: bulkBonusMonth,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setBulkOpen(false);
                    setBulkSubmitting(false);
                    setBulkAmount('');
                    setBulkNote('');
                },
                onError: () => setBulkSubmitting(false),
            },
        );
    }

    function downloadCSV(rows: PayrollRecord[], filename: string) {
        const headers = [
            'Salary Month',
            'Employee UID',
            'Employee Name',
            'Job Title',
            'Basic Salary',
            'Net Amount',
            'Payment Includes',
            'Note',
            'Created',
        ];
        const csvRows = rows.map((p) =>
            [
                salaryMonthLabel(p.salary_month, p.salary_year),
                p.employee_uid,
                p.employee?.name ?? '',
                p.employee?.job_title ?? '',
                p.basic_salary,
                p.net_amount,
                (Array.isArray(p.payment_includes) ? p.payment_includes : []).join('; '),
                p.note ?? '',
                p.created_at.split('T')[0],
            ]
                .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                .join(','),
        );
        const csv = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    function pageNumbers(): (number | -1)[] {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (page <= 4) return [1, 2, 3, 4, 5, -1, totalPages];
        if (page >= totalPages - 3) return [1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, -1, page - 1, page, page + 1, -1, totalPages];
    }

    // Is the add button blocked by a validation issue?
    const addBlocked = !editTarget && !!dialogError;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payrolls" />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Payroll Management</h1>
                        <p className="text-muted-foreground text-sm">
                            {processedPayrolls.length} records · ৳{stats.total.toLocaleString()} total
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
                            <Gift className="mr-1 h-3.5 w-3.5" /> Bulk Bonus
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setBulkReleaseOpen(true)}>
                            <Users className="mr-1 h-3.5 w-3.5" /> Bulk Release
                        </Button>
                        <Button size="sm" onClick={openAdd}>
                            <Plus className="mr-1 h-3.5 w-3.5" /> Add Payroll
                        </Button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        {
                            label: 'Total Paid',
                            value: `৳${stats.total.toLocaleString()}`,
                            icon: <Banknote className="h-4 w-4 text-emerald-500" />,
                            color: 'text-emerald-600',
                        },
                        { label: 'Records', value: stats.count, icon: <Calendar className="h-4 w-4 text-blue-500" />, color: 'text-blue-600' },
                        {
                            label: 'Avg Salary',
                            value: `৳${Math.round(stats.avgSalary).toLocaleString()}`,
                            icon: <TrendingUp className="h-4 w-4 text-purple-500" />,
                            color: 'text-purple-600',
                        },
                        { label: 'Employees', value: stats.uniqueEmps, icon: <Users className="h-4 w-4 text-amber-500" />, color: 'text-amber-600' },
                    ].map((s) => (
                        <div key={s.label} className="bg-card flex items-center gap-3 rounded-xl border p-3">
                            <div className="bg-muted rounded-lg p-2">{s.icon}</div>
                            <div>
                                <p className={`text-lg leading-tight font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-muted-foreground text-xs">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs + Filters */}
                <div className="flex flex-col gap-3">
                    <Tabs
                        value={tab}
                        onValueChange={(v) => {
                            setTab(v as typeof tab);
                            setPage(1);
                            setSearch('');
                        }}
                    >
                        <TabsList>
                            <TabsTrigger value="prev-month">
                                {MONTHS[prevMonth - 1]} {prevMonthYear}
                            </TabsTrigger>
                            <TabsTrigger value="current-year">{thisYear} Records</TabsTrigger>
                            <TabsTrigger value="custom">Custom Range</TabsTrigger>
                            <TabsTrigger value="employee">By Employee</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex flex-wrap items-center gap-2">
                        {tab === 'current-year' && (
                            <div className="flex flex-wrap gap-1">
                                {MONTHS.map((m, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setSelectedMonths((prev) => (prev.includes(i + 1) ? prev.filter((x) => x !== i + 1) : [...prev, i + 1]));
                                            setPage(1);
                                        }}
                                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${selectedMonths.includes(i + 1) ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-background hover:bg-muted'}`}
                                    >
                                        {m.slice(0, 3)}
                                    </button>
                                ))}
                                {selectedMonths.length > 0 && (
                                    <button onClick={() => setSelectedMonths([])} className="text-muted-foreground ml-1 text-xs underline">
                                        Clear
                                    </button>
                                )}
                            </div>
                        )}
                        {tab === 'custom' && (
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={customFrom}
                                    onChange={(e) => {
                                        setCustomFrom(e.target.value);
                                        setPage(1);
                                    }}
                                    className="h-8 w-36 text-xs"
                                />
                                <span className="text-muted-foreground text-xs">to</span>
                                <Input
                                    type="date"
                                    value={customTo}
                                    onChange={(e) => {
                                        setCustomTo(e.target.value);
                                        setPage(1);
                                    }}
                                    className="h-8 w-36 text-xs"
                                />
                            </div>
                        )}
                        {tab === 'employee' && (
                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    className="bg-background h-8 w-64 rounded-md border px-2 text-xs"
                                    value={selectedEmpUid}
                                    onChange={(e) => {
                                        setSelectedEmpUid(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    <option value="">Select employee…</option>
                                    {employees.map((e) => (
                                        <option key={e.employee_uid} value={e.employee_uid}>
                                            {e.name} ({e.employee_uid})
                                        </option>
                                    ))}
                                </select>
                                {selectedEmpUid && (
                                    <div className="bg-muted rounded-lg px-3 py-1 text-xs font-semibold">
                                        Total spent: <span className="text-emerald-600">৳{empTotal.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="relative ml-auto">
                            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
                            <Input
                                placeholder="Search name, month, note…"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="h-8 w-52 pl-8 text-xs"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => downloadCSV(processedPayrolls, 'payrolls.csv')}>
                            <Download className="h-3.5 w-3.5" /> Export
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-card rounded-xl border">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="w-10 text-xs">#</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('name')}
                                            className="flex h-auto items-center gap-1 p-0 text-xs font-semibold"
                                        >
                                            Employee <ArrowUpDown className="h-3 w-3" />
                                        </Button>
                                    </TableHead>

                                    {/* ── NEW: Salary Month column ── */}
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('salary_month')}
                                            className="flex h-auto items-center gap-1 p-0 text-xs font-semibold"
                                        >
                                            Salary Month <ArrowUpDown className="h-3 w-3" />
                                        </Button>
                                    </TableHead>

                                    <TableHead>Payment Type</TableHead>
                                    <TableHead className="text-right">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('basic_salary')}
                                            className="ml-auto flex h-auto items-center gap-1 p-0 text-xs font-semibold"
                                        >
                                            Basic <ArrowUpDown className="h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('net_amount')}
                                            className="ml-auto flex h-auto items-center gap-1 p-0 text-xs font-semibold"
                                        >
                                            Net Paid <ArrowUpDown className="h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Diff</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('created_at')}
                                            className="flex h-auto items-center gap-1 p-0 text-xs font-semibold"
                                        >
                                            Created <ArrowUpDown className="h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pageRows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-muted-foreground py-16 text-center text-sm">
                                            No payroll records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {pageRows.map((p, i) => {
                                    const diff = parseFloat(p.net_amount) - parseFloat(p.basic_salary);
                                    const rowNum = (page - 1) * perPage + i + 1;
                                    return (
                                        <TableRow key={p.id} className="hover:bg-muted/30">
                                            <TableCell className="text-muted-foreground text-xs">{rowNum}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <EmpAvatar img={p.employee?.img ?? null} name={p.employee?.name ?? p.employee_uid} size={7} />
                                                    <div>
                                                        <p className="text-sm font-medium">{p.employee?.name ?? p.employee_uid}</p>
                                                        <p className="text-muted-foreground text-xs">{p.employee?.job_title ?? p.employee_uid}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* ── Salary Month cell ── */}
                                            <TableCell>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                                    <Calendar className="h-3 w-3" />
                                                    {salaryMonthLabel(p.salary_month, p.salary_year)}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {(Array.isArray(p.payment_includes) ? p.payment_includes : []).map((t) => (
                                                        <PIBadge key={t} type={t} />
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm">
                                                ৳{parseFloat(p.basic_salary).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm font-bold text-emerald-600">
                                                ৳{parseFloat(p.net_amount).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {diff > 0 ? (
                                                    <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                                                        <TrendingUp className="h-3 w-3" />
                                                        +৳{diff.toLocaleString()}
                                                    </span>
                                                ) : diff < 0 ? (
                                                    <span className="flex items-center gap-0.5 text-xs font-semibold text-red-600">
                                                        <TrendingDown className="h-3 w-3" />
                                                        -৳{Math.abs(diff).toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[140px]">
                                                <span className="text-muted-foreground block truncate text-xs" title={p.note ?? ''}>
                                                    {p.note || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{p.created_at.split('T')[0]}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-600"
                                                        onClick={() => setDeleteTarget(p)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {processedPayrolls.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3">
                            <div className="flex items-center gap-2">
                                <p className="text-muted-foreground text-xs">
                                    Showing {Math.min((page - 1) * perPage + 1, processedPayrolls.length)}–
                                    {Math.min(page * perPage, processedPayrolls.length)} of {processedPayrolls.length}
                                </p>
                                <select
                                    className="bg-background h-7 rounded border px-1 text-xs"
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(parseInt(e.target.value));
                                        setPage(1);
                                    }}
                                >
                                    {[25, 50, 100, 200].map((n) => (
                                        <option key={n} value={n}>
                                            {n} per page
                                        </option>
                                    ))}
                                    <option value={999999}>All</option>
                                </select>
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </Button>
                                    {pageNumbers().map((p, idx) =>
                                        p === -1 ? (
                                            <span key={`e-${idx}`} className="text-muted-foreground px-1 text-xs">
                                                …
                                            </span>
                                        ) : (
                                            <Button
                                                key={p}
                                                variant={page === p ? 'default' : 'outline'}
                                                size="icon"
                                                className="h-7 w-7 text-xs"
                                                onClick={() => setPage(p as number)}
                                            >
                                                {p}
                                            </Button>
                                        ),
                                    )}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Add / Edit Dialog ─────────────────────────────────────────────── */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {editTarget ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {editTarget ? 'Edit Payroll Record' : 'Add Payroll Record'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={submitPayroll} className="space-y-5">
                        {/* Error / warning banner */}
                        {dialogError && (
                            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <p>{dialogError}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            {/* Left column */}
                            <div className="space-y-4">
                                {/* Employee */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold">Employee *</Label>
                                    {editTarget ? (
                                        <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                                            <EmpAvatar img={editTarget.employee?.img ?? null} name={editTarget.employee?.name ?? ''} size={8} />
                                            <div>
                                                <p className="text-sm font-semibold">{editTarget.employee?.name}</p>
                                                <p className="text-muted-foreground text-xs">{editTarget.employee_uid}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <select
                                            className="bg-background h-9 w-full rounded-md border px-3 text-sm"
                                            value={selectedEmp?.employee_uid ?? ''}
                                            onChange={(e) => handleEmpSelect(e.target.value)}
                                            required
                                        >
                                            <option value="">Select employee…</option>
                                            {employees.map((e) => (
                                                <option key={e.employee_uid} value={e.employee_uid}>
                                                    {e.name} ({e.employee_uid})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Salary Month / Year */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold">{editTarget ? 'Salary Month' : 'Salary Month *'}</Label>
                                        <select
                                            className={`bg-background h-9 w-full rounded-md border px-3 text-sm ${editTarget ? 'cursor-not-allowed opacity-60' : ''}`}
                                            value={salaryMonth}
                                            onChange={(e) => handleSalaryMonthChange(parseInt(e.target.value))}
                                            disabled={!!editTarget}
                                        >
                                            {MONTHS.map((m, i) => (
                                                <option key={i + 1} value={i + 1}>
                                                    {m}
                                                </option>
                                            ))}
                                        </select>
                                        {editTarget && <p className="text-muted-foreground text-xs">Month is fixed after creation.</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold">Year</Label>
                                        <select
                                            className={`bg-background h-9 w-full rounded-md border px-3 text-sm ${editTarget ? 'cursor-not-allowed opacity-60' : ''}`}
                                            value={salaryYear}
                                            onChange={(e) => handleSalaryYearChange(parseInt(e.target.value))}
                                            disabled={!!editTarget}
                                        >
                                            {[thisYear - 2, thisYear - 1, thisYear].map((y) => (
                                                <option key={y} value={y}>
                                                    {y}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Show join date hint when employee is selected */}
                                {selectedEmp?.join_date && !editTarget && (
                                    <p className="text-muted-foreground -mt-2 text-xs">
                                        Joined: {localLabel(selectedEmp.join_date, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {' — '}earliest eligible salary month is{' '}
                                        <strong>
                                            {salaryMonthLabel(
                                                parseInt(selectedEmp.join_date.split('-')[1]),
                                                parseInt(selectedEmp.join_date.split('-')[0]),
                                            )}
                                        </strong>
                                        .
                                    </p>
                                )}

                                {/* Payment Includes */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold">Payment Includes</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {PAYMENT_INCLUDES_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => togglePI(opt.value)}
                                                className={`rounded-full border-2 px-3 py-1 text-xs font-semibold transition-all ${paymentIncludes.includes(opt.value) ? opt.color + ' border-current' : 'border-border bg-background text-muted-foreground'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Salary fields */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold">Basic Salary *</Label>
                                        <div className="relative">
                                            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold">
                                                ৳
                                            </span>
                                            <Input
                                                type="number"
                                                value={basicSalary}
                                                onChange={(e) => setBasicSalary(e.target.value)}
                                                className="pl-7"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold">Net Amount *</Label>
                                        <div className="relative">
                                            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold">
                                                ৳
                                            </span>
                                            <Input
                                                type="number"
                                                value={netAmount}
                                                onChange={(e) => setNetAmount(e.target.value)}
                                                className="pl-7"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                        {basicSalary && netAmount && (
                                            <p
                                                className={`text-xs font-semibold ${parseFloat(netAmount) > parseFloat(basicSalary) ? 'text-emerald-600' : parseFloat(netAmount) < parseFloat(basicSalary) ? 'text-red-600' : 'text-muted-foreground'}`}
                                            >
                                                {parseFloat(netAmount) > parseFloat(basicSalary) ? '+' : ''}৳
                                                {(parseFloat(netAmount) - parseFloat(basicSalary)).toLocaleString()} vs basic
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold">Note (optional)</Label>
                                    <Textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Add any notes about this payment…"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Right column — Analysis */}
                            <div className="space-y-2">
                                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                                    <Zap className="h-4 w-4 text-amber-500" />
                                    Employee Analysis — {MONTHS[salaryMonth - 1]} {salaryYear}
                                </h3>
                                {selectedEmp || editTarget ? (
                                    <div className="bg-muted/20 max-h-[460px] overflow-y-auto rounded-xl border p-3">
                                        <EmployeeAnalysis
                                            emp={selectedEmp ?? employees.find((e) => e.employee_uid === editTarget?.employee_uid)!}
                                            year={salaryYear}
                                            month={salaryMonth}
                                            attendance={attendance}
                                            leaves={leaves}
                                            punishments={punishments}
                                            holidays={holidays}
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-muted/20 text-muted-foreground rounded-xl border p-8 text-center text-sm">
                                        Select an employee to see their attendance analysis
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addSubmitting || addBlocked}>
                                {addSubmitting ? 'Saving…' : editTarget ? 'Update Record' : 'Release Payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Delete Dialog ── */}
            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Delete Payroll Record</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground text-sm">
                        Are you sure you want to delete the payroll record for{' '}
                        <span className="text-foreground font-semibold">{deleteTarget?.employee?.name}</span>?<br />
                        Salary month:{' '}
                        <span className="text-foreground font-semibold">
                            {deleteTarget ? salaryMonthLabel(deleteTarget.salary_month, deleteTarget.salary_year) : ''}
                        </span>
                        <br />
                        Net amount:{' '}
                        <span className="text-foreground font-semibold">৳{parseFloat(deleteTarget?.net_amount ?? '0').toLocaleString()}</span>
                        <br />
                        This action cannot be undone.
                    </p>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={submitDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Bulk Release Dialog ── */}
            <Dialog open={bulkReleaseOpen} onOpenChange={setBulkReleaseOpen}>
                <DialogContent className="max-w-md" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-4 w-4" /> Bulk Salary Release
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitBulkRelease} className="space-y-4">
                        <p className="text-muted-foreground text-sm">
                            Releases the regular basic salary for all eligible employees for the selected month. Employees who joined{' '}
                            <strong>after</strong> the salary month, or who already have a record for that month, will be skipped.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Month</Label>
                                <select
                                    className="bg-background h-9 w-full rounded-md border px-3 text-sm"
                                    value={bulkReleaseMonth}
                                    onChange={(e) => setBulkReleaseMonth(parseInt(e.target.value))}
                                >
                                    {MONTHS.map((m, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Year</Label>
                                <select
                                    className="bg-background h-9 w-full rounded-md border px-3 text-sm"
                                    value={bulkReleaseYear}
                                    onChange={(e) => setBulkReleaseYear(parseInt(e.target.value))}
                                >
                                    {[thisYear - 2, thisYear - 1, thisYear].map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            Employees with no salary set, or who joined after this month, will be skipped automatically.
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setBulkReleaseOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={bulkReleaseSubmitting}>
                                {bulkReleaseSubmitting ? 'Releasing…' : `Release ${MONTHS[bulkReleaseMonth - 1]} ${bulkReleaseYear} Salaries`}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Bulk Bonus Dialog ── */}
            <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
                <DialogContent className="max-w-md" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Gift className="h-4 w-4" /> Bulk Bonus
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitBulkBonus} className="space-y-4">
                        <p className="text-muted-foreground text-sm">
                            Add a bonus to all eligible employees for a specific month. Net amount paid will be <strong>salary + bonus</strong>. If a
                            payroll already exists for that month, it will be updated; otherwise a new record is created. Employees who joined after
                            the bonus month are skipped.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Bonus Month</Label>
                                <select
                                    className="bg-background h-9 w-full rounded-md border px-3 text-sm"
                                    value={bulkBonusMonth}
                                    onChange={(e) => setBulkBonusMonth(parseInt(e.target.value))}
                                >
                                    {MONTHS.map((m, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Year</Label>
                                <select
                                    className="bg-background h-9 w-full rounded-md border px-3 text-sm"
                                    value={bulkBonusYear}
                                    onChange={(e) => setBulkBonusYear(parseInt(e.target.value))}
                                >
                                    {[thisYear - 2, thisYear - 1, thisYear].map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Amount Type</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['percent', 'fixed'] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setBulkType(t)}
                                        className={`rounded-xl border-2 py-2.5 text-sm font-semibold transition-all ${bulkType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-muted-foreground'}`}
                                    >
                                        {t === 'percent' ? '% Percentage of Basic' : '৳ Fixed Amount'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">{bulkType === 'percent' ? 'Percentage (%)' : 'Amount (৳)'} *</Label>
                            <div className="relative">
                                <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold">
                                    {bulkType === 'percent' ? '%' : '৳'}
                                </span>
                                <Input
                                    type="number"
                                    value={bulkAmount}
                                    onChange={(e) => setBulkAmount(e.target.value)}
                                    className="pl-7"
                                    placeholder="0"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Note (optional)</Label>
                            <Input value={bulkNote} onChange={(e) => setBulkNote(e.target.value)} placeholder="e.g. Eid Bonus 2025" />
                        </div>
                        <div className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            Net paid = basic salary + bonus. Existing payrolls for the selected month will be updated with the bonus.
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setBulkOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={bulkSubmitting || !bulkAmount}>
                                {bulkSubmitting ? 'Adding…' : 'Add Bonus to All Employees'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
