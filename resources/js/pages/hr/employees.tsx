import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowUpDown,
    Briefcase,
    Building2,
    Calendar,
    CalendarDays,
    Camera,
    Clock,
    DollarSign,
    ExternalLink,
    Facebook,
    Fingerprint,
    Globe,
    ImageIcon,
    Linkedin,
    Mail,
    MapPin,
    Pencil,
    Plus,
    Search,
    Trash2,
    Upload,
    User,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import FlashMessage from '../FlashMessage';

interface Employee {
    id: number;
    employee_uid: string;
    img: string | null;
    name: string;
    email: string;
    password: string | null;
    address: string | null;
    about: string | null;
    job_title: string | null;
    department: number | null;
    branch: number | null;
    outlet: number | null;
    role: number | null;
    department_label: string | null;
    branch_label: string | null;
    outlet_label: string | null;
    role_label: string | null;
    clock_in_time: string | null;
    clock_out_time: string | null;
    office_days: string[];
    weekend: string[];
    join_date: string | null;
    salary: string | null;
    facebook: string | null;
    linkedin: string | null;
    website: string | null;
    fingerprint1: string | null;
    fingerprint2: string | null;
    card_identity: string | null;
    created_at: string;
}

interface Department {
    id: number;
    title: string;
}
interface Role {
    id: number;
    title: string;
    department: number;
}
interface Branch {
    id: number;
    branch_name: string;
}
interface Outlet {
    id: number;
    name: string;
    branch: number;
}

interface Props {
    employees: Employee[];
    departments: Department[];
    roles: Role[];
    branches: Branch[];
    outlets: Outlet[];
}

type FormDataType = {
    [key: string]: string | number | string[] | File | null | undefined;
    id: number | null;
    img: File | null;
    name: string;
    email: string;
    password: string;
    address: string;
    about: string;
    job_title: string;
    department: string;
    role: string;
    branch: string;
    outlet: string;
    clock_in_time: string;
    clock_out_time: string;
    office_days: string[];
    weekend: string[];
    join_date: string;
    salary: string;
    facebook: string;
    linkedin: string;
    website: string;
    fingerprint1: string;
    fingerprint2: string;
    card_identity: string;
};

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
const ITEMS_PER_PAGE = 15;

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Employees', href: '/hrm/employees' }];

const emptyForm: FormDataType = {
    id: null,
    img: null,
    name: '',
    email: '',
    password: '',
    address: '',
    about: '',
    job_title: '',
    department: '',
    role: '',
    branch: '',
    outlet: '',
    clock_in_time: '',
    clock_out_time: '',
    office_days: [],
    weekend: [],
    join_date: '',
    salary: '',
    facebook: '',
    linkedin: '',
    website: '',
    fingerprint1: '',
    fingerprint2: '',
    card_identity: '',
};

function ImageField({ preview, onFile, error }: { preview: string | null; onFile: (f: File | null) => void; error?: string }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const cameraRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        onFile(file);
    };

    return (
        <div className="space-y-2">
            <Label className="text-sm font-semibold">Photo</Label>
            <div className="flex items-center gap-3">
                <div
                    className="group border-border bg-muted/20 hover:border-primary/60 relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors"
                    onClick={() => fileRef.current?.click()}
                >
                    {preview ? (
                        <>
                            <img src={preview} alt="preview" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                <Upload className="h-5 w-5 text-white" />
                            </div>
                        </>
                    ) : (
                        <ImageIcon className="text-muted-foreground/40 h-8 w-8" />
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()}>
                        <Upload className="h-3.5 w-3.5" /> Upload Photo
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => cameraRef.current?.click()}>
                        <Camera className="h-3.5 w-3.5" /> Use Camera
                    </Button>
                    <p className="text-muted-foreground text-[11px]">JPG, PNG, WEBP · max 15 MB</p>
                </div>
            </div>
            {error && (
                <p className="text-destructive flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}
            <input ref={fileRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp" className="hidden" onChange={handleChange} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleChange} />
        </div>
    );
}

function DayPicker({ label, value, onChange }: { label: string; value: string[]; onChange: (days: string[]) => void }) {
    const toggle = (day: string) => {
        onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day]);
    };
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-semibold">{label}</Label>
            <div className="flex flex-wrap gap-1.5">
                {DAYS.map((day) => (
                    <button
                        key={day}
                        type="button"
                        onClick={() => toggle(day)}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                            value.includes(day) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        {day}
                    </button>
                ))}
            </div>
        </div>
    );
}

function FieldRow({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-semibold">{label}</Label>
            {children}
            {error && (
                <p className="text-destructive flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" /> {error}
                </p>
            )}
        </div>
    );
}

function DialogSection({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-2 pt-2">
            <span className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-md text-xs">{icon}</span>
            <span className="text-foreground text-sm font-semibold">{title}</span>
            <Separator className="flex-1" />
        </div>
    );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <span className="bg-muted text-muted-foreground mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">{icon}</span>
            <div>
                <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">{label}</p>
                <p className="text-foreground text-sm">{value}</p>
            </div>
        </div>
    );
}

interface EmployeeFormFieldsProps {
    data: FormDataType;
    setData: (key: string, val: FormDataType[keyof FormDataType]) => void;
    errors: Partial<Record<string, string>>;
    preview: string | null;
    onPreview: (s: string | null) => void;
    isEdit?: boolean;
    departments: Department[];
    roles: Role[];
    branches: Branch[];
    outlets: Outlet[];
    toPreview: (file: File, setter: (s: string) => void) => void;
}

function EmployeeFormFields({
    data,
    setData,
    errors,
    preview,
    onPreview,
    isEdit = false,
    departments,
    roles,
    branches,
    outlets,
    toPreview,
}: EmployeeFormFieldsProps) {
    const deptRoles = roles.filter((r) => String(r.department) === (data.department as string));
    const branchOuts = outlets.filter((o) => String(o.branch) === (data.branch as string));

    return (
        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-2">
            {/* Photo */}
            <ImageField
                preview={preview}
                error={errors.img}
                onFile={(file) => {
                    setData('img', file);
                    if (file) toPreview(file, (s) => onPreview(s));
                    else onPreview(null);
                }}
            />

            {/* Basic Info */}
            <DialogSection icon={<User className="h-3.5 w-3.5" />} title="Basic Information" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldRow label="Full Name *" error={errors.name}>
                    <Input
                        value={data.name as string}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="John Doe"
                        className="bg-background"
                    />
                </FieldRow>
                <FieldRow label="Email *" error={errors.email}>
                    <Input
                        value={data.email as string}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="john@example.com"
                        type="email"
                        className="bg-background"
                    />
                </FieldRow>
                <FieldRow label={isEdit ? 'Password (leave blank to keep)' : 'Password *'} error={errors.password}>
                    <Input
                        value={data.password as string}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        type="text"
                        className="bg-background"
                    />
                </FieldRow>
                <FieldRow label="Job Title" error={errors.job_title}>
                    <Input
                        value={data.job_title as string}
                        onChange={(e) => setData('job_title', e.target.value)}
                        placeholder="Senior Developer"
                        className="bg-background"
                    />
                </FieldRow>
            </div>
            <FieldRow label="Address" error={errors.address}>
                <Input
                    value={data.address as string}
                    onChange={(e) => setData('address', e.target.value)}
                    placeholder="123 Main St, Dhaka"
                    className="bg-background"
                />
            </FieldRow>
            <FieldRow label="About (max 1500 chars)" error={errors.about}>
                <Textarea
                    value={data.about as string}
                    onChange={(e) => setData('about', e.target.value)}
                    placeholder="Short bio…"
                    maxLength={1500}
                    rows={3}
                    className="bg-background resize-none"
                />
                <p className="text-muted-foreground text-right text-[11px]">{(data.about as string).length}/1500</p>
            </FieldRow>

            {/* Organisation */}
            <DialogSection icon={<Building2 className="h-3.5 w-3.5" />} title="Organisation" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldRow label="Department" error={errors.department}>
                    <Select
                        value={data.department as string}
                        onValueChange={(v) => {
                            setData('department', v);
                            setData('role', '');
                        }}
                    >
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((d) => (
                                <SelectItem key={d.id} value={String(d.id)}>
                                    {d.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldRow>
                <FieldRow label="Role" error={errors.role}>
                    <Select value={data.role as string} onValueChange={(v) => setData('role', v)} disabled={!data.department}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder={data.department ? 'Select role' : 'Select dept first'} />
                        </SelectTrigger>
                        <SelectContent>
                            {deptRoles.map((r) => (
                                <SelectItem key={r.id} value={String(r.id)}>
                                    {r.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldRow>
                <FieldRow label="Branch" error={errors.branch}>
                    <Select
                        value={data.branch as string}
                        onValueChange={(v) => {
                            setData('branch', v);
                            setData('outlet', '');
                        }}
                    >
                        <SelectTrigger className="bg-background">
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
                </FieldRow>
                <FieldRow label="Outlet" error={errors.outlet}>
                    <Select value={data.outlet as string} onValueChange={(v) => setData('outlet', v)} disabled={!data.branch}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder={data.branch ? 'Select outlet' : 'Select branch first'} />
                        </SelectTrigger>
                        <SelectContent>
                            {branchOuts.map((o) => (
                                <SelectItem key={o.id} value={String(o.id)}>
                                    {o.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldRow>
            </div>

            {/* Schedule */}
            <DialogSection icon={<Clock className="h-3.5 w-3.5" />} title="Schedule" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldRow label="Clock In Time" error={errors.clock_in_time}>
                    <Input
                        value={data.clock_in_time as string}
                        onChange={(e) => setData('clock_in_time', e.target.value)}
                        type="time"
                        className="bg-background"
                    />
                </FieldRow>
                <FieldRow label="Clock Out Time" error={errors.clock_out_time}>
                    <Input
                        value={data.clock_out_time as string}
                        onChange={(e) => setData('clock_out_time', e.target.value)}
                        type="time"
                        className="bg-background"
                    />
                </FieldRow>
            </div>
            <DayPicker label="Office Days" value={data.office_days as string[]} onChange={(d) => setData('office_days', d)} />
            <DayPicker label="Weekend" value={data.weekend as string[]} onChange={(d) => setData('weekend', d)} />

            {/* Employment */}
            <DialogSection icon={<Briefcase className="h-3.5 w-3.5" />} title="Employment" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldRow label="Join Date" error={errors.join_date}>
                    <Input
                        value={data.join_date as string}
                        onChange={(e) => setData('join_date', e.target.value)}
                        type="date"
                        className="bg-background"
                    />
                </FieldRow>
                <FieldRow label="Salary" error={errors.salary}>
                    <div className="relative">
                        <DollarSign className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            value={data.salary as string}
                            onChange={(e) => setData('salary', e.target.value)}
                            placeholder="50000"
                            type="number"
                            className="bg-background pl-9"
                        />
                    </div>
                </FieldRow>
            </div>

            {/* Social */}
            <DialogSection icon={<Globe className="h-3.5 w-3.5" />} title="Social & Web" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldRow label="Facebook" error={errors.facebook}>
                    <div className="relative">
                        <Facebook className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            value={data.facebook as string}
                            onChange={(e) => setData('facebook', e.target.value)}
                            placeholder="https://facebook.com/..."
                            className="bg-background pl-9"
                        />
                    </div>
                </FieldRow>
                <FieldRow label="LinkedIn" error={errors.linkedin}>
                    <div className="relative">
                        <Linkedin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            value={data.linkedin as string}
                            onChange={(e) => setData('linkedin', e.target.value)}
                            placeholder="https://linkedin.com/in/..."
                            className="bg-background pl-9"
                        />
                    </div>
                </FieldRow>
                <FieldRow label="Website" error={errors.website}>
                    <div className="relative">
                        <Globe className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            value={data.website as string}
                            onChange={(e) => setData('website', e.target.value)}
                            placeholder="https://..."
                            className="bg-background pl-9"
                        />
                    </div>
                </FieldRow>
                <FieldRow label="Fingerprint 1" error={errors.fingerprint1}>
                    <div className="relative">
                        <Fingerprint className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            value={data.fingerprint1 as string}
                            onChange={(e) => setData('fingerprint1', e.target.value)}
                            placeholder="FP-001"
                            className="bg-background pl-9"
                        />
                    </div>
                </FieldRow>
                <FieldRow label="Fingerprint 2" error={errors.fingerprint2}>
                    <div className="relative">
                        <Fingerprint className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            value={data.fingerprint2 as string}
                            onChange={(e) => setData('fingerprint2', e.target.value)}
                            placeholder="FP-002"
                            className="bg-background pl-9"
                        />
                    </div>
                </FieldRow>
                <FieldRow label="Card Identity" error={errors.card_identity}>
                    <div className="relative">
                        <Fingerprint className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            value={data.card_identity as string}
                            onChange={(e) => setData('card_identity', e.target.value)}
                            placeholder="CARD-001"
                            className="bg-background pl-9"
                        />
                    </div>
                </FieldRow>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Employees({ employees, departments, roles, branches, outlets }: Props) {
    // ── Dialog states
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selected, setSelected] = useState<Employee | null>(null);

    // ── Image preview state
    const [addPreview, setAddPreview] = useState<string | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);

    // ── Table state
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<keyof Employee>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);

    // ── Forms
    const addForm = useForm<FormDataType>({ ...emptyForm });
    const editForm = useForm<FormDataType>({ ...emptyForm });
    const deleteForm = useForm({});

    // ── Filtered/sorted/paginated data
    const processed = useMemo(() => {
        let data = employees.filter((e) =>
            [e.name, e.email, e.employee_uid, e.job_title, e.department_label].some((f) => f?.toLowerCase().includes(search.toLowerCase())),
        );
        data = [...data].sort((a, b) => {
            const av = a[sortField] ?? '';
            const bv = b[sortField] ?? '';
            if (av < bv) return sortDir === 'asc' ? -1 : 1;
            if (av > bv) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return data;
    }, [employees, search, sortField, sortDir]);

    const totalPages = Math.ceil(processed.length / ITEMS_PER_PAGE);
    const paginated = processed.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleSort = (field: keyof Employee) => {
        if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortField(field);
            setSortDir('asc');
        }
        setPage(1);
    };

    // ── File → preview helper
    const toPreview = (file: File, setter: (s: string) => void) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) setter(e.target.result as string);
        };
        reader.readAsDataURL(file);
    };

    // ── Open handlers
    function openAdd() {
        addForm.reset();
        addForm.clearErrors();
        setAddPreview(null);
        setAddOpen(true);
    }

    function openEdit(emp: Employee) {
        setSelected(emp);
        editForm.setData({
            id: emp.id,
            img: null,
            name: emp.name,
            email: emp.email,
            password: emp.password ?? '',
            address: emp.address ?? '',
            about: emp.about ?? '',
            job_title: emp.job_title ?? '',
            department: emp.department ? String(emp.department) : '',
            role: emp.role ? String(emp.role) : '',
            branch: emp.branch ? String(emp.branch) : '',
            outlet: emp.outlet ? String(emp.outlet) : '',
            clock_in_time: emp.clock_in_time ? emp.clock_in_time.slice(0, 5) : '',
            clock_out_time: emp.clock_out_time ? emp.clock_out_time.slice(0, 5) : '',
            office_days: emp.office_days ?? [],
            weekend: emp.weekend ?? [],
            join_date: emp.join_date ?? '',
            salary: emp.salary ?? '',
            facebook: emp.facebook ?? '',
            linkedin: emp.linkedin ?? '',
            website: emp.website ?? '',
            fingerprint1: emp.fingerprint1 ?? '',
            fingerprint2: emp.fingerprint2 ?? '',
            card_identity: emp.card_identity ?? '',
        });
        setEditPreview(emp.img ? `/${emp.img}` : null);
        setEditOpen(true);
    }

    function openView(emp: Employee) {
        setSelected(emp);
        setViewOpen(true);
    }
    function openDelete(emp: Employee) {
        setSelected(emp);
        setDeleteOpen(true);
    }

    // ── Submit handlers
    function submitAdd(e: React.FormEvent) {
        e.preventDefault();
        addForm.post(route('hr.employees.store'), {
            forceFormData: true,
            onSuccess: () => {
                setAddOpen(false);
                addForm.reset();
                setAddPreview(null);
            },
        });
    }

    function submitEdit(e: React.FormEvent) {
        e.preventDefault();
        editForm.post(route('hr.employees.update'), {
            forceFormData: true,
            onSuccess: () => setEditOpen(false),
        });
    }

    function submitDelete() {
        if (!selected) return;
        deleteForm.delete(route('hr.employees.destroy', selected.id), {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    // ── Pagination helper
    function paginationPages(): number[] {
        const pages: number[] = [];
        const total = totalPages;
        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else if (page <= 4) {
            pages.push(1, 2, 3, 4, 5, -1, total);
        } else if (page >= total - 3) {
            pages.push(1, -1, total - 4, total - 3, total - 2, total - 1, total);
        } else {
            pages.push(1, -1, page - 1, page, page + 1, -1, total);
        }
        return pages;
    }

    // ── Sortable header button
    function SortBtn({ field, label }: { field: keyof Employee; label: string }) {
        return (
            <Button variant="ghost" onClick={() => handleSort(field)} className="flex h-auto items-center gap-1 p-0 font-semibold">
                {label} <ArrowUpDown className="h-3 w-3" />
            </Button>
        );
    }

    // ── Shared props for EmployeeFormFields
    const sharedFormFieldProps = { departments, roles, branches, outlets, toPreview };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />
            <FlashMessage />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
                        <p className="text-muted-foreground text-sm">{employees.length} total employees</p>
                    </div>
                    <Button onClick={openAdd} className="gap-2 self-start sm:self-auto">
                        <Plus className="h-4 w-4" /> Add Employee
                    </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                        placeholder="Search name, email, UID, department…"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pl-9"
                    />
                </div>

                {/* Table */}
                <div className="bg-card rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>
                                    <SortBtn field="name" label="Name" />
                                </TableHead>
                                <TableHead>
                                    <SortBtn field="employee_uid" label="UID" />
                                </TableHead>
                                <TableHead>
                                    <SortBtn field="job_title" label="Job Title" />
                                </TableHead>
                                <TableHead>
                                    <SortBtn field="department_label" label="Department" />
                                </TableHead>
                                <TableHead>
                                    <SortBtn field="branch_label" label="Branch" />
                                </TableHead>
                                <TableHead>
                                    <SortBtn field="join_date" label="Joined" />
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-muted-foreground py-10 text-center">
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {paginated.map((emp, i) => (
                                <TableRow key={emp.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => openView(emp)}>
                                    <TableCell className="text-muted-foreground text-sm">{(page - 1) * ITEMS_PER_PAGE + i + 1}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{emp.name}</p>
                                            <p className="text-muted-foreground text-xs">{emp.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {emp.employee_uid}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">{emp.job_title ?? '—'}</TableCell>
                                    <TableCell>
                                        {emp.department_label ? (
                                            <Badge variant="secondary">{emp.department_label}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm">{emp.branch_label ?? '—'}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {emp.join_date ? new Date(emp.join_date).toLocaleDateString() : '—'}
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(emp)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => openDelete(emp)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-muted-foreground text-sm">
                                Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, processed.length)} of {processed.length}
                            </p>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                                    Prev
                                </Button>
                                {paginationPages().map((p, idx) =>
                                    p === -1 ? (
                                        <span key={`ellipsis-${idx}`} className="text-muted-foreground px-1">
                                            …
                                        </span>
                                    ) : (
                                        <Button
                                            key={p}
                                            variant={page === p ? 'default' : 'outline'}
                                            size="sm"
                                            className="w-8"
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </Button>
                                    ),
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Add Dialog ── */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-2xl" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Employee
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitAdd}>
                        <EmployeeFormFields
                            data={addForm.data}
                            setData={(k, v) => addForm.setData(k as keyof FormDataType, v as FormDataType[keyof FormDataType])}
                            errors={addForm.errors}
                            preview={addPreview}
                            onPreview={setAddPreview}
                            {...sharedFormFieldProps}
                        />
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addForm.processing}>
                                {addForm.processing ? 'Saving…' : 'Save Employee'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Edit Dialog ── */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" /> Edit Employee
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="p-2">
                        <EmployeeFormFields
                            data={editForm.data}
                            setData={(k, v) => editForm.setData(k as keyof FormDataType, v as FormDataType[keyof FormDataType])}
                            errors={editForm.errors}
                            preview={editPreview}
                            onPreview={setEditPreview}
                            isEdit
                            {...sharedFormFieldProps}
                        />
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Updating…' : 'Update Employee'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── View Dialog ── */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="max-w-2xl" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-4 w-4" /> Employee Profile
                        </DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
                            {/* Profile header */}
                            <div className="flex items-center gap-4">
                                <div className="bg-muted h-20 w-20 shrink-0 overflow-hidden rounded-2xl border">
                                    {selected.img ? (
                                        <img src={`/${selected.img}`} alt={selected.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                                            <User className="h-8 w-8" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">{selected.name}</h2>
                                    <p className="text-muted-foreground text-sm">{selected.job_title ?? 'No job title'}</p>
                                    <Badge variant="outline" className="mt-1 font-mono text-xs">
                                        {selected.employee_uid}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            {/* Details grid */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={selected.email} />
                                <DetailRow icon={<MapPin className="h-4 w-4" />} label="Address" value={selected.address} />
                                <DetailRow icon={<Building2 className="h-4 w-4" />} label="Department" value={selected.department_label} />
                                <DetailRow icon={<Briefcase className="h-4 w-4" />} label="Role" value={selected.role_label} />
                                <DetailRow icon={<Building2 className="h-4 w-4" />} label="Branch" value={selected.branch_label} />
                                <DetailRow icon={<Building2 className="h-4 w-4" />} label="Outlet" value={selected.outlet_label} />
                                <DetailRow icon={<Clock className="h-4 w-4" />} label="Clock In" value={selected.clock_in_time} />
                                <DetailRow icon={<Clock className="h-4 w-4" />} label="Clock Out" value={selected.clock_out_time} />
                                <DetailRow icon={<CalendarDays className="h-4 w-4" />} label="Office Days" value={selected.office_days?.join(', ')} />
                                <DetailRow icon={<CalendarDays className="h-4 w-4" />} label="Weekend" value={selected.weekend?.join(', ')} />
                                <DetailRow
                                    icon={<Calendar className="h-4 w-4" />}
                                    label="Join Date"
                                    value={selected.join_date ? new Date(selected.join_date).toLocaleDateString() : undefined}
                                />
                                <DetailRow
                                    icon={<DollarSign className="h-4 w-4" />}
                                    label="Salary"
                                    value={selected.salary ? `৳ ${Number(selected.salary).toLocaleString()}` : undefined}
                                />
                                <DetailRow icon={<Fingerprint className="h-4 w-4" />} label="Fingerprint 1" value={selected.fingerprint1} />
                                <DetailRow icon={<Fingerprint className="h-4 w-4" />} label="Fingerprint 2" value={selected.fingerprint2} />
                                <DetailRow icon={<Fingerprint className="h-4 w-4" />} label="Card Identity" value={selected.card_identity} />
                            </div>

                            {selected.about && <div className="bg-muted/30 text-muted-foreground rounded-lg p-3 text-sm">{selected.about}</div>}

                            {/* Social links */}
                            {(selected.facebook || selected.linkedin || selected.website) && (
                                <>
                                    <Separator />
                                    <div className="flex flex-wrap gap-2">
                                        {selected.facebook && (
                                            <a href={selected.facebook} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm" className="gap-1.5">
                                                    <Facebook className="h-3.5 w-3.5" /> Facebook
                                                </Button>
                                            </a>
                                        )}
                                        {selected.linkedin && (
                                            <a href={selected.linkedin} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm" className="gap-1.5">
                                                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                                                </Button>
                                            </a>
                                        )}
                                        {selected.website && (
                                            <a href={selected.website} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm" className="gap-1.5">
                                                    <Globe className="h-3.5 w-3.5" /> Website
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Quick links */}
                            <Separator />
                            <div>
                                <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">Quick Links</p>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {[
                                        { label: 'Leave Requests', href: `/hrm/employees/leave-requests/${selected.employee_uid}` },
                                        { label: 'Announcements', href: `/hrm/employees/announcements/${selected.employee_uid}` },
                                        { label: 'Promotions', href: `/hrm/employees/promotions/${selected.employee_uid}` },
                                        { label: 'Attendance', href: `/hrm/employees/attendance/${selected.employee_uid}` },
                                        { label: 'Payroll', href: `/hrm/employees/payroll/${selected.employee_uid}` },
                                    ].map((link) => (
                                        <a key={link.label} href={link.href}>
                                            <Button variant="outline" size="sm" className="w-full justify-start gap-1.5 text-xs">
                                                <ExternalLink className="h-3 w-3" /> {link.label}
                                            </Button>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewOpen(false)}>
                            Close
                        </Button>
                        <Button
                            onClick={() => {
                                setViewOpen(false);
                                if (selected) openEdit(selected);
                            }}
                        >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Dialog ── */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-md" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                            <Trash2 className="h-4 w-4" /> Delete Employee
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-muted-foreground text-sm">
                            Are you sure you want to delete <span className="text-foreground font-semibold">{selected?.name}</span>?
                        </p>
                        <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm">
                            ⚠️ This action <strong>cannot be undone</strong>. All data belonging to this employee — including attendance, payroll,
                            leave requests, and their photo — will be permanently removed.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={submitDelete} disabled={deleteForm.processing}>
                            {deleteForm.processing ? 'Deleting…' : 'Yes, Delete Employee'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
