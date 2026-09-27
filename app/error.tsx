'use client';
export default function ErrorPage({ reset }: {
    error: Error & {
        digest?: string;
    };
    reset: () => void;
}) { return <main className="error-page"><span className="eyebrow">LET’S TRY THAT AGAIN</span><h1>A little interruption.</h1><p>We couldn’t load the content. Please try again. If you’re setting up the site, check your Supabase environment and migration.</p><button className="button button-primary" onClick={reset}>Try again</button></main>; }
