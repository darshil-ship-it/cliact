import { adminIdentity } from '@/lib/auth';
import { AdminShell } from '@/components/admin/shell';
import { redirect } from 'next/navigation';
export const metadata = { title: 'Cliact CMS', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function AdminLayout({ children }: {
    children: React.ReactNode;
}) { const user = await adminIdentity(); if (!user)
    redirect('/admin/login'); return <AdminShell email={user.email} demo={user.demo}>{children}</AdminShell>; }
