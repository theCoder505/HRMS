import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Branches', href: '/hrm/branches' }];

interface Branch {
    id: number;
    branch_name: string;
    outlets_count: number;
    created_at: string;
}

interface Props {
    branches: Branch[];
}

export default function Branches({ branches }: Props) {
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Branch | null>(null);
    
    // Search, sorting, and pagination states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof Branch>('branch_name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const addForm = useForm({ branch_name: '' });
    const editForm = useForm({ branch_name: '' });
    const deleteForm = useForm({});

    // Filter, sort, and paginate data
    const filteredAndSortedData = useMemo(() => {
        // Filter
        let filtered = branches.filter(branch =>
            branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Sort
        filtered = [...filtered].sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];
            
            if (sortField === 'created_at') {
                aValue = new Date(a.created_at).getTime();
                bValue = new Date(b.created_at).getTime();
            }
            
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        return filtered;
    }, [branches, searchTerm, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
    const paginatedData = filteredAndSortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (field: keyof Branch) => {
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

    function openEdit(branch: Branch) {
        setSelected(branch);
        editForm.setData('branch_name', branch.branch_name);
        setEditOpen(true);
    }

    function openDelete(branch: Branch) {
        setSelected(branch);
        setDeleteOpen(true);
    }

    function submitAdd(e: React.FormEvent) {
        e.preventDefault();
        addForm.post(route('hr.branches.store'), {
            onSuccess: () => {
                addForm.reset();
                setAddOpen(false);
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!selected) return;
        editForm.put(route('hr.branches.update', selected.id), {
            onSuccess: () => setEditOpen(false),
        });
    }

    function submitDelete() {
        if (!selected) return;
        deleteForm.delete(route('hr.branches.destroy', selected.id), {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Branches" />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Branches</h1>
                    <Button size="sm" onClick={() => setAddOpen(true)}>
                        <Plus className="mr-1 h-4 w-4" /> Add Branch
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search branches..."
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
                                        onClick={() => handleSort('branch_name')}
                                        className="flex items-center gap-1 p-0 h-auto font-semibold"
                                    >
                                        Branch Name
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('outlets_count')}
                                        className="flex items-center gap-1 p-0 h-auto font-semibold"
                                    >
                                        Total Outlets
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('created_at')}
                                        className="flex items-center gap-1 p-0 h-auto font-semibold"
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
                                    <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                                        No branches found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {paginatedData.map((branch, i) => (
                                <TableRow key={branch.id}>
                                    <TableCell className="text-muted-foreground">
                                        {(currentPage - 1) * itemsPerPage + i + 1}
                                    </TableCell>
                                    <TableCell className="font-medium">{branch.branch_name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{branch.outlets_count}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(branch.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="space-x-2 text-right">
                                        <Button variant="outline" size="icon" onClick={() => openEdit(branch)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => openDelete(branch)}>
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
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                                {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of{' '}
                                {filteredAndSortedData.length} branches
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Branch</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitAdd}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="add-branch_name">Branch Name</Label>
                                <Input
                                    id="add-branch_name"
                                    value={addForm.data.branch_name}
                                    onChange={(e) => addForm.setData('branch_name', e.target.value)}
                                    placeholder="e.g. Dhaka North"
                                    autoFocus
                                />
                                {addForm.errors.branch_name && <p className="text-destructive text-sm">{addForm.errors.branch_name}</p>}
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Branch</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-branch_name">Branch Name</Label>
                                <Input
                                    id="edit-branch_name"
                                    value={editForm.data.branch_name}
                                    onChange={(e) => editForm.setData('branch_name', e.target.value)}
                                />
                                {editForm.errors.branch_name && <p className="text-destructive text-sm">{editForm.errors.branch_name}</p>}
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
                        <DialogTitle>Delete Branch</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground text-sm">
                        Are you sure you want to delete <span className="text-foreground font-semibold">{selected?.branch_name}</span>? This action
                        cannot be undone.
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