export type Value = string | number | boolean | null | Value[] | {
    [key: string]: Value;
};
export type Content = {
    [key: string]: Value;
};
export type Entry = {
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published';
    enabled: boolean;
    sort_order: number;
    data: Content;
    created_at: string;
    updated_at: string;
    page_id?: string;
    section_type?: string;
};
export type EditableEntry = Omit<Entry, 'created_at' | 'updated_at'>;
export type Database = Record<string, Entry[]>;
export const sectionTypes = ['HeroSection', 'FeatureGrid', 'MediaSplitSection', 'ProductShowcase', 'InteractiveMediaTabs', 'ScrollSolutionsSection', 'AgentShowcase', 'SpecialtySelector', 'Testimonials', 'LogoMarquee', 'ResultsGrid', 'SecurityGrid', 'PricingCards', 'AgentPricingGrid', 'ComparisonTable', 'CompanyTimeline', 'MediaGallery', 'GlobalReachSection', 'FAQAccordion', 'CTASection', 'BlogGrid', 'RichTextSection'] as const;
export const tables = ['pages', 'page_sections', 'navigation_items', 'site_settings', 'theme_settings', 'specialties', 'features', 'ai_agents', 'testimonials', 'results', 'faq_items', 'pricing_plans', 'pricing_plan_features', 'agent_pricing', 'comparison_features', 'organization_content', 'team_members', 'company_timeline', 'partnerships', 'gallery_items', 'blog_posts', 'blog_categories', 'blog_tags', 'leads', 'compliance_badges'] as const;
export type Table = typeof tables[number];
export const text = (data: Content, key: string, fallback = ''): string => typeof data[key] === 'string' && data[key] !== '' ? data[key] as string : fallback;
export const list = (data: Content, key: string): Content[] => Array.isArray(data[key]) ? (data[key] as Value[]).filter((v): v is Content => typeof v === 'object' && v !== null && !Array.isArray(v)) : [];
export const strings = (data: Content, key: string): string[] => Array.isArray(data[key]) ? (data[key] as Value[]).filter((v): v is string => typeof v === 'string') : [];
