-- Repair CMS Data API grants and RLS policies for existing deployments.
-- Safe to run more than once after 001_cms.sql has created the schema.

grant usage on schema public to anon, authenticated;

do $$
declare
  t text;
  public_tables text[] := array[
    'pages','navigation_items','site_settings','theme_settings','specialties',
    'features','ai_agents','testimonials','results','faq_items','pricing_plans',
    'pricing_plan_features','agent_pricing','comparison_features',
    'organization_content','team_members','company_timeline','partnerships',
    'gallery_items','blog_posts','blog_categories','blog_tags'
  ];
  managed_tables text[];
begin
  managed_tables := public_tables || array['page_sections','leads','compliance_badges'];
  foreach t in array managed_tables loop
    if to_regclass(format('public.%I', t)) is null then
      raise exception 'Missing CMS table public.%. Run 001_cms.sql first.', t;
    end if;

    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);

    execute format('drop policy if exists admin_manage on public.%I', t);
    execute format(
      'create policy admin_manage on public.%I for all to authenticated using(public.is_admin()) with check(public.is_admin())',
      t
    );
  end loop;

  foreach t in array public_tables loop
    execute format('grant select on table public.%I to anon', t);
    execute format('drop policy if exists public_published on public.%I', t);
    execute format(
      'create policy public_published on public.%I for select to anon, authenticated using(status=''published'' and enabled)',
      t
    );
  end loop;
end $$;

revoke all on table public.page_sections from anon;
grant select on table public.page_sections to anon;
drop policy if exists public_sections on public.page_sections;
create policy public_sections on public.page_sections
  for select to anon, authenticated
  using (
    enabled and status = 'published'
    and exists (
      select 1 from public.pages p
      where p.id = page_id and p.enabled and p.status = 'published'
    )
  );

revoke all on table public.compliance_badges from anon;
grant select on table public.compliance_badges to anon;
drop policy if exists public_verified_badges on public.compliance_badges;
create policy public_verified_badges on public.compliance_badges
  for select to anon, authenticated
  using (enabled and status = 'published' and data->>'verified' = 'true');

-- Leads stay private. Public form submissions use the server-only service role.
revoke all on table public.leads from anon;

revoke all on function public.is_admin() from public;
revoke all on function public.is_owner() from public;
grant execute on function public.is_admin(), public.is_owner() to anon, authenticated;
