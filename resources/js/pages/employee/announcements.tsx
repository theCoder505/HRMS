import EmployeeLayout from '@/layouts/employee-layout';
import { Head } from '@inertiajs/react';
import { Megaphone, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface Announcement {
    id: number;
    title: string;
    description: string;
    type: string;
    created_at: string;
}

export default function Announcements({ announcements }: { announcements: Announcement[] }) {
    const handleRead = (id: number) => {
        Swal.fire({
            title: 'Announcement Read',
            text: 'You have marked this announcement as read.',
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            background: document.documentElement.classList.contains('dark') ? '#111827' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        });
    };

    return (
        <EmployeeLayout>
            <Head title="Announcements" />
            
            <div className="mb-10">
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">Announcements</h1>
                <p className="mt-2 text-lg text-slate-500 dark:text-[#8b8fa8]">Stay updated with latest news and notifications</p>
            </div>

            <div className="grid gap-6">
                {announcements.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-[#8b8fa8] backdrop-blur-md">
                        <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No announcements found.</p>
                    </div>
                ) : (
                    announcements.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm backdrop-blur-md transition-all hover:border-purple-500/30 dark:border-white/[0.07] dark:bg-white/[0.03]">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`rounded-xl px-3 py-1 text-[10px] font-bold uppercase tracking-widest ring-1 ${
                                    item.type === 'all' 
                                        ? 'bg-blue-100 text-blue-600 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20' 
                                        : 'bg-purple-100 text-purple-600 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20'
                                }`}>
                                    {item.type === 'all' ? 'Public' : 'Personal'}
                                </div>
                                <span className="text-xs text-slate-400 font-medium dark:text-[#8b8fa8]">
                                    Posted on {new Date(item.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold text-slate-900 mb-4 leading-tight dark:text-white">
                                {item.title}
                            </h3>
                            
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap dark:text-[#8b8fa8]">
                                    {item.description}
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between dark:border-white/[0.05]">
                                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-[#5b5f78]">
                                    <Megaphone className="h-4 w-4" />
                                    Broadcast system
                                </div>
                                <button 
                                    onClick={() => handleRead(item.id)}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors dark:text-purple-400 dark:hover:text-purple-300"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Mark as read
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </EmployeeLayout>
    );
}
