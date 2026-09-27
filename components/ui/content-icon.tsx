import { Activity, Calendar, ChartNoAxesCombined, ClipboardList, FileText, MessageSquare, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
const icons = { Activity, Calendar, ChartNoAxesCombined, ClipboardList, FileText, MessageSquare, RefreshCw, ShieldCheck, Sparkles };
export function ContentIcon({ name, size = 20 }: { name: string; size?: number }) {
    const Icon = icons[name as keyof typeof icons] ?? Sparkles;
    return <Icon size={size} />;
}
