import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { getPage, getDatabase } from '@/lib/data';
import { metadataFor, jsonLd } from '@/lib/seo';
import { Sections } from '@/components/sections/renderer';
import { ArticleArt } from '@/components/sections/blog';
import { text, strings } from '@/types/cms';
export const dynamic = 'force-dynamic';
type Props = {
    params: Promise<{
        slug: string[];
    }>;
};
export async function generateMetadata({ params }: Props) { const slug = '/' + (await params).slug.join('/'); if (slug.startsWith('/resources/blog/')) {
    const db = await getDatabase();
    const post = db.blog_posts.find(p => `/resources/blog/${p.slug}` === slug);
    return post ? metadataFor({ ...post, slug }) : {};
} const { page } = await getPage(slug); return page ? metadataFor(page) : {}; }
export default async function ContentPage({ params }: Props) { const slug = '/' + (await params).slug.join('/'); if (slug.startsWith('/resources/blog/')) {
    const db = await getDatabase();
    const post = db.blog_posts.find(p => `/resources/blog/${p.slug}` === slug);
    if (!post)
        notFound();
    return <article className="container article-page"><Link href="/resources/blog" className="text-link">← Back to the journal</Link><header><span className="eyebrow">{text(post.data, 'category')}</span><h1>{post.title}</h1><p>{text(post.data, 'excerpt')}</p><div className="article-byline">{text(post.data, 'author')} <span>·</span> {text(post.data, 'published_date')}{post.data.sample && <span className="sample-label">SAMPLE EDITORIAL</span>}</div></header><ArticleArt entry={post} large/><div className="prose"><ReactMarkdown remarkPlugins={[remarkGfm]}>{text(post.data, 'content')}</ReactMarkdown></div><div className="popular-topics">{strings(post.data, 'tags').map(tag => <span className="topic-tag" key={tag}>{tag}</span>)}</div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description: text(post.data, 'excerpt'), author: { '@type': 'Organization', name: text(post.data, 'author') }, datePublished: text(post.data, 'published_date'), dateModified: post.updated_at }) }}/></article>;
} const { page, sections, db } = await getPage(slug); if (!page)
    notFound(); return <><Sections sections={sections} db={db}/>{slug === '/company' && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@type': 'Organization', name: 'Cliact Health', url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' }) }}/>}</>; }
