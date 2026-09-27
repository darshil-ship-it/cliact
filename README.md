# Cliact Health

A complete Next.js website and lightweight CMS for Cliact Health. The public site is constructed from database-driven sections. The administrator can manage content without changing React files.

## Start with the local preview

Requirements: **Node.js 22.13 or newer** and npm. The project was validated with Node 24 and Next.js 16.3.6. Exact dependency versions are recorded in `package-lock.json`.

Open a terminal in this folder and run:

```bash
npm install
npm run dev
```

Open **http://127.0.0.1:3000**. Keep the terminal running while using the site.

Open **http://127.0.0.1:3000/admin/login** and select **Open local demo editor** to explore the CMS without Supabase. This option only exists under `npm run dev` when Supabase is not configured. It is disabled in production.

Local edits and test form submissions are saved in `.demo/content.json`. That directory is ignored by Git and excluded from the handoff archive. It is local development data, not a production database. To start fresh, stop the server and rename `.demo/content.json` to `content.backup.json`; restart the server. Keep a backup if you want to preserve edits.

The preview is a marketing website and CMS, **not a clinical application or medical AI service**. Product workspaces use synthetic examples. No actual notes are generated, no clinical decisions are made, and no real patient data should be entered.

## What is implemented

- All requested public routes, including the homepage, physiotherapy, multi-specialty solutions, organizations, pricing, company, resources, blog listing/articles, privacy/security, demo and contact forms. Draft privacy and terms pages are included.
- The requested initial section order, 21 reusable section types, interactive use-case pills, specialty and agent selectors, FAQ accordions, review sliders, a partial SVG globe, pricing billing toggle and comparison table, company timeline and gallery.
- Responsive public and admin interfaces, keyboard controls, focus states, native modal editors, reduced-motion support, restrained Framer Motion effects.
- Authenticated CMS with page/section CRUD, duplicate/hide/show controls, drag-and-drop and keyboard reordering, content collections, navigation, footer, URL media, theme, SEO, blog editing, pricing, compliance, and lead status updates.
- Supabase Auth integration, membership checks, PostgreSQL migration, row-level security, server-only service credentials, validation, same-origin mutation checks, honeypot, persistent form rate limits, optional Turnstile.
- Metadata API, canonical URLs, robots, sitemap, Article and Organization structured data, optional consent-gated analytics.

## Connect your Supabase project

1. Create a Supabase project in your own account.
2. In the project’s **SQL Editor**, paste and run `supabase/migrations/001_cms.sql`. Run it once on a new project. It creates the tables, indexes, policies, and helper functions.
   For an existing database that reports `Unable to load ...` or Postgres `42501` errors, run `supabase/migrations/002_repair_public_cms_access.sql` afterward. It restores the required Data API grants and public-read RLS policies without exposing drafts, leads, or admin writes.
3. Copy `.env.example` to `.env.local` in this project folder.
4. Set these values from your Supabase project settings:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
RATE_LIMIT_SECRET=YOUR_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
```

Generate a rate-limit secret locally with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

The anonymous key is intended for public use; RLS enforces permissions. **Never prefix the service-role key with `NEXT_PUBLIC_`, commit `.env.local`, or enter secrets in CMS content fields.**

5. Seed the database:

```bash
npm run seed
```

The seed inserts demo records only into empty tables. Existing content is preserved. On a partially populated database, check parent records before seeding child tables. Do not seed a production content database as a routine update mechanism.

6. Stop and restart `npm run dev` so it picks up the new environment. With both public Supabase variables present, reads and writes use Supabase rather than the local demo store. Database errors are surfaced rather than silently switching to demo content.

The Supabase CLI can also apply the checked-in migration with `supabase db push` after linking your project. Do not run both setup methods against the same already-migrated database.

## Create the first administrator

1. In Supabase, open **Authentication → Users** and create your own user. Use your own email and a strong password; confirm the email through your chosen account flow.
2. Copy that user’s UUID.
3. Run the following in the Supabase SQL Editor, replacing the example UUID:

```sql
insert into public.admin_users (id, role, enabled)
values ('REPLACE-WITH-THE-AUTH-USER-UUID', 'owner', true);
```

4. Sign in at `/admin/login` with that account.

Creating an ordinary Supabase Auth account does not grant CMS access. Only enabled `admin_users` members can edit content. Owners can use **Settings → Admin Users** to grant/revoke access for existing Auth accounts. Editors can edit CMS content but cannot manage membership. The UI refuses changes to the signed-in owner’s own role/access; another owner must perform them. Keep at least one owner.

Disable public signups in Supabase if you only need staff accounts. Configure your production Site URL and redirect URLs in Supabase Authentication settings. Use Supabase’s built-in password recovery/invite flows to manage account credentials.

## Editing the website

### Pages and sections

1. Go to **Website → Pages**.
2. Select **Sections** beside a page.
3. Edit the content, buttons, URLs, media options, and animation preset.
4. Save to apply the changes. Draft or disabled records are not shown publicly.

Use **Add section**, **Duplicate**, **Hide/Show**, and **Delete**. Drag the handle to reorder; for keyboard reordering, focus the handle, press Space, use arrow keys, then press Space again. Up/down buttons are also available. Filtered lists do not reorder until the filter is cleared.

Existing page paths should retain their leading `/`. New published paths automatically work through the catch-all App Router route. The initial page structures follow the specification; administrators can intentionally change them.

Sections can use either inline **Items** or a **Collection** (for example `features`, `specialties`, `ai_agents`, `testimonials`, `faq_items`, `results`). A collection takes precedence over inline items. An empty collection name uses the item list.

Reusable section types: `HeroSection`, `FeatureGrid`, `MediaSplitSection`, `ProductShowcase`, `InteractiveMediaTabs`, `ScrollSolutionsSection`, `AgentShowcase`, `SpecialtySelector`, `Testimonials`, `LogoMarquee`, `ResultsGrid`, `SecurityGrid`, `PricingCards`, `AgentPricingGrid`, `ComparisonTable`, `CompanyTimeline`, `MediaGallery`, `GlobalReachSection`, `FAQAccordion`, `CTASection`, `BlogGrid`, `RichTextSection`.

`ScrollSolutionsSection` uses scroll position on desktop to keep a sticky feature index and product stage in sync. Its items, benefit lists, and visual type are editable in the page builder. At 800px and below it becomes a normal stacked layout, and reduced-motion preferences remove panel transitions.

To develop a genuinely new section type, add it to `types/cms.ts`, implement its component/renderer case, add its editor defaults, and extend the SQL section-type constraint through a new migration. Adding instances of existing section types needs no code changes.

### Media by URL

Use **Media URL** and **Media type**. Supported formats are image, GIF, SVG, direct MP4/video, YouTube, Vimeo, and Loom. Expand hero items to change each pill’s media. The hero’s main media is the fallback when the selected pill has no media URL.

Set descriptive alt text, fit, position, corner radius, poster URL, and video behavior. The editor shows a preview. Native product videos default to autoplay, loop, muted, playsInline, and no controls. Below-fold videos load near the viewport and pause out of view. Reduced-motion users do not get autoplay. Embedded provider behavior is also subject to provider/browser restrictions, embedding permissions, and content availability.

Use approved, public HTTPS media URLs. Links that require a login or prevent hotlinking will not work for visitors. SVG is loaded as an image and is never injected into the page as raw HTML. Without approved media, the site displays clearly illustrative product workspaces or branded gallery placeholders.

`next/image` optimization is used for local images and the configured `images.unsplash.com` host. Other arbitrary HTTPS CMS image URLs use native responsive lazy images so uploads and code changes are not required. To enable Next image optimization for another trusted host, add a narrow `images.remotePatterns` entry in `next.config.ts` and update the compatible-host condition in `components/sections/media.tsx`. Avoid wildcard image-proxy domains.

### Theme

Go to **Design → Theme** and edit the Theme record. All key brand tokens, logos, favicon URL, typography, radius, container width, section spacing, and navbar height are centrally configurable. Supported CSS values are constrained; invalid values are ignored by the public theme layer. Font families use local/system fonts by default; adding a new downloadable font requires wiring that font into the project first.

### Navigation and footer

Use **Website → Navigation** to add links and reorder them. Add child links to turn an item into a dropdown. Desktop and mobile share this data. The primary/secondary CTA labels and destinations are under **Settings → Company Info**. Logo URLs are in Theme.

Use **Website → Footer** for the description, note, column headings, nested links, legal links, social links, and copyright. Expand items to edit their fields.

### Specialties and AI agents

Use **Content → Specialties** or **Content → AI Agents**, select **Add new**, fill in the descriptions and media, then set status to **Published**. Reorder to determine selector order. Disable a record to hide it without deleting it.

### Pricing and comparisons

Use **Business → Pricing**. Tabs expose software plans, normalized plan features, individual agent pricing, and comparison rows. Prices left blank display **Let’s talk**; no invented prices are published. Monthly/yearly amounts are the total price for the selected interval.

Plan features can be managed within a plan’s Features list or in Pricing Plan Features with a parent plan UUID. If normalized feature records exist, they take precedence over the plan’s inline list. Copy the parent ID from the editor’s Record information panel when using normalized features.

Comparison cells are labeled by plan and remain linked to that plan when columns are reordered. Use `check`, `cross`, or a custom text/limit. Add/remove plans to add/remove comparison columns. Older demo rows with a positional Values list are still supported and convert to linked cells when edited.

### Publish a blog post

1. Open **Content → Blog → Add new**.
2. Set a unique slug (without `/`), title, excerpt, author, date, category, optional cover URL and tags.
3. Write using the Markdown editor. Toolbar buttons add headings, bold, italic and links; **Preview** renders the article safely.
4. Set **Published** and **Enabled**. It appears at `/resources/blog/your-slug`.

Draft posts do not appear in the blog list, sitemap, or article routes. Categories and tags can be managed through the Blog collection tabs. Category filtering and popular topics derive from the posts’ current category/tag values.

### Leads

Demo requests, contact messages, and newsletter subscriptions save to **Business → Leads**. Open a record and update its lead status: New, Contacted, Qualified, Won, Lost, or Spam. Source page, UTM fields, consent timestamp, and submitted details are retained. Submissions do **not** send email or create calendar appointments; the inbox is the source of truth.

Local demo submissions are explicitly identified in the success message and saved only locally. Unconfigured production previews reject submissions with an explanation rather than claiming they were received.

### Compliance and integrations

Use **Settings → Compliance** to enter an approved badge, evidence URL, and verification status. Only `verified = true` records render publicly. The public Supabase policy enforces the same rule. Keep certifications disabled until independently verified.

Use **Business → Organizations** to mark integrations available only after they actually exist. Unavailable integrations are labeled as discussion areas.

## Forms, rate limits, and deployment security

Server-side Zod validation is authoritative. Required fields are also checked in the browser. Mutations require a matching Origin/Host. CMS API writes independently verify administrator membership; protecting the layout alone is not relied on.

Production forms use server-side service credentials and a PostgreSQL rate-limit function, limited by hashed IP and email to five accepted attempts per hour. The demo limiter is process-local. Configure your hosting proxy to overwrite forwarded client-IP headers rather than trusting arbitrary incoming values; otherwise IP limits can be spoofed. Email limits still apply. Set request-body limits and abuse protection at the hosting edge as additional protection.

Optional stronger bot protection:

```dotenv
NEXT_PUBLIC_TURNSTILE_SITE_KEY=YOUR_SITE_KEY
TURNSTILE_SECRET_KEY=YOUR_SERVER_SECRET
```

Configure your allowed hostnames in Turnstile. Both keys are required for an end-to-end challenge. The server verifies the token. Verify this against your actual hostname before launch.

Schedule removal of old rate-limit rows and define appropriate lead/analytics retention before accepting real submissions. Example maintenance SQL:

```sql
delete from public.rate_limits where started_at < now() - interval '2 days';
```

Never store patient data or secrets in public CMS tables. No regulatory compliance is implied by this implementation. Legal notices, policies, certifications, product availability, pricing, and real testimonials require review before launch.

## Analytics and SEO

Page metadata is under **Settings → SEO** or the page editor. Blog metadata is on each article. Use absolute HTTPS canonical URLs in production. Set `NEXT_PUBLIC_SITE_URL` to the final origin, without a trailing slash.

Under **Settings → Analytics**, configure GA4, GTM, Google Search Console verification, Meta Pixel, and LinkedIn Insight IDs. Invalid or empty IDs do not load scripts. GA4 is not loaded separately when GTM is configured, to avoid double installation. A consent banner is shown when tracking is configured. Internal page/blog event counts are recorded only after analytics consent. Counts start at zero; they are not fabricated. Ad blockers and declined consent mean these counts are not a complete visitor census.

Changing cookie preferences does not retroactively remove events already sent. The page reloads when consent is revoked to unload previously initialized third-party libraries. Configure your tags consistently with the consent choices and applicable requirements.

## Build and deploy

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

`npm start` runs the production build on `127.0.0.1:3000`. Local demo writes/sign-in are disabled in production. Stop the development server first if it is using the same port.

Deploy the project to a host that supports the **Next.js Node runtime**, such as a managed Next.js service or your own Node server behind HTTPS. Import this folder as the project root, use `npm ci` as the install command and `npm run build` as the build command. Configure all environment values before building. On a self-managed server, configure an appropriate hostname bind and process manager, TLS reverse proxy, request limits, backups, and log monitoring.

This is not a static export. Authentication, CMS mutations, form ingestion, and runtime database reads need a server. A Cloudflare Worker deployment needs a compatible adapter and separate adapter testing; replacing Next.js with another framework is not required or performed here. The source handoff does not provision a Supabase account, apply SQL to an external project, or publish the site to a live domain.

After deployment, verify real Supabase login, role revocation, anonymous RLS restrictions, form persistence, rate limits, media domains, production metadata, and the final domain. Keep the server-only key in the host’s secrets manager.

## Project map

```text
app/                         App Router, public/admin routes, API handlers
components/sections/         Reusable database-driven public sections
components/admin/            Dashboard, content editor, field editor, user controls
components/forms/            Validated conversion forms
components/ui/               Shared brand and animation components
hooks/                       Optional browser CMS tools
lib/demo/seed.ts              Clearly labeled initial demo content
lib/data.ts                   Supabase / local development data boundary
lib/supabase/                 Server clients and credential handling
lib/validators/               Zod schemas and URL/theme guards
types/cms.ts                  CMS record and content contracts
supabase/migrations/          PostgreSQL schema, indexes, RLS, RPCs
scripts/seed.ts               Non-destructive initial content seed
tests/                       Core content/security validation tests
```

Entities have individual tables with UUIDs, publication state, ordering, timestamps, and typed application contracts. Extensible editorial fields live in JSONB `data`; page sections and normalized pricing features have foreign-key relationships. `admin_users` references Supabase Auth users. Private leads, event counts, and rate-limit records are never publicly readable.

## Validation and troubleshooting

`npm run test:integration` tests against an already running local development server. It creates temporary synthetic records, checks publication/hiding and lead updates, and removes its own records. Do not point this script at production.

- **Blank database / missing tables:** run the migration, then `npm run seed`.
- **Signed in but access denied:** confirm the Auth UUID exists in `admin_users` and is enabled.
- **Cannot save a page:** check for duplicate slugs and required fields.
- **Forms say unavailable:** configure both Supabase keys, the server-only key, and `RATE_LIMIT_SECRET`; restart the server.
- **Embedded video will not play:** check the provider’s embedding permissions and browser autoplay rules. Direct muted MP4 offers the most consistent product-video behavior.
- **No analytics counts:** tracking requires a configured analytics ID, visitor consent, and the server environment.
- **`npm install` cannot write to the default Windows cache:** use `npm install --cache ./work/npm-cache` in a writable project directory.
- **A streamed unknown route returns HTTP 200:** Next.js may start streaming the root loading boundary before resolving a missing CMS record. The rendered route is still the not-found page with noindex metadata, and unpublished content is excluded. Configure blocking route resolution if your deployment requires strict HTTP status semantics for every streamed miss.

See `VALIDATION.md` for the checks performed on this handoff and the remaining environment-dependent verification.
