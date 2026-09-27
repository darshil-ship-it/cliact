-- NexAct CMS. Run once in the Supabase SQL editor, or use supabase db push.
create extension if not exists pgcrypto;
grant usage on schema public to anon, authenticated;

create table public.admin_users (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'editor' check(role in ('editor','owner')),
 enabled boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant select,insert,update,delete on table public.admin_users to authenticated;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admin_users where id=auth.uid() and enabled); $$;
create or replace function public.is_owner() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admin_users where id=auth.uid() and enabled and role='owner'); $$;
revoke all on function public.is_admin() from public;
revoke all on function public.is_owner() from public;
grant execute on function public.is_admin(), public.is_owner() to authenticated,anon;
create policy admin_self_read on public.admin_users for select to authenticated using(id=auth.uid() or public.is_owner());
-- Membership can only be changed by an owner via the server route; never public signup metadata.
create policy owner_manage on public.admin_users for all to authenticated using(public.is_owner()) with check(public.is_owner());

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now(); return new; end; $$;

do $$ declare t text; begin
 foreach t in array array['pages','page_sections','navigation_items','site_settings','theme_settings','specialties','features','ai_agents','testimonials','results','faq_items','pricing_plans','pricing_plan_features','agent_pricing','comparison_features','organization_content','team_members','company_timeline','partnerships','gallery_items','blog_posts','blog_categories','blog_tags','leads','compliance_badges'] loop
 execute format('create table public.%I (id uuid primary key default gen_random_uuid(),title text not null,slug text not null default '''',status text not null default ''draft'' check(status in (''draft'',''published'')),enabled boolean not null default true,sort_order integer not null default 0,data jsonb not null default ''{}''::jsonb check(jsonb_typeof(data)=''object''),created_at timestamptz not null default now(),updated_at timestamptz not null default now())',t);
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on table public.%I from anon,authenticated',t);
 execute format('grant select,insert,update,delete on table public.%I to authenticated',t);
 execute format('create policy admin_manage on public.%I for all to authenticated using(public.is_admin()) with check(public.is_admin())',t);
 if t not in ('leads','page_sections','compliance_badges') then
 execute format('grant select on table public.%I to anon',t);
 execute format('create policy public_published on public.%I for select to anon,authenticated using(status=''published'' and enabled)',t);
 end if;
 execute format('create index on public.%I (status,enabled,sort_order)',t);
 execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',t);
 end loop;
end $$;

create unique index pages_slug_unique on public.pages(slug);
create unique index posts_slug_unique on public.blog_posts(slug);
create unique index specialties_slug_unique on public.specialties(slug);
alter table public.page_sections add column page_id uuid not null references public.pages(id) on delete cascade;
alter table public.page_sections add column section_type text not null check(section_type in ('HeroSection','FeatureGrid','MediaSplitSection','ProductShowcase','InteractiveMediaTabs','ScrollSolutionsSection','AgentShowcase','SpecialtySelector','Testimonials','LogoMarquee','ResultsGrid','SecurityGrid','PricingCards','AgentPricingGrid','ComparisonTable','CompanyTimeline','MediaGallery','GlobalReachSection','FAQAccordion','CTASection','BlogGrid','RichTextSection'));
create index on public.page_sections(page_id,sort_order);
create policy public_sections on public.page_sections for select to anon,authenticated using(enabled and status='published' and exists(select 1 from public.pages p where p.id=page_id and p.enabled and p.status='published'));
create policy public_verified_badges on public.compliance_badges for select to anon,authenticated using(enabled and status='published' and data->>'verified'='true');
grant select on table public.page_sections,public.compliance_badges to anon;

-- Foreign keys retain the extensible editor payload while enforcing parent relationships.
alter table public.pricing_plan_features add column plan_id uuid generated always as ((data->>'plan_id')::uuid) stored references public.pricing_plans(id) on delete cascade;
create index on public.pricing_plan_features(plan_id);
create table public.blog_post_tags(post_id uuid references public.blog_posts(id) on delete cascade,tag_id uuid references public.blog_tags(id) on delete cascade,primary key(post_id,tag_id));
alter table public.blog_post_tags enable row level security;
revoke all on table public.blog_post_tags from anon,authenticated;
grant select,insert,update,delete on table public.blog_post_tags to authenticated;
grant select on table public.blog_post_tags to anon;
create policy tags_admin on public.blog_post_tags for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy tags_public on public.blog_post_tags for select to anon,authenticated using(exists(select 1 from public.blog_posts p where p.id=post_id and p.status='published' and p.enabled));

create table public.rate_limits (key text primary key,started_at timestamptz not null,count integer not null default 1);
alter table public.rate_limits enable row level security;
create or replace function public.consume_rate_limit(bucket_key text,maximum integer default 5,window_seconds integer default 3600) returns boolean language plpgsql security definer set search_path=public as $$
 declare used integer; begin
 insert into public.rate_limits(key,started_at,count) values(bucket_key,now(),1) on conflict(key) do update set count=case when rate_limits.started_at<now()-make_interval(secs=>window_seconds) then 1 else rate_limits.count+1 end,started_at=case when rate_limits.started_at<now()-make_interval(secs=>window_seconds) then now() else rate_limits.started_at end returning count into used;
 return used<=maximum; end; $$;
revoke all on function public.consume_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text,integer,integer) to service_role;

-- Atomic ordering, table name allowlisted to prevent arbitrary dynamic SQL.
create or replace function public.reorder_content(target_table text,ordered_ids uuid[]) returns void language plpgsql security invoker set search_path=public as $$
 begin
 if not public.is_admin() then raise exception 'Administrator access required'; end if;
 if target_table<>all(array['pages','page_sections','navigation_items','site_settings','theme_settings','specialties','features','ai_agents','testimonials','results','faq_items','pricing_plans','pricing_plan_features','agent_pricing','comparison_features','organization_content','team_members','company_timeline','partnerships','gallery_items','blog_posts','blog_categories','blog_tags','leads','compliance_badges']) then raise exception 'Invalid collection'; end if;
 execute format('update public.%I r set sort_order=o.position-1 from unnest($1) with ordinality o(id,position) where r.id=o.id',target_table) using ordered_ids;
 end; $$;
revoke all on function public.reorder_content(text,uuid[]) from public,anon;
grant execute on function public.reorder_content(text,uuid[]) to authenticated;

create table public.analytics_events(id uuid primary key default gen_random_uuid(),path text not null,event_type text not null check(event_type in ('page_view','blog_view')),created_at timestamptz not null default now());
alter table public.analytics_events enable row level security;
create policy admin_read_events on public.analytics_events for select to authenticated using(public.is_admin());
create index on public.analytics_events(created_at,event_type);
-- Leads/events are inserted only by server routes with validation and persistent rate limits.
-- No anon INSERT policy and no public reads of leads, rate limit buckets, or events.

-- SECURITY: never place credentials, patient data, or internal secrets in public CMS tables.
-- Retention maintenance: schedule DELETE FROM rate_limits WHERE started_at < now()-interval '2 days';
-- Agree retention for leads and analytics before launch; delete expired records on a schedule.
