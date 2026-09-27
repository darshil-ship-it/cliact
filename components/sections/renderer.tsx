import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUpRight, ArrowRight, Activity, ShieldCheck, LockKeyhole, FileText, MessageSquare, Calendar, Sparkles, Check } from 'lucide-react';
import { Content, Database, Entry, text, list } from '@/types/cms';
import { contentMediaUrl, safeUrl } from '@/lib/validators';
import { Reveal } from '@/components/ui/reveal';
import { HeroSection } from './hero';
import { Media } from './media';
import { AgentShowcase, SpecialtySelector, InteractiveMediaTabs, FAQAccordion, Testimonials, PricingCards, ComparisonTable, CompanyTimeline, MediaGallery } from './interactive';
import { BlogGrid } from './blog';
import { ContentIcon } from '@/components/ui/content-icon';
import { ScrollSolutionsSection } from './scroll-solutions';
const icons = [FileText, Activity, MessageSquare, Calendar, Sparkles, ShieldCheck, LockKeyhole];
export function SectionHeading({ data, center = false }: {
    data: Content;
    center?: boolean;
}) { return <div className={`section-heading ${center || data.alignment === 'center' ? 'center' : data.alignment === 'right' ? 'align-right' : ''}`}><span className="eyebrow">{text(data, 'eyebrow')}</span><h2>{text(data, 'heading')}</h2>{text(data, 'description') && <p>{text(data, 'description')}</p>}</div>; }
function SectionButton({ data }: {
    data: Content;
}) { return text(data, 'button_primary') ? <Link className="text-link" href={safeUrl(text(data, 'button_primary_url', '/book-demo'))}>{text(data, 'button_primary')}<ArrowUpRight size={17}/></Link> : null; }
export function FeatureGrid({ items, security = false }: {
    items: Content[];
    security?: boolean;
}) { return <div className={`feature-grid ${security ? 'security-grid' : ''}`}>{items.map((item, i) => { const Icon = security ? [ShieldCheck, LockKeyhole, FileText, ShieldCheck][i % 4] : icons[i % icons.length]; return <article className="feature-card" key={i}>{contentMediaUrl(item) ? <img className="team-photo" src={contentMediaUrl(item)} alt={text(item, 'title')} width={240} height={240} loading="lazy"/> : <div className="feature-icon">{text(item,'icon')?<ContentIcon name={text(item,'icon')} size={22}/>:<Icon size={22}/>}</div>}<h3>{text(item, 'title')}</h3><p>{text(item, 'description', text(item, 'bio'))}</p>{text(item, 'role') && <span className="sample-label">{text(item, 'role')}</span>}{typeof item.available === 'boolean' && <span className={`status-badge ${item.available ? 'success' : ''}`}>{item.available ? 'Available' : 'Discuss availability'}</span>}{text(item, 'url') && <Link className="text-link" href={safeUrl(text(item, 'url'))}>Learn more <ArrowUpRight size={15}/></Link>}{text(item, 'linkedin_url') && <a className="text-link" href={safeUrl(text(item, 'linkedin_url'))} rel="noopener noreferrer">LinkedIn <ArrowUpRight size={15}/></a>}</article>; })}</div>; }
export const SecurityGrid = ({ items }: {
    items: Content[];
}) => <FeatureGrid items={items} security/>;
export function ResultsGrid({ items }: {
    items: Content[];
}) { return <div className="results-grid">{items.map((item, i) => <article key={i}><span className="result-number">{text(item, 'value', String(i + 1).padStart(2, '0'))}</span><h3>{text(item, 'title')}</h3><p>{text(item, 'description')}</p></article>)}</div>; }
export function MediaSplitSection({ data }: {
    data: Content;
}) { return <div className={`media-split ${data.reverse ? 'reverse' : ''} ${text(data, 'layout')}`}><div><SectionHeading data={data}/><SectionButton data={data}/></div><div className="showcase-stage"><Media data={data} mode={text(data, 'visual', 'Write progress notes')}/></div></div>; }
export const ProductShowcase = MediaSplitSection;
export function GlobalReachSection({ data, items }: {
    data: Content;
    items: Content[];
}) { return <div className="global-reach"><div className="global-content"><SectionHeading data={data}/><div className="global-metrics">{items.map((item, i) => <div key={i}><strong>{text(item, 'title')}</strong><span>{text(item, 'description')}</span></div>)}</div>{text(data, 'country_count') && <p className="sample-label">{text(data, 'country_count')} · {data.verified ? 'Verified reach' : 'Sample metric — pending verification'}</p>}</div><div className="globe-space">{contentMediaUrl(data) ? <Media data={data}/> : <svg className="globe" viewBox="0 0 560 560" role="img" aria-label="A blue globe representing a global perspective"><defs><radialGradient id="globe-fill" cx="32%" cy="26%"><stop offset="0%" stopColor="var(--background)"/><stop offset="65%" stopColor="var(--accent)"/><stop offset="100%" stopColor="var(--primary)" stopOpacity=".48"/></radialGradient><clipPath id="globe-clip"><circle cx="280" cy="280" r="255"/></clipPath></defs><circle cx="280" cy="280" r="255" fill="url(#globe-fill)"/><g clipPath="url(#globe-clip)" fill="none" stroke="var(--primary)" strokeOpacity=".16">{[55, 115, 175, 225, 253].map(r => <ellipse key={r} cx="280" cy="280" rx={r} ry="255" transform="rotate(-24 280 280)"/>)}{[100, 170, 240, 310, 380, 450].map(y => <ellipse key={y} cx="280" cy={y} rx="260" ry="45" transform="rotate(-24 280 280)"/>)}</g><g fill="var(--primary)">{[[135, 177], [220, 240], [345, 140], [411, 284], [185, 365], [375, 407]].map(([cx, cy], i) => <g key={i}><circle cx={cx} cy={cy} r="12" opacity=".1"/><circle cx={cx} cy={cy} r="4"/></g>)}</g></svg>}</div></div>; }
export function CTASection({ data }: {
    data: Content;
}) { return <div className="cta-section"><span className="cta-spark"></span><SectionHeading data={data} center/><div className="button-row"><Link className="button button-primary" href={safeUrl(text(data, 'button_primary_url', '/book-demo'))}>{text(data, 'button_primary', 'Book a Demo')}<ArrowUpRight size={17}/></Link>{text(data, 'button_secondary') && <Link className="button button-outline" href={safeUrl(text(data, 'button_secondary_url', '/connect'))}>{text(data, 'button_secondary')}<ArrowRight size={17}/></Link>}</div><div className="cta-lines" aria-hidden="true"/></div>; }
export function RichTextSection({ data }: {
    data: Content;
}) { return <div className="rich-section"><span className="eyebrow">{text(data, 'eyebrow')}</span><h1>{text(data, 'heading')}</h1><p className="rich-intro">{text(data, 'description')}</p>{text(data, 'content') && <div className="prose"><ReactMarkdown remarkPlugins={[remarkGfm]}>{text(data, 'content')}</ReactMarkdown></div>}</div>; }
export function AgentPricingGrid({ items }: {
    items: Content[];
}) { return <div className="agent-pricing-grid">{items.map((item, i) => <article className="agent-pricing-card" key={i}><Sparkles size={22}/><h3>{text(item, 'title')}</h3><p>{text(item, 'description')}</p><strong>{typeof item.price === 'number' ? String(item.price) : 'Let’s talk'}</strong><span>{text(item, 'billing')}</span><Link href={safeUrl(text(item, 'url', '/book-demo'))} className="text-link">Explore agent <ArrowUpRight size={15}/></Link></article>)}</div>; }
export function LogoMarquee({ items }: {
    items: Content[];
}) { const verified = items.filter(i => i.verified === true); return verified.length ? <div className="verified-badges">{verified.map((i, n) => <a key={n} href={safeUrl(text(i, 'url'))} className="verified-badge"><ShieldCheck size={24}/><span>{text(i, 'title')}<small>{text(i, 'description')}</small></span><Check size={16}/></a>)}</div> : <div className="empty-state subtle-empty">No verified certifications are currently published.</div>; }
export function Sections({ sections, db }: {
    sections: Entry[];
    db: Database;
}) {
    return <>{sections.map(section => {
            const data = section.data;
            const collection = text(data, 'collection');
            let items = collection ? (db[collection] ?? []).map(r => ({ title: r.title, ...r.data })) : list(data, 'items');
            if (section.section_type === 'PricingCards')
                items = (db.pricing_plans ?? []).map(r => { const features = (db.pricing_plan_features ?? []).filter(f => f.data.plan_id === r.id).map(f => f.title); return { title: r.title, ...r.data, ...(features.length ? { features } : {}) }; });
            const type = section.section_type;
            if (type === 'HeroSection')
                return <HeroSection key={section.id} data={data}/>;
            let content: React.ReactNode;
            switch (type) {
                case 'MediaSplitSection':
                case 'ProductShowcase':
                    content = <MediaSplitSection data={data}/>;
                    break;
                case 'GlobalReachSection':
                    content = <GlobalReachSection data={data} items={items}/>;
                    break;
                case 'CTASection':
                    content = <CTASection data={data}/>;
                    break;
                case 'RichTextSection':
                    content = <RichTextSection data={data}/>;
                    break;
                case 'BlogGrid':
                    content = <BlogGrid data={{...db.site_settings[0]?.data,...data}} items={db.blog_posts ?? []}/>;
                    break;
                case 'ScrollSolutionsSection':
                    content = <ScrollSolutionsSection data={data} items={items}/>;
                    break;
                default: content = <><SectionHeading data={data} center={['FeatureGrid', 'Testimonials', 'SecurityGrid', 'PricingCards', 'ResultsGrid'].includes(type ?? '')}/>{type === 'FeatureGrid' ? <FeatureGrid items={items}/> : type === 'SecurityGrid' ? <SecurityGrid items={items}/> : type === 'Testimonials' ? <Testimonials items={items}/> : type === 'InteractiveMediaTabs' ? <InteractiveMediaTabs items={items}/> : type === 'AgentShowcase' ? <AgentShowcase items={items}/> : type === 'SpecialtySelector' ? <SpecialtySelector items={items}/> : type === 'FAQAccordion' ? <FAQAccordion items={items}/> : type === 'PricingCards' ? <PricingCards items={items}/> : type === 'AgentPricingGrid' ? <AgentPricingGrid items={items}/> : type === 'ComparisonTable' ? <ComparisonTable items={items} plans={(db.pricing_plans ?? []).map(r => ({ id:r.id,title: r.title, ...r.data }))}/> : type === 'CompanyTimeline' ? <CompanyTimeline items={items}/> : type === 'MediaGallery' ? <MediaGallery items={items}/> : type === 'ResultsGrid' ? <ResultsGrid items={items}/> : type === 'LogoMarquee' ? <LogoMarquee items={items}/> : null}<SectionButton data={data}/></>;
            }
            return <section key={section.id} id={section.slug} className={`section section-${type} ${text(data, 'background') === 'tint' ? 'section-tint' : ''}`}><Reveal preset={type === 'ScrollSolutionsSection' ? 'none' : text(data, 'animation', 'fade-up')} className="container">{content}</Reveal></section>;
        })}</>;
}
