import EmployeeLayout from '@/layouts/employee-layout';
import { Head } from '@inertiajs/react';
import { Users, FileText, AlertTriangle, Speaker, Calendar } from 'lucide-react';

interface DashboardProps {
    employee: any;
    totalLeaves: number;
    pendingLeaves: number;
    payrollsCount: number;
    punishmentsCount: number;
    announcementsCount: number;
}

export default function Dashboard({
    employee,
    totalLeaves,
    pendingLeaves,
    payrollsCount,
    punishmentsCount,
    announcementsCount
}: DashboardProps) {
    return (
        <EmployeeLayout>
            <Head title="Employee Dashboard" />
            
            <div className="mb-8">
                <h1 className="font-['Syne',sans-serif] text-3xl font-extrabold tracking-tight">
                    Welcome back, {employee.name}!
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                    Here is an overview of your profile and recent activities.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-[#e2dfd6] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Total Leaves</p>
                            <p className="mt-2 font-['Syne',sans-serif] text-4xl font-extrabold">{totalLeaves}</p>
                            {pendingLeaves > 0 && (
                                <p className="mt-2 text-sm font-medium text-amber-600">{pendingLeaves} pending</p>
                            )}
                        </div>
                        <div className="rounded-full bg-blue-50 p-4 text-blue-600">
                            <Calendar className="h-8 w-8" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[#e2dfd6] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Payrolls</p>
                            <p className="mt-2 font-['Syne',sans-serif] text-4xl font-extrabold">{payrollsCount}</p>
                            <p className="mt-2 text-sm text-gray-500">Total salary slips</p>
                        </div>
                        <div className="rounded-full bg-emerald-50 p-4 text-emerald-600">
                            <FileText className="h-8 w-8" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[#e2dfd6] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Punishments</p>
                            <p className="mt-2 font-['Syne',sans-serif] text-4xl font-extrabold">{punishmentsCount}</p>
                            <p className="mt-2 text-sm text-gray-500">Disciplinary actions</p>
                        </div>
                        <div className="rounded-full bg-red-50 p-4 text-red-600">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-[#e2dfd6] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Announcements</p>
                            <p className="mt-2 font-['Syne',sans-serif] text-4xl font-extrabold">{announcementsCount}</p>
                            <p className="mt-2 text-sm text-gray-500">Total broadcasts</p>
                        </div>
                        <div className="rounded-full bg-purple-50 p-4 text-purple-600">
                            <Speaker className="h-8 w-8" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 rounded-xl border border-[#e2dfd6] bg-white p-8 shadow-sm">
                <h2 className="font-['Syne',sans-serif] text-2xl font-bold">Quick Actions</h2>
                <p className="mt-2 text-gray-600">Access frequently used tools instantly.</p>
                
                <div className="mt-6 flex flex-wrap gap-4">
                    <a href={route('employee.leaves')} className="rounded-md bg-[#0d0f14] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#d4500a]">
                        Apply for Leave
                    </a>
                    <a href={route('employee.attendance')} className="rounded-md border border-[#0d0f14] px-5 py-3 font-semibold text-[#0d0f14] transition-colors hover:bg-gray-50">
                        View Attendance
                    </a>
                </div>
            </div>
        </EmployeeLayout>
    );
}
