import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: { title: string; url: string }[];
}

export interface SharedData {
    name: string;
    settings: {
        brand_name: string;
        brand_logo: string;
        brand_icon: string;
        location: string;
        gogle_map?: string;
        facebook: string;
        instagram: string;
        twitter: string;
        linkedin: string;
        contact_email: string;
        about: string;
        privacy_policy: string;
        terms_conditions: string;
    } | null;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}


export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
