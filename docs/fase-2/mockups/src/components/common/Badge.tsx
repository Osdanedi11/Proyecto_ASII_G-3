import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type BadgeProps = {
  children: ReactNode;
  tone?: 'default' | 'info' | 'success' | 'warning' | 'danger';
  className?: string;
};

export function Badge({ children, tone = 'default', className }: BadgeProps) {
  const tones = {
    default: 'bg-white/6 text-slate-200 border-white/10',
    info: 'bg-cyan-400/10 text-cyan-200 border-cyan-300/20',
    success: 'bg-emerald-400/10 text-emerald-200 border-emerald-300/20',
    warning: 'bg-amber-400/10 text-amber-200 border-amber-300/20',
    danger: 'bg-rose-400/10 text-rose-200 border-rose-300/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[0.16em] uppercase',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
