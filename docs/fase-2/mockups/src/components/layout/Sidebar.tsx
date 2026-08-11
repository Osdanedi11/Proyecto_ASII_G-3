import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, GraduationCap, X } from 'lucide-react';
import { actorLabels } from '../../data/sourceOfTruth';
import { cn } from '../../utils/cn';
import type { NavigationItem } from '../../routes/navigation';
import type { Role } from '../../types';

type SidebarProps = {
  role: Role;
  items: NavigationItem[];
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
};

export function Sidebar({ role, items, open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  return (
    <>
      {open ? <button aria-label="Cerrar menú" className="fixed inset-0 z-30 bg-slate-950/75 lg:hidden" onClick={onClose} /> : null}
      <aside
        className={cn(
          'glass-panel fixed inset-y-3 left-3 z-40 flex w-[280px] flex-col rounded-2xl p-4 transition-transform lg:sticky lg:top-4 lg:z-auto lg:h-[calc(100vh-2rem)] lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-[115%]',
          collapsed ? 'lg:w-[88px]' : 'lg:w-[260px]',
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-xl bg-cyan-400/10 p-2.5 text-cyan-100"><GraduationCap className="size-6" /></div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="section-title">PGPTE</p>
                <p className="truncate text-sm font-semibold text-white">Proyectos y tareas</p>
              </div>
            ) : null}
          </div>
          <button className="rounded-lg p-2 text-slate-300 hover:bg-white/6 lg:hidden" aria-label="Cerrar menú" onClick={onClose}>
            <X className="size-5" />
          </button>
        </div>

        {!collapsed ? (
          <div className="mt-5 rounded-xl bg-white/[0.035] px-3 py-3">
            <p className="section-title">Rol activo</p>
            <p className="mt-1 text-sm font-semibold text-white">{actorLabels[role]}</p>
          </div>
        ) : null}

        <nav aria-label="Navegación principal" className="mt-5 flex-1 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isHome = item.path.split('/').length === 3;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={isHome}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition',
                    isActive ? 'bg-cyan-400/12 text-cyan-100' : 'text-slate-300 hover:bg-white/6 hover:text-white',
                    collapsed && 'justify-center',
                  )
                }
              >
                <Icon className="size-5 shrink-0" />
                {!collapsed ? <span>{item.label}</span> : <span className="sr-only">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <button
          className="mt-3 hidden min-h-11 items-center justify-center rounded-xl text-slate-300 hover:bg-white/6 hover:text-white lg:flex"
          aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          onClick={onToggleCollapse}
        >
          {collapsed ? <ChevronRight className="size-5" /> : <><ChevronLeft className="mr-2 size-5" /> Ocultar menú</>}
        </button>
      </aside>
    </>
  );
}
