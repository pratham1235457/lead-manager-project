import React from 'react';
import { Users, Sparkles, PhoneCall, CheckCircle2, XCircle } from 'lucide-react';

const CARDS = [
{
key: 'Total',
label: 'Total Leads',
icon: Users,
badgeBg: 'bg-slate-100 text-slate-700',
activeRing: 'ring-slate-900',
},
{
key: 'New',
label: 'New',
icon: Sparkles,
badgeBg: 'bg-blue-50 text-blue-700',
activeRing: 'ring-blue-600',
},
{
key: 'Contacted',
label: 'Contacted',
icon: PhoneCall,
badgeBg: 'bg-amber-50 text-amber-700',
activeRing: 'ring-amber-500',
},
{
key: 'Qualified',
label: 'Qualified',
icon: CheckCircle2,
badgeBg: 'bg-emerald-50 text-emerald-700',
activeRing: 'ring-emerald-600',
},
{
key: 'Lost',
label: 'Lost',
icon: XCircle,
badgeBg: 'bg-rose-50 text-rose-700',
activeRing: 'ring-rose-600',
},
];

export default function StatsBar({ counts, activeStatus, onSelectStatus }) {
return (

{CARDS.map(({ key, label, icon: Icon, badgeBg, activeRing }) => {
const isSelected = (key === 'Total' && activeStatus === '') || activeStatus === key;
return (
<button
key={key}
type="button"
onClick={() => onSelectStatus(key === 'Total' ? '' : key)}
className={text-left bg-white rounded-xl border border-slate-200 p-4 shadow-sm transition-all hover:border-slate-300 ${ isSelected ? ring-2 ${activeRing} : '' }}
>


{label}

<span className=`{p-1.5 rounded-lg ${badgeBg}}`>



`{counts?.[key] ?? 0}

);
})}

);
}