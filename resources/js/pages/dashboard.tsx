import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users, UserCheck, Calendar, Building, ArrowRight, Activity, Bell } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    totalEmployees?: number;
    presentToday?: number;
    pendingLeaves?: number;
    totalDepartments?: number;
    recentLeaves?: any[];
    recentEmployees?: any[];
}

export default function Dashboard({
    totalEmployees = 0,
    presentToday = 0,
    pendingLeaves = 0,
    totalDepartments = 0,
    recentLeaves = [],
    recentEmployees = []
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="HR Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground">
                        Here's a summary of the HR data and recent activities.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalEmployees}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Active members in the company
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-emerald-500 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                            <UserCheck className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{presentToday}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Employees clocked in today
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
                            <Calendar className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingLeaves}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Leave requests awaiting approval
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Departments</CardTitle>
                            <Building className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalDepartments}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Total active departments
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent Leaves */}
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4 pt-5">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Bell className="h-4 w-4 text-muted-foreground" />
                                    Recent Leave Requests
                                </CardTitle>
                                <CardDescription>Latest employee time-off applications.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentLeaves.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <Calendar className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                    <p className="text-sm text-muted-foreground">No recent leave requests found.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/10 hover:bg-muted/10">
                                                <TableHead className="pl-6">Employee</TableHead>
                                                <TableHead>Dates</TableHead>
                                                <TableHead className="text-right pr-6">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentLeaves.map((leave) => (
                                                <TableRow key={leave.id} className="last:border-0 hover:bg-muted/30">
                                                    <TableCell className="font-medium pl-6 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={leave.employee?.img ? `/${leave.employee.img}` : '/assets/user.png'} alt={leave.employee?.name} />
                                                                <AvatarFallback>{leave.employee?.name?.charAt(0) || 'U'}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="truncate max-w-[120px] sm:max-w-[150px]">{leave.employee?.name || 'Unknown'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground py-3">
                                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                            <span>{leave.leave_from_date}</span>
                                                            <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                                                            <span>{leave.leave_to_date}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6 py-3">
                                                        {leave.approval == 1 ? (
                                                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-0 shadow-none">Approved</Badge>
                                                        ) : leave.approval == 2 ? (
                                                            <Badge variant="destructive" className="bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 border-0 shadow-none">Denied</Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border-0 shadow-none">Pending</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* New Employees */}
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4 pt-5">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                    Newly Onboarded
                                </CardTitle>
                                <CardDescription>Recently added employees in the system.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentEmployees.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                    <p className="text-sm text-muted-foreground">No recent employees found.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {recentEmployees.map((employee) => (
                                        <div key={employee.id} className="flex items-center justify-between border-b px-6 py-4 last:border-0 hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                                                    <AvatarImage src={employee.img ? `/${employee.img}` : '/assets/user.png'} alt={employee.name} />
                                                    <AvatarFallback className="bg-primary/5 text-primary font-medium">
                                                        {employee.name?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">{employee.name}</p>
                                                    <p className="text-xs text-muted-foreground">{employee.job_title || 'Employee'}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge variant="outline" className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted/30">
                                                    Joined
                                                </Badge>
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    {new Date(employee.created_at).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
