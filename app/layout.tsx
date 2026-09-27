import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Cliact Health', template: '%s | Cliact Health' }, description: 'Thoughtful AI and a connected workspace for modern healthcare teams.', metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), icons: { icon: '/favicon.svg' } };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>; }
