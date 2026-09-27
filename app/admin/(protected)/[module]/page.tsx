import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDatabase } from '@/lib/data';
import { modules, label } from '@/lib/admin-config';
import { CollectionEditor } from '@/components/admin/editor';
import { Table } from '@/types/cms';
export default async function ModulePage({ params, searchParams }: {
    params: Promise<{
        module: string;
    }>;
    searchParams: Promise<{
        collection?: string;
    }>;
}) { const { module } = await params; const config = modules[module]; if (!config)
    notFound(); const { collection } = await searchParams; const selected = collection && config.extra?.includes(collection as Table) ? collection as Table : config.table; const db = await getDatabase(true); return <>{config.extra && <nav className="module-tabs" aria-label="Content collections">{[config.table, ...config.extra].map(t => <Link key={t} className={t === selected ? 'active' : ''} href={`/admin/${module}?collection=${t}`}>{label(t)}</Link>)}</nav>}<CollectionEditor key={selected + module} table={selected} initial={db[selected] ?? []} title={selected === config.table ? config.title : label(selected)} description={config.description} fields={config.fields} plans={db.pricing_plans} allowAdd={!['site_settings', 'theme_settings', 'leads'].includes(selected) && module !== 'animations' && module !== 'seo'}/></>; }
