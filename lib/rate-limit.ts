import 'server-only';
import { createHmac } from 'node:crypto';
import { NextRequest } from 'next/server';
import { configured, serviceClient } from './supabase/server';
const buckets = new Map<string, {
    count: number;
    until: number;
}>();
export async function rateLimit(request: NextRequest, purpose: string, email = '', maximum = 5) { const secret = process.env.RATE_LIMIT_SECRET; if (configured() && !secret)
    throw new Error('Rate limiting is not configured. Please contact the site administrator.'); const ip = request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'; const identities = [`${purpose}:ip:${ip}`, `${purpose}:email:${email.toLowerCase()}`]; for (const identity of identities) {
    const key = createHmac('sha256', secret || 'local-development-only').update(identity).digest('hex');
    if (configured()) {
        const { data, error } = await serviceClient().rpc('consume_rate_limit', { bucket_key: key, maximum, window_seconds: 3600 });
        if (error)
            throw new Error('Unable to check request limits. Please try later.');
        if (!data)
            return false;
    }
    else {
        const now = Date.now();
        if (buckets.size > 1000)
            for (const [k, v] of buckets)
                if (v.until < now)
                    buckets.delete(k);
        const current = buckets.get(key);
        if (current && current.until > now) {
            if (current.count >= maximum)
                return false;
            current.count++;
        }
        else
            buckets.set(key, { count: 1, until: now + 3600000 });
    }
} return true; }
