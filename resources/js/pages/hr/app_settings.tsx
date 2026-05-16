// resources/js/pages/hr/app_settings.tsx

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Building2,
    Globe,
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Mail,
    MapPin,
    Upload,
    ImageIcon,
    Save,
    ShieldCheck,
    FileText,
    Info,
    AlertCircle,
    Settings2,
    Palette,
    Contact,
    Share2,
    Lock,
} from 'lucide-react';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import type { Editor } from '@tiptap/react';

import FlashMessage from '@/pages/FlashMessage';

// ── Types ────────────────────────────────────────────────────────────────────

interface Setting {
    id: number;
    brand_name: string | null;
    brand_logo: string | null;
    brand_icon: string | null;
    location: string | null;
    gogle_map: string | null;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    linkedin: string | null;
    contact_email: string | null;
    about: string | null;
    privacy_policy: string | null;
    terms_conditions: string | null;
}

interface Props {
    settings: Setting;
}

type SocialKey = 'facebook' | 'instagram' | 'twitter' | 'linkedin';

type FormData = {
    [key: string]: string | File | null;
    brand_name: string;
    brand_logo: File | null;
    brand_icon: File | null;
    location: string;
    gogle_map: string;
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    contact_email: string;
    about: string;
    privacy_policy: string;
    terms_conditions: string;
    _method: string;
};

// ── Breadcrumbs ──────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'App Settings', href: '/hrm/app-settings' },
];

// ── Social fields config ─────────────────────────────────────────────────────

const socialFields: {
    key: SocialKey;
    label: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    ph: string;
}[] = [
    { key: 'facebook',  label: 'Facebook',    Icon: Facebook,  ph: 'https://facebook.com/yourpage'        },
    { key: 'instagram', label: 'Instagram',   Icon: Instagram, ph: 'https://instagram.com/yourhandle'     },
    { key: 'twitter',   label: 'Twitter / X', Icon: Twitter,   ph: 'https://twitter.com/yourhandle'       },
    { key: 'linkedin',  label: 'LinkedIn',    Icon: Linkedin,  ph: 'https://linkedin.com/company/yourco'  },
];

// ── Rich Text Toolbar ────────────────────────────────────────────────────────

function RichToolbar({ editor }: { editor: Editor | null }) {
    if (!editor) return null;

    const btn = (active: boolean, onClick: () => void, label: string, icon?: React.ReactNode) => (
        <button
            key={label}
            type="button"
            onClick={onClick}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-all ${
                active
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title={label}
        >
            {icon || label}
        </button>
    );

    return (
        <div className="flex flex-wrap gap-1 rounded-t-xl border-b border-slate-200 bg-slate-50/50 p-1.5">
            {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Bold', <span className="font-bold">B</span>)}
            {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Italic', <span className="italic">I</span>)}
            <div className="mx-1 w-px bg-slate-200" />
            {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'Heading 2', <span className="font-bold text-xs">H2</span>)}
            {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'Heading 3', <span className="font-bold text-xs">H3</span>)}
            <div className="mx-1 w-px bg-slate-200" />
            {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'Bullet List', <span className="text-lg">•</span>)}
            {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Ordered List', <span className="text-xs">1.</span>)}
        </div>
    );
}

// ── Rich Text Editor ─────────────────────────────────────────────────────────

function RichTextEditor({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
            Placeholder.configure({ placeholder: placeholder ?? 'Write here…' }),
        ],
        content: value,
        onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    });

    useEffect(() => {
        if (editor && value === '') editor.commands.clearContent();
    }, [value, editor]);

    return (
        <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
            <RichToolbar editor={editor ?? null} />
            <EditorContent
                editor={editor}
                className="prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-4
                           [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror]:outline-none"
            />
        </div>
    );
}

// ── Image Upload Field ───────────────────────────────────────────────────────

function ImageUploadField({
    label,
    name,
    currentUrl,
    hint,
    onFileChange,
}: {
    label: string;
    name: string;
    currentUrl: string | null;
    hint: string;
    onFileChange: (file: File | null) => void;
}) {
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) setPreview(ev.target.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
        onFileChange(file);
    };

    const displaySrc = preview ?? (currentUrl ? `/${currentUrl}` : null);

    return (
        <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{label}</Label>
            <div
                className="group relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center
                           overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50
                           transition-all hover:border-indigo-400 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5"
                onClick={() => inputRef.current?.click()}
            >
                {displaySrc ? (
                    <div className="relative flex h-full w-full items-center justify-center p-6">
                        <img src={displaySrc} alt={label} className="max-h-32 max-w-full object-contain transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40
                                        opacity-0 transition-all backdrop-blur-[2px] group-hover:opacity-100">
                            <div className="flex translate-y-4 flex-col items-center gap-2 text-white transition-transform group-hover:translate-y-0">
                                <div className="rounded-full bg-white/20 p-2 backdrop-blur-md">
                                    <Upload className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">Update Image</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 p-8 text-slate-400">
                        <div className="rounded-full bg-slate-100 p-4 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-500">
                            <ImageIcon className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <span className="block text-sm font-bold text-slate-600">Click to upload</span>
                            <span className="text-xs">{hint}</span>
                        </div>
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                name={name}
                accept="image/png"
                className="hidden"
                onChange={handleChange}
            />
        </div>
    );
}

// ── Field Row ────────────────────────────────────────────────────────────────

function FieldRow({
    label,
    error,
    children,
    icon: Icon,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
    icon?: any;
}) {
    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                {Icon && <Icon size={14} className="text-slate-400" />}
                {label}
            </Label>
            {children}
            {error && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {error}
                </p>
            )}
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AppSettings({ settings }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        brand_name:       settings.brand_name       ?? '',
        brand_logo:       null,
        brand_icon:       null,
        location:         settings.location         ?? '',
        gogle_map:        settings.gogle_map         ?? '',
        facebook:         settings.facebook         ?? '',
        instagram:        settings.instagram        ?? '',
        twitter:          settings.twitter          ?? '',
        linkedin:         settings.linkedin         ?? '',
        contact_email:    settings.contact_email    ?? '',
        about:            settings.about            ?? '',
        privacy_policy:   settings.privacy_policy   ?? '',
        terms_conditions: settings.terms_conditions ?? '',
        _method:          'POST',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hr.update_app_settings'), { forceFormData: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="App Settings" />
            <FlashMessage />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* --- Sticky Header --- */}
                    <div className="sticky top-0 z-20 -mx-4 mb-8 bg-slate-50/80 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                    System Settings
                                </h1>
                                <p className="text-sm font-medium text-slate-500">
                                    Configure your platform identity, contact details and legal policies.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="rounded-xl border-slate-200 font-bold"
                                >
                                    Discard
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-slate-900 px-6 font-bold text-white shadow-xl shadow-slate-900/10 hover:bg-slate-800 disabled:opacity-50"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* --- Tabs Layout --- */}
                    <Tabs defaultValue="general" className="flex flex-col gap-8 lg:flex-row">
                        {/* Sidebar Navigation */}
                        <div className="w-full lg:w-64 xl:w-72">
                            <TabsList className="flex h-auto w-full flex-col items-stretch justify-start gap-1 bg-transparent p-0">
                                <TabsTrigger 
                                    value="general" 
                                    className="flex items-center justify-start gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-slate-200"
                                >
                                    <Palette size={18} />
                                    Appearance
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="contact" 
                                    className="flex items-center justify-start gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-slate-200"
                                >
                                    <Contact size={18} />
                                    Contact Info
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="social" 
                                    className="flex items-center justify-start gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-slate-200"
                                >
                                    <Share2 size={18} />
                                    Social Media
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="policies" 
                                    className="flex items-center justify-start gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-slate-200"
                                >
                                    <Lock size={18} />
                                    Legal & Policies
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 space-y-8">
                            {/* APPEARANCE TAB */}
                            <TabsContent value="general" className="m-0 space-y-8 outline-none">
                                <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                                    <CardHeader className="bg-slate-50/50 pb-8 pt-8">
                                        <CardTitle className="flex items-center gap-2 text-xl font-extrabold">
                                            <Palette className="text-indigo-500" />
                                            Brand Identity
                                        </CardTitle>
                                        <CardDescription className="font-medium text-slate-500">
                                            Customize how your platform looks to your employees and clients.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8 p-8">
                                        <FieldRow label="Application Name" error={errors.brand_name} icon={Building2}>
                                            <Input
                                                value={data.brand_name}
                                                onChange={(e) => setData('brand_name', e.target.value)}
                                                placeholder="e.g. PeopleOS HRMS"
                                                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                            />
                                        </FieldRow>

                                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                            <ImageUploadField
                                                label="Primary Logo"
                                                name="brand_logo"
                                                currentUrl={settings.brand_logo}
                                                hint="PNG format · Recommended: 512x512px"
                                                onFileChange={(file) => setData('brand_logo', file)}
                                            />
                                            <ImageUploadField
                                                label="Favicon / Icon"
                                                name="brand_icon"
                                                currentUrl={settings.brand_icon}
                                                hint="PNG format · Recommended: 64x64px"
                                                onFileChange={(file) => setData('brand_icon', file)}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                                    <CardHeader className="bg-slate-50/50 pb-8 pt-8">
                                        <CardTitle className="flex items-center gap-2 text-xl font-extrabold">
                                            <Info className="text-indigo-500" />
                                            About Organization
                                        </CardTitle>
                                        <CardDescription className="font-medium text-slate-500">
                                            This information will be displayed on the public about page.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <RichTextEditor
                                            value={data.about}
                                            onChange={(val) => setData('about', val)}
                                            placeholder="Tell the world about your company culture and mission..."
                                        />
                                        {errors.about && (
                                            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-500">
                                                <AlertCircle className="h-3.5 w-3.5" /> {errors.about}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* CONTACT TAB */}
                            <TabsContent value="contact" className="m-0 space-y-8 outline-none">
                                <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
                                    <CardHeader className="bg-slate-50/50 pb-8 pt-8">
                                        <CardTitle className="flex items-center gap-2 text-xl font-extrabold">
                                            <Contact className="text-indigo-500" />
                                            Contact Details
                                        </CardTitle>
                                        <CardDescription className="font-medium text-slate-500">
                                            Let your employees know where to find the headquarters and how to get in touch.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8 p-8">
                                        <FieldRow label="Official Email" error={errors.contact_email} icon={Mail}>
                                            <Input
                                                value={data.contact_email}
                                                onChange={(e) => setData('contact_email', e.target.value)}
                                                placeholder="hr@company.com"
                                                type="email"
                                                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                            />
                                        </FieldRow>

                                        <FieldRow label="Office Address" error={errors.location} icon={MapPin}>
                                            <Input
                                                value={data.location}
                                                onChange={(e) => setData('location', e.target.value)}
                                                placeholder="123 Corporate Blvd, Suite 100..."
                                                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                            />
                                        </FieldRow>

                                        <FieldRow label="Google Maps Embed URL" error={errors.gogle_map} icon={Globe}>
                                            <Input
                                                value={data.gogle_map}
                                                onChange={(e) => setData('gogle_map', e.target.value)}
                                                placeholder="https://maps.google.com/maps?..."
                                                className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                            />
                                        </FieldRow>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* SOCIAL TAB */}
                            <TabsContent value="social" className="m-0 space-y-8 outline-none">
                                <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
                                    <CardHeader className="bg-slate-50/50 pb-8 pt-8">
                                        <CardTitle className="flex items-center gap-2 text-xl font-extrabold">
                                            <Share2 className="text-indigo-500" />
                                            Social Presence
                                        </CardTitle>
                                        <CardDescription className="font-medium text-slate-500">
                                            Link your company's social media profiles for better visibility.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
                                        {socialFields.map(({ key, label, Icon, ph }) => (
                                            <FieldRow key={key} label={label} error={errors[key]} icon={Icon}>
                                                <Input
                                                    value={data[key]}
                                                    onChange={(e) => setData(key, e.target.value)}
                                                    placeholder={ph}
                                                    className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                                />
                                            </FieldRow>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* POLICIES TAB */}
                            <TabsContent value="policies" className="m-0 space-y-8 outline-none">
                                <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
                                    <CardHeader className="bg-slate-50/50 pb-8 pt-8">
                                        <CardTitle className="flex items-center gap-2 text-xl font-extrabold">
                                            <ShieldCheck className="text-indigo-500" />
                                            Privacy Policy
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <RichTextEditor
                                            value={data.privacy_policy}
                                            onChange={(val) => setData('privacy_policy', val)}
                                            placeholder="Define your privacy standards..."
                                        />
                                        {errors.privacy_policy && (
                                            <p className="mt-2 text-xs font-medium text-red-500">{errors.privacy_policy}</p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
                                    <CardHeader className="bg-slate-50/50 pb-8 pt-8">
                                        <CardTitle className="flex items-center gap-2 text-xl font-extrabold">
                                            <FileText className="text-indigo-500" />
                                            Terms & Conditions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <RichTextEditor
                                            value={data.terms_conditions}
                                            onChange={(val) => setData('terms_conditions', val)}
                                            placeholder="Define your terms and conditions..."
                                        />
                                        {errors.terms_conditions && (
                                            <p className="mt-2 text-xs font-medium text-red-500">{errors.terms_conditions}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </form>
            </div>
        </AppLayout>
    );
}