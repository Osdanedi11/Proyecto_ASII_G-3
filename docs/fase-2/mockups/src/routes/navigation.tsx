import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardCheck,
  FileText,
  FolderKanban,
  History,
  Home,
  ListTodo,
  Settings,
  ShieldCheck,
  Star,
  UserCog,
  UsersRound,
} from 'lucide-react';
import type { Role } from '../types';

export type NavigationItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: Role[];
};

const roleItems: Record<Role, NavigationItem[]> = {
  estudiante: [
    { label: 'Inicio', path: '/app/estudiante', icon: Home, roles: ['estudiante'] },
    { label: 'Mis proyectos', path: '/app/estudiante/proyectos', icon: FolderKanban, roles: ['estudiante'] },
    { label: 'Mis tareas', path: '/app/estudiante/tareas', icon: ListTodo, roles: ['estudiante'] },
    { label: 'Calendario', path: '/app/estudiante/calendario', icon: CalendarDays, roles: ['estudiante'] },
    { label: 'Notificaciones', path: '/app/estudiante/notificaciones', icon: Bell, roles: ['estudiante'] },
  ],
  lider: [
    { label: 'Inicio', path: '/app/lider', icon: Home, roles: ['lider'] },
    { label: 'Proyecto actual', path: '/app/lider/proyecto', icon: FolderKanban, roles: ['lider'] },
    { label: 'Tareas', path: '/app/lider/tareas', icon: ListTodo, roles: ['lider'] },
    { label: 'Equipo', path: '/app/lider/equipo', icon: UsersRound, roles: ['lider'] },
    { label: 'Cronograma', path: '/app/lider/cronograma', icon: CalendarDays, roles: ['lider'] },
    { label: 'Historial', path: '/app/lider/historial', icon: History, roles: ['lider'] },
  ],
  profesor: [
    { label: 'Inicio', path: '/app/profesor', icon: Home, roles: ['profesor'] },
    { label: 'Proyectos', path: '/app/profesor/proyectos', icon: FolderKanban, roles: ['profesor'] },
    { label: 'Revisiones', path: '/app/profesor/revisiones', icon: ClipboardCheck, roles: ['profesor'] },
    { label: 'Evaluaciones', path: '/app/profesor/evaluaciones', icon: Star, roles: ['profesor'] },
    { label: 'Reportes', path: '/app/profesor/reportes', icon: FileText, roles: ['profesor'] },
  ],
  administrador: [
    { label: 'Resumen', path: '/app/administracion', icon: BarChart3, roles: ['administrador'] },
    { label: 'Usuarios', path: '/app/administracion/usuarios', icon: UserCog, roles: ['administrador'] },
    { label: 'Proyectos', path: '/app/administracion/proyectos', icon: FolderKanban, roles: ['administrador'] },
    { label: 'Actividad', path: '/app/administracion/actividad', icon: Activity, roles: ['administrador'] },
    { label: 'Configuración', path: '/app/administracion/configuracion', icon: Settings, roles: ['administrador'] },
  ],
  auditor: [
    { label: 'Resumen', path: '/app/auditoria', icon: BarChart3, roles: ['auditor'] },
    { label: 'Bitácora', path: '/app/auditoria/bitacora', icon: ShieldCheck, roles: ['auditor'] },
    { label: 'Reportes de auditoría', path: '/app/auditoria/reportes', icon: FileText, roles: ['auditor'] },
  ],
};

export const navigationItems = Object.values(roleItems).flat();

export function getNavigationByRole(role: Role | null) {
  return role ? roleItems[role] : [];
}
