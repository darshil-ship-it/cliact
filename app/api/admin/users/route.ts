import { sameOrigin } from '@/lib/request-origin';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminIdentity } from '@/lib/auth';
import { configured, supabaseServer } from '@/lib/supabase/server';
export async function POST(req: NextRequest) { if (!sameOrigin(req))
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 }); const identity = await adminIdentity(); if (!configured() || identity?.role !== 'owner')
    return NextResponse.json({ error: 'A connected owner account is required.' }, { status: 403 }); const parsed = z.object({ id: z.uuid(), role: z.enum(['owner', 'editor']), enabled: z.boolean() }).safeParse(await req.json()); if (!parsed.success)
    return NextResponse.json({ error: 'Enter a valid user ID and role.' }, { status: 400 }); const client = await supabaseServer(); const { data: { user } } = await client.auth.getUser(); if (parsed.data.id === user?.id)
    return NextResponse.json({ error: 'Another owner must change your own access.' }, { status: 400 }); const { error } = await client.from('admin_users').upsert(parsed.data); return error ? NextResponse.json({ error: 'Could not update this user. Check that the account exists.' }, { status: 400 }) : NextResponse.json({ ok: true }); }
