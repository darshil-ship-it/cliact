'use client';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { leadSchema } from '@/lib/validators';
type FormValues = {
    name: string;
    email: string;
    phone: string;
    company: string;
    role: string;
    specialty: string;
    team_size: string;
    country: string;
    reason: string;
    message: string;
    consent: boolean;
    website: string;
};
type Turnstile = {
    render: (element: HTMLElement, options: Record<string, unknown>) => string;
    remove: (id: string) => void;
    reset: (id?: string) => void;
};
declare global {
    interface Window {
        turnstile?: Turnstile;
    }
}
export function LeadForm({ type, compact = false, specialties = [] }: {
    type: 'demo' | 'contact' | 'newsletter';
    compact?: boolean;
    specialties?: string[];
}) {
    const path = usePathname();
    const { register, handleSubmit, formState: { errors }, setError, reset } = useForm<FormValues>();
    const [busy, setBusy] = useState(false);
    const [error, setFailure] = useState('');
    const [success, setSuccess] = useState('');
    const widget = useRef<HTMLDivElement>(null);
    const token = useRef('');
    const widgetId = useRef('');
    useEffect(() => { const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY; if (!key || !widget.current)
        return; let active = true; const mount = () => { if (active && widget.current && window.turnstile && !widgetId.current)
        widgetId.current = window.turnstile.render(widget.current, { sitekey: key, callback: (v: string) => { token.current = v; }, 'expired-callback': () => { token.current = ''; } }); }; let script = document.querySelector<HTMLScriptElement>('script[data-turnstile]'); if (!script) {
        script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.dataset.turnstile = 'true';
        script.async = true;
        document.head.appendChild(script);
    } script.addEventListener('load', mount); mount(); return () => { active = false; script?.removeEventListener('load', mount); if (widgetId.current)
        window.turnstile?.remove(widgetId.current); widgetId.current = ''; }; }, []);
    async function submit(values: FormValues) { setFailure(''); const search = new URLSearchParams(window.location.search); const payload = { ...values, type, source: path, utm_source: search.get('utm_source') || '', utm_medium: search.get('utm_medium') || '', utm_campaign: search.get('utm_campaign') || '', utm_term: search.get('utm_term') || '', utm_content: search.get('utm_content') || '', turnstile_token: token.current }; const checked = leadSchema.safeParse(payload); if (!checked.success) {
        checked.error.issues.forEach(issue => { const field = issue.path[0] as keyof FormValues; setError(field, { message: issue.message }); });
        return;
    } setBusy(true); try {
        const response = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(checked.data) });
        const result = await response.json();
        if (!response.ok)
            throw new Error(result.error || 'We couldn’t send your message.');
        setSuccess(result.message);
        reset();
    }
    catch (e) {
        setFailure(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
        window.turnstile?.reset(widgetId.current);
        token.current = '';
    }
    finally {
        setBusy(false);
    } }
    const field = (name: keyof FormValues, label: string, required = false, inputType = 'text') => <label className="field" key={name}><span>{label}{required && ' *'}</span><input type={inputType} {...register(name, { required: required ? `${label} is required.` : false })} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} autoComplete={name === 'email' ? 'email' : name === 'name' ? 'name' : name === 'phone' ? 'tel' : name === 'company' ? 'organization' : 'off'}/>{errors[name] && <small id={`${name}-error`} className="field-error">{errors[name]?.message}</small>}</label>;
    if (success)
        return <div className="form-success" role="status"><CheckCircle2 size={32}/><h3>{type === 'newsletter' ? 'You’re on the list.' : 'Thanks for reaching out.'}</h3><p>{success}</p><button className="text-link" onClick={() => setSuccess('')}>Send another message</button></div>;
    return <form className={`lead-form ${compact ? 'compact-form' : ''}`} onSubmit={event => void handleSubmit(submit)(event)} noValidate><div className="form-grid">{field('name', 'Your name', true)}{field('email', type === 'demo' ? 'Work email' : 'Email', true, 'email')}{type !== 'newsletter' && <>{field('company', 'Company / clinic', type === 'demo')}{field('phone', 'Phone (optional)', false, 'tel')}</>}{type === 'demo' && <>{field('role', 'Your role', true)}<label className="field"><span>Specialty *</span><select {...register('specialty', { required: 'Choose your specialty.' })}><option value="">Select specialty</option>{specialties.map(s => <option key={s}>{s}</option>)}<option>Other</option></select>{errors.specialty && <small className="field-error">{errors.specialty.message}</small>}</label><label className="field"><span>Team size *</span><select {...register('team_size', { required: 'Choose a team size.' })}><option value="">Select team size</option>{['Just me', '2–10', '11–50', '51–200', '200+'].map(s => <option key={s}>{s}</option>)}</select>{errors.team_size && <small className="field-error">{errors.team_size.message}</small>}</label>{field('country', 'Country', true)}</>}{type === 'contact' && <label className="field full"><span>What brings you here?</span><select {...register('reason')}><option>General question</option><option>Partnership</option><option>Enterprise</option><option>Security</option><option>Support</option></select></label>}{type !== 'newsletter' && <label className="field full"><span>How can we help?{type === 'contact' ? ' *' : ''}</span><textarea rows={4} {...register('message', { required: type === 'contact' ? 'Please tell us how we can help.' : false })} placeholder="Tell us a little about your team. Please don’t include patient information."/>{errors.message && <small className="field-error">{errors.message.message}</small>}</label>}</div><div className="honeypot" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" {...register('website')}/></label></div><label className="consent"><input type="checkbox" {...register('consent', { required: 'Please agree to be contacted.' })}/><span>I agree to be contacted by Cliact Health{type === 'newsletter' ? ' with editorial updates' : ''}. Read the <Link href="/privacy">privacy notice</Link>.</span></label>{errors.consent && <p className="field-error">{errors.consent.message}</p>}<div ref={widget}/>{error && <div role="alert" className="form-error">{error}</div>}<button disabled={busy} className="button button-primary" type="submit">{busy ? 'Sending…' : type === 'demo' ? 'Request a demo' : type === 'newsletter' ? 'Keep me in the loop' : 'Send message'}<ArrowUpRight size={17}/></button><p className="form-footnote">A human conversation. No patient information, please.</p></form>;
}
