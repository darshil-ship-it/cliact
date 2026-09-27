import { sameOrigin } from '@/lib/request-origin';
import { NextRequest, NextResponse } from 'next/server';
import { leadSchema } from '@/lib/validators';
import { configured, serviceClient } from '@/lib/supabase/server';
import { demoChange } from '@/lib/data';
import { localDemo } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
export async function POST(req: NextRequest) { if (!sameOrigin(req))
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 }); if (Number(req.headers.get('content-length') ?? 0) > 16000)
    return NextResponse.json({ error: 'Your message is too long.' }, { status: 413 }); try {
    const checked = leadSchema.safeParse(await req.json());
    if (!checked.success)
        return NextResponse.json({ error: 'Please check the required form fields.', details: checked.error.flatten() }, { status: 400 });
    const body = checked.data;
    if (body.website)
        return NextResponse.json({ error: 'Unable to submit this request.' }, { status: 400 });
    if (!configured() && !localDemo())
        return NextResponse.json({ error: 'This preview is not accepting submissions yet. Please try again after the site is connected.' }, { status: 503 });
    if (!await rateLimit(req, 'lead', body.email))
        return NextResponse.json({ error: 'Too many requests. Please try again in an hour.' }, { status: 429 });
    if (process.env.TURNSTILE_SECRET_KEY) {
        const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: body.turnstile_token }) });
        const result = await check.json();
        if (!result.success)
            return NextResponse.json({ error: 'Please complete the verification and try again.' }, { status: 400 });
    }
    const data = { ...body, lead_status: 'New', consented_at: new Date().toISOString(), demo: !configured() };
    delete (data as Partial<typeof data>).website;
    delete (data as Partial<typeof data>).turnstile_token;
    const now = new Date().toISOString();
    const row = { id: crypto.randomUUID(), title: body.name, slug: '', status: 'draft' as const, enabled: true, sort_order: 0, data, created_at: now, updated_at: now };
    if (configured()) {
        const { error } = await serviceClient().from('leads').insert(row);
        if (error)
            throw new Error('We couldn’t save your message. Please try again.');
    }
    else
        await demoChange(db => db.leads.push(row));
    return NextResponse.json({ ok: true, message: configured() ? 'Your request has been saved for the Cliact team.' : 'Saved to the local demo inbox. No message was sent to a live team.' });
}
catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unable to send. Please try again.' }, { status: 500 });
} }
