import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { createSeed } from '../lib/demo/seed';
loadEnvConfig(process.cwd());
async function main() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY; if (!url || !key)
    throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.'); const client = createClient(url, key, { auth: { persistSession: false } }); for (const [table, rows] of Object.entries(createSeed())) {
    if (!rows.length)
        continue;
    const { count, error: countError } = await client.from(table).select('id', { count: 'exact', head: true });
    if (countError)
        throw countError;
    if (count) {
        console.log(`Keeping existing ${table} (${count} records)`);
        continue;
    }
    const { error } = await client.from(table).insert(rows);
    if (error)
        throw new Error(`${table}: ${error.message}`);
    console.log(`Seeded ${table}: ${rows.length}`);
} console.log('Seed complete. Demo claims remain clearly labeled.'); }
main().catch(e => { console.error(e.message); process.exitCode = 1; });
