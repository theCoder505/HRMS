import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowUpDown,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Eye,
    Gift,
    Hourglass,
    LogOut,
    MinusCircle,
    Pencil,
    Plus,
    Search,
    Timer,
    Trash2,
    User,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import FlashMessage from '../../FlashMessage';

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
}

interface AttendanceRecord {
    id: number;
    employee_uid: string;
    attend_date: string;
    clock_in_time: string | null;
    clock_out_time: string | null;
    created_at: string;
    employee: EmployeeMini | null;
}

interface Holiday {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
}

interface Props {
    attendance: AttendanceRecord[];
    employees: EmployeeMini[];
    holidays: Holiday[];
}

// ── Row types ─────────────────────────────────────────────────────────────────

interface PadRow {
    kind: 'pad';
    date: string;
    dayName: string;
}
interface DataRow {
    kind: 'data';
    date: string;
    dayName: string;
    total: number;
    present: number;
    absent: number;
    late: number;
    departed: number;
    weekend: number;
    holiday: boolean;
    holidayName?: string;
}
type TableRow = PadRow | DataRow;

// ── Low-level date helpers ────────────────────────────────────────────────────

const zeroPad = (n: number) => String(n).padStart(2, '0');

/** Local Date → YYYY-MM-DD (never touches UTC) */
function fmtDate(d: Date): string {
    return `${d.getFullYear()}-${zeroPad(d.getMonth() + 1)}-${zeroPad(d.getDate())}`;
}

/** YYYY-MM-DD → short day name e.g. "Sat" */
function getDayName(date: string): string {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short' });
}

/** Every date in [from, to] as YYYY-MM-DD strings */
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

/** Format YYYY-MM-DD for display without UTC shift */
function localLabel(date: string, opts?: Intl.DateTimeFormatOptions): string {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', opts);
}

// ── Attendance helpers ────────────────────────────────────────────────────────

function toMinutes(time: string | null | undefined): number | null {
    if (!time) return null;
    const p = time.split(':');
    if (p.length < 2) return null;
    return +p[0] * 60 + +p[1];
}

function formatMinutes(mins: number): string {
    return `${Math.floor(Math.abs(mins) / 60)}h ${Math.abs(mins) % 60}m`;
}

type AttendanceStatus = 'present' | 'departed' | 'late' | 'early-out' | 'absent' | 'weekend' | 'holiday';

interface ComputedAttendance {
    record: AttendanceRecord;
    status: AttendanceStatus;
    lateMinutes: number;
    earlyOutMinutes: number;
    overtimeMinutes: number;
    workedMinutes: number | null;
    scheduledMinutes: number | null;
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

function isAfterJoinDate(emp: EmployeeMini | null, date: string): boolean {
    if (!emp?.join_date) return true;
    const [jy, jm, jd] = emp.join_date.split('-').map(Number);
    const [ay, am, ad] = date.split('-').map(Number);
    return new Date(ay, am - 1, ad) >= new Date(jy, jm - 1, jd);
}

function computeAttendance(record: AttendanceRecord, holidays: Holiday[]): ComputedAttendance {
    const emp = record.employee;
    const scheduledIn = toMinutes(emp?.clock_in_time);
    const scheduledOut = toMinutes(emp?.clock_out_time);
    const actualIn = toMinutes(record.clock_in_time);
    const actualOut = toMinutes(record.clock_out_time);

    const workedMinutes = actualIn !== null && actualOut !== null ? actualOut - actualIn : null;
    const scheduledMinutes = scheduledIn !== null && scheduledOut !== null ? scheduledOut - scheduledIn : null;
    const lateMinutes = actualIn !== null && scheduledIn !== null ? Math.max(0, actualIn - scheduledIn) : 0;
    const earlyOutMinutes = actualOut !== null && scheduledOut !== null ? Math.max(0, scheduledOut - actualOut) : 0;
    const overtimeMinutes = actualOut !== null && scheduledOut !== null ? Math.max(0, actualOut - scheduledOut) : 0;

    const holiday = isHoliday(record.attend_date, holidays);
    if (holiday)
        return { record, status: 'holiday', lateMinutes: 0, earlyOutMinutes: 0, overtimeMinutes: 0, workedMinutes: null, scheduledMinutes: null };

    const dayName = getDayName(record.attend_date);
    const isWeekend = (emp?.weekend ?? []).some((d) => d.toLowerCase().startsWith(dayName.toLowerCase().slice(0, 3)));
    if (isWeekend)
        return { record, status: 'weekend', lateMinutes: 0, earlyOutMinutes: 0, overtimeMinutes: 0, workedMinutes: null, scheduledMinutes: null };

    // late BEFORE departed — late always takes priority
    let status: AttendanceStatus = 'present';
    if (!record.clock_in_time && !record.clock_out_time) status = 'absent';
    else if (lateMinutes > 0) status = 'late';
    else if (record.clock_out_time) status = 'departed';

    return { record, status, lateMinutes, earlyOutMinutes, overtimeMinutes, workedMinutes, scheduledMinutes };
}

// ── Date range builders ───────────────────────────────────────────────────────

function getToday(): string {
    return fmtDate(new Date());
}

/**
 * Week: Saturday → Friday
 * daysSinceSat = (jsDay - 6 + 7) % 7  →  Sat=0, Sun=1, Mon=2, … Fri=6
 */
function getWeekRange(): { from: string; to: string } {
    const now = new Date();
    const sinceSat = (now.getDay() - 6 + 7) % 7;
    const sat = new Date(now);
    sat.setDate(now.getDate() - sinceSat);
    const fri = new Date(sat);
    fri.setDate(sat.getDate() + 6);
    return { from: fmtDate(sat), to: fmtDate(fri) };
}

/**
 * Month grid — always complete Sat→Fri weeks that cover the whole calendar month.
 */
function getMonthGrid(): { gridStart: string; gridEnd: string; monthStart: string; monthEnd: string } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    // Saturday on or before the 1st
    const sinceSat = (first.getDay() - 6 + 7) % 7;
    const gridStart = new Date(first);
    gridStart.setDate(1 - sinceSat);

    // Friday on or after the last day  (Fri = JS index 5)
    const tillFri = (5 - last.getDay() + 7) % 7;
    const gridEnd = new Date(last);
    gridEnd.setDate(last.getDate() + tillFri);

    return {
        gridStart: fmtDate(gridStart),
        gridEnd: fmtDate(gridEnd),
        monthStart: fmtDate(first),
        monthEnd: fmtDate(last),
    };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const WEEK_SIZE = 7;
const DEFAULT_PAGE = 10;
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Attendance', href: '/hrm/attendance' }];

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AttendanceStatus }) {
    const MAP: Record<AttendanceStatus, { label: string; cls: string; icon: React.ReactNode }> = {
        present: {
            label: 'Present',
            cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            icon: <CheckCircle2 className="h-3 w-3" />,
        },
        departed: {
            label: 'Departed',
            cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            icon: <LogOut className="h-3 w-3" />,
        },
        late: { label: 'Late', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Timer className="h-3 w-3" /> },
        'early-out': {
            label: 'Early Out',
            cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            icon: <Hourglass className="h-3 w-3" />,
        },
        absent: { label: 'Absent', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="h-3 w-3" /> },
        weekend: {
            label: 'Weekend',
            cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
            icon: <MinusCircle className="h-3 w-3" />,
        },
        holiday: {
            label: 'Holiday',
            cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            icon: <Gift className="h-3 w-3" />,
        },
    };
    const { label, cls, icon } = MAP[status];
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
            {icon} {label}
        </span>
    );
}

// ── Employee Avatar ───────────────────────────────────────────────────────────

function EmpAvatar({ emp, size = 8 }: { emp: EmployeeMini | null; size?: number }) {
    const cls = `h-${size} w-${size} rounded-full overflow-hidden bg-muted border shrink-0`;
    return (
        <div className={cls}>
            {emp?.img ? (
                <img src={`/${emp.img}`} alt={emp.name} className="h-full w-full object-cover" />
            ) : (
                <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                    <User className="h-4 w-4" />
                </div>
            )}
        </div>
    );
}

// ── Page component ────────────────────────────────────────────────────────────

export default function Attendance({ attendance, employees, holidays }: Props) {
    // ── Local attendance state — mirrors the prop but is updated optimistically
    const [localAttendance, setLocalAttendance] = useState<AttendanceRecord[]>(attendance);

    // ── Tab state
    const [tab, setTab] = useState<'today' | 'week' | 'month' | 'custom'>('today');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    // ── Table state
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);

    // ── Dialogs
    const [viewOpen, setViewOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // ── Forms
    const addForm = useForm({ employee_uid: '', attend_date: getToday(), clock_in_time: '', clock_out_time: '' });
    const editForm = useForm({ id: null as number | null, employee_uid: '', attend_date: '', clock_in_time: '', clock_out_time: '' });
    const deleteForm = useForm({});

    // ── Month grid (computed once per month tab activation)
    const monthGrid = useMemo(() => (tab === 'month' ? getMonthGrid() : null), [tab]);

    // ── Query range
    const queryRange = useMemo((): { from: string; to: string } => {
        if (tab === 'today') return { from: getToday(), to: getToday() };
        if (tab === 'week') return getWeekRange();
        if (tab === 'month' && monthGrid) return { from: monthGrid.monthStart, to: monthGrid.monthEnd };
        return { from: customFrom, to: customTo };
    }, [tab, customFrom, customTo, monthGrid]);

    // ── Attendance matrix: date → ComputedAttendance[] — built from localAttendance
    const attendanceMatrix = useMemo<Map<string, ComputedAttendance[]>>(() => {
        if (!queryRange.from || !queryRange.to) return new Map();

        const recMap = new Map<string, AttendanceRecord>();
        const dateMap = new Map<string, ComputedAttendance[]>();

        localAttendance.forEach((r) => recMap.set(`${r.employee_uid}|${r.attend_date}`, r));
        datesInRange(queryRange.from, queryRange.to).forEach((d) => dateMap.set(d, []));

        employees.forEach((emp) => {
            datesInRange(queryRange.from, queryRange.to).forEach((date) => {
                if (!isAfterJoinDate(emp, date)) return;

                const rec = recMap.get(`${emp.employee_uid}|${date}`) ?? {
                    id: -1,
                    employee_uid: emp.employee_uid,
                    attend_date: date,
                    clock_in_time: null,
                    clock_out_time: null,
                    created_at: '',
                    employee: emp,
                };

                const computed = computeAttendance(rec, holidays);
                dateMap.get(date)!.push(computed);
            });
        });

        return dateMap;
    }, [localAttendance, employees, holidays, queryRange.from, queryRange.to]);

    // ── Live dialog records — derived from matrix so they update immediately
    const selectedDateRecords = useMemo<ComputedAttendance[]>(() => {
        if (!selectedDate) return [];
        return attendanceMatrix.get(selectedDate) ?? [];
    }, [selectedDate, attendanceMatrix]);

    // ── Build the full flat list of display rows
    const allRows = useMemo((): TableRow[] => {
        const rows: TableRow[] = [];

        if (tab === 'month' && monthGrid) {
            for (const date of datesInRange(monthGrid.gridStart, monthGrid.gridEnd)) {
                const isPad = date < monthGrid.monthStart || date > monthGrid.monthEnd;

                if (isPad) {
                    rows.push({ kind: 'pad', date, dayName: getDayName(date) });
                    continue;
                }

                const records = attendanceMatrix.get(date) ?? [];
                const holidayInfo = isHoliday(date, holidays);

                rows.push({
                    kind: 'data',
                    date,
                    dayName: getDayName(date),
                    total: records.filter((r) => r.status !== 'weekend' && r.status !== 'holiday').length,
                    present: records.filter((r) => r.status === 'present').length,
                    absent: records.filter((r) => r.status === 'absent').length,
                    late: records.filter((r) => r.status === 'late').length,
                    departed: records.filter((r) => r.status === 'departed').length,
                    weekend: records.filter((r) => r.status === 'weekend').length,
                    holiday: !!holidayInfo,
                    holidayName: holidayInfo?.title,
                });
            }
            return rows;
        }

        const { from, to } = queryRange;
        if (!from || !to) return rows;

        for (const date of datesInRange(from, to)) {
            const records = attendanceMatrix.get(date) ?? [];
            const holidayInfo = isHoliday(date, holidays);

            rows.push({
                kind: 'data',
                date,
                dayName: getDayName(date),
                total: records.filter((r) => r.status !== 'weekend' && r.status !== 'holiday').length,
                present: records.filter((r) => r.status === 'present').length,
                absent: records.filter((r) => r.status === 'absent').length,
                late: records.filter((r) => r.status === 'late').length,
                departed: records.filter((r) => r.status === 'departed').length,
                weekend: records.filter((r) => r.status === 'weekend').length,
                holiday: !!holidayInfo,
                holidayName: holidayInfo?.title,
            });
        }

        rows.sort((a, b) => {
            const da = a as DataRow,
                db = b as DataRow;
            const dir = sortDir === 'asc' ? 1 : -1;
            if (sortField === 'date') return da.date.localeCompare(db.date) * dir;
            if (sortField === 'dayName') return da.dayName.localeCompare(db.dayName) * dir;
            if (sortField === 'present') return (da.present - db.present) * dir;
            if (sortField === 'absent') return (da.absent - db.absent) * dir;
            if (sortField === 'late') return (da.late - db.late) * dir;
            return 0;
        });

        return rows;
    }, [tab, monthGrid, attendanceMatrix, queryRange, holidays, sortField, sortDir]);

    // ── Search filter
    const filteredRows = useMemo((): TableRow[] => {
        if (tab === 'month' || !search.trim()) return allRows;
        const q = search.toLowerCase();
        return allRows.filter(
            (r) =>
                r.kind === 'pad' ||
                r.date.includes(q) ||
                r.dayName.toLowerCase().includes(q) ||
                (r.kind === 'data' && r.holidayName?.toLowerCase().includes(q)),
        );
    }, [allRows, search, tab]);

    // ── Pagination
    const perPage = tab === 'month' ? WEEK_SIZE : DEFAULT_PAGE;
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage));
    const pageRows = filteredRows.slice((page - 1) * perPage, page * perPage);

    // ── Summary stats
    const stats = useMemo(() => {
        let present = 0,
            absent = 0,
            late = 0,
            departed = 0;
        const holidayDates = new Set<string>();
        for (const r of allRows) {
            if (r.kind === 'pad') continue;
            if (r.holiday) holidayDates.add(r.date);
            present += r.present;
            absent += r.absent;
            late += r.late;
            departed += r.departed;
        }
        return { present, absent, late, departed, holidayCount: holidayDates.size };
    }, [allRows]);

    // ── Week label shown above table in month view
    const weekLabel = useMemo(() => {
        if (tab !== 'month') return null;
        const slice = filteredRows.slice((page - 1) * WEEK_SIZE, page * WEEK_SIZE);
        if (!slice.length) return null;
        const first = slice[0].date;
        const last = slice[slice.length - 1].date;
        return `${localLabel(first, { day: '2-digit', month: 'short' })} – ${localLabel(last, { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }, [tab, page, filteredRows]);

    // ── Optimistic local state helpers ────────────────────────────────────────

    /** Upsert a record in localAttendance (for add/edit) */
    function upsertLocalRecord(updated: AttendanceRecord) {
        setLocalAttendance((prev) => {
            const idx = prev.findIndex((r) => r.employee_uid === updated.employee_uid && r.attend_date === updated.attend_date);
            if (idx === -1) return [updated, ...prev];
            const next = [...prev];
            next[idx] = updated;
            return next;
        });
    }

    /** Remove a record by id from localAttendance (for delete) */
    function removeLocalRecord(id: number) {
        setLocalAttendance((prev) => prev.filter((r) => r.id !== id));
    }

    // ── Handlers ─────────────────────────────────────────────────────────────

    function handleSort(field: string) {
        if (tab === 'month') return;
        if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortField(field);
            setSortDir('asc');
        }
        setPage(1);
    }

    function openDateView(date: string) {
        setSelectedDate(date);
        setViewOpen(true);
    }

    function openAddRecord(date: string) {
        addForm.setData({ employee_uid: '', attend_date: date, clock_in_time: '', clock_out_time: '' });
        setAddOpen(true);
    }

    function openEditRecord(r: ComputedAttendance) {
        editForm.setData({
            id: r.record.id,
            employee_uid: r.record.employee_uid,
            attend_date: r.record.attend_date,
            clock_in_time: r.record.clock_in_time || '',
            clock_out_time: r.record.clock_out_time || '',
        });
        setAddOpen(true);
    }

    function openDeleteRecord(r: ComputedAttendance) {
        if (r.record.id === -1) return;
        editForm.setData({
            id: r.record.id,
            employee_uid: r.record.employee_uid,
            attend_date: r.record.attend_date,
            clock_in_time: r.record.clock_in_time || '',
            clock_out_time: r.record.clock_out_time || '',
        });
        setDeleteOpen(true);
    }

    function submitAdd(e: React.FormEvent) {
        e.preventDefault();
        addForm.post(route('hr.attendance.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                // Build a synthetic record for optimistic update from the form data.
                // The server returns the real id via Inertia props reload; we use
                // a temporary id of -2 and let the next prop sync correct it.
                // However we DO get the fresh props via Inertia's automatic reload
                // — so we just sync localAttendance from the new props.
                const freshAttendance = (page.props as unknown as Props).attendance;
                if (freshAttendance) setLocalAttendance(freshAttendance);

                setAddOpen(false);
                addForm.reset();
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editForm.data.id) return;

        // Capture values before async completes
        const { id, employee_uid, attend_date, clock_in_time, clock_out_time } = editForm.data;

        editForm.put(route('hr.attendance.update', id), {
            preserveScroll: true,
            onSuccess: (page) => {
                const freshAttendance = (page.props as unknown as Props).attendance;
                if (freshAttendance) {
                    setLocalAttendance(freshAttendance);
                } else {
                    // Fallback: apply optimistically without server confirmation
                    const emp = employees.find((e) => e.employee_uid === employee_uid) ?? null;
                    upsertLocalRecord({
                        id: id!,
                        employee_uid,
                        attend_date,
                        clock_in_time: clock_in_time || null,
                        clock_out_time: clock_out_time || null,
                        created_at: '',
                        employee: emp,
                    });
                }
                setAddOpen(false);
                editForm.reset();
            },
        });
    }

    function submitDelete() {
        if (!editForm.data.id) return;
        const idToDelete = editForm.data.id;

        deleteForm.delete(route('hr.attendance.destroy', idToDelete), {
            preserveScroll: true,
            onSuccess: (page) => {
                const freshAttendance = (page.props as unknown as Props).attendance;
                if (freshAttendance) {
                    setLocalAttendance(freshAttendance);
                } else {
                    // Fallback: remove optimistically
                    removeLocalRecord(idToDelete);
                }
                setDeleteOpen(false);
            },
        });
    }

    function pageNumbers(): number[] {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (page <= 4) return [1, 2, 3, 4, 5, -1, totalPages];
        if (page >= totalPages - 3) return [1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, -1, page - 1, page, page + 1, -1, totalPages];
    }

    function SortBtn({ field, label }: { field: string; label: string }) {
        const disabled = tab === 'month';
        return (
            <Button
                variant="ghost"
                onClick={() => handleSort(field)}
                disabled={disabled}
                className="flex h-auto items-center gap-1 p-0 text-xs font-semibold disabled:cursor-default disabled:opacity-60"
            >
                {label} {!disabled && <ArrowUpDown className="h-3 w-3" />}
            </Button>
        );
    }

    // ── Derived display values
    const dataRowCount = allRows.filter((r) => r.kind === 'data').length;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance Reports" />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* ── Header ───────────────────────────────────────────────── */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Attendance Reports</h1>
                        <p className="text-muted-foreground text-sm">
                            {dataRowCount} days · {employees.length} employees
                            {tab === 'month' && (
                                <span className="ml-1 text-xs">
                                    · {totalPages} week{totalPages !== 1 ? 's' : ''}
                                </span>
                            )}
                            {queryRange.from && queryRange.to && (
                                <span className="ml-2 text-xs">
                                    ({localLabel(queryRange.from)} – {localLabel(queryRange.to)})
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* ── Summary Stats ─────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {[
                        {
                            label: 'Present',
                            value: stats.present,
                            icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                            color: 'text-emerald-600',
                        },
                        { label: 'Absent', value: stats.absent, icon: <XCircle className="h-4 w-4 text-red-500" />, color: 'text-red-600' },
                        { label: 'Late', value: stats.late, icon: <Timer className="h-4 w-4 text-amber-500" />, color: 'text-amber-600' },
                        { label: 'Departed', value: stats.departed, icon: <LogOut className="h-4 w-4 text-blue-500" />, color: 'text-blue-600' },
                        {
                            label: 'Holidays',
                            value: stats.holidayCount,
                            icon: <Gift className="h-4 w-4 text-purple-500" />,
                            color: 'text-purple-600',
                            onClick: () => router.visit('/hrm/holidays'),
                            extraCls: 'cursor-pointer hover:bg-muted/50 transition-colors',
                        },
                    ].map((s) => (
                        <div
                            key={s.label}
                            className={`bg-card flex items-center gap-3 rounded-xl border p-3 ${'extraCls' in s ? s.extraCls : ''}`}
                            onClick={'onClick' in s ? s.onClick : undefined}
                        >
                            <div className="bg-muted rounded-lg p-2">{s.icon}</div>
                            <div>
                                <p className={`text-lg leading-tight font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-muted-foreground text-xs">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Tabs + Filters ────────────────────────────────────────── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Tabs
                        value={tab}
                        onValueChange={(v) => {
                            setTab(v as typeof tab);
                            setPage(1);
                            setSearch('');
                        }}
                    >
                        <TabsList>
                            <TabsTrigger value="today">Today</TabsTrigger>
                            <TabsTrigger value="week">This Week (Sat–Fri)</TabsTrigger>
                            <TabsTrigger value="month">This Month</TabsTrigger>
                            <TabsTrigger value="custom">Custom</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex flex-wrap items-center gap-2">
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
                        {tab !== 'month' && (
                            <div className="relative">
                                <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
                                <Input
                                    placeholder="Search date, day, holiday..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="h-8 w-52 pl-8 text-xs"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Main Table ────────────────────────────────────────────── */}
                <div className="bg-card rounded-xl border">
                    {tab === 'month' && weekLabel && (
                        <div className="flex items-center gap-2 border-b px-4 py-2">
                            <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                            <span className="text-muted-foreground text-xs font-medium">
                                Week {page} of {totalPages} — {weekLabel}
                            </span>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="w-10 text-xs">#</TableHead>
                                    <TableHead>
                                        <SortBtn field="date" label="Date" />
                                    </TableHead>
                                    <TableHead>
                                        <SortBtn field="dayName" label="Day" />
                                    </TableHead>
                                    <TableHead className="text-center">Total</TableHead>
                                    <TableHead className="text-center">Present</TableHead>
                                    <TableHead className="text-center">Absent</TableHead>
                                    <TableHead className="text-center">Late</TableHead>
                                    <TableHead className="text-center">Departed</TableHead>
                                    <TableHead className="text-center">Weekend</TableHead>
                                    <TableHead>Holiday</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {pageRows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-muted-foreground py-16 text-center text-sm">
                                            No records found for the selected period.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {pageRows.map((row, i) => {
                                    const rowNum = (page - 1) * perPage + i + 1;

                                    if (row.kind === 'pad') {
                                        return (
                                            <TableRow key={`pad-${row.date}`} className="bg-muted/10 pointer-events-none opacity-40 select-none">
                                                <TableCell className="text-muted-foreground text-xs">{rowNum}</TableCell>
                                                <TableCell className="text-muted-foreground font-medium">
                                                    {localLabel(row.date, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-semibold">{row.dayName}</TableCell>
                                                {Array.from({ length: 8 }).map((_, ci) => (
                                                    <TableCell key={ci} className="text-muted-foreground text-center">
                                                        —
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        );
                                    }

                                    return (
                                        <TableRow key={row.date} className="hover:bg-muted/30">
                                            <TableCell className="text-muted-foreground text-xs">{rowNum}</TableCell>
                                            <TableCell className="font-medium">
                                                {localLabel(row.date, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell className="font-semibold">{row.dayName}</TableCell>
                                            <TableCell className="text-center">{row.total}</TableCell>
                                            <TableCell className="text-center text-emerald-600">{row.present}</TableCell>
                                            <TableCell className="text-center text-red-600">{row.absent}</TableCell>
                                            <TableCell className="text-center text-amber-600">{row.late}</TableCell>
                                            <TableCell className="text-center text-blue-600">{row.departed}</TableCell>
                                            <TableCell className="text-center text-slate-500">{row.weekend}</TableCell>
                                            <TableCell>
                                                {row.holiday ? (
                                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                                        <Gift className="mr-1 h-3 w-3" />
                                                        {row.holidayName}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => openDateView(row.date)} className="h-7 gap-1">
                                                    <Eye className="h-3.5 w-3.5" /> View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* ── Pagination ── */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-muted-foreground text-xs">
                                {tab === 'month'
                                    ? `Week ${page} of ${totalPages}`
                                    : `Showing ${(page - 1) * perPage + 1}–${Math.min(page * perPage, filteredRows.length)} of ${filteredRows.length} days`}
                            </p>
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
                                            onClick={() => setPage(p)}
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
                        </div>
                    )}
                </div>
            </div>

            {/* ── View Date Details Dialog ─────────────────────────────────── */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="max-h-[80vh] max-w-6xl overflow-y-auto" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Attendance Details —{' '}
                            {selectedDate && localLabel(selectedDate, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedDate && isHoliday(selectedDate, holidays) && (
                        <div className="mb-4 rounded-lg bg-purple-50 p-4 text-center dark:bg-purple-950/20">
                            <Gift className="mx-auto mb-2 h-8 w-8 text-purple-500" />
                            <p className="text-lg font-semibold text-purple-700">Holiday</p>
                            <p className="text-sm text-purple-600">{isHoliday(selectedDate, holidays)?.title}</p>
                            <p className="text-muted-foreground mt-1 text-xs">No attendance records required for this day</p>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>UID</TableHead>
                                    <TableHead>Clock In</TableHead>
                                    <TableHead>Clock Out</TableHead>
                                    <TableHead>Worked</TableHead>
                                    <TableHead>Late</TableHead>
                                    <TableHead>Early Out</TableHead>
                                    <TableHead>Overtime</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedDateRecords
                                    .filter((r) => r.status !== 'weekend' && r.status !== 'holiday')
                                    .map((record, idx) => (
                                        <TableRow key={`${record.record.employee_uid}-${record.record.attend_date}`}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <EmpAvatar emp={record.record.employee} size={6} />
                                                    <span className="text-sm">{record.record.employee?.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {record.record.employee_uid}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono">{record.record.clock_in_time?.slice(0, 5) || '—'}</TableCell>
                                            <TableCell className="font-mono">{record.record.clock_out_time?.slice(0, 5) || '—'}</TableCell>
                                            <TableCell>{record.workedMinutes !== null ? formatMinutes(record.workedMinutes) : '—'}</TableCell>
                                            <TableCell className="text-amber-600">
                                                {record.lateMinutes > 0 ? `+${formatMinutes(record.lateMinutes)}` : '—'}
                                            </TableCell>
                                            <TableCell className="text-orange-600">
                                                {record.earlyOutMinutes > 0 ? `-${formatMinutes(record.earlyOutMinutes)}` : '—'}
                                            </TableCell>
                                            <TableCell className="text-blue-600">
                                                {record.overtimeMinutes > 0 ? `+${formatMinutes(record.overtimeMinutes)}` : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={record.status} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {record.record.id === -1 ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-emerald-600"
                                                            onClick={() => openAddRecord(record.record.attend_date)}
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => openEditRecord(record)}
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-red-600"
                                                                onClick={() => openDeleteRecord(record)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                {selectedDateRecords.filter((r) => r.status === 'weekend').length > 0 && (
                                    <>
                                        <TableRow>
                                            <TableCell colSpan={11} className="bg-muted/20">
                                                <div className="text-muted-foreground flex items-center gap-2">
                                                    <MinusCircle className="h-4 w-4" /> Weekend / Non-working days
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {selectedDateRecords
                                            .filter((r) => r.status === 'weekend')
                                            .map((record, idx) => (
                                                <TableRow key={`wk-${record.record.employee_uid}`} className="bg-muted/10">
                                                    <TableCell>
                                                        {selectedDateRecords.filter((r) => r.status !== 'weekend' && r.status !== 'holiday').length +
                                                            idx +
                                                            1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <EmpAvatar emp={record.record.employee} size={6} />
                                                            <span className="text-muted-foreground text-sm">{record.record.employee?.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {record.record.employee_uid}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell colSpan={7}>—</TableCell>
                                                    <TableCell>
                                                        <StatusBadge status="weekend" />
                                                    </TableCell>
                                                    <TableCell />
                                                </TableRow>
                                            ))}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Add / Edit Dialog ────────────────────────────────────────── */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-md" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {editForm.data.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {editForm.data.id ? 'Edit Attendance Record' : 'Add Attendance Record'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={editForm.data.id ? submitEdit : submitAdd} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Employee *</Label>
                            <div className="relative">
                                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <select
                                    className="bg-background focus:ring-ring h-9 w-full appearance-none rounded-md border pr-3 pl-9 text-sm focus:ring-2 focus:outline-none"
                                    value={editForm.data.id ? editForm.data.employee_uid : addForm.data.employee_uid}
                                    onChange={(e) =>
                                        editForm.data.id
                                            ? editForm.setData('employee_uid', e.target.value)
                                            : addForm.setData('employee_uid', e.target.value)
                                    }
                                    required
                                >
                                    <option value="">Select employee…</option>
                                    {employees.map((e) => (
                                        <option key={e.employee_uid} value={e.employee_uid}>
                                            {e.name} ({e.employee_uid})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Date *</Label>
                            <Input
                                type="date"
                                value={editForm.data.id ? editForm.data.attend_date : addForm.data.attend_date}
                                onChange={(e) =>
                                    editForm.data.id
                                        ? editForm.setData('attend_date', e.target.value)
                                        : addForm.setData('attend_date', e.target.value)
                                }
                                required
                                className="bg-background"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Clock In</Label>
                                <Input
                                    type="time"
                                    value={editForm.data.id ? editForm.data.clock_in_time : addForm.data.clock_in_time}
                                    onChange={(e) =>
                                        editForm.data.id
                                            ? editForm.setData('clock_in_time', e.target.value)
                                            : addForm.setData('clock_in_time', e.target.value)
                                    }
                                    className="bg-background"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Clock Out</Label>
                                <Input
                                    type="time"
                                    value={editForm.data.id ? editForm.data.clock_out_time : addForm.data.clock_out_time}
                                    onChange={(e) =>
                                        editForm.data.id
                                            ? editForm.setData('clock_out_time', e.target.value)
                                            : addForm.setData('clock_out_time', e.target.value)
                                    }
                                    className="bg-background"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setAddOpen(false);
                                    editForm.reset();
                                    addForm.reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.data.id ? editForm.processing : addForm.processing}>
                                {editForm.data.id
                                    ? editForm.processing
                                        ? 'Updating…'
                                        : 'Update Record'
                                    : addForm.processing
                                      ? 'Saving…'
                                      : 'Save Record'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Delete Dialog ─────────────────────────────────────────────── */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Attendance Record</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground text-sm">
                        Are you sure you want to delete this attendance record?
                        <br />
                        This action cannot be undone.
                    </p>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={submitDelete} disabled={deleteForm.processing}>
                            {deleteForm.processing ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
