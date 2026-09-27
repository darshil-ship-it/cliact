import { sameOrigin } from '@/lib/request-origin';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { localDemo } from '@/lib/auth';
import { configured, supabaseServer } from '@/lib/supabase/server';
export async function POST(req: NextRequest) {
    if (!sameOrigin(req))
        return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
    const body = await req.json();
    if (body.action === 'logout') {
        (await cookies()).delete('nexact-demo');
        if (configured())
            await (await supabaseServer()).auth.signOut();
        return NextResponse.json({ ok: true });
    }
    if (body.action === 'demo' && localDemo()) {
        (await cookies()).set('nexact-demo', 'local-editor', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 3600 });
        return NextResponse.json({ ok: true });
    }
    if (!configured())
        return NextResponse.json({ error: 'Configure Supabase to enable administrator sign-in.' }, { status: 503 });
    if (typeof body.email !== 'string' || typeof body.password !== 'string')
        return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 });
    const client = await supabaseServer();
    const { data, error } = await client.auth.signInWithPassword({ email: body.email, password: body.password });
    if (error)
        return NextResponse.json({ error: 'Sign-in failed. Check your email and password.' }, { status: 401 });
    const { data: admin } = await client.from('admin_users').select('id').eq('id', data.user.id).eq('enabled', true).single();
    if (!admin) {
        await client.auth.signOut();
        return NextResponse.json({ error: 'This account does not have administrator access.' }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
}
