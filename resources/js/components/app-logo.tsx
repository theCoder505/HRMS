import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';

export default function AppLogo() {
    const { settings } = usePage<SharedData>().props;
    return (
        <>
            <div className="flex h-10 w-full items-center justify-center rounded-md">
                <img src={"/" + settings?.brand_logo || "/assets/logo.png"} alt={settings?.brand_name || "HRMS"} className="block w-full fill-current" />
            </div>
        </>
    );
}

