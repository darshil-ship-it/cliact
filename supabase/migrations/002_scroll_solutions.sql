-- Allow the CMS page builder to publish the scroll-controlled Solutions section
-- in projects that already applied 001_cms.sql.
alter table public.page_sections drop constraint if exists page_sections_section_type_check;
alter table public.page_sections add constraint page_sections_section_type_check check(section_type in (
  'HeroSection','FeatureGrid','MediaSplitSection','ProductShowcase','InteractiveMediaTabs',
  'ScrollSolutionsSection','AgentShowcase','SpecialtySelector','Testimonials','LogoMarquee',
  'ResultsGrid','SecurityGrid','PricingCards','AgentPricingGrid','ComparisonTable','CompanyTimeline',
  'MediaGallery','GlobalReachSection','FAQAccordion','CTASection','BlogGrid','RichTextSection'
));
