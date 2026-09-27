import { sameOrigin } from '@/lib/request-origin';
import { NextRequest, NextResponse } from 'next/server';
import { configured, serviceClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
export async function POST(req: NextRequest) { if (!sameOrigin(req))
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 }); if (!configured())
    return NextResponse.json({ ok: true }); try {
    const { path } = await req.json();
    if (typeof path !== 'string' || !path.startsWith('/') || path.length > 500 || path.startsWith('/admin'))
        return NextResponse.json({ error: 'Invalid path.' }, { status: 400 });
    if (!await rateLimit(req, 'event', 'aggregate', 500))
        return NextResponse.json({ error: 'Rate limited.' }, { status: 429 });
    const client = serviceClient();
    const events = [{ path, event_type: 'page_view' }, ...(path.startsWith('/resources/blog/') ? [{ path, event_type: 'blog_view' }] : [])];
    const { error } = await client.from('analytics_events').insert(events);
    if (error)
        throw error;
    return NextResponse.json({ ok: true });
}
catch {
    return NextResponse.json({ error: 'Event unavailable.' }, { status: 503 });
} }
