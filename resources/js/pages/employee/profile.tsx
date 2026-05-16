import EmployeeLayout from '@/layouts/employee-layout';
import { Head } from '@inertiajs/react';

export default function Profile({ employee }: { employee: any }) {
    return (
        <EmployeeLayout>
            <Head title="My Profile" />
            
            <div className="mb-8">
                <h1 className="font-['Syne',sans-serif] text-3xl font-extrabold tracking-tight">My Profile</h1>
                <p className="mt-2 text-lg text-gray-600">View your personal information</p>
            </div>

            <div className="rounded-xl border border-[#e2dfd6] bg-white p-8 shadow-sm max-w-3xl">
                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                    <img 
                        src={employee.img ? `/${employee.img}` : '/assets/user.png'} 
                        alt="Profile" 
                        className="h-32 w-32 rounded-full border-4 border-[#f7f6f2] object-cover shadow-sm"
                    />
                    <div>
                        <h2 className="text-2xl font-bold font-['Syne',sans-serif]">{employee.name}</h2>
                        <p className="text-gray-500 font-medium text-lg mt-1">{employee.job_title || 'Employee'}</p>
                        <div className="mt-4 inline-flex items-center rounded-md bg-[#d4500a]/10 px-3 py-1 text-sm font-semibold text-[#d4500a]">
                            ID: {employee.employee_uid}
                        </div>
                    </div>
                </div>

                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Email Address</p>
                        <p className="mt-1 text-lg font-medium">{employee.email}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Date of Joining</p>
                        <p className="mt-1 text-lg font-medium">
                            {employee.join_date ? new Date(employee.join_date).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Basic Salary</p>
                        <p className="mt-1 text-lg font-medium">${employee.salary || '0.00'}</p>
                    </div>
                    <div className="sm:col-span-2">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Address</p>
                        <p className="mt-1 text-lg font-medium">{employee.address || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </EmployeeLayout>
    );
}
