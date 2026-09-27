# Verification record

## Completed locally

- Installed dependencies; initial audit reported zero vulnerabilities.
- TypeScript strict checking, ESLint, and the Next.js production build.
- Final production build: Next.js 16.3.6 compiled successfully. The production server passed homepage rendering, disabled demo sign-in, forged demo-cookie rejection, protected admin redirect, and unconfigured form-persistence rejection checks.
- Route sweep: 45 public, article, and admin routes plus the XML sitemap passed.
- Core tests: all seed records conform to the CMS schema; UUIDs/section parents are valid; locked homepage order; no invented compliance/pricing claims; unsafe URLs/theme injection rejected; form consent and required-field validation.
- HTTP integration: anonymous admin write rejected, cross-origin request rejected, local sign-in, draft page excluded, published section rendered, hidden section removed, lead saved, lead status updated, invalid form rejected. Temporary test records were cleaned up.
- Browser checks: public routes, admin login/dashboard, homepage section editor, interactive hero tab, responsive public/admin layouts at 320, 375, 390, 430, 768, 1024, and 1440 pixels. Blog overflow and DnD hydration IDs were corrected during verification. The browser form’s required-field errors, successful synthetic submission, admin inbox appearance, and lead-status update were verified. Optional WebMCP tools were checked for listing, opening a record, and intentional invalid-record failure.
- Scroll Solutions checks: desktop sticky stage and feature index, downward and upward synchronization, click selection, Arrow-key navigation, natural section release, one visible desktop panel, five stacked mobile panels at 390px, and no horizontal overflow. Runtime console warnings/errors: none.

## Requires the owner's external environment

- Apply migration and seed to a real Supabase project.
- Verify live Auth sign-in and RLS using anonymous, ordinary-user, editor, and owner accounts.
- Verify form and analytics persistence against that real database, including rate-limit behavior behind the production proxy.
- Configure/test Turnstile if enabled; verify real media URLs and third-party embedding permissions.
- Supply approved branding, company profiles, prices, customer reviews, verified metrics/certifications, and final legal text.
- Deploy to a compatible Next.js Node host and verify the actual domain. No live deployment or regulatory certification is claimed.

The checked-in SQL and server integrations are implemented; these external checks cannot be completed without a configured Supabase project and deployment environment. The local fallback is deliberately restricted to development, and the production build does not expose an unauthenticated demo editor.

## Repeat the checks

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` from the project directory. With the development server running on port 3000, run `npm run test:integration` and `npm run test:routes`. To check the unconfigured production security guards, start `npm run start -- --port 3001` without Supabase environment variables and run `npm run test:production` in another terminal.
