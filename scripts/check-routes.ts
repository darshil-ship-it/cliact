import assert from 'node:assert/strict';
import { createSeed } from '../lib/demo/seed';
import { modules } from '../lib/admin-config';
const base = 'http://127.0.0.1:3000';
async function run() {
    const auth = await fetch(base + '/api/auth', { method: 'POST', headers: { origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'demo' }) });
    const cookie = auth.headers.get('set-cookie')?.split(';')[0] ?? '';
    assert.ok(cookie);
    const db = createSeed();
    const routes = [...db.pages.map(p => p.slug), ...db.blog_posts.map(p => '/resources/blog/' + p.slug), '/book-demo', '/connect', '/admin', '/admin/users', ...Object.keys(modules).map(m => '/admin/' + m)];
    for (const route of routes) {
        const response = await fetch(base + route, { headers: { cookie } });
        const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
        assert.equal(response.status, 200, route);
        assert.ok(!html.includes('<h1>A little interruption.</h1>'), `Error boundary: ${route}`);
        assert.ok(!html.includes('404 · A SMALL DETOUR'), `Unexpected 404: ${route}`);
        assert.ok(html.includes('<h1'), `Missing main heading: ${route}`);
    }
    const sitemap = await (await fetch(base + '/sitemap.xml')).text();
    assert.ok(sitemap.includes('/resources/blog/'));
    assert.ok(!sitemap.includes('/admin'));
    console.log(`PASS: ${routes.length} public/article/admin routes and sitemap.`);
}
run().catch(error => { console.error(error); process.exitCode = 1; });

