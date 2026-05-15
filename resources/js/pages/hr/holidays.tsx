import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowUpDown, Calendar, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Holidays',
        href: '/hrm/holidays',
    },
];

interface Holiday {
    id: number;
    title: string;
    reason: string;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    holidays: Holiday[];
}

export default function Holidays({ holidays }: Props) {
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Holiday | null>(null);

    // Search, sorting, and pagination states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof Holiday>('start_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const addForm = useForm({
        title: '',
        reason: '',
        start_date: '',
        end_date: '',
    });

    const editForm = useForm({
        id: null as number | null,
        title: '',
        reason: '',
        start_date: '',
        end_date: '',
    });

    const deleteForm = useForm({});

    // Helper functions - MOVED BEFORE useMemo
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Helper function to format date range
    const formatDateRange = (startDate: string, endDate: string) => {
        const start = formatDate(startDate);
        if (startDate === endDate) {
            return start;
        }
        const end = formatDate(endDate);
        return `${start} - ${end}`;
    };

    // Helper to check if holiday is upcoming, ongoing, past, or today
    const getHolidayStatus = (startDate: string, endDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);

        if (today >= start && today <= end) return 'ongoing';
        if (start > today) return 'upcoming';
        return 'past';
    };

    // Get duration in days
    const getDuration = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    // Filter, sort, and paginate data
    const filteredAndSortedData = useMemo(() => {
        // Filter
        let filtered = holidays.filter(
            (holiday) =>
                holiday.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                holiday.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formatDateRange(holiday.start_date, holiday.end_date).toLowerCase().includes(searchTerm.toLowerCase()),
        );

        // Sort
        filtered = [...filtered].sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            if (sortField === 'start_date') {
                aValue = new Date(a.start_date).getTime();
                bValue = new Date(b.start_date).getTime();
            } else if (sortField === 'end_date') {
                aValue = new Date(a.end_date).getTime();
                bValue = new Date(b.end_date).getTime();
            } else if (sortField === 'created_at' || sortField === 'updated_at') {
                aValue = new Date(a[sortField]).getTime();
                bValue = new Date(b[sortField]).getTime();
            } else {
                aValue = a[sortField] || '';
                bValue = b[sortField] || '';
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [holidays, searchTerm, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
    const paginatedData = filteredAndSortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (field: keyof Holiday) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    function openEdit(holiday: Holiday) {
        setSelected(holiday);
        editForm.setData({
            id: holiday.id,
            title: holiday.title,
            reason: holiday.reason,
            start_date: holiday.start_date,
            end_date: holiday.end_date,
        });
        setEditOpen(true);
    }

    function openDelete(holiday: Holiday) {
        setSelected(holiday);
        setDeleteOpen(true);
    }

    function submitAdd(e: React.FormEvent) {
        e.preventDefault();
        addForm.post(route('hr.holidays.store'), {
            onSuccess: () => {
                addForm.reset();
                setAddOpen(false);
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editForm.data.id) return;
        editForm.put(route('hr.holidays.update', editForm.data.id), {
            onSuccess: () => {
                editForm.reset();
                setEditOpen(false);
            },
        });
    }

    function submitDelete() {
        if (!selected) return;
        deleteForm.delete(route('hr.holidays.destroy', selected.id), {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Holidays" />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Holidays</h1>
                    <Button size="sm" onClick={() => setAddOpen(true)}>
                        <Plus className="mr-1 h-4 w-4" /> Add Holiday
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-sm">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search holidays by title, reason or date range..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-9"
                    />
                </div>

                <div className="rounded-lg border bg-white dark:bg-zinc-900">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('start_date')}
                                        className="flex h-auto items-center gap-1 p-0 font-semibold"
                                    >
                                        Date Range
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('title')}
                                        className="flex h-auto items-center gap-1 p-0 font-semibold"
                                    >
                                        Title
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('created_at')}
                                        className="flex h-auto items-center gap-1 p-0 font-semibold"
                                    >
                                        Created At
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                                        No holidays found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {paginatedData.map((holiday, i) => {
                                const status = getHolidayStatus(holiday.start_date, holiday.end_date);
                                const duration = getDuration(holiday.start_date, holiday.end_date);
                                return (
                                    <TableRow key={holiday.id}>
                                        <TableCell className="text-muted-foreground">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{formatDateRange(holiday.start_date, holiday.end_date)}</span>
                                                {holiday.start_date !== holiday.end_date && (
                                                    <span className="text-muted-foreground mt-1 text-xs">
                                                        <Calendar className="mr-1 inline h-3 w-3" />
                                                        {duration} {duration === 1 ? 'day' : 'days'}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{holiday.title}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-muted-foreground max-w-md text-sm">{holiday.reason}</div>
                                        </TableCell>
                                        <TableCell>
                                            {status === 'upcoming' && (
                                                <Badge variant="default" className="bg-blue-500">
                                                    Upcoming
                                                </Badge>
                                            )}
                                            {status === 'ongoing' && (
                                                <Badge variant="default" className="animate-pulse bg-green-500">
                                                    Ongoing
                                                </Badge>
                                            )}
                                            {status === 'past' && <Badge variant="secondary">Past</Badge>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono">
                                                {duration} {duration === 1 ? 'day' : 'days'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(holiday.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="space-x-2 text-right">
                                            <Button variant="outline" size="icon" onClick={() => openEdit(holiday)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={() => openDelete(holiday)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-4">
                            <div className="text-muted-foreground text-sm">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)}{' '}
                                of {filteredAndSortedData.length} holidays
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Holiday</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitAdd}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="add-start_date">Start Date</Label>
                                <Input
                                    id="add-start_date"
                                    type="date"
                                    value={addForm.data.start_date}
                                    onChange={(e) => addForm.setData('start_date', e.target.value)}
                                    required
                                    autoFocus
                                />
                                {addForm.errors.start_date && <p className="text-destructive text-sm">{addForm.errors.start_date}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="add-end_date">End Date</Label>
                                <Input
                                    id="add-end_date"
                                    type="date"
                                    value={addForm.data.end_date}
                                    onChange={(e) => addForm.setData('end_date', e.target.value)}
                                    required
                                />
                                {addForm.errors.end_date && <p className="text-destructive text-sm">{addForm.errors.end_date}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="add-title">Title</Label>
                                <Input
                                    id="add-title"
                                    value={addForm.data.title}
                                    onChange={(e) => addForm.setData('title', e.target.value)}
                                    placeholder="Enter holiday title"
                                    required
                                />
                                {addForm.errors.title && <p className="text-destructive text-sm">{addForm.errors.title}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="add-reason">Description</Label>
                                <Textarea
                                    id="add-reason"
                                    value={addForm.data.reason}
                                    onChange={(e) => addForm.setData('reason', e.target.value)}
                                    placeholder="Enter holiday description..."
                                    rows={4}
                                    required
                                />
                                {addForm.errors.reason && <p className="text-destructive text-sm">{addForm.errors.reason}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addForm.processing}>
                                {addForm.processing ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Holiday</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-start_date">Start Date</Label>
                                <Input
                                    id="edit-start_date"
                                    type="date"
                                    value={editForm.data.start_date}
                                    onChange={(e) => editForm.setData('start_date', e.target.value)}
                                    required
                                />
                                {editForm.errors.start_date && <p className="text-destructive text-sm">{editForm.errors.start_date}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-end_date">End Date</Label>
                                <Input
                                    id="edit-end_date"
                                    type="date"
                                    value={editForm.data.end_date}
                                    onChange={(e) => editForm.setData('end_date', e.target.value)}
                                    required
                                />
                                {editForm.errors.end_date && <p className="text-destructive text-sm">{editForm.errors.end_date}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                    id="edit-title"
                                    value={editForm.data.title}
                                    onChange={(e) => editForm.setData('title', e.target.value)}
                                    placeholder="Enter holiday title"
                                    required
                                />
                                {editForm.errors.title && <p className="text-destructive text-sm">{editForm.errors.title}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-reason">Description</Label>
                                <Textarea
                                    id="edit-reason"
                                    value={editForm.data.reason}
                                    onChange={(e) => editForm.setData('reason', e.target.value)}
                                    placeholder="Enter holiday description..."
                                    rows={4}
                                    required
                                />
                                {editForm.errors.reason && <p className="text-destructive text-sm">{editForm.errors.reason}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Saving...' : 'Update'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Holiday</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground text-sm">
                        Are you sure you want to delete the holiday for{' '}
                        <span className="text-foreground font-semibold">
                            {selected ? formatDateRange(selected.start_date, selected.end_date) : ''}
                        </span>
                        ?
                        <br />
                        Title: <span className="text-foreground font-semibold">{selected?.title}</span>
                        <br />
                        This action cannot be undone.
                    </p>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={submitDelete} disabled={deleteForm.processing}>
                            {deleteForm.processing ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
