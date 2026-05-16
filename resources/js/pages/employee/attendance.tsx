import EmployeeLayout from '@/layouts/employee-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Attendance({ attendances }: { attendances: any[] }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filterData = () => {
        router.get(route('employee.attendance'), { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    const clearFilter = () => {
        setStartDate('');
        setEndDate('');
        router.get(route('employee.attendance'), {}, { preserveState: true });
    };

    return (
        <EmployeeLayout>
            <Head title="My Attendance" />
            
            <div className="mb-8">
                <h1 className="font-['Syne',sans-serif] text-3xl font-extrabold tracking-tight">Attendance Log</h1>
                <p className="mt-2 text-lg text-gray-600">Track your daily clock-ins and clock-outs</p>
            </div>

            <div className="mb-6 rounded-xl border border-[#e2dfd6] bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 font-['Syne',sans-serif]">Filter by Date</h2>
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#d4500a] focus:ring-[#d4500a] sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#d4500a] focus:ring-[#d4500a] sm:text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={filterData} className="rounded-md bg-[#0d0f14] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d4500a]">
                            Filter
                        </button>
                        <button onClick={clearFilter} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-[#e2dfd6] bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#e2dfd6]">
                        <thead className="bg-[#f7f6f2]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Clock In</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Clock Out</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2dfd6] bg-white">
                            {attendances.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-10 text-center text-gray-500">No attendance records found.</td>
                                </tr>
                            ) : (
                                attendances.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                                            {new Date(record.attend_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                            {record.clock_in_time || '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                            {record.clock_out_time || '-'}
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
