import { Bell, LogOut, Menu } from 'lucide-react';
import { actorLabels } from '../../data/sourceOfTruth';
import { Button } from '../common/Button';
import type { Project, Role } from '../../types';

type TopbarProps = {
  pageTitle: string;
  role: Role;
  userName: string;
  projects: Project[];
  activeProjectId?: string;
  unreadCount: number;
  onProjectChange: (projectId: string) => void;
  onNotificationsOpen: () => void;
  onMenuOpen: () => void;
  onLogout: () => void;
};

export function Topbar({
  pageTitle,
  role,
  userName,
  projects,
  activeProjectId,
  unreadCount,
  onProjectChange,
  onNotificationsOpen,
  onMenuOpen,
  onLogout,
}: TopbarProps) {
  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button aria-label="Abrir menú" className="rounded-xl p-2 text-slate-200 hover:bg-white/6 lg:hidden" onClick={onMenuOpen}>
          <Menu className="size-5" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-white">{pageTitle}</p>
          <p className="truncate text-xs text-slate-400">{actorLabels[role]} · {userName}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {projects.length > 1 && role !== 'auditor' ? (
          <label className="order-3 flex w-full items-center gap-2 sm:order-none sm:w-auto">
            <span className="sr-only">Proyecto activo</span>
            <select aria-label="Proyecto activo" className="form-control w-full py-2 text-sm sm:max-w-80" value={activeProjectId} onChange={(event) => onProjectChange(event.target.value)}>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.course} — {project.name}</option>)}
            </select>
          </label>
        ) : null}
        <button type="button" className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm text-slate-200 hover:bg-white/6" aria-label={`Abrir notificaciones: ${unreadCount} sin leer`} onClick={onNotificationsOpen}>
          <Bell className="size-5 text-cyan-200" /><span className="hidden sm:inline">{unreadCount}</span>
        </button>
        <Button variant="ghost" onClick={onLogout}><LogOut className="mr-2 size-4" /><span className="hidden sm:inline">Salir</span></Button>
      </div>
    </header>
  );
}
