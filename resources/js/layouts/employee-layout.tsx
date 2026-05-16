import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { LogOut, User, LayoutDashboard, Calendar, Clock, DollarSign, Bell, ShieldAlert } from 'lucide-react';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage<SharedData>().props;
    const currentPath = window.location.pathname;

    const navLinks = [
        { name: 'Dashboard', href: route('employee.dashboard'), icon: LayoutDashboard },
        { name: 'Attendance', href: route('employee.attendance'), icon: Clock },
        { name: 'Leaves', href: route('employee.leaves'), icon: Calendar },
        { name: 'Payrolls', href: route('employee.payrolls'), icon: DollarSign },
        { name: 'Holidays', href: route('employee.holidays'), icon: Calendar },
        { name: 'Announcements', href: route('employee.announcements'), icon: Bell },
        { name: 'Punishments', href: route('employee.punishments'), icon: ShieldAlert },
    ];

    return (
        <div className="min-h-screen bg-[#f7f6f2] font-['DM_Sans',sans-serif] text-[#0d0f14]">
            <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#e2dfd6] bg-[#f7f6f2]/85 px-6 backdrop-blur-md lg:px-12">
                <div className="flex items-center gap-8">
                    <div className="font-['Syne',sans-serif] text-xl font-extrabold tracking-tight">
                        People<span className="text-[#d4500a]">OS</span>
                        <span className="ml-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest bg-[#d4500a]/10 text-[#d4500a] py-1 px-2 rounded-full">Employee</span>
                    </div>
                    
                    <div className="hidden items-center gap-4 md:flex">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.name} 
                                href={link.href}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    currentPath.startsWith(new URL(link.href).pathname) 
                                        ? 'bg-white text-[#d4500a] shadow-sm ring-1 ring-[#e2dfd6]' 
                                        : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm hover:ring-1 hover:ring-[#e2dfd6]'
                                }`}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href={route('employee.profile')} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">{auth.user?.name || 'Profile'}</span>
                    </Link>
                    
                    <Link 
                        href={route('employee.logout')} 
                        method="post" 
                        as="button"
                        className="flex items-center gap-2 rounded-md bg-[#0d0f14] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#d4500a]"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Log out</span>
                    </Link>
                </div>
            </nav>

            {/* Mobile Nav */}
            <div className="flex gap-2 overflow-x-auto border-b border-[#e2dfd6] bg-white p-4 md:hidden">
                {navLinks.map((link) => (
                    <Link 
                        key={link.name} 
                        href={link.href}
                        className={`flex whitespace-nowrap items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            currentPath.startsWith(new URL(link.href).pathname) 
                                ? 'bg-[#f7f6f2] text-[#d4500a] ring-1 ring-[#e2dfd6]' 
                                : 'text-gray-600 hover:bg-[#f7f6f2]'
                        }`}
                    >
                        <link.icon className="h-4 w-4" />
                        {link.name}
                    </Link>
                ))}
            </div>

            <main className="mx-auto max-w-7xl p-6 lg:p-12">
                {children}
            </main>
        </div>
    );
}
