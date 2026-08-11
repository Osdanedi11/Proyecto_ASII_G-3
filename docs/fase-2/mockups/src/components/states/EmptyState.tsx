import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function EmptyState({ title, description, icon: Icon }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-10 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
        <Icon className="size-6 text-cyan-200" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
