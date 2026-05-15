import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowUpDown, Calendar, ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, User, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Announcement',
        href: '/hrm/announcement',
    },
];

interface Employee {
    employee_uid: string;
    name: string;
    email: string;
    img: string | null;
}

interface Announcement {
    id: number;
    title: string;
    description: string;
    type: 'all' | 'specific';
    spec_employees: string[];
    created_at: string;
    updated_at: string;
    employees?: Employee[];
}

interface Props {
    announcements: Announcement[];
    employees: Employee[];
}

type SortField = keyof Pick<Announcement, 'title' | 'created_at' | 'updated_at'>;

// Form data interfaces
interface AnnouncementFormData {
    title: string;
    description: string;
    type: 'all' | 'specific';
    spec_employees: string[];
}

interface EditAnnouncementFormData extends AnnouncementFormData {
    id: number | null;
}

interface DeleteFormData {
    id: number;
}

export default function Announcement({ announcements, employees }: Props) {
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Announcement | null>(null);

    // Search, sorting, and pagination states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const addForm = useForm<AnnouncementFormData>({
        title: '',
        description: '',
        type: 'all',
        spec_employees: [],
    });

    const editForm = useForm<EditAnnouncementFormData>({
        id: null,
        title: '',
        description: '',
        type: 'all',
        spec_employees: [],
    });

    const deleteForm = useForm<DeleteFormData>({
        id: 0,
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getEmployeeNames = (announcement: Announcement) => {
        if (announcement.type === 'all') return 'All Employees';
        const employeeNames = announcement.spec_employees.map((uid) => {
            const employee = employees.find((e) => e.employee_uid === uid);
            return employee?.name || uid;
        });
        return employeeNames.join(', ');
    };

    const filteredAndSortedData = useMemo(() => {
        let filtered = announcements.filter(
            (announcement) =>
                announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                announcement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (announcement.type === 'all' ? 'all employees' : getEmployeeNames(announcement)).toLowerCase().includes(searchTerm.toLowerCase()),
        );

        filtered = [...filtered].sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            if (sortField === 'created_at' || sortField === 'updated_at') {
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
    }, [announcements, searchTerm, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
    const paginatedData = filteredAndSortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (field: SortField) => {
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

    function openEdit(announcement: Announcement) {
        setSelected(announcement);
        editForm.setData({
            id: announcement.id,
            title: announcement.title,
            description: announcement.description,
            type: announcement.type,
            spec_employees: announcement.spec_employees || [],
        });
        setEditOpen(true);
    }

    function openDelete(announcement: Announcement) {
        setSelected(announcement);
        setDeleteOpen(true);
    }

    function submitAdd(e: React.FormEvent) {
        e.preventDefault();
        addForm.post(route('hr.announcement.store'), {
            onSuccess: () => {
                addForm.reset();
                setAddOpen(false);
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editForm.data.id) return;

        editForm.put(route('hr.announcement.update'), {
            onSuccess: () => {
                editForm.reset();
                setEditOpen(false);
            },
        });
    }

    function submitDelete() {
        if (!selected) return;

        deleteForm.delete(route('hr.announcement.delete', selected.id), {
            onSuccess: () => {
                deleteForm.reset();
                setDeleteOpen(false);
            },
        });
    }

    // Reset forms when dialogs close
    useEffect(() => {
        if (!addOpen) {
            addForm.reset();
        }
    }, [addOpen]);

    useEffect(() => {
        if (!editOpen) {
            editForm.reset();
            setSelected(null);
        }
    }, [editOpen]);

    useEffect(() => {
        if (!deleteOpen) {
            deleteForm.reset();
            setSelected(null);
        }
    }, [deleteOpen]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={breadcrumbs[0].title} />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Announcements</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Manage company announcements and notifications</p>
                    </div>
                    <Button size="sm" onClick={() => setAddOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> Create Announcement
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-sm">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search announcements by title, content or audience..."
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
                                        onClick={() => handleSort('title')}
                                        className="flex h-auto items-center gap-1 p-0 font-semibold"
                                    >
                                        Title
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Audience</TableHead>
                                <TableHead>Type</TableHead>
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
                                    <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Calendar className="h-12 w-12 opacity-50" />
                                            <p>No announcements found</p>
                                            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
                                                Create your first announcement
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            {paginatedData.map((announcement, i) => (
                                <TableRow key={announcement.id}>
                                    <TableCell className="text-muted-foreground">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                                    <TableCell className="max-w-xs font-medium">
                                        <div className="line-clamp-2">{announcement.title}</div>
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <div className="text-muted-foreground line-clamp-2 text-sm">{announcement.description}</div>
                                    </TableCell>
                                    <TableCell>
                                        {announcement.type === 'all' ? (
                                            <Badge variant="default" className="gap-1 bg-green-500">
                                                <Users className="h-3 w-3" /> All Employees
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="gap-1">
                                                <User className="h-3 w-3" /> Specific Employees
                                            </Badge>
                                        )}
                                        {announcement.type === 'specific' && announcement.spec_employees.length > 0 && (
                                            <div className="text-muted-foreground mt-2 text-xs ml-4">{announcement.spec_employees.length} employee(s)</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{announcement.type === 'all' ? 'Public' : 'Private'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{formatDate(announcement.created_at)}</TableCell>
                                    <TableCell className="space-x-2 text-right">
                                        <Button variant="outline" size="icon" onClick={() => openEdit(announcement)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => openDelete(announcement)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-4">
                            <div className="text-muted-foreground text-sm">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)}{' '}
                                of {filteredAndSortedData.length} announcements
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum: number;
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
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Announcement</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to create a new announcement. You can send it to all employees or specific ones.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitAdd}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="add-title">Title *</Label>
                                <Input
                                    id="add-title"
                                    value={addForm.data.title}
                                    onChange={(e) => addForm.setData('title', e.target.value)}
                                    placeholder="Enter announcement title"
                                    required
                                    autoFocus
                                />
                                {addForm.errors.title && <p className="text-destructive text-sm">{addForm.errors.title}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="add-description">Description *</Label>
                                <Textarea
                                    id="add-description"
                                    value={addForm.data.description}
                                    onChange={(e) => addForm.setData('description', e.target.value)}
                                    placeholder="Enter announcement details..."
                                    rows={5}
                                    required
                                />
                                {addForm.errors.description && <p className="text-destructive text-sm">{addForm.errors.description}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label>Audience *</Label>
                                <RadioGroup
                                    value={addForm.data.type}
                                    onValueChange={(value: 'all' | 'specific') => {
                                        addForm.setData((prev) => ({
                                            ...prev,
                                            type: value,
                                            spec_employees: value === 'all' ? [] : prev.spec_employees,
                                        }));
                                    }}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all" id="add-all" />
                                        <Label htmlFor="add-all" className="cursor-pointer">
                                            All Employees
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="specific" id="add-specific" />
                                        <Label htmlFor="add-specific" className="cursor-pointer">
                                            Specific Employees
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {addForm.data.type === 'specific' && (
                                <div className="grid gap-2">
                                    <Label>Select Employees *</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            if (value && !addForm.data.spec_employees.includes(value)) {
                                                addForm.setData('spec_employees', [...addForm.data.spec_employees, value]);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose employees..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees
                                                .filter((emp) => !addForm.data.spec_employees.includes(emp.employee_uid))
                                                .map((employee) => (
                                                    <SelectItem key={employee.employee_uid} value={employee.employee_uid}>
                                                        <div className="flex items-center gap-2">
                                                            {employee.img ? (
                                                                <img src={'/' + employee.img} alt={employee.name} className="h-6 w-6 rounded-full" />
                                                            ) : (
                                                                <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                                                                    <User className="h-3 w-3" />
                                                                </div>
                                                            )}
                                                            <span>{employee.name}</span>
                                                            <span className="text-muted-foreground text-xs">({employee.email})</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>

                                    {addForm.data.spec_employees.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            <Label>Selected Employees:</Label>
                                            <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                                                {addForm.data.spec_employees.map((uid) => {
                                                    const employee = employees.find((e) => e.employee_uid === uid);
                                                    return (
                                                        <div key={uid} className="bg-muted/50 flex items-center justify-between rounded p-2">
                                                            <div className="flex items-center gap-2">
                                                                {employee?.img ? (
                                                                    <img
                                                                        src={'/' + employee.img}
                                                                        alt={employee.name}
                                                                        className="h-6 w-6 rounded-full"
                                                                    />
                                                                ) : (
                                                                    <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                                                                        <User className="h-3 w-3" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="text-sm font-medium">{employee?.name}</p>
                                                                    <p className="text-muted-foreground text-xs">{employee?.email}</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    addForm.setData(
                                                                        'spec_employees',
                                                                        addForm.data.spec_employees.filter((id) => id !== uid),
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {addForm.errors.spec_employees && <p className="text-destructive text-sm">{addForm.errors.spec_employees}</p>}
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addForm.processing}>
                                {addForm.processing ? 'Creating...' : 'Create Announcement'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Announcement</DialogTitle>
                        <DialogDescription>Update the announcement details below. Changes will be saved immediately.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEdit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-title">Title *</Label>
                                <Input
                                    id="edit-title"
                                    value={editForm.data.title}
                                    onChange={(e) => editForm.setData('title', e.target.value)}
                                    placeholder="Enter announcement title"
                                    required
                                />
                                {editForm.errors.title && <p className="text-destructive text-sm">{editForm.errors.title}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description *</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    placeholder="Enter announcement details..."
                                    rows={5}
                                    required
                                />
                                {editForm.errors.description && <p className="text-destructive text-sm">{editForm.errors.description}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label>Audience *</Label>
                                <RadioGroup
                                    value={editForm.data.type}
                                    onValueChange={(value: 'all' | 'specific') => {
                                        editForm.setData((prev) => ({
                                            ...prev,
                                            type: value,
                                            spec_employees: value === 'all' ? [] : prev.spec_employees,
                                        }));
                                    }}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all" id="edit-all" />
                                        <Label htmlFor="edit-all" className="cursor-pointer">
                                            All Employees
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="specific" id="edit-specific" />
                                        <Label htmlFor="edit-specific" className="cursor-pointer">
                                            Specific Employees
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {editForm.data.type === 'specific' && (
                                <div className="grid gap-2">
                                    <Label>Select Employees *</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            if (value && !editForm.data.spec_employees.includes(value)) {
                                                editForm.setData('spec_employees', [...editForm.data.spec_employees, value]);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose employees..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees
                                                .filter((emp) => !editForm.data.spec_employees.includes(emp.employee_uid))
                                                .map((employee) => (
                                                    <SelectItem key={employee.employee_uid} value={employee.employee_uid}>
                                                        <div className="flex items-center gap-2">
                                                            {employee.img ? (
                                                                <img src={'/' + employee.img} alt={employee.name} className="h-6 w-6 rounded-full" />
                                                            ) : (
                                                                <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                                                                    <User className="h-3 w-3" />
                                                                </div>
                                                            )}
                                                            <span>{employee.name}</span>
                                                            <span className="text-muted-foreground text-xs">({employee.email})</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>

                                    {editForm.data.spec_employees.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            <Label>Selected Employees:</Label>
                                            <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                                                {editForm.data.spec_employees.map((uid) => {
                                                    const employee = employees.find((e) => e.employee_uid === uid);
                                                    return (
                                                        <div key={uid} className="bg-muted/50 flex items-center justify-between rounded p-2">
                                                            <div className="flex items-center gap-2">
                                                                {employee?.img ? (
                                                                    <img
                                                                        src={'/' + employee.img}
                                                                        alt={employee.name}
                                                                        className="h-6 w-6 rounded-full"
                                                                    />
                                                                ) : (
                                                                    <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">
                                                                        <User className="h-3 w-3" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="text-sm font-medium">{employee?.name}</p>
                                                                    <p className="text-muted-foreground text-xs">{employee?.email}</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    editForm.setData(
                                                                        'spec_employees',
                                                                        editForm.data.spec_employees.filter((id) => id !== uid),
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {editForm.errors.spec_employees && <p className="text-destructive text-sm">{editForm.errors.spec_employees}</p>}
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Updating...' : 'Update Announcement'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Announcement</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the announcement and remove all associated data.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-muted-foreground">Are you sure you want to delete the announcement:</p>
                        <p className="mt-2 font-semibold">{selected?.title}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={submitDelete} disabled={deleteForm.processing}>
                            {deleteForm.processing ? 'Deleting...' : 'Delete Announcement'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
