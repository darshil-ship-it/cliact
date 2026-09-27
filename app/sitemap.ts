import type { MetadataRoute } from 'next';
import { getDatabase } from '@/lib/data';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const db = await getDatabase(); const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; return [...db.pages.filter(p => p.data.index !== false).map(p => ({ url: base + p.slug, lastModified: p.updated_at })), ...db.blog_posts.filter(p => p.data.index !== false).map(p => ({ url: `${base}/resources/blog/${p.slug}`, lastModified: p.updated_at }))]; }
