import Heading from '@/components/heading';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-4 py-6">
            <Heading title="Settings" description="Manage your profile, password and appearance settings" />

            <div className="mt-8 w-full">
                <section className="space-y-12">{children}</section>
            </div>
        </div>
    );
}
