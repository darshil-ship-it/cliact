'use client';
import { Content, Entry, list, strings, text } from '@/types/cms';
export function ComparisonFields({ data, plans, onChange }: { data: Content; plans: Entry[]; onChange: (data: Content) => void }) {
    const cells = plans.map((plan, index) => ({ plan_id: plan.id, value: text(list(data, 'cells').find(cell => cell.plan_id === plan.id) ?? {}, 'value', strings(data, 'values')[index] ?? 'Discuss') }));
    return <div className="comparison-fields"><p className="field-hint">Choose check, cross, or enter a limit/custom value. Cells stay linked to the plan when columns are reordered.</p><div className="data-fields">{plans.map((plan, index) => <label className="field" key={plan.id}><span>{plan.title}</span><input list="comparison-cell-options" value={cells[index].value} onChange={event => onChange({ ...data, cells: cells.map((cell, i) => i === index ? { ...cell, value: event.target.value } : cell) })} /></label>)}</div><datalist id="comparison-cell-options"><option value="check" /><option value="cross" /><option value="Discuss" /><option value="Custom" /></datalist></div>;
}
