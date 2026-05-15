import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Store, Building2, Shield, LucideCookie, Cog, Users, ChartColumn, BadgeDollarSign, SunSnow, StarIcon, Cctv, Volume2 } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/hrm/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Departments',
        url: '/hrm/departments',
        icon: Building2,
    },
    {
        title: 'Roles',
        url: '/hrm/roles',
        icon: Shield,
    },
    {
        title: 'Store',
        url: '#',
        icon: Store,
        items: [
            {
                title: 'Branches',
                url: '/hrm/branches',
            },
            {
                title: 'Outlets',
                url: '/hrm/outlets',
            },
        ],
    },
    {
        title: 'Holidays',
        url: '/hrm/holidays',
        icon: LucideCookie,
    },
    {
        title: 'Employees',
        url: '/hrm/employees',
        icon: Users,
    },
    {
        title: 'Announcement',
        url: '/hrm/announcement',
        icon: Volume2,
    },
    {
        title: 'Leave Requests',
        url: '/hrm/leave-requests',
        icon: SunSnow,
    },
    {
        title: 'Punishments',
        url: '/hrm/punishments',
        icon: Cctv,
    },
    {
        title: 'Promotions',
        url: '/hrm/promotions',
        icon: StarIcon,
    },
    {
        title: 'Attendance',
        url: '/hrm/attendance',
        icon: ChartColumn,
    },
    {
        title: 'Payrolls',
        url: '/hrm/payrolls',
        icon: BadgeDollarSign,
    },
    {
        title: 'App Settings',
        url: '/hrm/app-settings',
        icon: Cog,
    },
];


export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/hrm/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}