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

    const btn = (active: boolean, onClick: () => void, label: string) => (
        <button
            key={label}
            type="button"
            onClick={onClick}
            className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-wrap gap-1 rounded-t-md border-b border-border bg-muted/30 p-2">
            {btn(editor.isActive('bold'),                    () => editor.chain().focus().toggleBold().run(),               'B'     )}
            {btn(editor.isActive('italic'),                  () => editor.chain().focus().toggleItalic().run(),             'I'     )}
            {btn(editor.isActive('strike'),                  () => editor.chain().focus().toggleStrike().run(),             'S̶'    )}
            {btn(editor.isActive('heading', { level: 2 }),   () => editor.chain().focus().toggleHeading({ level: 2 }).run(),'H2'    )}
            {btn(editor.isActive('heading', { level: 3 }),   () => editor.chain().focus().toggleHeading({ level: 3 }).run(),'H3'    )}
            {btn(editor.isActive('bulletList'),              () => editor.chain().focus().toggleBulletList().run(),         '• List')}
            {btn(editor.isActive('orderedList'),             () => editor.chain().focus().toggleOrderedList().run(),        '1. List')}
            {btn(editor.isActive('blockquote'),              () => editor.chain().focus().toggleBlockquote().run(),         '❝'    )}
            {btn(false,                                      () => editor.chain().focus().setHardBreak().run(),             '↵'    )}
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
        <div className="overflow-hidden rounded-md border border-border transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
            <RichToolbar editor={editor ?? null} />
            <EditorContent
                editor={editor}
                className="prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-3
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
        <div className="space-y-2">
            <Label className="text-sm font-semibold">{label}</Label>
            <div
                className="group relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center
                           overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/20
                           transition-colors hover:border-primary/60 hover:bg-muted/40"
                onClick={() => inputRef.current?.click()}
            >
                {displaySrc ? (
                    <>
                        <img src={displaySrc} alt={label} className="max-h-28 max-w-full object-contain p-2" />
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50
                                        opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex flex-col items-center gap-1 text-white">
                                <Upload className="h-5 w-5" />
                                <span className="text-xs font-medium">Change Image</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 p-4 text-muted-foreground">
                        <ImageIcon className="h-10 w-10 opacity-40" />
                        <span className="text-xs font-medium">Click to upload</span>
                    </div>
                )}
            </div>
            <p className="text-[11px] text-muted-foreground">{hint}</p>
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

// ── Section Card ─────────────────────────────────────────────────────────────

function Section({
    icon,
    title,
    description,
    children,
    fullWidth = false,
}: {
    icon: React.ReactNode;
    title: string;
    description?: string;
    children: React.ReactNode;
    fullWidth?: boolean;
}) {
    return (
        <Card className={`border-border/60 shadow-sm ${fullWidth ? 'col-span-full' : ''}`}>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {icon}
                    </span>
                    {title}
                </CardTitle>
                {description && <CardDescription className="text-xs">{description}</CardDescription>}
            </CardHeader>
            <Separator className="mx-6 mb-4" />
            <CardContent className="space-y-4">{children}</CardContent>
        </Card>
    );
}

// ── Field Row ────────────────────────────────────────────────────────────────

function FieldRow({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-semibold">{label}</Label>
            {children}
            {error && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
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

            <form onSubmit={handleSubmit}>
                <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">

                    {/* ── Page Header ── */}
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">App Settings</h1>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Manage your application branding, social links, and content policies.
                            </p>
                        </div>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="mt-3 gap-2 self-start sm:mt-0 sm:self-auto"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </div>

                    {/* ── Grid ── */}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                        {/* Brand Identity */}
                        <Section
                            icon={<Building2 className="h-4 w-4" />}
                            title="Brand Identity"
                            description="Name and visual assets for your application."
                        >
                            <FieldRow label="Brand Name" error={errors.brand_name}>
                                <Input
                                    value={data.brand_name}
                                    onChange={(e) => setData('brand_name', e.target.value)}
                                    placeholder="My HRMS"
                                    className="bg-background"
                                />
                            </FieldRow>
                            <ImageUploadField
                                label="Brand Logo"
                                name="brand_logo"
                                currentUrl={settings.brand_logo}
                                hint="PNG only · max 10 MB · saved as assets/logo.png"
                                onFileChange={(file) => setData('brand_logo', file)}
                            />
                            <ImageUploadField
                                label="Brand Icon"
                                name="brand_icon"
                                currentUrl={settings.brand_icon}
                                hint="PNG only · max 10 MB · saved as assets/hrms_icon.png"
                                onFileChange={(file) => setData('brand_icon', file)}
                            />
                        </Section>

                        {/* Location */}
                        <Section
                            icon={<MapPin className="h-4 w-4" />}
                            title="Location"
                            description="Physical address and Google Maps embed."
                        >
                            <FieldRow label="Address / Location" error={errors.location}>
                                <Input
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="123 Main St, Dhaka, Bangladesh"
                                    className="bg-background"
                                />
                            </FieldRow>
                            <FieldRow label="Google Maps Embed URL" error={errors.gogle_map}>
                                <Input
                                    value={data.gogle_map}
                                    onChange={(e) => setData('gogle_map', e.target.value)}
                                    placeholder="https://maps.google.com/maps?..."
                                    className="bg-background"
                                />
                            </FieldRow>
                            <FieldRow label="Contact Email" error={errors.contact_email}>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={data.contact_email}
                                        onChange={(e) => setData('contact_email', e.target.value)}
                                        placeholder="info@example.com"
                                        type="email"
                                        className="bg-background pl-9"
                                    />
                                </div>
                            </FieldRow>
                        </Section>

                        {/* Social Media */}
                        <Section
                            icon={<Globe className="h-4 w-4" />}
                            title="Social Media"
                            description="Links to your official social media profiles."
                        >
                            {socialFields.map(({ key, label, Icon, ph }) => (
                                <FieldRow key={key} label={label} error={errors[key]}>
                                    <div className="relative">
                                        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={data[key]}
                                            onChange={(e) => setData(key, e.target.value)}
                                            placeholder={ph}
                                            className="bg-background pl-9"
                                        />
                                    </div>
                                </FieldRow>
                            ))}
                        </Section>

                        {/* About — full width */}
                        <Section
                            icon={<Info className="h-4 w-4" />}
                            title="About"
                            description="About your organization — displayed on the about page."
                            fullWidth
                        >
                            <RichTextEditor
                                value={data.about}
                                onChange={(val) => setData('about', val)}
                                placeholder="Write about your organization…"
                            />
                            {errors.about && (
                                <p className="flex items-center gap-1 text-xs text-destructive">
                                    <AlertCircle className="h-3 w-3" /> {errors.about}
                                </p>
                            )}
                        </Section>

                        {/* Privacy Policy — full width */}
                        <Section
                            icon={<ShieldCheck className="h-4 w-4" />}
                            title="Privacy Policy"
                            description="Your application's privacy policy content."
                            fullWidth
                        >
                            <RichTextEditor
                                value={data.privacy_policy}
                                onChange={(val) => setData('privacy_policy', val)}
                                placeholder="Write your privacy policy…"
                            />
                            {errors.privacy_policy && (
                                <p className="flex items-center gap-1 text-xs text-destructive">
                                    <AlertCircle className="h-3 w-3" /> {errors.privacy_policy}
                                </p>
                            )}
                        </Section>

                        {/* Terms & Conditions — full width */}
                        <Section
                            icon={<FileText className="h-4 w-4" />}
                            title="Terms & Conditions"
                            description="Your application's terms and conditions content."
                            fullWidth
                        >
                            <RichTextEditor
                                value={data.terms_conditions}
                                onChange={(val) => setData('terms_conditions', val)}
                                placeholder="Write your terms and conditions…"
                            />
                            {errors.terms_conditions && (
                                <p className="flex items-center gap-1 text-xs text-destructive">
                                    <AlertCircle className="h-3 w-3" /> {errors.terms_conditions}
                                </p>
                            )}
                        </Section>

                    </div>

                    {/* ── Bottom Save ── */}
                    <div className="flex justify-end pb-4 pt-2">
                        <Button type="submit" disabled={processing} className="gap-2" size="lg">
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving Changes…' : 'Save All Settings'}
                        </Button>
                    </div>

                </div>
            </form>
        </AppLayout>
    );
}