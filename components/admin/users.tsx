'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export function AdminUsers({ users, demo, owner }: {
    users: {
        id: string;
        role: string;
        enabled: boolean;
    }[];
    demo: boolean;
    owner: boolean;
}) { const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState(false); const router = useRouter(); async function save(data: {
    id: string;
    role: string;
    enabled: boolean;
}) { setBusy(true); setError(''); setSuccess(''); try {
    const response = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok)
        throw new Error(result.error);
    setSuccess('Administrator access updated.');
    router.refresh();
}
catch (e) {
    setError(e instanceof Error ? e.message : 'Could not update access.');
}
finally {
    setBusy(false);
} } return <><div className="admin-page-heading"><div><span className="eyebrow">ACCESS & PEOPLE</span><h1>Admin users</h1><p>Only workspace owners can grant or revoke CMS access.</p></div></div>{demo ? <div className="admin-panel setup-note"><h2>Connect Supabase to manage access.</h2><p>The local demo editor has no real user accounts. Create your first owner using the setup instructions, then manage existing Supabase users here.</p></div> : <><div className="admin-panel"><table className="admin-table"><thead><tr><th>User ID</th><th>Role</th><th>Access</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td>{user.id}</td><td>{user.role}</td><td>{owner ? <button className="button button-outline button-small" disabled={busy} onClick={() => save({ ...user, enabled: !user.enabled })}>{user.enabled ? 'Revoke access' : 'Enable access'}</button> : user.enabled ? 'Enabled' : 'Disabled'}</td></tr>)}</tbody></table></div>{owner && <form className="admin-panel user-form" action={form => save({ id: String(form.get('id')), role: String(form.get('role')), enabled: true })}><h2>Grant access to an existing account</h2><p>Create or invite the account in Supabase Authentication first, then paste its user UUID.</p><label className="field"><span>Supabase user ID</span><input name="id" required pattern="[0-9a-fA-F-]{36}"/></label><label className="field"><span>Role</span><select name="role"><option value="editor">Editor</option><option value="owner">Owner</option></select></label><button className="button button-primary" disabled={busy}>Grant admin access</button></form>}</>}{error && <p role="alert" className="form-error">{error}</p>}{success && <p role="status" className="save-notice">{success}</p>}</>; }
