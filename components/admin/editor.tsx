'use client';
import { useCmsTools } from '@/hooks/use-cms-tools';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Save, Plus, Trash2, Copy, Eye, EyeOff, GripVertical, ArrowUp, ArrowDown, ArrowUpRight, Search, FileText } from 'lucide-react';
import Link from 'next/link';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Content, Entry, Table, sectionTypes } from '@/types/cms';
import { defaults, label, sectionTypeDefaults } from '@/lib/admin-config';
import { DataFields } from './fields';
import { ComparisonFields } from './comparison-fields';
import { updateEntrySchema } from '@/lib/validators';
type MutationResult = { ok: true; record?: Entry };
export async function mutate(payload: unknown): Promise<MutationResult> { const response = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const data = await response.json(); if (!response.ok)
    throw new Error(data.error || 'Could not save changes.'); return data as MutationResult; }
function SortableRow({ entry, children }: {
    entry: Entry;
    children: React.ReactNode;
}) { const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: entry.id }); return <div className="cms-row" ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}><button className="drag-handle" aria-label={`Reorder ${entry.title}`} {...attributes} {...listeners}><GripVertical size={18}/></button>{children}</div>; }
export function RecordDialog({ entry, table, onClose, onSaved, fields, plans = [] }: {
    entry: Entry;
    table: Table;
    onClose: () => void;
    onSaved: (entry: Entry) => void;
    fields?: string[];
    plans?: Entry[];
}) {
    const [record, setRecord] = useState({ ...entry, data: { ...structuredClone(defaults[table] ?? {}), ...(table === 'page_sections' ? sectionTypeDefaults(entry.section_type || 'FeatureGrid') : {}), ...entry.data } });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [advanced, setAdvanced] = useState(false);
    const [raw, setRaw] = useState(JSON.stringify(entry.data, null, 2));
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => { const el = dialog.current; el?.showModal(); return () => el?.close(); }, []);
    async function save() { setError(''); let final = record; try {
        if (advanced)
            final = { ...record, data: JSON.parse(raw) as Content };
        const validated = updateEntrySchema.safeParse(final);
        if (!validated.success)
            throw new Error(validated.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n'));
        if (table === 'pages' && (!final.slug.startsWith('/') || final.slug.startsWith('//')))
            throw new Error('Page paths must begin with a single /.');
        setBusy(true);
        const result = await mutate({ table, action: 'save', record: validated.data });
        onSaved(result.record ?? { ...entry, ...validated.data, updated_at: new Date().toISOString() });
        onClose();
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to save.');
    }
    finally {
        setBusy(false);
    } }
    return <dialog ref={dialog} className="record-dialog" onCancel={e => { e.preventDefault(); if (!busy)
        onClose(); }}><div className="dialog-header"><div><span className="eyebrow">{label(table)}</span><h2>{entry.title}</h2></div><button className="icon-button" disabled={busy} onClick={onClose} aria-label="Close editor"><X size={19}/></button></div><div className="dialog-body"><div className="form-grid"><label className="field full"><span>{table === 'pages' ? 'Page title' : table === 'page_sections' ? 'Section name' : 'Title / name'} *</span><input required value={record.title} onChange={e => setRecord({ ...record, title: e.target.value })}/></label>{!fields && <><label className="field"><span>{table === 'pages' ? 'Page path' : 'Slug'}</span><input value={record.slug} onChange={e => setRecord({ ...record, slug: e.target.value })}/></label><label className="field"><span>Publication status</span><select value={record.status} onChange={e => setRecord({ ...record, status: e.target.value as Entry['status'] })}><option value="draft">Draft</option><option value="published">Published</option></select></label><label className="toggle-field"><span>Enabled / visible</span><input type="checkbox" role="switch" checked={record.enabled} onChange={e => setRecord({ ...record, enabled: e.target.checked })}/></label>{table === 'page_sections' && <label className="field"><span>Section type</span><select value={record.section_type} onChange={e => setRecord({ ...record, section_type: e.target.value, data: { ...record.data, ...sectionTypeDefaults(e.target.value) } })}>{sectionTypes.map(t => <option key={t}>{t}</option>)}</select></label>}</>}</div><details className="record-info"><summary>Record information</summary><label className="field"><span>Record ID (for linking related content)</span><input readOnly value={record.id} onFocus={e=>e.target.select()}/></label></details><div className="editor-divider"/>{advanced ? <label className="field"><span>Advanced content JSON</span><textarea className="json-input" rows={22} value={raw} onChange={e => setRaw(e.target.value)}/></label> : table === 'comparison_features' ? <ComparisonFields data={record.data} plans={plans} onChange={data => setRecord({...record,data})}/> : <DataFields data={record.data} onChange={data => setRecord({ ...record, data })} only={fields} theme={table === 'theme_settings'}/>}<button className="text-link advanced-toggle" onClick={() => { if (!advanced) {
        setRaw(JSON.stringify(record.data, null, 2));
        setAdvanced(true);
    }
    else {
        try {
            setRecord({ ...record, data: JSON.parse(raw) });
            setAdvanced(false);
            setError('');
        }
        catch {
            setError('Fix the JSON before returning to visual fields.');
        }
    } }}>{advanced ? 'Return to visual fields' : 'Advanced JSON editor'}</button>{error && <div role="alert" className="form-error">{error}</div>}</div><div className="dialog-footer"><span>Changes apply when saved.</span><button className="button button-outline" disabled={busy} onClick={onClose}>Cancel</button><button className="button button-primary" disabled={busy} onClick={save}><Save size={16}/>{busy ? 'Saving…' : 'Save changes'}</button></div></dialog>;
}
export function CollectionEditor({ table, initial, title, description, pageId, fields, allowAdd = true, plans = [] }: {
    table: Table;
    initial: Entry[];
    title: string;
    description: string;
    pageId?: string;
    fields?: string[];
    plans?: Entry[];
    allowAdd?: boolean;
}) {
    const router = useRouter();
    const [rows, setRows] = useState([...initial].sort((a, b) => a.sort_order - b.sort_order));
    const [editing, setEditing] = useState<Entry | null>(null);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [busy, setBusy] = useState(false);
    const [deleting, setDeleting] = useState<Entry | null>(null);
    const deleteDialog = useRef<HTMLDialogElement>(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    useEffect(() => { if (deleting)
        deleteDialog.current?.showModal();
    else
        deleteDialog.current?.close(); }, [deleting]);
    useCmsTools(rows, setEditing);
    const filtered = rows.filter(r => (r.title + ' ' + JSON.stringify(r.data)).toLowerCase().includes(query.toLowerCase()) && (status === 'all' || (table === 'leads' ? r.data.lead_status : r.status) === status));
    function saved(record: Entry) { setRows(old => old.some(r => r.id === record.id) ? old.map(r => r.id === record.id ? record : r) : [...old, record]); setNotice('Changes saved.'); router.refresh(); }
    async function action(fn: () => Promise<void>) { setError(''); setNotice(''); setBusy(true); try {
        await fn();
        router.refresh();
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to save.');
    }
    finally {
        setBusy(false);
    } }
    function create() { const now = new Date().toISOString(); setEditing({ id: crypto.randomUUID(), title: table === 'page_sections' ? 'New section' : `New ${label(table).replace(/s$/, '')}`, slug: table === 'pages' ? '/new-page' : 'new-item', status: 'draft', enabled: true, sort_order: rows.length ? Math.max(...rows.map(r => r.sort_order)) + 1 : 0, data: structuredClone(defaults[table] ?? {}), created_at: now, updated_at: now, ...(pageId ? { page_id: pageId, section_type: 'FeatureGrid' } : {}) }); }
    async function reorder(ids: string[]) { await action(async () => { await mutate({ table, action: 'reorder', ids }); setRows(ids.map((id, i) => ({ ...rows.find(r => r.id === id)!, sort_order: i }))); setNotice('Order updated.'); }); }
    async function dragEnd(event: DragEndEvent) { if (!event.over || event.active.id === event.over.id || query || status !== 'all')
        return; const ids = rows.map(r => r.id); await reorder(arrayMove(ids, ids.indexOf(String(event.active.id)), ids.indexOf(String(event.over.id)))); }
    return <div><div className="admin-page-heading"><div><span className="eyebrow">{table === 'page_sections' ? 'PAGE BUILDER' : 'YOUR CONTENT'}</span><h1>{title}</h1><p>{description}</p></div>{allowAdd && <button onClick={create} className="button button-primary"><Plus size={17}/>{table === 'page_sections' ? 'Add section' : table === 'pages' ? 'Add page' : 'Add new'}</button>}</div>{error && <div role="alert" className="form-error">{error}</div>}{notice && <p role="status" className="save-notice">{notice}</p>}<div className="collection-toolbar"><label><Search size={17}/><input aria-label="Search records" placeholder="Find something…" value={query} onChange={e => setQuery(e.target.value)}/></label><div><span>{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</span><select aria-label="Filter by status" value={status} onChange={e => setStatus(e.target.value)}><option value="all">All statuses</option>{(table === 'leads' ? ['New', 'Contacted', 'Qualified', 'Won', 'Lost', 'Spam'] : ['published', 'draft']).map(s => <option key={s}>{s}</option>)}</select></div></div><DndContext id={'cms-' + table + '-' + (pageId ?? 'collection')} sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}><SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}><div className="cms-rows">{filtered.map(row => <SortableRow entry={row} key={row.id}><div className="row-icon"><FileText size={19}/></div><div className="row-title"><b>{row.title}</b><small>{table === 'leads' ? `${String(row.data.email)} · ${String(row.data.type)} · ${String(row.data.company || '')}` : row.section_type || row.slug || label(table)}</small></div><span className={`status-chip ${row.enabled && row.status === 'published' ? 'published' : ''}`}>{table === 'leads' ? String(row.data.lead_status) : !row.enabled ? 'Hidden' : row.status}</span><div className="row-actions">{table === 'pages' && <Link className="button button-outline button-small" href={`/admin/pages/${row.id}`}>Sections <ArrowUpRight size={14}/></Link>}<button className="button button-outline button-small" onClick={() => setEditing(row)}>{table === 'leads' ? 'View / update' : 'Edit'}</button>{table !== 'leads' && <><button title={row.enabled ? 'Hide' : 'Show'} className="row-icon-button" disabled={busy} onClick={() => action(async () => { const record = updateEntrySchema.parse({ ...row, enabled: !row.enabled }); const result = await mutate({ table, action: 'save', record }); saved(result.record ?? { ...row, ...record, updated_at: new Date().toISOString() }); })}>{row.enabled ? <Eye size={16}/> : <EyeOff size={16}/>}</button><button title="Duplicate" className="row-icon-button" disabled={busy} onClick={() => action(async () => { const now = new Date().toISOString(); const record = updateEntrySchema.parse({ ...row, id: crypto.randomUUID(), title: row.title + ' (copy)', slug: row.slug + '-copy-' + Date.now().toString(36), sort_order: Math.max(...rows.map(r => r.sort_order)) + 1, status: 'draft' }); const result = await mutate({ table, action: 'save', record }); saved(result.record ?? { ...record, created_at: now, updated_at: now }); })}><Copy size={16}/></button></>}<button title="Delete" className="row-icon-button danger" onClick={() => setDeleting(row)}><Trash2 size={16}/></button><div className="row-order-buttons"><button className="row-icon-button" title="Move up" disabled={busy || rows.indexOf(row) === 0 || Boolean(query) || status !== 'all'} onClick={() => reorder(arrayMove(rows.map(r => r.id), rows.indexOf(row), rows.indexOf(row) - 1))}><ArrowUp size={15}/></button><button className="row-icon-button" title="Move down" disabled={busy || rows.indexOf(row) === rows.length - 1 || Boolean(query) || status !== 'all'} onClick={() => reorder(arrayMove(rows.map(r => r.id), rows.indexOf(row), rows.indexOf(row) + 1))}><ArrowDown size={15}/></button></div></div></SortableRow>)}</div></SortableContext></DndContext>{!filtered.length && <div className="admin-panel dashboard-empty"><FileText size={28}/><h3>{query ? 'No matches this time.' : 'A fresh start.'}</h3><p>{query ? 'Try a different search.' : 'Your content will appear here.'}</p>{allowAdd && <button className="text-link" onClick={create}><Plus size={16}/>Create your first item</button>}</div>}{table === 'page_sections' && <p className="field-hint builder-help">Drag the handle to reorder, or focus it and use Space + arrow keys. Changes affect this page only.</p>}{editing && <RecordDialog key={editing.id} entry={editing} table={table} fields={fields} plans={plans} onClose={() => setEditing(null)} onSaved={saved}/>}<dialog className="confirm-dialog" ref={deleteDialog} onCancel={() => setDeleting(null)}><h2>Delete {deleting?.title}?</h2><p>This removes the record{table === 'pages' ? ' and its sections' : ''}. This action cannot be undone.</p><div className="button-row"><button className="button button-outline" onClick={() => setDeleting(null)}>Keep it</button><button className="button button-danger" disabled={busy} onClick={() => action(async () => { if (!deleting)
        return; await mutate({ table, action: 'delete', id: deleting.id }); setRows(old => old.filter(r => r.id !== deleting.id)); setDeleting(null); setNotice('Record deleted.'); })}>Delete record</button></div></dialog></div>;
}

