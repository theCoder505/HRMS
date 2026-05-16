import EmployeeLayout from '@/layouts/employee-layout';
import { Head } from '@inertiajs/react';

interface Announcement {
    id: number;
    title: string;
    description: string;
    type: 'all' | 'specific';
    created_at: string;
}

export default function Announcements({ announcements }: { announcements: Announcement[] }) {
    return (
        <EmployeeLayout>
            <Head title="Announcements" />

            <div className="mb-8">
                <h1 className="font-['Syne',sans-serif] text-3xl font-extrabold tracking-tight">Announcements</h1>
                <p className="mt-2 text-lg text-gray-600">Company-wide and personal announcements</p>
            </div>

            {announcements.length === 0 ? (
                <div className="rounded-xl border border-[#e2dfd6] bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">
                        <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">No announcements yet</p>
                    <p className="mt-1 text-sm text-gray-500">Company announcements will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((a) => (
                        <div key={a.id} className="rounded-xl border border-[#e2dfd6] bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <h3 className="text-xl font-bold font-['Syne',sans-serif] text-gray-900 leading-tight">{a.title}</h3>
                                    <span className={`shrink-0 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                        a.type === 'all'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-purple-100 text-purple-800'
                                    }`}>
                                        {a.type === 'all' ? 'Company-wide' : 'Personal'}
                                    </span>
                                </div>
                                <div
                                    className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: a.description }}
                                />
                            </div>
                            <div className="border-t border-[#e2dfd6] bg-[#f7f6f2]/60 px-6 py-3">
                                <p className="text-xs text-gray-400">
                                    Posted on {new Date(a.created_at).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </EmployeeLayout>
    );
}
