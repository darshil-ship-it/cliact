'use client';
import { useEffect } from 'react';
import { Entry } from '@/types/cms';
type ModelContext = {
    registerTool: (tool: {
        name: string;
        title: string;
        description: string;
        inputSchema: object;
        annotations: {
            readOnlyHint: boolean;
            untrustedContentHint: boolean;
        };
        execute: (input: unknown) => unknown;
    }, options: {
        signal: AbortSignal;
    }) => void | Promise<void>;
};
export function useCmsTools(rows: Entry[], open: (entry: Entry) => void) { useEffect(() => { const context = (document as Document & {
    modelContext?: ModelContext;
}).modelContext; if (!context)
    return; const lifecycle = new AbortController(); const tools = [{ name: 'list_cms_records', title: 'List current CMS records', description: 'Read records in the current CMS collection. Does not change content.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: true }, execute: () => rows.map(r => ({ id: r.id, title: r.title, status: r.status, enabled: r.enabled })) }, { name: 'open_cms_record_editor', title: 'Open a CMS record for editing', description: 'Open an existing record in the visible editor. Does not save or publish changes.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: true }, execute: (input: unknown) => { if (!input || typeof input !== 'object' || !('id' in input) || typeof input.id !== 'string')
            throw new Error('A record ID is required.'); const record = rows.find(r => r.id === input.id); if (!record)
            throw new Error('Record not found in this collection.'); open(record); return { opened: true, id: record.id, saved: false }; } }]; for (const tool of tools) {
    try {
        void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => { });
    }
    catch { /* Optional browser capability. */ }
} return () => lifecycle.abort(); }, [rows, open]); }
