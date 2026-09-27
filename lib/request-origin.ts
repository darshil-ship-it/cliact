import type { NextRequest } from 'next/server';
// Next.js may normalize req.url to localhost behind its development proxy.
// Compare the browser Origin to the actual Host header; never trust forwarded hosts.
export function sameOrigin(req: NextRequest) { const origin = req.headers.get('origin'); if (!origin)
    return false; try {
    const url = new URL(origin);
    return url.host === req.headers.get('host') && ['http:', 'https:'].includes(url.protocol);
}
catch {
    return false;
} }
