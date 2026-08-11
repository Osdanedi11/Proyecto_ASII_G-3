import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, AlertTriangle, FolderKanban, UserCog, Users } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { FeedbackMessage } from '../components/common/FeedbackMessage';
import { FormField } from '../components/common/FormField';
import { MetricCard } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { PageHeader } from '../components/common/PageHeader';
import { Pagination } from '../components/common/Pagination';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/states/EmptyState';
import { LoadingState } from '../components/states/LoadingState';
import { usePageReady } from '../hooks/usePageReady';
import { usePrototypeContext } from '../hooks/usePrototypeContext';
import { usePrototypeStore } from '../modules/auth/auth-store';
import type { ProjectStatus, Role } from '../types';
import { formatDate, formatDateTime, roleLabel, statusLabel } from '../utils/format';

export type AdminView =
  | 'resumen'
  | 'usuarios'
  | 'usuario-detalle'
  | 'proyectos'
  | 'proyecto-detalle'
  | 'actividad'
  | 'configuracion';

type PendingAction =
  | { type: 'user-status'; id: string; label: string }
  | { type: 'role'; id: string; role: Role; label: string }
  | { type: 'project-status'; id: string; status: ProjectStatus; label: string }
  | null;

const roles: Role[] = ['estudiante', 'lider', 'profesor', 'administrador', 'auditor'];

export function AdminPage({ view }: { view: AdminView }) {
  const ready = usePageReady(120);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = usePrototypeContext();
  const users = usePrototypeStore((state) => state.users);
  const projects = usePrototypeStore((state) => state.projects);
  const auditLogs = usePrototypeStore((state) => state.auditLogs);
  const createUser = usePrototypeStore((state) => state.createUser);
  const toggleUserStatus = usePrototypeStore((state) => state.toggleUserStatus);
  const updateUserRole = usePrototypeStore((state) => state.updateUserRole);
  const updateProjectStatus = usePrototypeStore((state) => state.updateProjectStatus);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<PendingAction>(null);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'estudiante' as Role });
  const [moduleFilter, setModuleFilter] = useState('todos');
  const [userFilter, setUserFilter] = useState('todos');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  if (!ready || !currentUser) return <LoadingState />;

  const pageSize = 10;
  const selectedUser = users.find((user) => user.id === id);
  const selectedProject = projects.find((project) => project.id === id);
  const confirmAction = () => {
    if (!pending) return;
    if (pending.type === 'user-status') toggleUserStatus(pending.id);
    if (pending.type === 'role') updateUserRole(pending.id, pending.role);
    if (pending.type === 'project-status') updateProjectStatus(pending.id, pending.status);
    setMessage(
      pending.type === 'role'
        ? 'El rol del usuario fue actualizado.'
        : pending.type === 'project-status'
          ? 'El estado del proyecto se actualizó correctamente.'
          : 'El estado de la cuenta se actualizó correctamente.',
    );
    setMessageError(false);
    setPending(null);
  };

  if (view === 'resumen') {
    const activeUsers = users.filter((user) => user.status === 'activo').length;
    const activeProjects = projects.filter((project) => project.status === 'activo').length;
    const alerts = users.filter((user) => user.status === 'inactivo').length + projects.filter((project) => project.status === 'pausado').length;
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Administración" title="Resumen administrativo" description="Estado general de cuentas, proyectos y actividad reciente." />
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Usuarios activos" value={`${activeUsers}`} trend="Cuentas disponibles" accent="cyan" icon={Users} />
          <MetricCard label="Proyectos activos" value={`${activeProjects}`} trend="Portafolio académico" accent="blue" icon={FolderKanban} />
          <MetricCard label="Alertas" value={`${alerts}`} trend="Cuentas inactivas o proyectos pausados" accent="warning" icon={AlertTriangle} />
        </section>
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card><div className="flex items-center justify-between"><h2 className="font-semibold text-white">Actividad reciente</h2><Button variant="ghost" onClick={() => navigate('/app/administracion/actividad')}>Ver toda la actividad</Button></div><div className="mt-4 divide-y divide-white/8">{auditLogs.slice(0, 5).map((log) => <article key={log.id} className="py-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-white">{log.action}</p><Badge>{log.module}</Badge></div><p className="mt-1 text-sm text-slate-400">{log.detail}</p></article>)}</div></Card>
          <Card><h2 className="font-semibold text-white">Accesos rápidos</h2><div className="mt-4 grid gap-3"><Button onClick={() => navigate('/app/administracion/usuarios')}>Gestionar usuarios</Button><Button variant="secondary" onClick={() => navigate('/app/administracion/proyectos')}>Gestionar proyectos</Button></div></Card>
        </section>
      </div>
    );
  }

  if (view === 'usuario-detalle' && selectedUser) {
    return (
      <div className="space-y-5"><PageHeader eyebrow="Usuario" title={selectedUser.name} description="Detalle administrativo de una cuenta ficticia." /><Card><dl className="grid gap-5 sm:grid-cols-2"><div><dt className="section-title">Correo</dt><dd className="mt-2 text-white">{selectedUser.email}</dd></div><div><dt className="section-title">Rol</dt><dd className="mt-2 text-white">{roleLabel(selectedUser.role)}</dd></div><div><dt className="section-title">Estado</dt><dd className="mt-2"><StatusBadge status={selectedUser.status} /></dd></div><div><dt className="section-title">Última actividad</dt><dd className="mt-2 text-white">{formatDateTime(selectedUser.lastActive)}</dd></div></dl></Card></div>
    );
  }

  if (view === 'usuario-detalle' && !selectedUser) {
    return <EmptyState icon={UserCog} title="Usuario no encontrado" description="La cuenta solicitada no existe en los datos de demostración." />;
  }

  if (view === 'usuarios') {
    const filtered = users.filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase()) &&
      (roleFilter === 'todos' || user.role === roleFilter) &&
      (statusFilter === 'todos' || user.status === statusFilter),
    );
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Administración" title="Usuarios" description="Busca, filtra y administra cuentas simuladas." action={<Button onClick={() => setCreateOpen(true)}>Crear usuario simulado</Button>} />
        {message ? <FeedbackMessage tone={messageError ? 'error' : 'success'}>{message}</FeedbackMessage> : null}
        <Card><div className="grid gap-3 md:grid-cols-3"><FormField label="Buscar"><input className="form-control" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></FormField><FormField label="Rol"><select className="form-control" value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(1); }}><option value="todos">Todos</option>{roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></FormField><FormField label="Estado"><select className="form-control" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="todos">Todos</option><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></FormField></div></Card>
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-white/8 text-slate-400"><tr><th className="p-4 font-medium">Usuario</th><th className="p-4 font-medium">Rol</th><th className="p-4 font-medium">Estado</th><th className="p-4 font-medium">Acciones</th></tr></thead><tbody className="divide-y divide-white/8">{items.map((user) => <tr key={user.id}><td className="p-4"><button className="text-left font-medium text-white hover:text-cyan-200" onClick={() => navigate(`/app/administracion/usuarios/${user.id}`)}>{user.name}<span className="mt-1 block font-normal text-slate-400">{user.email}</span></button></td><td className="p-4"><select aria-label={`Rol de ${user.name}`} className="form-control py-2" value={user.role} disabled={user.id === currentUser.id} onChange={(event) => setPending({ type: 'role', id: user.id, role: event.target.value as Role, label: `¿Deseas cambiar el rol de ${user.name} a ${roleLabel(event.target.value as Role)}?` })}>{roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></td><td className="p-4"><StatusBadge status={user.status} /></td><td className="p-4"><Button variant={user.status === 'activo' ? 'danger' : 'secondary'} disabled={user.id === currentUser.id} onClick={() => setPending({ type: 'user-status', id: user.id, label: `¿Deseas ${user.status === 'activo' ? 'desactivar' : 'reactivar'} esta cuenta?` })}>{user.status === 'activo' ? 'Desactivar' : 'Reactivar'}</Button></td></tr>)}</tbody></table>
          <div className="px-4 pb-4"><Pagination page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} /></div>
        </Card>
        <Modal open={createOpen} title="Crear usuario simulado" description="Los datos se conservarán solo durante esta sesión." onClose={() => setCreateOpen(false)}><div className="grid gap-4"><FormField label="Nombre"><input className="form-control" value={newUser.name} onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} /></FormField><FormField label="Correo ficticio" hint="Debe terminar en @ctp-san-isidro.demo"><input className="form-control" type="email" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} /></FormField><FormField label="Rol"><select className="form-control" value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value as Role })}>{roles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></FormField><div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancelar</Button><Button onClick={() => { const result = createUser(newUser); setMessage(result.message); setMessageError(!result.ok); if (result.ok) { setCreateOpen(false); setNewUser({ name: '', email: '', role: 'estudiante' }); } }}>Guardar usuario</Button></div></div></Modal>
        <Modal open={Boolean(pending)} title="Confirmar acción" description={pending?.label} onClose={() => setPending(null)}><div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setPending(null)}>Cancelar</Button><Button variant={pending?.type === 'user-status' ? 'danger' : 'primary'} onClick={confirmAction}>Confirmar</Button></div></Modal>
      </div>
    );
  }

  if (view === 'proyecto-detalle' && selectedProject) {
    const members = users.filter((user) => selectedProject.memberIds.includes(user.id));
    return (
      <div className="space-y-5"><PageHeader eyebrow={selectedProject.course} title={selectedProject.name} description="Detalle administrativo del proyecto." /><Card><dl className="grid gap-5 sm:grid-cols-3"><div><dt className="section-title">Estado actual</dt><dd className="mt-2"><StatusBadge status={selectedProject.status} /></dd></div><div><dt className="section-title">Progreso</dt><dd className="numeric mt-2 text-xl text-white">{selectedProject.progress}%</dd></div><div><dt className="section-title">Cierre</dt><dd className="mt-2 text-white">{formatDate(selectedProject.dueDate)}</dd></div></dl><h2 className="mt-6 font-semibold text-white">Integrantes</h2><div className="mt-3 flex flex-wrap gap-2">{members.map((member) => <Badge key={member.id}>{member.name}</Badge>)}</div></Card></div>
    );
  }

  if (view === 'proyecto-detalle' && !selectedProject) {
    return <EmptyState icon={FolderKanban} title="Proyecto no encontrado" description="El proyecto solicitado no existe en los datos de demostración." />;
  }

  if (view === 'proyectos') {
    const filtered = projects.filter((project) => `${project.name} ${project.course}`.toLowerCase().includes(query.toLowerCase()) && (statusFilter === 'todos' || project.status === statusFilter));
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);
    return (
      <div className="space-y-5"><PageHeader eyebrow="Administración" title="Proyectos" description="Consulta proyectos y cambia su estado mediante una acción confirmada." />{message ? <FeedbackMessage tone="success">{message}</FeedbackMessage> : null}<Card><div className="grid gap-3 md:grid-cols-2"><FormField label="Buscar"><input className="form-control" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></FormField><FormField label="Estado"><select className="form-control" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="todos">Todos</option><option value="activo">Activo</option><option value="pausado">Pausado</option><option value="finalizado">Finalizado</option><option value="archivado">Archivado</option></select></FormField></div></Card><div className="space-y-3">{items.map((project) => <Card key={project.id} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex gap-2"><StatusBadge status={project.status} /><Badge>{project.progress}%</Badge></div><button className="mt-3 text-left font-semibold text-white hover:text-cyan-200" onClick={() => navigate(`/app/administracion/proyectos/${project.id}`)}>{project.name}</button><p className="mt-1 text-sm text-slate-400">{project.course}</p></div><FormField label={`Estado de ${project.name}`}><select className="form-control min-w-48" value={project.status} onChange={(event) => setPending({ type: 'project-status', id: project.id, status: event.target.value as ProjectStatus, label: `¿Deseas cambiar el estado del proyecto a ${statusLabel(event.target.value as ProjectStatus)}?` })}><option value="activo">Activo</option><option value="pausado">Pausado</option><option value="finalizado">Finalizado</option><option value="archivado">Archivado</option></select></FormField></Card>)}</div><Pagination page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} /><Modal open={Boolean(pending)} title="Confirmar cambio" description={pending?.label} onClose={() => setPending(null)}><div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setPending(null)}>Cancelar</Button><Button onClick={confirmAction}>Confirmar</Button></div></Modal></div>
    );
  }

  if (view === 'actividad') {
    const modules = Array.from(new Set(auditLogs.map((log) => log.module)));
    const filtered = auditLogs.filter((log) => (moduleFilter === 'todos' || log.module === moduleFilter) && (userFilter === 'todos' || log.userId === userFilter) && (!actionFilter || `${log.action} ${log.detail}`.toLowerCase().includes(actionFilter.toLowerCase())) && (!dateFilter || log.timestamp.startsWith(dateFilter)));
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);
    return (
      <div className="space-y-5"><PageHeader eyebrow="Administración" title="Actividad administrativa" description="Resumen filtrable de acciones administrativas; la auditoría completa pertenece al Auditor." /><Card><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><FormField label="Acción"><input className="form-control" value={actionFilter} onChange={(event) => { setActionFilter(event.target.value); setPage(1); }} /></FormField><FormField label="Módulo"><select className="form-control" value={moduleFilter} onChange={(event) => { setModuleFilter(event.target.value); setPage(1); }}><option value="todos">Todos</option>{modules.map((module) => <option key={module} value={module}>{module}</option>)}</select></FormField><FormField label="Usuario"><select className="form-control" value={userFilter} onChange={(event) => { setUserFilter(event.target.value); setPage(1); }}><option value="todos">Todos</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></FormField><FormField label="Fecha"><input className="form-control" type="date" value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); setPage(1); }} /></FormField></div></Card><Card><div className="divide-y divide-white/8">{items.map((log) => <article key={log.id} className="py-4"><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold text-white">{log.action}</h2><Badge>{log.module}</Badge></div><p className="mt-2 text-sm text-slate-300">{log.detail}</p><p className="mt-2 text-xs text-slate-400">{users.find((user) => user.id === log.userId)?.name} · {formatDateTime(log.timestamp)}</p></article>)}</div>{!items.length ? <EmptyState icon={Activity} title="No se encontraron eventos" description="Ajusta los filtros para consultar otra actividad." /> : null}<Pagination page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} /></Card></div>
    );
  }

  return (
    <div className="space-y-5"><PageHeader eyebrow="Administración" title="Configuración" description="Información real del entorno de demostración." /><Card><h2 className="font-semibold text-white">Entorno académico local</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2"><div><dt className="section-title">Persistencia</dt><dd className="mt-2 text-white">Memoria de la sesión</dd></div><div><dt className="section-title">Datos</dt><dd className="mt-2 text-white">Exclusivamente ficticios</dd></div><div><dt className="section-title">Archivos</dt><dd className="mt-2 text-white">Metadatos simulados, máximo 5 MB</dd></div><div><dt className="section-title">Integraciones</dt><dd className="mt-2 text-white">Sin servicios externos</dd></div></dl></Card></div>
  );
}
