'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, X, LogOut, Search, ChevronDown, LayoutDashboard, PanelsTopLeft, Palette, Inbox, Sparkles, Grid2X2 } from 'lucide-react';
import { Brand } from '@/components/ui/brand';
import { adminGroups } from '@/lib/admin-config';
const icons = { LayoutDashboard, PanelsTopLeft, Palette, Inbox, Sparkles };
export function AdminShell({ children, email, demo }: {
    children: React.ReactNode;
    email: string;
    demo: boolean;
}) { const path = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false); const [query, setQuery] = useState(''); const [error, setError] = useState(''); async function logout() { try {
    const response = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    if (!response.ok)
        throw new Error();
    router.push('/admin/login');
    router.refresh();
}
catch {
    setError('Could not sign out. Please try again.');
} } return <div className="admin-layout"><aside className={`admin-sidebar ${open ? 'is-open' : ''}`}><div className="admin-brand"><Brand small/><button className="icon-button admin-close" onClick={() => setOpen(false)} aria-label="Close sidebar"><X size={19}/></button></div><div className="admin-workspace"><span className="workspace-icon">N</span><div>Cliact website<small>{demo ? 'Local demo workspace' : 'Content management'}</small></div><ChevronDown size={15}/></div><label className="admin-nav-search"><Search size={15}/><input placeholder="Find a workspace…" value={query} onChange={e => setQuery(e.target.value)} aria-label="Filter admin navigation"/></label><nav aria-label="Administration">{adminGroups.map(group => <div className="admin-nav-group" key={group.label}><h2>{group.label}</h2>{group.items.filter(([name]) => name.toLowerCase().includes(query.toLowerCase())).map(([name, href, icon]) => { const Icon = icons[icon as keyof typeof icons] ?? Grid2X2; return <Link className={path === href || href === '/admin/pages' && path.startsWith('/admin/pages/') ? 'active' : ''} href={href} key={href} onClick={() => setOpen(false)}><Icon size={16}/>{name}{name === 'Leads' && <span className="nav-indicator"/>}</Link>; })}</div>)}</nav><div className="admin-profile"><span className="profile-avatar">{email[0].toUpperCase()}</span><span><b>{demo ? 'Demo administrator' : 'Administrator'}</b><small>{email}</small></span><button aria-label="Sign out" onClick={logout}><LogOut size={16}/></button></div>{error && <p role="alert" className="field-error">{error}</p>}</aside>{open && <button className="admin-overlay" aria-label="Close navigation" onClick={() => setOpen(false)}/>}<div className="admin-main"><header className="admin-topbar"><div><button className="icon-button admin-menu" onClick={() => setOpen(true)} aria-label="Open admin navigation"><Menu size={18}/></button><span>Workspace</span><span className="breadcrumb-slash">/</span><b>{adminGroups.flatMap(g => g.items).find(([, url]) => path === url)?.[0] || 'Page editor'}</b></div><div>{demo && <span className="demo-status">DEMO MODE</span>}<Link href="/" target="_blank" className="button button-outline button-small">View website <ArrowUpRight size={15}/></Link></div></header>{demo && <div className="demo-banner">Local demo · changes stay on this computer. Connect Supabase before launch.</div>}<div className="admin-content">{children}</div></div></div>; }
