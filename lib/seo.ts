import type { Metadata } from 'next';
import { Entry, text } from '@/types/cms';
import { mediaUrl } from './validators';
export function metadataFor(page: Entry): Metadata { const title = text(page.data, 'seo_title', page.title); const description = text(page.data, 'seo_description', text(page.data, 'excerpt', 'Thoughtful technology for modern healthcare.')); const canonical = text(page.data, 'canonical') || page.slug; const image = mediaUrl(text(page.data, 'og_image_url', text(page.data, 'cover_image_url'))); return { title: { absolute: title }, description, alternates: { canonical }, robots: { index: page.data.index !== false, follow: page.data.follow !== false }, openGraph: { title, description, url: canonical, ...(image ? { images: [image] } : {}) }, twitter: { card: image ? 'summary_large_image' : 'summary', title, description, ...(image ? { images: [image] } : {}) } }; }
export const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
