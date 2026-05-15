import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowUpDown, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import FlashMessage from '../FlashMessage';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Outlets', href: '/hrm/outlets' }];

interface Branch {
    id: number;
    branch_name: string;
}

interface Outlet {
    id: number;
    name: string;
    branch: number | null;
    branch_info: Branch | null;
    location: string | null;
    map: string | null;
    created_at: string;
}

interface Props {
    outlets: Outlet[];
    branches: Branch[];
}

export default function Outlets({ outlets, branches }: Props) {
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Outlet | null>(null);

    // Search, sorting, and pagination states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof Outlet>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const addForm = useForm({ name: '', branch: '', location: '', map: '' });
    const editForm = useForm({ name: '', branch: '', location: '', map: '' });
    const deleteForm = useForm({});

    // Filter, sort, and paginate data
    const filteredAndSortedData = useMemo(() => {
        // Filter
        let filtered = outlets.filter(
            (outlet) =>
                outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (outlet.branch_info?.branch_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (outlet.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
        );

        // Sort
        filtered = [...filtered].sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            if (sortField === 'branch') {
                aValue = a.branch_info?.branch_name || '';
                bValue = b.branch_info?.branch_name || '';
            } else if (sortField === 'created_at') {
                aValue = new Date(a.created_at).getTime();
                bValue = new Date(b.created_at).getTime();
            } else if (sortField === 'location') {
                aValue = a.location || '';
                bValue = b.location || '';
            } else {
                aValue = a[sortField] || '';
                bValue = b[sortField] || '';
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [outlets, searchTerm, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
    const paginatedData = filteredAndSortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (field: keyof Outlet) => {
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

    function openEdit(outlet: Outlet) {
        setSelected(outlet);
        editForm.setData({
            name: outlet.name,
            branch: outlet.branch ? String(outlet.branch) : '',
            location: outlet.location ?? '',
            map: outlet.map ?? '',
        });
        setEditOpen(true);
    }

    function openDelete(outlet: Outlet) {
        setSelected(outlet);
        setDeleteOpen(true);
    }

    function submitAdd(e: React.FormEvent) {
        e.preventDefault();
        addForm.post(route('hr.outlets.store'), {
            onSuccess: () => {
                addForm.reset();
                setAddOpen(false);
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!selected) return;
        editForm.put(route('hr.outlets.update', selected.id), {
            onSuccess: () => setEditOpen(false),
        });
    }

    function submitDelete() {
        if (!selected) return;
        deleteForm.delete(route('hr.outlets.destroy', selected.id), {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Outlets" />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Outlets</h1>
                    <Button size="sm" onClick={() => setAddOpen(true)}>
                        <Plus className="mr-1 h-4 w-4" /> Add Outlet
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-sm">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input placeholder="Search outlets, branches, or locations..." value={searchTerm} onChange={handleSearch} className="pl-9" />
                </div>

                <div className="rounded-lg border bg-white dark:bg-zinc-900">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('name')}
                                        className="flex h-auto items-center gap-1 p-0 font-semibold"
                                    >
                                        Name
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('branch')}
                                        className="flex h-auto items-center gap-1 p-0 font-semibold"
                                    >
                                        Branch
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('location')}
                                        className="flex h-auto items-center gap-1 p-0 font-semibold"
                                    >
                                        Location
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>Map</TableHead>
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
                                        No outlets found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {paginatedData.map((outlet, i) => (
                                <TableRow key={outlet.id}>
                                    <TableCell className="text-muted-foreground">{(currentPage - 1) * itemsPerPage + i + 1}</TableCell>
                                    <TableCell className="font-medium">{outlet.name}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {outlet.branch_info?.branch_name ?? <span className="italic">—</span>}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{outlet.location ?? '—'}</TableCell>
                                    <TableCell className="text-sm">
                                        {outlet.map ? (
                                            <a href={outlet.map} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                View Map
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(outlet.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="space-x-2 text-right">
                                        <Button variant="outline" size="icon" onClick={() => openEdit(outlet)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => openDelete(outlet)}>
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
                                of {filteredAndSortedData.length} outlets
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Outlet</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitAdd}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="add-name">Name</Label>
                                <Input
                                    id="add-name"
                                    value={addForm.data.name}
                                    onChange={(e) => addForm.setData('name', e.target.value)}
                                    placeholder="e.g. Gulshan Outlet"
                                    autoFocus
                                />
                                {addForm.errors.name && <p className="text-destructive text-sm">{addForm.errors.name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label>
                                    Branch <span className="text-muted-foreground text-xs">(optional)</span>
                                </Label>
                                <Select value={addForm.data.branch} onValueChange={(val) => addForm.setData('branch', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.branch_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {addForm.errors.branch && <p className="text-destructive text-sm">{addForm.errors.branch}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="add-location">
                                    Location <span className="text-muted-foreground text-xs">(optional)</span>
                                </Label>
                                <Input
                                    id="add-location"
                                    value={addForm.data.location}
                                    onChange={(e) => addForm.setData('location', e.target.value)}
                                    placeholder="e.g. House 12, Road 4, Gulshan"
                                />
                                {addForm.errors.location && <p className="text-destructive text-sm">{addForm.errors.location}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="add-map">
                                    Map Iframe <span className="text-muted-foreground text-xs">(optional)</span>
                                </Label>
                                <Input
                                    id="add-map"
                                    value={addForm.data.map}
                                    onChange={(e) => addForm.setData('map', e.target.value)}
                                    placeholder="https://maps.google.com/..."
                                />
                                {addForm.errors.map && <p className="text-destructive text-sm">{addForm.errors.map}</p>}
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
                        <DialogTitle>Edit Outlet</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input id="edit-name" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} />
                                {editForm.errors.name && <p className="text-destructive text-sm">{editForm.errors.name}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label>
                                    Branch <span className="text-muted-foreground text-xs">(optional)</span>
                                </Label>
                                <Select value={editForm.data.branch} onValueChange={(val) => editForm.setData('branch', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.branch_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {editForm.errors.branch && <p className="text-destructive text-sm">{editForm.errors.branch}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-location">
                                    Location <span className="text-muted-foreground text-xs">(optional)</span>
                                </Label>
                                <Input
                                    id="edit-location"
                                    value={editForm.data.location}
                                    onChange={(e) => editForm.setData('location', e.target.value)}
                                />
                                {editForm.errors.location && <p className="text-destructive text-sm">{editForm.errors.location}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-map">
                                    Map Iframe <span className="text-muted-foreground text-xs">(optional)</span>
                                </Label>
                                <Input id="edit-map" value={editForm.data.map} onChange={(e) => editForm.setData('map', e.target.value)} />
                                {editForm.errors.map && <p className="text-destructive text-sm">{editForm.errors.map}</p>}
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
                        <DialogTitle>Delete Outlet</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground text-sm">
                        Are you sure you want to delete <span className="text-foreground font-semibold">{selected?.name}</span>? This action cannot be
                        undone.
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
