import EmployeeLayout from '@/layouts/employee-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Leaves({ leaves }: { leaves: any[] }) {
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
            },
        });
    };

    return (
        <EmployeeLayout>
            <Head title="Leave Appeals" />
            
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="font-['Syne',sans-serif] text-3xl font-extrabold tracking-tight">Leave Appeals</h1>
                    <p className="mt-2 text-lg text-gray-600">Manage your time-off requests</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-md bg-[#0d0f14] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#d4500a]"
                >
                    {showForm ? 'Cancel' : 'Apply for Leave'}
                </button>
            </div>

            {showForm && (
                <div className="mb-8 rounded-xl border border-[#e2dfd6] bg-white p-6 shadow-sm max-w-2xl">
                    <h2 className="font-['Syne',sans-serif] text-xl font-bold mb-4">New Leave Request</h2>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subject</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#d4500a] focus:ring-[#d4500a] sm:text-sm"
                                required
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">From Date</label>
                                <input
                                    type="date"
                                    value={data.leave_from_date}
                                    onChange={e => setData('leave_from_date', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#d4500a] focus:ring-[#d4500a] sm:text-sm"
                                    required
                                />
                                {errors.leave_from_date && <p className="mt-1 text-sm text-red-600">{errors.leave_from_date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">To Date</label>
                                <input
                                    type="date"
                                    value={data.leave_to_date}
                                    onChange={e => setData('leave_to_date', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#d4500a] focus:ring-[#d4500a] sm:text-sm"
                                    required
                                />
                                {errors.leave_to_date && <p className="mt-1 text-sm text-red-600">{errors.leave_to_date}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Reason</label>
                            <textarea
                                value={data.leave_reson}
                                onChange={e => setData('leave_reson', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#d4500a] focus:ring-[#d4500a] sm:text-sm"
                                required
                            />
                            {errors.leave_reson && <p className="mt-1 text-sm text-red-600">{errors.leave_reson}</p>}
                        </div>

                        <button type="submit" disabled={processing} className="rounded-md bg-[#d4500a] px-4 py-2 font-semibold text-white hover:bg-[#b8420a] disabled:opacity-50">
                            Submit Request
                        </button>
                    </form>
                </div>
            )}

            <div className="rounded-xl border border-[#e2dfd6] bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#e2dfd6]">
                        <thead className="bg-[#f7f6f2]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2dfd6] bg-white">
                            {leaves.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">No leave requests found.</td>
                                </tr>
                            ) : (
                                leaves.map((leave) => (
                                    <tr key={leave.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 font-medium">{leave.title}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                            {leave.leave_from_date} to {leave.leave_to_date}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{leave.leave_reson}</td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {leave.approval == 1 ? (
                                                <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">Approved</span>
                                            ) : leave.approval == 2 ? (
                                                <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Denied</span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">Pending</span>
                                            )}
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
