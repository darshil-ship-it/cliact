import { sameOrigin } from '@/lib/request-origin';
import { NextRequest, NextResponse } from 'next/server';
import { adminIdentity } from '@/lib/auth';
import { deleteEntry, reorderEntries, saveEntry } from '@/lib/data';
import { mutationSchema, validateContent, safeThemeValue, themeKeys } from '@/lib/validators';
export async function POST(req: NextRequest) {
    if (!sameOrigin(req))
        return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
    if (!await adminIdentity())
        return NextResponse.json({ error: 'Please sign in as an administrator.' }, { status: 401 });
    if (Number(req.headers.get('content-length') ?? 0) > 1000000)
        return NextResponse.json({ error: 'Record is too large.' }, { status: 413 });
    try {
        const parsed = mutationSchema.safeParse(await req.json());
        if (!parsed.success)
            return NextResponse.json({ error: 'Please check the record fields.', details: parsed.error.flatten() }, { status: 400 });
        const { action, table, record, id, ids } = parsed.data;
        if (record) {
            const contentError = validateContent(record.data);
            if (contentError) return NextResponse.json({ error: contentError }, { status: 400 });
            if (table === 'theme_settings') {
                for (const key of themeKeys) {
                    if (key in record.data && !safeThemeValue(key, record.data[key])) return NextResponse.json({ error: `Invalid theme value: ${key}.` }, { status: 400 });
                }
            }
            if (table === 'pages' && (!/^\/(?!\/)[a-z0-9/-]*$/.test(record.slug) || /^\/(admin|api|_next)(\/|$)/.test(record.slug))) return NextResponse.json({ error: 'Use a valid public page path, beginning with /.' }, { status: 400 });
            if (table === 'blog_posts' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) return NextResponse.json({ error: 'Article slugs should use lowercase letters, numbers, and single hyphens.' }, { status: 400 });
        }
        if (table === 'leads' && record && !['New', 'Contacted', 'Qualified', 'Won', 'Lost', 'Spam'].includes(String(record.data.lead_status)))
            return NextResponse.json({ error: 'Invalid lead status.' }, { status: 400 });
        if (action === 'save' && record) {
            if (table === 'page_sections' && (!record.page_id || !record.section_type))
                throw new Error('Select a page and section type.');
            const saved = await saveEntry(table, record);
            return NextResponse.json({ ok: true, record: saved });
        }
        else if (action === 'delete' && id)
            await deleteEntry(table, id);
        else if (action === 'reorder' && ids)
            await reorderEntries(table, ids);
        else
            return NextResponse.json({ error: 'Incomplete request.' }, { status: 400 });
        return NextResponse.json({ ok: true });
    }
    catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Unable to save. Please try again.' }, { status: 500 });
    }
}
