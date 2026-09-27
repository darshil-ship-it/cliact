import 'server-only';
import { cookies } from 'next/headers';
import { configured, supabaseServer } from '@/lib/supabase/server';
export const localDemo = () => !configured() && process.env.NODE_ENV === 'development';
export async function adminIdentity() {
    if (localDemo())
        return (await cookies()).get('nexact-demo')?.value === 'local-editor' ? { email: 'Local demo editor', role: 'owner', demo: true } : null;
    if (!configured())
        return null;
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user)
        return null;
    const { data } = await supabase.from('admin_users').select('role,enabled').eq('id', user.id).eq('enabled', true).single();
    return data ? { email: user.email ?? 'Admin', role: data.role as string, demo: false } : null;
}
