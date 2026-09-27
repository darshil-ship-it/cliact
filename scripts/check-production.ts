// Run against `npm run start -- --port 3001` without Supabase credentials.
import assert from 'node:assert/strict';
const base = 'http://127.0.0.1:3001';
const post = (path: string, body: unknown, cookie = '') => fetch(base + path, {
    method: 'POST', headers: { 'content-type': 'application/json', origin: base, cookie }, body: JSON.stringify(body),
});
async function run() {
    assert.equal((await fetch(base)).status, 200);
    assert.equal((await post('/api/auth', { action: 'demo' })).status, 503);
    assert.equal((await post('/api/admin', { table: 'features', action: 'delete', id: crypto.randomUUID() }, 'nexact-demo=local-editor')).status, 401);
    assert.equal((await post('/api/leads', { type: 'contact', name: 'Production guard test', email: 'guard@example.com', message: 'Synthetic guard test', consent: true, source: '/connect' })).status, 503);
    const admin = await fetch(base + '/admin', { redirect: 'manual', headers: { cookie: 'nexact-demo=local-editor' } });
    const html = await admin.text();
    // A streaming Next.js response may deliver its redirect in HTML after headers.
    assert.ok(admin.headers.get('location')?.includes('/admin/login') || html.includes('NEXT_REDIRECT;replace;/admin/login;307;'));
    assert.ok(!html.includes('Quick actions'), 'Private dashboard content must not render');
    console.log('PASS: production homepage, disabled demo login, rejected forged demo cookie, protected admin, unconfigured form rejection.');
}
run().catch(e => { console.error(e); process.exitCode = 1; });
