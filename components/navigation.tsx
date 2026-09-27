'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Entry, Content, text, list } from '@/types/cms';
import { safeUrl, mediaUrl } from '@/lib/validators';
import { Brand } from './ui/brand';
import { footerDefaults } from '@/lib/footer';
export function Navigation({ items, settings, logo }: {
    items: Entry[];
    settings: Content;
    logo: string;
}) { const [open, setOpen] = useState(false); const reduced = useReducedMotion(); useEffect(() => { if (!open)
    return; const close = (e: KeyboardEvent) => { if (e.key === 'Escape')
    setOpen(false); }; document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close); }, [open]); const links = items.map(item => list(item.data, 'children').length ? <details key={item.id} className="nav-dropdown"><summary>{item.title}<ChevronDown size={13}/></summary><div>{list(item.data, 'children').filter(child => child.enabled !== false).map((child, i) => <Link key={i} href={safeUrl(text(child, 'url')) || '/'} target={child.new_tab?'_blank':undefined} rel={child.new_tab?'noopener noreferrer':undefined} onClick={() => setOpen(false)}>{text(child, 'label')}</Link>)}</div></details> : <Link key={item.id} href={safeUrl(text(item.data, 'url')) || '/'} target={item.data.new_tab ? '_blank' : undefined} rel={item.data.new_tab ? 'noopener noreferrer' : undefined} onClick={() => setOpen(false)}>{item.title}</Link>); return <header className="site-header"><div className="nav-inner"><Brand logo={mediaUrl(logo)}/><nav aria-label="Main navigation" className="desktop-nav">{links}</nav><div className="nav-actions"><Link href={safeUrl(text(settings, 'cta_primary_url', '/book-demo'))} className="nav-demo">{text(settings, 'cta_primary', 'Book a Demo')}</Link><Link href={safeUrl(text(settings, 'cta_secondary_url', '/connect'))} className="button button-dark button-small">{text(settings, 'cta_secondary', 'Connect to Team')}<ArrowUpRight size={15}/></Link></div><button className="icon-button mobile-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div><AnimatePresence>{open && <motion.nav initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} id="mobile-menu" aria-label="Mobile navigation" className="mobile-menu">{links}<Link href={safeUrl(text(settings, 'cta_primary_url', '/book-demo'))} className="button button-primary" onClick={() => setOpen(false)}>{text(settings, 'cta_primary', 'Book a Demo')}</Link><Link href={safeUrl(text(settings, 'cta_secondary_url', '/connect'))} className="button button-outline" onClick={() => setOpen(false)}>{text(settings, 'cta_secondary', 'Connect to Team')}</Link></motion.nav>}</AnimatePresence></header>; }
export function Footer({ settings, logo }: {
    items: Entry[];
    settings: Content;
    logo: string;
}) {
    const content = { ...footerDefaults, ...settings };
    return <footer className="site-footer"><div className="container footer-main"><div><Brand logo={mediaUrl(logo)}/><p>{text(content, 'footer_text')}</p><span className="footer-note">{text(content, 'footer_note')}</span></div>{list(content, 'footer_columns').map((column, i) => <div key={i}><h3>{text(column, 'title')}</h3>{list(column, 'links').filter(link => link.enabled !== false).map((link, j) => <Link key={j} href={safeUrl(text(link, 'url')) || '/'} target={link.new_tab ? '_blank' : undefined} rel={link.new_tab ? 'noopener noreferrer' : undefined}>{text(link, 'label')}</Link>)}{i === 2 && list(content, 'social_links').map((link, j) => <a key={j} href={safeUrl(text(link, 'url'))} rel="noopener noreferrer">{text(link, 'label')}<ArrowUpRight size={14}/></a>)}</div>)}</div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {text(content, 'copyright')}</span><div>{list(content, 'legal_links').map((link, i) => <Link key={i} href={safeUrl(text(link, 'url')) || '/'}>{text(link, 'label')}</Link>)}</div></div></footer>;
}
