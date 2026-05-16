import EmployeeLayout from '@/layouts/employee-layout';
import { Head } from '@inertiajs/react';
import { User, Mail, Calendar, Briefcase, MapPin, DollarSign } from 'lucide-react';

export default function Profile({ employee }: { employee: any }) {
    return (
        <EmployeeLayout>
            <Head title="My Profile" />
            
            <div className="mb-10">
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">My Profile</h1>
                <p className="mt-2 text-lg text-slate-500 dark:text-[#8b8fa8]">View your personal information</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm backdrop-blur-md max-w-4xl dark:border-white/[0.07] dark:bg-white/[0.03] transition-colors">
                <div className="flex flex-col md:flex-row gap-10 items-start md:items-center border-b border-slate-100 pb-10 dark:border-white/[0.07]">
                    <div className="relative">
                        <img 
                            src={employee.img ? `/${employee.img}` : '/assets/user.png'} 
                            alt="Profile" 
                            className="h-40 w-40 rounded-3xl border-4 border-white object-cover shadow-2xl dark:border-white/10 dark:shadow-purple-500/10"
                        />
                        <div className="absolute -bottom-3 -right-3 rounded-2xl bg-purple-600 p-2 text-white shadow-xl">
                            <Briefcase className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-4xl font-bold text-slate-900 dark:text-white">{employee.name}</h2>
                        <p className="text-purple-600 font-semibold text-xl mt-2 dark:text-purple-400">{employee.job_title || 'Employee'}</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-white/5 dark:text-[#8b8fa8] dark:ring-white/10">
                                UID: {employee.employee_uid}
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                                Active Member
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-10 grid gap-10 sm:grid-cols-2">
                    <div className="group">
                        <div className="flex items-center gap-3 mb-2">
                            <Mail className="h-4 w-4 text-slate-400 dark:text-[#5b5f78]" />
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest dark:text-[#5b5f78]">Email Address</p>
                        </div>
                        <p className="text-xl font-medium text-slate-900 dark:text-white">{employee.email}</p>
                    </div>
                    
                    <div className="group">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="h-4 w-4 text-slate-400 dark:text-[#5b5f78]" />
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest dark:text-[#5b5f78]">Date of Joining</p>
                        </div>
                        <p className="text-xl font-medium text-slate-900 dark:text-white">
                            {employee.join_date ? new Date(employee.join_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                        </p>
                    </div>

                    <div className="group">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="h-4 w-4 text-slate-400 dark:text-[#5b5f78]" />
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest dark:text-[#5b5f78]">Basic Salary</p>
                        </div>
                        <p className="text-xl font-medium text-emerald-600 dark:text-emerald-400">৳{employee.salary || '0.00'}</p>
                    </div>

                    <div className="group">
                        <div className="flex items-center gap-3 mb-2">
                            <MapPin className="h-4 w-4 text-slate-400 dark:text-[#5b5f78]" />
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest dark:text-[#5b5f78]">Office Location</p>
                        </div>
                        <p className="text-xl font-medium text-slate-900 dark:text-white">{employee.branch || 'Headquarters'}</p>
                    </div>

                    <div className="sm:col-span-2 group">
                        <div className="flex items-center gap-3 mb-2">
                            <MapPin className="h-4 w-4 text-slate-400 dark:text-[#5b5f78]" />
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest dark:text-[#5b5f78]">Residential Address</p>
                        </div>
                        <p className="text-xl font-medium text-slate-900 leading-relaxed dark:text-white">{employee.address || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </EmployeeLayout>
    );
}
