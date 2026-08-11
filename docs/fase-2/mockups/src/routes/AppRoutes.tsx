import { Suspense, lazy, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingState } from '../components/states/LoadingState';
import { AppLayout } from '../layouts/AppLayout';
import { usePrototypeStore } from '../modules/auth/auth-store';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import type { Role } from '../types';

const roleHome: Record<Role, string> = {
  estudiante: '/app/estudiante',
  lider: '/app/lider',
  profesor: '/app/profesor',
  administrador: '/app/administracion',
  auditor: '/app/auditoria',
};

const StudentPage = lazy(async () => ({ default: (await import('../pages/StudentPage')).StudentPage }));
const LeaderPage = lazy(async () => ({ default: (await import('../pages/LeaderPage')).LeaderPage }));
const ProfessorPage = lazy(async () => ({ default: (await import('../pages/ProfessorPage')).ProfessorPage }));
const AdminPage = lazy(async () => ({ default: (await import('../pages/AdminPage')).AdminPage }));
const AuditorPage = lazy(async () => ({ default: (await import('../pages/AuditorPage')).AuditorPage }));

function ProtectedRoute({ children }: { children: ReactNode }) {
  return usePrototypeStore((state) => state.currentRole) ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleRoute({ children, allowed }: { children: ReactNode; allowed: Role[] }) {
  const currentRole = usePrototypeStore((state) => state.currentRole);
  if (!currentRole) return <Navigate to="/login" replace />;
  return allowed.includes(currentRole) ? <>{children}</> : <Navigate to={roleHome[currentRole]} replace />;
}

function CurrentRoleHome() {
  const currentRole = usePrototypeStore((state) => state.currentRole);
  return <Navigate to={currentRole ? roleHome[currentRole] : '/login'} replace />;
}

export function AppRoutes() {
  const wrap = (node: ReactNode) => <Suspense fallback={<LoadingState />}>{node}</Suspense>;
  const student = (view: Parameters<typeof StudentPage>[0]['view']) => (
    <RoleRoute allowed={['estudiante']}>{wrap(<StudentPage view={view} />)}</RoleRoute>
  );
  const leader = (view: Parameters<typeof LeaderPage>[0]['view']) => (
    <RoleRoute allowed={['lider']}>{wrap(<LeaderPage view={view} />)}</RoleRoute>
  );
  const professor = (view: Parameters<typeof ProfessorPage>[0]['view']) => (
    <RoleRoute allowed={['profesor']}>{wrap(<ProfessorPage view={view} />)}</RoleRoute>
  );
  const admin = (view: Parameters<typeof AdminPage>[0]['view']) => (
    <RoleRoute allowed={['administrador']}>{wrap(<AdminPage view={view} />)}</RoleRoute>
  );
  const auditor = (view: Parameters<typeof AuditorPage>[0]['view']) => (
    <RoleRoute allowed={['auditor']}>{wrap(<AuditorPage view={view} />)}</RoleRoute>
  );

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<CurrentRoleHome />} />
        <Route path="inicio" element={<CurrentRoleHome />} />
        <Route path="overview" element={<CurrentRoleHome />} />

        <Route path="estudiante" element={student('inicio')} />
        <Route path="estudiante/proyectos" element={student('proyectos')} />
        <Route path="estudiante/proyectos/:id" element={student('proyecto-detalle')} />
        <Route path="estudiante/tareas" element={student('tareas')} />
        <Route path="estudiante/tareas/:id" element={student('tarea-detalle')} />
        <Route path="estudiante/calendario" element={student('calendario')} />
        <Route path="estudiante/notificaciones" element={student('notificaciones')} />

        <Route path="lider" element={leader('inicio')} />
        <Route path="lider/proyecto" element={leader('proyecto')} />
        <Route path="lider/tareas" element={leader('tareas')} />
        <Route path="lider/equipo" element={leader('equipo')} />
        <Route path="lider/cronograma" element={leader('cronograma')} />
        <Route path="lider/historial" element={leader('historial')} />

        <Route path="profesor" element={professor('inicio')} />
        <Route path="profesor/proyectos" element={professor('proyectos')} />
        <Route path="profesor/proyectos/:id" element={professor('proyecto-detalle')} />
        <Route path="profesor/revisiones" element={professor('revisiones')} />
        <Route path="profesor/revisiones/:id" element={professor('revision-detalle')} />
        <Route path="profesor/evaluaciones" element={professor('evaluaciones')} />
        <Route path="profesor/reportes" element={professor('reportes')} />

        <Route path="administracion" element={admin('resumen')} />
        <Route path="administracion/usuarios" element={admin('usuarios')} />
        <Route path="administracion/usuarios/:id" element={admin('usuario-detalle')} />
        <Route path="administracion/proyectos" element={admin('proyectos')} />
        <Route path="administracion/proyectos/:id" element={admin('proyecto-detalle')} />
        <Route path="administracion/actividad" element={admin('actividad')} />
        <Route path="administracion/configuracion" element={admin('configuracion')} />

        <Route path="auditoria" element={auditor('resumen')} />
        <Route path="auditoria/bitacora" element={auditor('bitacora')} />
        <Route path="auditoria/bitacora/:id" element={auditor('evento-detalle')} />
        <Route path="auditoria/reportes" element={auditor('reportes')} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
