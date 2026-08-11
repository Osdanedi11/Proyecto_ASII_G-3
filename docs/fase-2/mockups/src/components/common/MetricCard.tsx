import type { LucideIcon } from 'lucide-react';
import { Card } from './Card';

type MetricCardProps = {
  label: string;
  value: string;
  trend: string;
  accent: 'cyan' | 'blue' | 'violet' | 'success' | 'warning';
  icon: LucideIcon;
};

const accentMap = {
  cyan: 'text-cyan-200 bg-cyan-400/10',
  blue: 'text-blue-200 bg-blue-400/10',
  violet: 'text-violet-200 bg-violet-400/10',
  success: 'text-emerald-200 bg-emerald-400/10',
  warning: 'text-amber-200 bg-amber-400/10',
};

export function MetricCard({ label, value, trend, accent, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-title">{label}</p>
          <p className="numeric mt-3 text-3xl font-semibold text-white">{value}</p>
          <p className="mt-2 line-clamp-1 text-sm text-slate-400">{trend}</p>
        </div>
        <div className={`rounded-xl p-3 ${accentMap[accent]}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}
