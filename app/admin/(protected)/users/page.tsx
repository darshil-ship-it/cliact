import { adminIdentity } from '@/lib/auth';
import { configured, supabaseServer } from '@/lib/supabase/server';
import { AdminUsers } from '@/components/admin/users';
export default async function Users() { const identity = await adminIdentity(); const { data, error } = configured() ? await (await supabaseServer()).from('admin_users').select('id,role,enabled') : { data: [], error: null }; if (error)
    throw new Error('Could not load administrators.'); return <AdminUsers users={data ?? []} demo={!configured()} owner={identity?.role === 'owner'}/>; }
