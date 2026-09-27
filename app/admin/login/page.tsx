import { Login } from '@/components/admin/login';
import { adminIdentity, localDemo } from '@/lib/auth';
import { redirect } from 'next/navigation';
export const metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function LoginPage() { if (await adminIdentity())
    redirect('/admin'); return <Login demo={localDemo()}/>; }
