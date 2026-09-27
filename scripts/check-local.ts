// Integration checks against the local development server. Creates and cleans up only its own test records.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const base = 'http://127.0.0.1:3000';
async function post(path: string, body: unknown, cookie = '', origin = base) { return fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', origin, ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body) }); }
async function run() {
    const denied = await post('/api/admin', { table: 'features', action: 'delete', id: crypto.randomUUID() });
    assert.equal(denied.status, 401);
    const csrf = await post('/api/auth', { action: 'demo' }, '', 'https://another.example');
    assert.equal(csrf.status, 403);
    const auth = await post('/api/auth', { action: 'demo' });
    assert.equal(auth.status, 200);
    const cookie = auth.headers.get('set-cookie')!.split(';')[0];
    const now = new Date().toISOString();
    const page = { id: crypto.randomUUID(), title: 'CMS integration check', slug: '/qa-cms-check', status: 'draft', enabled: true, sort_order: 999, data: { seo_title: 'QA test', seo_description: 'Temporary integration check', index: false }, created_at: now, updated_at: now };
    const section = { id: crypto.randomUUID(), title: 'Integration section', slug: 'integration-section', status: 'published', enabled: true, sort_order: 0, page_id: page.id, section_type: 'RichTextSection', data: { heading: 'Verified CMS update', description: 'Temporary test content' }, created_at: now, updated_at: now };
    try {
        for (const [table, record] of [['pages', page], ['page_sections', section]]) {
            const response = await post('/api/admin', { table, action: 'save', record }, cookie);
            assert.equal(response.status, 200, await response.text());
        }
        const draftHtml = await (await fetch(base + page.slug)).text();
        assert.ok(!draftHtml.includes('Verified CMS update'), 'Draft content must not be public');
        assert.ok(draftHtml.includes('A SMALL DETOUR'), 'Draft route must render the not-found view');
        page.status = 'published';
        assert.equal((await post('/api/admin', { table: 'pages', action: 'save', record: page }, cookie)).status, 200);
        let html = await (await fetch(base + page.slug)).text();
        assert.ok(html.includes('Verified CMS update'));
        section.enabled = false;
        assert.equal((await post('/api/admin', { table: 'page_sections', action: 'save', record: section }, cookie)).status, 200);
        html = await (await fetch(base + page.slug)).text();
        assert.ok(!html.includes('Verified CMS update'), 'Hidden section must not render');
        const lead = await post('/api/leads', { type: 'contact', name: 'CMS QA test', email: 'qa-local@example.com', company: 'Synthetic test', message: 'Temporary local integration test.', consent: true, source: '/connect' });
        assert.equal(lead.status, 200, await lead.text());
        const db = JSON.parse(await readFile('.demo/content.json', 'utf8'));
        const saved = db.leads.find((l: {
            title: string;
        }) => l.title === 'CMS QA test');
        assert.ok(saved, 'Lead persisted');
        saved.data.lead_status = 'Qualified';
        assert.equal((await post('/api/admin', { table: 'leads', action: 'save', record: saved }, cookie)).status, 200);
        const after = JSON.parse(await readFile('.demo/content.json', 'utf8'));
        assert.equal(after.leads.find((l: {
            id: string;
        }) => l.id === saved.id).data.lead_status, 'Qualified');
        assert.equal((await post('/api/admin', { table: 'leads', action: 'delete', id: saved.id }, cookie)).status, 200);
        assert.equal((await post('/api/leads', { type: 'contact', name: 'No consent', email: 'invalid', message: 'test', consent: false })).status, 400);
        console.log('PASS: auth rejection, CSRF, local sign-in, draft visibility, publish, hide, lead persistence, status update, validation.');
    }
    finally {
        await post('/api/admin', { table: 'page_sections', action: 'delete', id: section.id }, cookie);
        await post('/api/admin', { table: 'pages', action: 'delete', id: page.id }, cookie);
    }
}
run().catch(e => { console.error(e); process.exitCode = 1; });
