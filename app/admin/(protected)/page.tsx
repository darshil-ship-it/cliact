import { getDatabase } from '@/lib/data';
import { configured, supabaseServer } from '@/lib/supabase/server';
import { Dashboard } from '@/components/admin/dashboard';
export default async function Admin() { const db = await getDatabase(true); let views = 0, blogViews = 0; if (configured()) {
    const client = await supabaseServer();
    const [a, b] = await Promise.all([client.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'page_view'), client.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'blog_view')]);
    views = a.count ?? 0;
    blogViews = b.count ?? 0;
} return <Dashboard db={db} views={views} blogViews={blogViews} demo={!configured()}/>; }
