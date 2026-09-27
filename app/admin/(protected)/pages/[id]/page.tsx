import { getDatabase } from '@/lib/data';
import { CollectionEditor } from '@/components/admin/editor';
import { notFound } from 'next/navigation';
import Link from 'next/link';
export default async function PageBuilder({ params }: {
    params: Promise<{
        id: string;
    }>;
}) { const { id } = await params; const db = await getDatabase(true); const page = db.pages.find(p => p.id === id); if (!page)
    notFound(); return <><div className="builder-top"><Link className="text-link" href="/admin/pages">← All pages</Link><Link className="button button-outline button-small" href={page.slug} target="_blank">Preview published page ↗</Link></div><CollectionEditor table="page_sections" initial={db.page_sections.filter(s => s.page_id === id)} title={page.title} description="Edit the story, shape the order, and make every section yours." pageId={id}/></>; }
