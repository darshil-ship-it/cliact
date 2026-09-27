import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
export const configured = () => {const url=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);const key=Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);if(url!==key)throw new Error('Set both public Supabase environment variables, or leave both empty for the local preview.');return url&&key;};
export async function supabaseServer() {
    const jar = await cookies();
    return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => jar.getAll(), setAll: values => { try {
                values.forEach(({ name, value, options }) => jar.set(name, value, options));
            }
            catch { /* Server components cannot refresh cookies; proxy performs refresh. */ } } } });
}
export function serviceClient() { if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error('Server configuration is incomplete.'); return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }); }
