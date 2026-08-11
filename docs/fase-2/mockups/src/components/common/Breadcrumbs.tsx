import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const labels: Record<string, string> = {
  estudiante: 'Estudiante',
  lider: 'Líder',
  profesor: 'Profesor',
  administracion: 'Administración',
  auditoria: 'Auditoría',
  proyectos: 'Proyectos',
  proyecto: 'Proyecto actual',
  tareas: 'Tareas',
  calendario: 'Calendario',
  notificaciones: 'Notificaciones',
  equipo: 'Equipo',
  cronograma: 'Cronograma',
  historial: 'Historial',
  revisiones: 'Revisiones',
  evaluaciones: 'Evaluaciones',
  reportes: 'Reportes',
  usuarios: 'Usuarios',
  actividad: 'Actividad',
  configuracion: 'Configuración',
  bitacora: 'Bitácora',
};

export function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean).slice(1);
  if (parts.length < 2) return null;

  return (
    <nav aria-label="Ruta de navegación" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-slate-400">
      {parts.map((part, index) => {
        const href = `/app/${parts.slice(0, index + 1).join('/')}`;
        const isLast = index === parts.length - 1;
        const label = labels[part] ?? (isLast ? 'Detalle' : part);
        return (
          <span key={href} className="flex items-center gap-1">
            {index > 0 ? <ChevronRight className="size-3" /> : null}
            {isLast ? <span aria-current="page" className="text-slate-200">{label}</span> : <Link className="hover:text-white" to={href}>{label}</Link>}
          </span>
        );
      })}
    </nav>
  );
}
