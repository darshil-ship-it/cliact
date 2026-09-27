import { footerDefaults } from '@/lib/footer';
import { Content, Table } from '@/types/cms';
export const adminGroups = [{ label: 'Overview', items: [['Dashboard', '/admin', 'LayoutDashboard']] }, { label: 'Website', items: [['Pages', '/admin/pages', 'PanelsTopLeft'], ['Navigation', '/admin/navigation', 'Menu'], ['Footer', '/admin/footer', 'PanelBottom']] }, { label: 'Content', items: [['Specialties', '/admin/specialties', 'Stethoscope'], ['Solutions', '/admin/solutions', 'Layers'], ['AI Agents', '/admin/agents', 'Sparkles'], ['Features', '/admin/features', 'Grid2X2'], ['Testimonials', '/admin/testimonials', 'Quote'], ['Results', '/admin/results', 'ChartNoAxesCombined'], ['FAQs', '/admin/faqs', 'CircleHelp'], ['Blog', '/admin/blog', 'Newspaper']] }, { label: 'Business', items: [['Pricing', '/admin/pricing', 'CreditCard'], ['Organizations', '/admin/organizations', 'Building2'], ['Leads', '/admin/leads', 'Inbox']] }, { label: 'Company', items: [['Story', '/admin/story', 'History'], ['Team', '/admin/team', 'Users'], ['Gallery', '/admin/gallery', 'Images'], ['Partnerships', '/admin/partnerships', 'Handshake']] }, { label: 'Design', items: [['Theme', '/admin/theme', 'Palette'], ['Animations', '/admin/animations', 'WandSparkles'], ['Media URLs', '/admin/media', 'Link']] }, { label: 'Settings', items: [['Company Info', '/admin/company-info', 'Building'], ['SEO', '/admin/seo', 'Search'], ['Analytics', '/admin/analytics', 'ChartLine'], ['Social Links', '/admin/social-links', 'Share2'], ['Compliance', '/admin/compliance', 'ShieldCheck'], ['Admin Users', '/admin/users', 'UserCog']] }];
export const modules: Record<string, {
    title: string;
    description: string;
    table: Table;
    fields?: string[];
    extra?: Table[];
}> = {
    pages: { title: 'Pages', description: 'Your website, section by section.', table: 'pages' },
    navigation: { title: 'Navigation', description: 'One menu for desktop and mobile. Drag to change the order.', table: 'navigation_items' },
    footer: { title: 'Footer', description: 'The finishing details of your public website.', table: 'site_settings', fields: ['footer_text', 'footer_note', 'copyright', 'footer_columns', 'legal_links', 'social_links'] },
    specialties: { title: 'Specialties', description: 'Make room for every way of caring.', table: 'specialties' },
    solutions: { title: 'Solutions', description: 'Manage the specialties shown on your solutions page.', table: 'specialties' },
    agents: { title: 'AI Agents', description: 'Focused support, managed in one place.', table: 'ai_agents' },
    features: { title: 'Features', description: 'The capabilities behind a better working day.', table: 'features' },
    testimonials: { title: 'Testimonials', description: 'Publish only approved testimonials. Keep illustrative reviews labeled.', table: 'testimonials' },
    results: { title: 'Results', description: 'Only publish measurable claims with supporting evidence.', table: 'results' },
    faqs: { title: 'Frequently asked questions', description: 'Clear answers for curious people.', table: 'faq_items' },
    blog: { title: 'The journal', description: 'Create, preview, and publish your stories.', table: 'blog_posts', extra: ['blog_categories', 'blog_tags'] },
    pricing: { title: 'Pricing', description: 'Plans, agents, and every detail in between.', table: 'pricing_plans', extra: ['pricing_plan_features', 'agent_pricing', 'comparison_features'] },
    organizations: { title: 'Organizations', description: 'Manage integration availability and organizational capabilities.', table: 'organization_content' },
    leads: { title: 'Your conversations', description: 'Demo requests, messages, and newsletter signups.', table: 'leads' },
    story: { title: 'Company story', description: 'The moments that shape Cliact.', table: 'company_timeline' },
    team: { title: 'Your team', description: 'Introduce the people behind the purpose.', table: 'team_members' },
    gallery: { title: 'Life at Cliact', description: 'Add approved images and videos by URL.', table: 'gallery_items' },
    partnerships: { title: 'Partnerships', description: 'Opportunities to build something together.', table: 'partnerships' },
    theme: { title: 'Make it Cliact', description: 'Your central brand system. Changes appear across the website.', table: 'theme_settings' },
    animations: { title: 'Motion settings', description: 'Choose restrained section animations. Reduced-motion preferences are always respected.', table: 'page_sections', fields: ['animation'] },
    media: { title: 'Media library', description: 'URL-based media. No uploads needed.', table: 'gallery_items' },
    'company-info': { title: 'Company information', description: 'Shared contact details and conversion buttons.', table: 'site_settings', fields: ['name', 'description', 'email', 'cta_primary', 'cta_primary_url', 'cta_secondary', 'cta_secondary_url','newsletter_heading','newsletter_description'] },
    seo: { title: 'Search & sharing', description: 'Page metadata, canonical URLs, and indexing preferences.', table: 'pages', fields: ['seo_title', 'seo_description', 'og_image_url', 'canonical', 'index', 'follow'] },
    analytics: { title: 'Analytics', description: 'Tracking scripts load only after visitor consent and when valid IDs are configured.', table: 'site_settings', fields: ['ga4', 'gtm', 'meta_pixel', 'linkedin', 'search_console'] },
    'social-links': { title: 'Social links', description: 'The places people can find Cliact.', table: 'site_settings', fields: ['social_links'] },
    compliance: { title: 'Verified compliance', description: 'Only records marked verified are visible publicly. Add evidence before verification.', table: 'compliance_badges' }
};
export const mediaDefaults: Content = { media_url: '', media_type: 'image', alt: '', fit: 'cover', position: 'center', radius: 18, autoplay: true, loop: true, muted: true, playsInline: true, controls: false, poster_url: '' };
export function sectionTypeDefaults(type: string): Content {
    const collections: Record<string, string> = { FeatureGrid: 'features', AgentShowcase: 'ai_agents', SpecialtySelector: 'specialties', Testimonials: 'testimonials', ResultsGrid: 'results', PricingCards: 'pricing_plans', AgentPricingGrid: 'agent_pricing', ComparisonTable: 'comparison_features', FAQAccordion: 'faq_items', CompanyTimeline: 'company_timeline', MediaGallery: 'gallery_items', BlogGrid: 'blog_posts', LogoMarquee: 'compliance_badges' };
    return {
        ...(collections[type] ? { collection: collections[type] } : {}),
        ...(type === 'RichTextSection' ? { content: '' } : {}),
        ...(type === 'GlobalReachSection' ? { country_count: '', verified: false } : {}),
        ...(type === 'HeroSection' ? { support_heading: 'How can AI support you?' } : {}),
        ...(type === 'ScrollSolutionsSection' ? { items: [
            { title: 'AI Clinical Notes', nav_label: 'From conversation to draft', description: 'Turn a consultation into a structured draft while keeping clinical review at the centre.', benefits: ['Structured draft', 'Clinician review', 'Physio context'], visual: 'notes' },
            { title: 'Practice Assistant', nav_label: 'Keep the day moving', description: 'Bring appointments and useful prompts into one calm view of the working day.', benefits: ['Task prompts', 'Daily overview', 'Team visibility'], visual: 'assistant' },
            { title: 'Patient Follow-ups', nav_label: 'Stay connected after care', description: 'Prepare a thoughtful message for the clinician to edit and approve before it is sent.', benefits: ['Review before sending', 'Exercise context', 'Consistent follow-up'], visual: 'followups' },
            { title: 'Billing and Operations', nav_label: 'See what needs attention', description: 'Keep appointment status and billing follow-up together without losing sight of patient care.', benefits: ['Clear queues', 'Billing checks', 'Appointment context'], visual: 'operations' },
            { title: 'Clinic Insights', nav_label: 'Turn activity into action', description: 'Understand practice activity and surface useful next steps for the team.', benefits: ['Weekly patterns', 'Actionable prompts', 'Practice overview'], visual: 'insights' },
        ] } : {}),
        ...(['ProductShowcase', 'MediaSplitSection'].includes(type) ? { layout: 'half', reverse: false } : {})
    };
}
export const sectionDefaults: Content = { eyebrow: '', heading: 'A new section', description: '', button_primary: '', button_primary_url: '/book-demo', button_secondary: '', button_secondary_url: '/connect', background: 'default', alignment: 'left', animation: 'fade-up', collection: '', items: [], ...mediaDefaults };
export const defaults: Partial<Record<Table, Content>> = { site_settings: footerDefaults, pages: { seo_title: '', seo_description: '', og_image_url: '', canonical: '', index: true, follow: true }, page_sections: sectionDefaults, navigation_items: { url: '/', new_tab: false, children: [] }, specialties: { description: '', long_description: '', icon_url: '', page_url: '/book-demo', ...mediaDefaults }, features: { description: '', icon: 'Activity' }, ai_agents: { nav_label: '', description: '', benefits: [], visual: 'notes', ...mediaDefaults }, testimonials: { quote: '', name: '', role: '', clinic: '', rating: 5, avatar_url: '', sample: true }, results: { value: '', description: '', evidence_url: '', verified: false }, faq_items: { answer: '' }, pricing_plans: { description: '', monthly_price: null, yearly_price: null, currency: 'USD', billing_interval: 'month', badge: '', highlighted: false, cta_text: 'Book a Demo', cta_url: '/book-demo', features: [], sample: true }, pricing_plan_features: { plan_id: '' }, agent_pricing: { description: '', price: null, currency: 'USD', billing: 'per month', url: '/book-demo' }, comparison_features: { values: [] }, organization_content: { description: '', available: false }, team_members: { role: '', bio: '', image_url: '', linkedin_url: '', sample: false }, company_timeline: { year: '', description: '', sample: false }, partnerships: { description: '', url: '/connect' }, gallery_items: { category: 'team', description: '', ...mediaDefaults }, blog_posts: { excerpt: '', content: '# Your story\n\nStart writing here.', author: '', author_avatar_url: '', cover_image_url: '', category: '', tags: [], published_date: new Date().toISOString().slice(0, 10), featured: false, seo_title: '', seo_description: '', og_image_url: '', sample: false }, compliance_badges: { verified: false, description: '', url: '', verification_status: 'pending' } };
export const label = (key: string) => key.replaceAll('_', ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, v => v.toUpperCase());
