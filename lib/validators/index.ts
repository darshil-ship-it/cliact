import { z } from 'zod';
import { sectionTypes, tables } from '@/types/cms';
import type { Content, Value } from '@/types/cms';
export function validateContent(data: Content, depth = 0): string | null {
    if (depth > 12) return 'Content is nested too deeply.';
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && value && (key === 'url' || key === 'canonical' || key.endsWith('_url'))) {
            const isMedia = /^(media|image|video|poster|avatar|cover_image|author_avatar|icon|logo|dark_logo|favicon|og_image)_url$/.test(key);
            if (!(isMedia ? mediaUrl(value) : safeUrl(value))) return `Please enter a valid URL for ${key.replaceAll('_', ' ')}.`;
        }
        const children: Value[] = Array.isArray(value) ? value : [value];
        for (const child of children) {
            if (child && typeof child === 'object' && !Array.isArray(child)) {
                const error = validateContent(child, depth + 1);
                if (error) return error;
            }
        }
    }
    return null;
}
export const safeUrl = (value: string): string => {
    if (!value)
        return '';
    if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\'))
        return value;
    try {
        const u = new URL(value);
        return ['https:', 'http:', 'mailto:', 'tel:'].includes(u.protocol) ? value : '';
    }
    catch {
        return '';
    }
};
export const mediaUrl = (value: string): string => { try {
    const u = new URL(value);
    return u.protocol === 'https:' || (u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname)) ? value : '';
}
catch {
    return value.startsWith('/') && !value.startsWith('//') ? value : '';
} };
const primaryMediaKeys = ['media_url', 'image_url', 'video_url', 'cover_image_url'] as const;
export const contentMediaUrl = (data: Content): string => {
    for (const key of primaryMediaKeys) {
        const value = data[key];
        if (typeof value === 'string' && value) {
            const safe = mediaUrl(value);
            if (safe) return safe;
        }
    }
    return '';
};
const plainData = z.record(z.string().max(100), z.json());
const editableEntryFields = { id: z.uuid(), title: z.string().min(1).max(300), slug: z.string().max(300), status: z.enum(['draft', 'published']), enabled: z.boolean(), sort_order: z.number().int(), data: plainData, page_id: z.uuid().optional(), section_type: z.enum(sectionTypes).optional() } as const;
// Database/read records include metadata. Supabase serializes timestamptz values with an offset,
// so the read schema accepts both Z and +00:00 ISO representations.
export const entrySchema = z.object({ ...editableEntryFields, created_at: z.iso.datetime({ offset: true }), updated_at: z.iso.datetime({ offset: true }) });
// Form and mutation payloads deliberately exclude database-managed timestamps. Zod strips any
// metadata accidentally carried over from a read record before it reaches the persistence layer.
export const createEntrySchema = z.object(editableEntryFields);
export const updateEntrySchema = z.object(editableEntryFields);
export const mutationSchema = z.object({ table: z.enum(tables), action: z.enum(['save', 'delete', 'reorder']), record: updateEntrySchema.optional(), id: z.uuid().optional(), ids: z.array(z.uuid()).max(500).optional() });
export const leadSchema = z.object({ type: z.enum(['demo', 'contact', 'newsletter']), name: z.string().trim().min(2, 'Please enter your name.').max(120), email: z.email('Enter a valid email.').max(254), phone: z.string().max(40).optional().default(''), company: z.string().max(180).default(''), role: z.string().max(100).default(''), specialty: z.string().max(100).default(''), team_size: z.string().max(40).default(''), country: z.string().max(100).default(''), reason: z.string().max(100).default(''), message: z.string().max(4000).default(''), consent: z.literal(true, { error: 'Please agree to be contacted.' }), website: z.string().max(200).default(''), source: z.string().max(500).default(''), utm_source: z.string().max(200).default(''), utm_medium: z.string().max(200).default(''), utm_campaign: z.string().max(200).default(''), utm_term: z.string().max(200).default(''), utm_content: z.string().max(200).default(''), turnstile_token: z.string().max(3000).default('') }).superRefine((v, ctx) => { if (v.type === 'demo') {
    for (const key of ['company', 'role', 'specialty', 'team_size', 'country'] as const)
        if (!v[key])
            ctx.addIssue({ code: 'custom', path: [key], message: 'This field is required.' });
} if (v.type === 'contact' && !v.message.trim())
    ctx.addIssue({ code: 'custom', path: ['message'], message: 'Please tell us how we can help.' }); });
export const themeKeys = ['primary', 'secondary', 'accent', 'background', 'secondary_background', 'surface', 'card', 'text', 'muted', 'border', 'success', 'warning', 'danger', 'heading_font', 'body_font', 'button_radius', 'card_radius', 'input_radius', 'container_width', 'section_spacing', 'navbar_height', 'shadow_intensity'] as const;
export function safeThemeValue(key: string, value: unknown): string | undefined { if (typeof value !== 'string')
    return; if (['heading_font', 'body_font'].includes(key))
    return /^[a-zA-Z ,'-]{1,100}$/.test(value) ? value : undefined; if (key === 'shadow_intensity')
    return /^(0(\.\d{1,2})?|1)$/.test(value) ? value : undefined; if (key.endsWith('radius') || key.endsWith('width') || key.endsWith('spacing') || key.endsWith('height'))
    return /^\d{1,4}(px|rem)$/.test(value) ? value : undefined; return /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : undefined; }
