import { getPage } from '@/lib/data';
import { Sections } from '@/components/sections/renderer';
import { metadataFor } from '@/lib/seo';
export const dynamic = 'force-dynamic';
export async function generateMetadata() { const { page } = await getPage('/'); return page ? metadataFor(page) : {}; }
export default async function Home() { const { sections, db } = await getPage('/'); return <Sections sections={sections} db={db}/>; }
