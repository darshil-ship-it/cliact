import 'server-only';
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';
import { Database, EditableEntry, Entry, tables } from '@/types/cms';
import { createSeed } from '@/lib/demo/seed';
import { configured, supabaseServer } from '@/lib/supabase/server';
const demoPath = path.join(process.cwd(), '.demo', 'content.json');
let writes: Promise<unknown> = Promise.resolve();
async function demoRead(): Promise<Database> { if (process.env.NODE_ENV !== 'development')
    return createSeed(); try {
    return JSON.parse(await readFile(demoPath, 'utf8'));
}
catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT')
        throw e;
    return createSeed();
} }
export async function demoChange(fn: (db: Database) => void) { if (process.env.NODE_ENV !== 'development')
    throw new Error('Demo writes are disabled outside local development.'); const task = writes.then(async () => { const db = await demoRead(); fn(db); await mkdir(path.dirname(demoPath), { recursive: true }); await writeFile(demoPath + '.tmp', JSON.stringify(db, null, 2)); await rename(demoPath + '.tmp', demoPath); }); writes = task.catch(() => { }); await task; }
export const getDatabase = cache(async (admin = false): Promise<Database> => {
    if (!configured()) {
        const db = await demoRead();
        return Object.fromEntries(Object.entries(db).map(([k, rows]) => [k, (admin ? rows : rows.filter(r => r.enabled && r.status === 'published' && k !== 'leads')).sort((a,b)=>a.sort_order-b.sort_order)])) as Database;
    }
    const client = await supabaseServer();
    const all = await Promise.all(tables.filter(t => admin || t !== 'leads').map(async (table) => { let query = client.from(table).select('*').order('sort_order'); if (!admin)
        query = query.eq('enabled', true).eq('status', 'published'); const { data, error } = await query; if (error)
        throw new Error(`Unable to load ${table}: [${error.code ?? 'unknown'}] ${error.message}${error.hint ? ` Hint: ${error.hint}` : ''}`); return [table, data ?? []]; }));
    return Object.fromEntries(all);
});
export async function saveEntry(table: string, record: EditableEntry): Promise<Entry> { if (!configured()) {
    let saved!: Entry;
    await demoChange(db => { const index = db[table].findIndex(r => r.id === record.id); const now = new Date().toISOString(); const existing = index < 0 ? undefined : db[table][index]; saved = { ...record, created_at: existing?.created_at ?? now, updated_at: now }; if (index < 0)
        db[table].push(saved);
    else
        db[table][index] = saved; });
    return saved;
} const client = await supabaseServer(); const { data, error } = await client.from(table).upsert(record).select('*').single(); if (error)
    throw new Error(error.message); return data as Entry; }
export async function deleteEntry(table: string, id: string) { if (!configured())
    return demoChange(db => { db[table] = db[table].filter(r => r.id !== id); if (table === 'pages')
        db.page_sections = db.page_sections.filter(r => r.page_id !== id); }); const { error } = await (await supabaseServer()).from(table).delete().eq('id', id); if (error)
    throw new Error(error.message); }
export async function reorderEntries(table: string, ids: string[]) { if (!configured())
    return demoChange(db => { ids.forEach((id, i) => { const row = db[table].find(r => r.id === id); if (row)
        row.sort_order = i; }); }); const { error } = await (await supabaseServer()).rpc('reorder_content', { target_table: table, ordered_ids: ids }); if (error)
    throw new Error(error.message); }
export const getPage = cache(async (slug: string) => { const db = await getDatabase(); const page = db.pages.find(p => p.slug === slug); return { db, page, sections: page ? db.page_sections.filter(s => s.page_id === page.id).sort((a, b) => a.sort_order - b.sort_order) : [] }; });

