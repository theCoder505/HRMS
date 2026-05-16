import EmployeeLayout from '@/layouts/employee-layout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { 
    Calendar, 
    CheckCircle2, 
    XCircle, 
    Timer, 
    Clock, 
    ChevronLeft, 
    ChevronRight, 
    Search,
    Info,
    Gift,
    MinusCircle
} from 'lucide-react';

interface AttendanceRecord {
    id: number;
    attend_date: string;
    clock_in_time: string | null;
    clock_out_time: string | null;
}

interface Holiday {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
}

interface Employee {
    employee_uid: string;
    name: string;
    join_date: string | null;
    clock_in_time: string | null;
    clock_out_time: string | null;
    weekend: string[] | null;
}

interface Props {
    attendances: AttendanceRecord[];
    holidays: Holiday[];
    employee: Employee;
}

// ── Low-level date helpers ────────────────────────────────────────────────────
const zeroPad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date): string => `${d.getFullYear()}-${zeroPad(d.getMonth() + 1)}-${zeroPad(d.getDate())}`;

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

// ── Types ─────────────────────────────────────────────────────────────────────
type AttendanceStatus = 'present' | 'late' | 'early-out' | 'absent' | 'weekend' | 'holiday';

interface ComputedAttendance {
    date: string;
    dayName: string;
    clockIn: string | null;
    clockOut: string | null;
    status: AttendanceStatus;
    lateMins: number;
    earlyOutMins: number;
    overtimeMins: number;
    holidayName?: string;
}

export default function Attendance({ attendances, holidays, employee }: Props) {
    const [tab, setTab] = useState<'week' | 'month' | 'custom'>('month');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [search, setSearch] = useState('');

    // ── Helper: Time to Minutes
    const toMins = (time: string | null) => {
        if (!time) return null;
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const formatMins = (mins: number) => {
        if (mins <= 0) return '—';
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    // ── Range Calculators
    const weekRange = useMemo(() => {
        const now = new Date();
        const sinceSat = (now.getDay() - 6 + 7) % 7;
        const sat = new Date(now);
        sat.setDate(now.getDate() - sinceSat);
        const fri = new Date(sat);
        fri.setDate(sat.getDate() + 6);
        return { from: fmtDate(sat), to: fmtDate(fri) };
    }, []);

    const monthRange = useMemo(() => {
        const now = new Date();
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { from: fmtDate(first), to: fmtDate(last) };
    }, []);

    const activeRange = useMemo(() => {
        if (tab === 'week') return weekRange;
        if (tab === 'month') return monthRange;
        return { from: customFrom, to: customTo };
    }, [tab, weekRange, monthRange, customFrom, customTo]);

    // ── Computation Logic
    const allRows = useMemo(() => {
        const { from, to } = activeRange;
        if (!from || !to) return [];

        const recordsMap = new Map(attendances.map(a => [a.attend_date, a]));
        const holidaysMap = new Map();
        holidays.forEach(h => {
            datesInRange(h.start_date, h.end_date).forEach(d => holidaysMap.set(d, h.title));
        });

        const shiftIn = toMins(employee.clock_in_time);
        const shiftOut = toMins(employee.clock_out_time);
        const weekendDays = (employee.weekend || []).map(d => d.toLowerCase().slice(0, 3));

        return datesInRange(from, to).map(date => {
            const dayName = getDayName(date);
            const record = recordsMap.get(date);
            const holidayName = holidaysMap.get(date);
            
            const joinDate = employee.join_date || '1970-01-01';
            const isBeforeJoin = date < joinDate;

            let status: AttendanceStatus = 'absent';
            let lateMins = 0;
            let earlyOutMins = 0;
            let overtimeMins = 0;

            if (holidayName) status = 'holiday';
            else if (weekendDays.includes(dayName.toLowerCase())) status = 'weekend';
            else if (record) {
                const actualIn = toMins(record.clock_in_time);
                const actualOut = toMins(record.clock_out_time);
                
                if (actualIn !== null && shiftIn !== null) lateMins = Math.max(0, actualIn - shiftIn);
                if (actualOut !== null && shiftOut !== null) {
                    earlyOutMins = Math.max(0, shiftOut - actualOut);
                    overtimeMins = Math.max(0, actualOut - shiftOut);
                }
                
                status = lateMins > 0 ? 'late' : 'present';
                if (status === 'present' && earlyOutMins > 0 && !record.clock_out_time) status = 'early-out';
            }

            return {
                date,
                dayName,
                clockIn: record?.clock_in_time || null,
                clockOut: record?.clock_out_time || null,
                status: isBeforeJoin ? 'absent' : status, // Simplified
                lateMins,
                earlyOutMins,
                overtimeMins,
                holidayName,
                isBeforeJoin
            };
        });
    }, [activeRange, attendances, holidays, employee]);

    const filteredRows = useMemo(() => {
        if (!search.trim()) return allRows;
        const q = search.toLowerCase();
        return allRows.filter(r => 
            r.date.includes(q) || 
            r.dayName.toLowerCase().includes(q) || 
            r.holidayName?.toLowerCase().includes(q)
        );
    }, [allRows, search]);

    const stats = useMemo(() => {
        return {
            present: allRows.filter(r => r.status === 'present' || r.status === 'late').length,
            absent: allRows.filter(r => r.status === 'absent' && !r.isBeforeJoin).length,
            late: allRows.filter(r => r.status === 'late').length,
            holidays: new Set(allRows.filter(r => r.holidayName).map(r => r.date)).size
        };
    }, [allRows]);

    return (
        <EmployeeLayout>
            <Head title="Attendance Reports" />
            
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">Attendance Reports</h1>
                    <p className="mt-2 text-lg text-slate-500 dark:text-[#8b8fa8]">Complete calendar view of your work history</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Present', val: stats.present, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                        { label: 'Absent', val: stats.absent, color: 'text-red-500', bg: 'bg-red-500/10' },
                        { label: 'Late', val: stats.late, color: 'text-amber-600', bg: 'bg-amber-500/10' },
                        { label: 'Holidays', val: stats.holidays, color: 'text-purple-600', bg: 'bg-purple-500/10' },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-slate-100 dark:border-white/5`}>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#8b8fa8]">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.val}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex bg-slate-100 p-1 rounded-xl dark:bg-white/5 ring-1 ring-slate-200 dark:ring-white/10 w-full lg:w-auto">
                    {(['week', 'month', 'custom'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 lg:flex-none px-6 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
                                tab === t 
                                ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white' 
                                : 'text-slate-500 hover:text-slate-900 dark:text-[#8b8fa8] dark:hover:text-white'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {tab === 'custom' && (
                        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 dark:bg-white/[0.03] dark:border-white/10">
                            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="bg-transparent border-none text-xs focus:ring-0 dark:text-white [color-scheme:dark]" />
                            <span className="text-slate-300">/</span>
                            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="bg-transparent border-none text-xs focus:ring-0 dark:text-white [color-scheme:dark]" />
                        </div>
                    )}
                    <div className="relative flex-1 lg:flex-none min-w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            placeholder="Search records..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-500/50 dark:bg-white/[0.03] dark:border-white/10 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-white/[0.07] dark:bg-white/[0.03] backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-slate-100 dark:divide-white/[0.07]">
                        <thead className="bg-slate-50 dark:bg-white/[0.03]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Date & Day</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 text-center">In / Out</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Late</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Early Leave</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Overtime</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/[0.05]">
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400 dark:text-[#8b8fa8]">
                                        <div className="flex flex-col items-center gap-3">
                                            <Calendar className="h-10 w-10 opacity-20" />
                                            <p>No records found for the selected range.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row) => (
                                    <tr key={row.date} className={`transition-colors ${row.status === 'weekend' ? 'bg-slate-50/30 dark:bg-white/[0.01]' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-slate-900 dark:text-white">{row.date}</div>
                                            <div className="text-xs text-slate-400 dark:text-[#5b5f78]">{row.dayName}</div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <StatusBadge status={row.status} holidayName={row.holidayName} />
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="text-sm font-medium text-slate-700 dark:text-[#8b8fa8]">
                                                {row.clockIn || '—'} <span className="mx-1 opacity-30">/</span> {row.clockOut || '—'}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-5 text-center text-sm font-bold ${row.lateMins > 0 ? 'text-red-500' : 'text-slate-300 dark:text-white/10'}`}>
                                            {formatMins(row.lateMins)}
                                        </td>
                                        <td className={`px-6 py-5 text-center text-sm font-bold ${row.earlyOutMins > 0 ? 'text-amber-500' : 'text-slate-300 dark:text-white/10'}`}>
                                            {formatMins(row.earlyOutMins)}
                                        </td>
                                        <td className={`px-6 py-5 text-center text-sm font-bold ${row.overtimeMins > 0 ? 'text-emerald-500' : 'text-slate-300 dark:text-white/10'}`}>
                                            {formatMins(row.overtimeMins)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </EmployeeLayout>
    );
}

function StatusBadge({ status, holidayName }: { status: AttendanceStatus, holidayName?: string }) {
    const MAP: Record<AttendanceStatus, { label: string; cls: string; icon: any }> = {
        present: { label: 'Present', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', icon: CheckCircle2 },
        late: { label: 'Late', cls: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400', icon: Timer },
        'early-out': { label: 'Early Out', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', icon: Clock },
        absent: { label: 'Absent', cls: 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400', icon: XCircle },
        weekend: { label: 'Weekend', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400', icon: MinusCircle },
        holiday: { label: holidayName || 'Holiday', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400', icon: Gift },
    };

    const { label, cls, icon: Icon } = MAP[status];
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ring-current/20 ${cls}`}>
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}
