import EmployeeLayout from '@/layouts/employee-layout';
import { Head } from '@inertiajs/react';

interface Holiday {
    id: number;
    title: string;
    reason: string;
    start_date: string;
    end_date: string;
}

function getDays(start: string, end: string) {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
}

function isUpcoming(start: string) {
    return new Date(start) >= new Date(new Date().toDateString());
}

export default function Holidays({ holidays }: { holidays: Holiday[] }) {
    const upcoming = holidays.filter((h) => isUpcoming(h.start_date));
    const past = holidays.filter((h) => !isUpcoming(h.start_date));

    const HolidayCard = ({ h }: { h: Holiday }) => {
        const days = getDays(h.start_date, h.end_date);
        const upcoming = isUpcoming(h.start_date);
        return (
            <div className={`rounded-xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${upcoming ? 'border-[#d4500a]/30 bg-white' : 'border-[#e2dfd6] bg-white'}`}>
                <div className={`h-1.5 w-full ${upcoming ? 'bg-[#d4500a]' : 'bg-gray-200'}`} />
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-lg font-bold font-['Syne',sans-serif] text-gray-900">{h.title}</h3>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${upcoming ? 'bg-[#d4500a]/10 text-[#d4500a]' : 'bg-gray-100 text-gray-500'}`}>
                                {upcoming ? 'Upcoming' : 'Past'}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">{days} {days === 1 ? 'day' : 'days'}</span>
                        </div>
                    </div>

                    {h.reason && (
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{h.reason}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700 font-medium">
                                {new Date(h.start_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        {h.start_date !== h.end_date && (
                            <>
                                <span className="text-gray-300">→</span>
                                <div className="flex items-center gap-1.5">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-700 font-medium">
                                        {new Date(h.end_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <EmployeeLayout>
            <Head title="Holidays" />

            <div className="mb-8">
                <h1 className="font-['Syne',sans-serif] text-3xl font-extrabold tracking-tight">Holidays</h1>
                <p className="mt-2 text-lg text-gray-600">Company-wide holidays and scheduled off-days</p>
            </div>

            {holidays.length === 0 ? (
                <div className="rounded-xl border border-[#e2dfd6] bg-white p-12 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                        <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">No holidays listed yet</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {upcoming.length > 0 && (
                        <section>
                            <h2 className="font-['Syne',sans-serif] text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="inline-block h-3 w-3 rounded-full bg-[#d4500a]" />
                                Upcoming Holidays
                                <span className="ml-1 rounded-full bg-[#d4500a]/10 px-2 py-0.5 text-xs font-semibold text-[#d4500a]">{upcoming.length}</span>
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {upcoming.map((h) => <HolidayCard key={h.id} h={h} />)}
                            </div>
                        </section>
                    )}

                    {past.length > 0 && (
                        <section>
                            <h2 className="font-['Syne',sans-serif] text-xl font-bold mb-4 flex items-center gap-2 text-gray-500">
                                <span className="inline-block h-3 w-3 rounded-full bg-gray-300" />
                                Past Holidays
                                <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">{past.length}</span>
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {past.map((h) => <HolidayCard key={h.id} h={h} />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </EmployeeLayout>
    );
}
