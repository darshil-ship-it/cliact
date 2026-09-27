'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brand } from '@/components/ui/brand';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
export function Login({ demo }: {
    demo: boolean;
}) { const router = useRouter(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); async function login(form: FormData, action = 'login') { setBusy(true); setError(''); try {
    const response = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, email: form.get('email'), password: form.get('password') }) });
    const data = await response.json();
    if (!response.ok)
        throw new Error(data.error);
    router.push('/admin');
    router.refresh();
}
catch (e) {
    setError(e instanceof Error ? e.message : 'Unable to sign in.');
}
finally {
    setBusy(false);
} } return <div className="login-page"><div className="login-brand"><Brand /></div><div className="login-card"><span className="login-icon"><LockKeyhole size={24}/></span><span className="eyebrow">CLIACT WORKSPACE</span><h1>Welcome back.</h1><p>A little space to shape what’s next.</p><form action={form => login(form)}><label className="field"><span>Email address</span><input name="email" type="email" required autoComplete="username"/></label><label className="field"><span>Password</span><input name="password" type="password" required autoComplete="current-password" minLength={6}/></label>{error && <p role="alert" className="form-error">{error}</p>}<button className="button button-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<ArrowUpRight size={16}/></button></form>{demo && <div className="demo-login"><p>Supabase isn’t connected. Explore the working CMS using local demo content.</p><button className="button button-outline" disabled={busy} onClick={() => login(new FormData(), 'demo')}>Open local demo editor</button></div>}<p className="login-footnote">Administrator access only. Contact your workspace owner for an account.</p></div></div>; }
