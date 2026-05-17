import EmployeeLayout from '@/layouts/employee-layout';
import { Head } from '@inertiajs/react';
import {
    ChevronDown,
    FileText,
    Download,
    Calendar,
    CheckCircle2,
    TrendingDown,
    TrendingUp,
    AlertCircle,
    Banknote,
    Sparkles,
    Activity,
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

// ── Types ─────────────────────────────────────────────────────────────────────

interface EmployeeMini {
    employee_uid: string;
    name: string;
    img: string | null;
    job_title: string | null;
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
}

interface Props {
    payrolls: PayrollRecord[];
    attendance: AttendanceRecord[];
    leaves: LeaveRecord[];
    punishments: PunishmentRecord[];
    holidays: Holiday[];
    employee: EmployeeMini;
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

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function salaryMonthLabel(month: number, year: number): string {
    return `${MONTHS[month - 1]} ${year}`;
}

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
    attendance.forEach((a) => recMap.set(a.attend_date, a));

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

export default function Payrolls({ payrolls, attendance, leaves, punishments, holidays, employee }: Props) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    // Dynamic slip download using browser printing in a beautifully styled separate window
    const handleDownloadSlip = (
        payroll: PayrollRecord,
        stats: MonthStats,
        empLeaves: LeaveRecord[],
        empPunishments: PunishmentRecord[],
        totalLeaveDeduction: number,
        totalPunishmentDeduction: number
    ) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            Swal.fire({
                title: 'Popup Blocked',
                text: 'Please allow popups to download your salary slip.',
                icon: 'warning',
                background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
                color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
            });
            return;
        }

        const monthLabel = salaryMonthLabel(payroll.salary_month, payroll.salary_year);
        const hasLeaveDeducted = payroll.payment_includes.includes('leave_deduction');
        const hasPunishmentDeducted = payroll.payment_includes.includes('punishment');
        const hasLateDeducted = payroll.payment_includes.includes('late_deduction');
        const hasOvertimeIncluded = payroll.payment_includes.includes('overtime');
        const hasBonusIncluded = payroll.payment_includes.includes('bonus');

        // Total deductions applied by HR
        const totalDeducted = (hasLeaveDeducted ? totalLeaveDeduction : 0) + (hasPunishmentDeducted ? totalPunishmentDeduction : 0);

        // Reverse-engineered extra additions (Bonus/Overtime/Others)
        const additions = parseFloat(payroll.net_amount) - parseFloat(payroll.basic_salary) + totalDeducted;
        const finalAdditions = additions > 0 ? additions : 0;

        const htmlContent = `
            <html>
            <head>
                <title>Salary Slip - ${monthLabel} - ${employee.name}</title>
                <style>
                    body {
                        font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
                        color: #1e293b;
                        margin: 0;
                        padding: 40px;
                        background: #fff;
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 40px;
                        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 2px solid #10b981;
                        padding-bottom: 24px;
                        margin-bottom: 30px;
                    }
                    .company-name {
                        font-size: 26px;
                        font-weight: 800;
                        color: #065f46;
                        letter-spacing: -0.025em;
                    }
                    .slip-title {
                        font-size: 16px;
                        font-weight: 600;
                        color: #475569;
                        background: #f1f5f9;
                        padding: 6px 16px;
                        border-radius: 9999px;
                    }
                    .meta-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 30px;
                    }
                    .meta-block h3 {
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        color: #64748b;
                        margin-bottom: 8px;
                        margin-top: 0;
                    }
                    .meta-value {
                        font-size: 15px;
                        font-weight: 600;
                        color: #0f172a;
                    }
                    .table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    .table th {
                        background: #f8fafc;
                        text-align: left;
                        padding: 12px 16px;
                        font-size: 12px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        color: #475569;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    .table td {
                        padding: 14px 16px;
                        font-size: 14px;
                        border-bottom: 1px solid #f1f5f9;
                    }
                    .text-right {
                        text-align: right !important;
                    }
                    .badge {
                        display: inline-block;
                        font-size: 11px;
                        font-weight: 600;
                        padding: 2px 8px;
                        border-radius: 9999px;
                        margin-left: 6px;
                    }
                    .badge-success { background: #dcfce7; color: #15803d; }
                    .badge-warning { background: #fef3c7; color: #b45309; }
                    .total-section {
                        background: #f8fafc;
                        border-radius: 8px;
                        padding: 20px;
                        margin-bottom: 40px;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 14px;
                        margin-bottom: 10px;
                    }
                    .total-row:last-child {
                        margin-bottom: 0;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 10px;
                        font-size: 20px;
                        font-weight: 800;
                        color: #0f172a;
                    }
                    .footer {
                        text-align: center;
                        font-size: 12px;
                        color: #94a3b8;
                        margin-top: 60px;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 20px;
                    }
                    @media print {
                        body { padding: 0; }
                        .container { border: none; box-shadow: none; padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div>
                            <div class="company-name">HRMS Portal</div>
                            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Employee Salary Statement</div>
                        </div>
                        <div class="slip-title">Salary Slip</div>
                    </div>

                    <div class="meta-grid">
                        <div class="meta-block">
                            <h3>Employee Details</h3>
                            <div style="margin-bottom: 6px;"><span style="color: #64748b;">Name:</span> <span class="meta-value">${employee.name}</span></div>
                            <div style="margin-bottom: 6px;"><span style="color: #64748b;">Employee ID:</span> <span class="meta-value">${payroll.employee_uid}</span></div>
                            <div><span style="color: #64748b;">Job Title:</span> <span class="meta-value">${employee.job_title || 'N/A'}</span></div>
                        </div>
                        <div class="meta-block">
                            <h3>Statement Period</h3>
                            <div style="margin-bottom: 6px;"><span style="color: #64748b;">Salary Month:</span> <span class="meta-value">${monthLabel}</span></div>
                            <div style="margin-bottom: 6px;"><span style="color: #64748b;">Release Date:</span> <span class="meta-value">${new Date(payroll.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span></div>
                            <div><span style="color: #64748b;">Basic Salary (Table):</span> <span class="meta-value">৳${parseFloat(employee.salary).toLocaleString('en-us')}</span></div>
                        </div>
                    </div>

                    <h3 style="font-size: 14px; text-transform: uppercase; color: #065f46; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px;">Salary Breakdown</h3>
                    
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Status / Details</th>
                                <th class="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>Basic Salary</b></td>
                                <td>Monthly Standard basic rate</td>
                                <td class="text-right">৳${parseFloat(payroll.basic_salary).toLocaleString('en-us')}</td>
                            </tr>
                            ${finalAdditions > 0 ? `
                            <tr>
                                <td><b>Allowances & Additions</b></td>
                                <td>${[hasBonusIncluded && 'Bonus', hasOvertimeIncluded && 'Overtime', 'Other Adjustments'].filter(Boolean).join(', ')}</td>
                                <td class="text-right" style="color: #15803d;">+৳${finalAdditions.toLocaleString('en-us')}</td>
                            </tr>
                            ` : ''}
                            
                            <!-- Leave Deductions -->
                            <tr>
                                <td><b>Leave Deductions</b></td>
                                <td>
                                    ${empLeaves.length > 0 ? `${empLeaves.length} unpaid leave day(s)` : 'No unpaid leaves'}
                                    ${empLeaves.length > 0 ? (hasLeaveDeducted ? '<span class="badge badge-success">Deducted by HR</span>' : '<span class="badge badge-warning">Was deduction but HR did not deduce</span>') : ''}
                                </td>
                                <td class="text-right" style="color: ${hasLeaveDeducted ? '#b91c1c' : '#475569'};">
                                    ${hasLeaveDeducted ? '-' : ''}৳${totalLeaveDeduction.toLocaleString('en-us')}
                                </td>
                            </tr>

                            <!-- Punishment Deductions -->
                            <tr>
                                <td><b>Punishments & Fines</b></td>
                                <td>
                                    ${empPunishments.length > 0 ? `${empPunishments.length} punishment record(s)` : 'No punishments'}
                                    ${empPunishments.length > 0 ? (hasPunishmentDeducted ? '<span class="badge badge-success">Deducted by HR</span>' : '<span class="badge badge-warning">Was deduction but HR did not deduce</span>') : ''}
                                </td>
                                <td class="text-right" style="color: ${hasPunishmentDeducted ? '#b91c1c' : '#475569'};">
                                    ${hasPunishmentDeducted ? '-' : ''}৳${totalPunishmentDeduction.toLocaleString('en-us')}
                                </td>
                            </tr>

                            <!-- Late Deductions -->
                            <tr>
                                <td><b>Late Arrival Deductions</b></td>
                                <td>
                                    ${stats.lateDays > 0 ? `${stats.lateDays} late day(s) (${fmtMins(stats.lateMinutes)})` : 'No late arrivals'}
                                    ${stats.lateDays > 0 ? (hasLateDeducted ? '<span class="badge badge-success">Deducted by HR</span>' : '<span class="badge badge-warning">Was deduction but HR did not deduce</span>') : ''}
                                </td>
                                <td class="text-right" style="color: ${hasLateDeducted ? '#b91c1c' : '#475569'};">
                                    ${hasLateDeducted ? 'Deducted' : '৳0.00'}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-row">
                            <span style="color: #64748b;">Gross Earnings</span>
                            <span>৳${(parseFloat(payroll.basic_salary) + finalAdditions).toLocaleString('en-us')}</span>
                        </div>
                        <div class="total-row">
                            <span style="color: #64748b;">Total Deductions Applied</span>
                            <span style="color: #b91c1c;">-৳${totalDeducted.toLocaleString('en-us')}</span>
                        </div>
                        <div class="total-row" style="margin-top: 15px;">
                            <span>Net Payout</span>
                            <span style="color: #10b981;">৳${parseFloat(payroll.net_amount).toLocaleString('en-us')}</span>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-top: 60px; font-size: 13px;">
                        <div style="text-align: center; width: 200px; border-top: 1px solid #94a3b8; padding-top: 8px;">
                            Employee Signature
                        </div>
                        <div style="text-align: center; width: 200px; border-top: 1px solid #94a3b8; padding-top: 8px;">
                            Authorized Signature
                        </div>
                    </div>

                    <div class="footer">
                        This is a computer-generated salary slip and does not require a physical signature.
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <EmployeeLayout>
            <Head title="My Payrolls" />

            <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Banknote className="h-8 w-8 text-emerald-500" />
                        My Payrolls
                    </h1>
                    <p className="mt-2 text-lg text-slate-500 dark:text-[#8b8fa8]">View your statement, breakdown of earnings, deductions, and download salary slips dynamically.</p>
                </div>

                {/* Global Current Basic Salary Stats card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 dark:bg-white/[0.02] dark:border-white/[0.07] backdrop-blur-md">
                    <div className="bg-emerald-500/10 p-3 rounded-xl dark:bg-emerald-500/20">
                        <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest dark:text-[#8b8fa8]">Current Salary in Directory</p>
                        <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                            ৳{parseFloat(employee.salary || '0').toLocaleString('en-us')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {payrolls.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-[#8b8fa8] backdrop-blur-md">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="text-base font-semibold">No payroll records found.</p>
                        <p className="text-sm mt-1">When your payroll records are processed by HR, they will show up here.</p>
                    </div>
                ) : (
                    payrolls.map((payroll) => {
                        const monthLabel = salaryMonthLabel(payroll.salary_month, payroll.salary_year);

                        // 1. Calculate month stats dynamically
                        const stats = computeMonthStats(employee, payroll.salary_year, payroll.salary_month, attendance, holidays);

                        // 2. Filter approved unpaid leaves for this month
                        const empLeaves = leaves.filter((l) => {
                            const monthStr = `${payroll.salary_year}-${zeroPad(payroll.salary_month)}`;
                            return l.leave_from_date.startsWith(monthStr) || l.leave_to_date.startsWith(monthStr);
                        });
                        const approvedUnpaidLeaves = empLeaves.filter((l) => Number(l.approval) === 1 && l.type === 'unpaid');
                        const totalLeaveDeduction = approvedUnpaidLeaves.reduce((sum, l) => {
                            const amt = parseFloat(l.deduction_amount) || 0;
                            if (l.deduction_type === 'fixed') {
                                return sum + amt;
                            } else {
                                return sum + (parseFloat(payroll.basic_salary) * (amt / 100));
                            }
                        }, 0);

                        // 3. Filter punishments for this month
                        const empPunishments = punishments.filter((p) => {
                            const from = `${payroll.salary_year}-${zeroPad(payroll.salary_month)}-01`;
                            const to = `${payroll.salary_year}-${zeroPad(payroll.salary_month)}-${zeroPad(new Date(payroll.salary_year, payroll.salary_month, 0).getDate())}`;
                            return p.effective_from <= to && p.effective_to >= from;
                        });
                        const totalPunishmentDeduction = empPunishments.reduce((sum, p) => sum + (parseFloat(p.deduction_amount) || 0), 0);

                        // 4. Check HR's actual applied deductions
                        const hasLeaveDeducted = payroll.payment_includes.includes('leave_deduction');
                        const hasPunishmentDeducted = payroll.payment_includes.includes('punishment');
                        const hasLateDeducted = payroll.payment_includes.includes('late_deduction');
                        const hasOvertimeIncluded = payroll.payment_includes.includes('overtime');
                        const hasBonusIncluded = payroll.payment_includes.includes('bonus');

                        // 5. Total deductions applied by HR
                        const totalDeductedApplied = (hasLeaveDeducted ? totalLeaveDeduction : 0) + (hasPunishmentDeducted ? totalPunishmentDeduction : 0);

                        // 6. Net reverse-engineered allowances/bonuses
                        const additions = parseFloat(payroll.net_amount) - parseFloat(payroll.basic_salary) + totalDeductedApplied;
                        const finalAdditionsVal = additions > 0 ? additions : 0;

                        // 7. Potential net salary after ALL potential deductions
                        const potentialNetSalary = parseFloat(payroll.basic_salary) - totalLeaveDeduction - totalPunishmentDeduction;

                        return (
                            <div key={payroll.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm backdrop-blur-md transition-all hover:border-slate-300 dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:border-white/10">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 p-6 border-b border-slate-100 gap-4 dark:bg-white/[0.02] dark:border-white/[0.07]">
                                    <div>
                                        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-indigo-500" />
                                            Payroll for {monthLabel}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 dark:text-[#8b8fa8]">Statement Released on {new Date(payroll.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] dark:text-[#8b8fa8]">Net Paid Amount</p>
                                            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                ৳{parseFloat(payroll.net_amount).toLocaleString('en-us')}
                                            </p>
                                        </div>
                                        <button
                                            id={`toggle-payroll-${payroll.id}`}
                                            onClick={() => setExpandedId(expandedId === payroll.id ? null : payroll.id)}
                                            className="rounded-xl bg-slate-100 p-2.5 text-slate-600 transition-all hover:bg-slate-200 ring-1 ring-slate-200 dark:bg-white/[0.05] dark:text-white dark:hover:bg-white/10 dark:ring-white/10"
                                        >
                                            <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${expandedId === payroll.id ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {expandedId === payroll.id && (
                                    <div className="p-8 space-y-8 bg-transparent animate-in fade-in slide-in-from-top-2 duration-300">

                                        {/* Attendance Statistics Integration Section */}
                                        <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-100 dark:bg-white/[0.01] dark:border-white/[0.04]">
                                            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2 dark:text-[#8b8fa8]">
                                                <Activity className="h-4 w-4 text-indigo-500" />
                                                Attendance Statistics for the Month
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                                {[
                                                    { label: 'Present Days', value: stats.presentDays, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                                                    { label: 'Absent Days', value: stats.absentDays, color: 'text-red-600', bg: 'bg-red-500/10' },
                                                    { label: 'Late Days', value: stats.lateDays, color: 'text-amber-600', bg: 'bg-amber-500/10' },
                                                    { label: 'Late Minutes', value: fmtMins(stats.lateMinutes), color: 'text-amber-700', bg: 'bg-amber-500/10' },
                                                    { label: 'Overtime', value: fmtMins(stats.overtimeMinutes), color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
                                                    { label: 'Holidays/Weekends', value: stats.holidayDays + stats.weekendDays, color: 'text-slate-500', bg: 'bg-slate-500/10' },
                                                ].map((s, idx) => (
                                                    <div key={idx} className="bg-white/80 border border-slate-200/50 rounded-xl p-3 text-center dark:bg-white/[0.02] dark:border-white/[0.05]">
                                                        <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                                                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold dark:text-[#8b8fa8]">{s.label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Main breakdown details grid */}
                                        <div className="grid gap-8 md:grid-cols-2">

                                            {/* Earnings Breakdown Card */}
                                            <div className="space-y-6">
                                                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 dark:text-[#8b8fa8]">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Earnings Breakdown
                                                </h4>
                                                <div className="space-y-4 rounded-xl bg-slate-50 p-5 border border-slate-100 dark:bg-white/[0.02] dark:border-white/[0.05]">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500 dark:text-[#8b8fa8]">Basic Salary</span>
                                                        <span className="text-slate-900 font-medium dark:text-white">৳{parseFloat(payroll.basic_salary).toLocaleString('en-us')}</span>
                                                    </div>

                                                    <div className="flex justify-between text-sm">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-slate-500 dark:text-[#8b8fa8]">Allowances & Additions</span>
                                                            {hasBonusIncluded && <span className="bg-emerald-500/10 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold dark:text-emerald-400">Bonus</span>}
                                                            {hasOvertimeIncluded && <span className="bg-blue-500/10 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold dark:text-blue-400">OT</span>}
                                                        </div>
                                                        <span className="text-emerald-600 font-medium dark:text-emerald-400">+৳{finalAdditionsVal.toLocaleString('en-us')}</span>
                                                    </div>

                                                    <div className="border-t border-slate-200 pt-4 flex justify-between font-bold dark:border-white/[0.07]">
                                                        <span className="text-slate-900 dark:text-white">Gross Salary</span>
                                                        <span className="text-slate-900 dark:text-white">
                                                            ৳{(parseFloat(payroll.basic_salary) + finalAdditionsVal).toLocaleString('en-us')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Deductions Breakdown Card */}
                                            <div className="space-y-6">
                                                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 dark:text-[#8b8fa8]">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                    Deductions Analysis
                                                </h4>
                                                <div className="space-y-4 rounded-xl bg-slate-50 p-5 border border-slate-100 dark:bg-white/[0.02] dark:border-white/[0.05]">

                                                    {/* Leave Deductions detailed status */}
                                                    <div className="border-b border-slate-200/50 pb-3 dark:border-white/[0.05]">
                                                        <div className="flex justify-between text-sm items-center">
                                                            <div>
                                                                <span className="text-slate-900 font-medium dark:text-white block">Leave Deductions</span>
                                                                <span className="text-xs text-slate-400 dark:text-[#8b8fa8]">
                                                                    {approvedUnpaidLeaves.length > 0 ? `${approvedUnpaidLeaves.length} unpaid approved leave day(s)` : 'No unpaid approved leaves'}
                                                                </span>
                                                            </div>
                                                            <span className={`font-semibold ${hasLeaveDeducted ? 'text-red-500' : 'text-slate-400'}`}>
                                                                -৳{totalLeaveDeduction.toLocaleString('en-us')}
                                                            </span>
                                                        </div>
                                                        {totalLeaveDeduction > 0 && (
                                                            <div className="mt-1.5">
                                                                {hasLeaveDeducted ? (
                                                                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold dark:text-emerald-400">
                                                                        <CheckCircle2 className="h-3 w-3" /> Deducted from salary by HR
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-bold dark:text-amber-400">
                                                                        <AlertCircle className="h-3 w-3" /> Leave deduction occurred, but HR did not deduce
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Punishment Deductions detailed status */}
                                                    <div className="border-b border-slate-200/50 pb-3 dark:border-white/[0.05]">
                                                        <div className="flex justify-between text-sm items-center">
                                                            <div>
                                                                <span className="text-slate-900 font-medium dark:text-white block">Punishments & Fines</span>
                                                                <span className="text-xs text-slate-400 dark:text-[#8b8fa8]">
                                                                    {empPunishments.length > 0 ? `${empPunishments.length} punishment record(s) active` : 'No punishments active'}
                                                                </span>
                                                            </div>
                                                            <span className={`font-semibold ${hasPunishmentDeducted ? 'text-red-500' : 'text-slate-400'}`}>
                                                                -৳{totalPunishmentDeduction.toLocaleString('en-us')}
                                                            </span>
                                                        </div>
                                                        {totalPunishmentDeduction > 0 && (
                                                            <div className="mt-1.5">
                                                                {hasPunishmentDeducted ? (
                                                                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold dark:text-emerald-400">
                                                                        <CheckCircle2 className="h-3 w-3" /> Deducted from salary by HR
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-bold dark:text-amber-400">
                                                                        <AlertCircle className="h-3 w-3" /> Punishment was applicable, but HR did not deduce
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Late Arrivals detailed status */}
                                                    <div>
                                                        <div className="flex justify-between text-sm items-center">
                                                            <div>
                                                                <span className="text-slate-900 font-medium dark:text-white block">Late Arrivals</span>
                                                                <span className="text-xs text-slate-400 dark:text-[#8b8fa8]">
                                                                    {stats.lateDays > 0 ? `${stats.lateDays} late arrival day(s) (${fmtMins(stats.lateMinutes)})` : 'No late arrivals'}
                                                                </span>
                                                            </div>
                                                            <span className="text-slate-400 text-xs font-semibold">
                                                                {hasLateDeducted ? 'Deducted' : '৳0.00'}
                                                            </span>
                                                        </div>
                                                        {stats.lateDays > 0 && (
                                                            <div className="mt-1.5">
                                                                {hasLateDeducted ? (
                                                                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold dark:text-emerald-400">
                                                                        <CheckCircle2 className="h-3 w-3" /> Deducted from salary by HR
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-bold dark:text-amber-400">
                                                                        <AlertCircle className="h-3 w-3" /> Late arrivals occurred, but HR did not deduce
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Comparison / Verification section */}
                                        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 dark:bg-white/[0.01] dark:border-white/[0.05] grid gap-4 md:grid-cols-3">
                                            <div className="text-center md:text-left">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-[#8b8fa8]">Basic Salary in Directory</p>
                                                <p className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                                                    ৳{parseFloat(employee.salary || '0').toLocaleString('en-us')}
                                                </p>
                                                <span className="text-[10px] text-slate-400 block mt-0.5 dark:text-[#8b8fa8]">Reference from directory</span>
                                            </div>

                                            <div className="text-center md:text-left border-y md:border-y-0 md:border-x border-slate-200 py-3 md:py-0 md:px-6 dark:border-white/[0.06]">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-[#8b8fa8]">Should Be (After Deductions)</p>
                                                <p className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                                                    ৳{potentialNetSalary > 0 ? potentialNetSalary.toLocaleString('en-us') : '0'}
                                                </p>
                                                <span className="text-[10px] text-slate-400 block mt-0.5 dark:text-[#8b8fa8]">Basic minus all leaves & punishment</span>
                                            </div>

                                            <div className="text-center md:text-left">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest dark:text-[#8b8fa8]">Actual Net Paid</p>
                                                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                                                    ৳{parseFloat(payroll.net_amount).toLocaleString('en-us')}
                                                </p>
                                                {parseFloat(payroll.net_amount) > potentialNetSalary ? (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold mt-0.5">
                                                        <TrendingUp className="h-2.5 w-2.5" /> +৳{(parseFloat(payroll.net_amount) - potentialNetSalary).toLocaleString('en-us')} more than expected
                                                    </span>
                                                ) : parseFloat(payroll.net_amount) < potentialNetSalary ? (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-red-500 font-semibold mt-0.5">
                                                        <TrendingDown className="h-2.5 w-2.5" /> -৳{Math.abs(parseFloat(payroll.net_amount) - potentialNetSalary).toLocaleString('en-us')} less than expected
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 block mt-0.5 dark:text-[#8b8fa8]">Exactly matching standard</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Note and download actions footer */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-white/[0.05]">
                                            <div className="flex-1">
                                                {payroll.note ? (
                                                    <p className="text-xs text-slate-500 dark:text-[#8b8fa8] italic">
                                                        <strong>Note from HR:</strong> "{payroll.note}"
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-slate-400 dark:text-[#8b8fa8]">No additional notes from HR.</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDownloadSlip(payroll, stats, empLeaves, empPunishments, totalLeaveDeduction, totalPunishmentDeduction)}
                                                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-sm text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] dark:bg-emerald-500 dark:shadow-emerald-500/20 dark:hover:bg-emerald-400"
                                            >
                                                <Download className="h-4 w-4" />
                                                Download Dynamic Statement (PDF)
                                            </button>
                                        </div>

                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </EmployeeLayout>
    );
}
