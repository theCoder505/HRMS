import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'frame',
        href: '/hrm/frame',
    },
];

export default function frame() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <FlashMessage />

            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                
            </div>
        </AppLayout>
    );
}
