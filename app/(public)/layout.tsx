import { getDatabase } from '@/lib/data';
import { text } from '@/types/cms';
import { Navigation, Footer } from '@/components/navigation';
import { safeThemeValue, themeKeys } from '@/lib/validators';
import type { CSSProperties } from 'react';
import { Analytics } from '@/components/analytics';
import { mediaUrl } from '@/lib/validators';
export const dynamic = 'force-dynamic';
export async function generateMetadata() { const db = await getDatabase(); const s = db.site_settings[0]?.data ?? {}; const t = db.theme_settings[0]?.data ?? {}; return { verification: { google: text(s, 'search_console') || undefined }, icons: { icon: mediaUrl(text(t, 'favicon_url')) || '/favicon.svg' } }; }
export default async function PublicLayout({ children }: {
    children: React.ReactNode;
}) { const db = await getDatabase(); const settings = db.site_settings[0]?.data ?? {}; const theme = db.theme_settings[0]?.data ?? {}; const tokens = Object.fromEntries(themeKeys.flatMap(k => { const v = safeThemeValue(k, theme[k]); return v ? [[`--${k.replaceAll('_', '-')}`, v]] : []; })); return <div style={tokens as CSSProperties}><a href="#main" className="skip-link">Skip to content</a><Navigation items={db.navigation_items} settings={settings} logo={text(theme, 'logo_url')}/><main id="main">{children}</main><Footer items={db.navigation_items} settings={settings} logo={text(theme, 'logo_url')}/><Analytics settings={settings}/></div>; }
