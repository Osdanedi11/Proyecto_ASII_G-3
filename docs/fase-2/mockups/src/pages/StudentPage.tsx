import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Bell, CalendarDays, CheckCircle2, FolderKanban, Paperclip, Settings2 } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { EvidenceCard } from '../components/common/EvidenceCard';
import { FeedbackMessage } from '../components/common/FeedbackMessage';
import { FormField } from '../components/common/FormField';
import { Modal } from '../components/common/Modal';
import { PageHeader } from '../components/common/PageHeader';
import { Pagination } from '../components/common/Pagination';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/states/EmptyState';
import { LoadingState } from '../components/states/LoadingState';
import { usePageReady } from '../hooks/usePageReady';
import { usePrototypeContext } from '../hooks/usePrototypeContext';
import { usePrototypeStore } from '../modules/auth/auth-store';
import type { TaskPriority, TaskStatus } from '../types';
import { formatDate, formatDateTime, priorityLabel, relativeDays, statusLabel } from '../utils/format';

export type StudentView =
  | 'inicio'
  | 'proyectos'
  | 'proyecto-detalle'
  | 'tareas'
  | 'tarea-detalle'
  | 'calendario'
  | 'notificaciones';

export function StudentPage({ view }: { view: StudentView }) {
  const ready = usePageReady(120);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, activeProject, availableProjects } = usePrototypeContext();
  const users = usePrototypeStore((state) => state.users);
  const tasks = usePrototypeStore((state) => state.tasks);
  const notifications = usePrototypeStore((state) => state.notifications);
  const preferences = usePrototypeStore((state) => state.notificationPreferences);
  const setActiveProject = usePrototypeStore((state) => state.setActiveProject);
  const updateTaskStatus = usePrototypeStore((state) => state.updateTaskStatus);
  const addComment = usePrototypeStore((state) => state.addComment);
  const addEvidence = usePrototypeStore((state) => state.addEvidence);
  const markNotificationRead = usePrototypeStore((state) => state.markNotificationRead);
  const updateNotificationPreference = usePrototypeStore((state) => state.updateNotificationPreference);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [priorityFilter, setPriorityFilter] = useState('todas');
  const [tab, setTab] = useState<'resumen' | 'tareas' | 'equipo' | 'evidencias'>('resumen');
  const [comment, setComment] = useState('');
  const [nextStatus, setNextStatus] = useState<TaskStatus>('en_progreso');
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationPage, setNotificationPage] = useState(1);

  const assignedTasks = useMemo(
    () => (currentUser ? tasks.filter((task) => task.assigneeId === currentUser.id) : []),
    [currentUser, tasks],
  );
  const selectedProject = id ? availableProjects.find((project) => project.id === id) ?? null : activeProject;
  const selectedTask = assignedTasks.find((task) => task.id === id) ?? null;

  useEffect(() => {
    if (selectedProject && selectedProject.id !== activeProject?.id && view === 'proyecto-detalle') {
      setActiveProject(selectedProject.id);
    }
  }, [activeProject?.id, selectedProject, setActiveProject, view]);

  useEffect(() => {
    if (selectedTask) {
      setNextStatus(selectedTask.status === 'atrasada' ? 'en_progreso' : selectedTask.status);
      if (selectedTask.projectId !== activeProject?.id) setActiveProject(selectedTask.projectId);
    }
  }, [activeProject?.id, selectedTask, setActiveProject]);

  if (!ready || !currentUser || !activeProject) return <LoadingState />;

  const userNotifications = notifications
    .filter((item) => item.userId === currentUser.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const prioritizedTasks = assignedTasks
    .filter((task) => task.projectId === activeProject.id && task.status !== 'completada')
    .sort((a, b) => {
      const priority: Record<TaskPriority, number> = { alta: 0, media: 1, baja: 2 };
      return priority[a.priority] - priority[b.priority] || a.dueDate.localeCompare(b.dueDate);
    });

  if (view === 'inicio') {
    const nextTask = prioritizedTasks[0];
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Inicio"
          title={`Hola, ${currentUser.name.split(' ')[0]}. ¿Qué debes hacer ahora?`}
          description="Revisa tu próxima tarea y avanza sin perder de vista la fecha de entrega."
          action={<Button onClick={() => navigate('/app/estudiante/tareas')}>Ver mis tareas</Button>}
        />
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-title">Proyecto activo</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{activeProject.name}</h2>
                <p className="mt-2 text-sm text-slate-300">{activeProject.course}</p>
              </div>
              <span className="numeric text-3xl font-semibold text-cyan-200">{activeProject.progress}%</span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-cyan-400" style={{ width: `${activeProject.progress}%` }} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => navigate(`/app/estudiante/proyectos/${activeProject.id}`)}>Abrir proyecto</Button>
              <Button variant="ghost" onClick={() => navigate('/app/estudiante/calendario')}>Ver calendario</Button>
            </div>
          </Card>
          <Card>
            <p className="section-title">Próxima tarea</p>
            {nextTask ? (
              <>
                <h2 className="mt-2 text-lg font-semibold text-white">{nextTask.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{nextTask.description}</p>
                <div className="mt-4 flex flex-wrap gap-2"><StatusBadge status={nextTask.status} /><Badge>{relativeDays(nextTask.dueDate)}</Badge></div>
                <Button className="mt-5" onClick={() => navigate(`/app/estudiante/tareas/${nextTask.id}`)}>Continuar tarea</Button>
              </>
            ) : <EmptyState icon={CheckCircle2} title="No tienes tareas pendientes" description="Todas tus tareas asignadas están completadas." />}
          </Card>
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between"><h2 className="font-semibold text-white">Tareas prioritarias</h2><Link className="text-sm text-cyan-200" to="/app/estudiante/tareas">Ver todas</Link></div>
            <div className="mt-4 divide-y divide-white/8">
              {prioritizedTasks.slice(0, 3).map((task) => (
                <Link key={task.id} to={`/app/estudiante/tareas/${task.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-cyan-100">
                  <div><p className="text-sm font-medium text-white">{task.title}</p><p className="mt-1 text-xs text-slate-400">{formatDate(task.dueDate)}</p></div>
                  <StatusBadge status={task.status} />
                </Link>
              ))}
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between"><h2 className="font-semibold text-white">Notificaciones recientes</h2><Link className="text-sm text-cyan-200" to="/app/estudiante/notificaciones">Ver todas</Link></div>
            <div className="mt-4 divide-y divide-white/8">
              {userNotifications.slice(0, 2).map((notification) => (
                <div key={notification.id} className="py-3"><p className="text-sm font-medium text-white">{notification.title}</p><p className="mt-1 text-sm text-slate-400">{notification.body}</p></div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    );
  }

  if (view === 'proyectos') {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Estudiante" title="Mis proyectos" description="Consulta el avance y la próxima fecha de cada proyecto asignado." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {availableProjects.map((project) => (
            <Card key={project.id}>
              <div className="flex items-center justify-between gap-3"><StatusBadge status={project.status} /><span className="numeric text-lg text-cyan-200">{project.progress}%</span></div>
              <h2 className="mt-4 text-lg font-semibold text-white">{project.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{project.course}</p>
              <p className="mt-4 text-sm text-slate-300">Próxima fecha: {formatDate(project.dueDate)}</p>
              <Button className="mt-5 w-full" variant="secondary" onClick={() => navigate(`/app/estudiante/proyectos/${project.id}`)}>Abrir proyecto</Button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'proyecto-detalle' && !selectedProject) {
    return <EmptyState icon={FolderKanban} title="Proyecto no encontrado" description="El proyecto no existe o no está asignado a tu cuenta." />;
  }

  if (view === 'proyecto-detalle' && selectedProject) {
    const projectTasks = assignedTasks.filter((task) => task.projectId === selectedProject.id);
    const members = users.filter((user) => selectedProject.memberIds.includes(user.id));
    const evidences = projectTasks.flatMap((task) => task.evidences);
    return (
      <div className="space-y-5">
        <PageHeader eyebrow={selectedProject.course} title={selectedProject.name} description={selectedProject.description} />
        <div className="flex gap-1 overflow-x-auto border-b border-white/8" role="tablist" aria-label="Detalle del proyecto">
          {(['resumen', 'tareas', 'equipo', 'evidencias'] as const).map((item) => (
            <button key={item} role="tab" aria-selected={tab === item} className={`min-h-11 whitespace-nowrap border-b-2 px-4 text-sm capitalize ${tab === item ? 'border-cyan-300 text-white' : 'border-transparent text-slate-400'}`} onClick={() => setTab(item)}>{item}</button>
          ))}
        </div>
        {tab === 'resumen' ? <Card><div className="grid gap-5 sm:grid-cols-3"><div><p className="section-title">Estado</p><div className="mt-2"><StatusBadge status={selectedProject.status} /></div></div><div><p className="section-title">Progreso</p><p className="numeric mt-2 text-2xl text-white">{selectedProject.progress}%</p></div><div><p className="section-title">Entrega</p><p className="mt-2 text-white">{formatDate(selectedProject.dueDate)}</p></div></div></Card> : null}
        {tab === 'tareas' ? <div className="space-y-3">{projectTasks.map((task) => <Card key={task.id} className="flex items-center justify-between gap-4"><div><h2 className="font-semibold text-white">{task.title}</h2><p className="mt-1 text-sm text-slate-400">{formatDate(task.dueDate)}</p></div><Button variant="ghost" onClick={() => navigate(`/app/estudiante/tareas/${task.id}`)}>Ver detalle</Button></Card>)}</div> : null}
        {tab === 'equipo' ? <Card><div className="grid gap-3 sm:grid-cols-2">{members.map((member) => <div key={member.id} className="rounded-xl bg-white/[0.03] p-4"><p className="font-medium text-white">{member.name}</p><p className="mt-1 text-sm text-slate-400">{member.id === selectedProject.leaderId ? 'Líder de equipo' : 'Integrante'}</p></div>)}</div></Card> : null}
        {tab === 'evidencias' ? (evidences.length ? <div className="grid gap-3 md:grid-cols-2">{evidences.map((evidence) => <EvidenceCard key={evidence.id} evidence={evidence} user={users.find((user) => user.id === evidence.userId)} />)}</div> : <EmptyState icon={Paperclip} title="No hay evidencias" description="Las evidencias adjuntas a tus tareas aparecerán aquí." />) : null}
      </div>
    );
  }

  if (view === 'tareas') {
    const filtered = assignedTasks.filter((task) =>
      task.projectId === activeProject.id &&
      (statusFilter === 'todos' || task.status === statusFilter) &&
      (priorityFilter === 'todas' || task.priority === priorityFilter),
    );
    return (
      <div className="space-y-5">
        <PageHeader eyebrow={activeProject.course} title="Mis tareas" description={`Responsabilidades del proyecto ${activeProject.name}. Usa el selector superior para cambiar de proyecto.`} />
        <Card>
          <div className="grid gap-3 md:grid-cols-2" aria-label="Filtros de tareas">
            <FormField label="Estado"><select className="form-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="todos">Todos</option><option value="pendiente">Pendiente</option><option value="en_progreso">En progreso</option><option value="completada">Completada</option><option value="atrasada">Atrasada</option></select></FormField>
            <FormField label="Prioridad"><select className="form-control" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option value="todas">Todas</option><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></select></FormField>
          </div>
        </Card>
        <div className="space-y-3">
          {filtered.map((task) => (
            <Card key={task.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><div className="flex flex-wrap gap-2"><StatusBadge status={task.status} /><Badge>{priorityLabel(task.priority)}</Badge></div><h2 className="mt-3 font-semibold text-white">{task.title}</h2><p className="mt-1 text-sm text-slate-400">{availableProjects.find((project) => project.id === task.projectId)?.course} · {formatDate(task.dueDate)}</p></div>
              <Button variant="secondary" onClick={() => navigate(`/app/estudiante/tareas/${task.id}`)}>Ver detalle</Button>
            </Card>
          ))}
          {!filtered.length ? <EmptyState icon={CheckCircle2} title="No tienes tareas pendientes" description="No se encontraron tareas con los filtros seleccionados." /> : null}
        </div>
      </div>
    );
  }

  if (view === 'tarea-detalle' && !selectedTask) {
    return <EmptyState icon={CheckCircle2} title="Tarea no encontrada" description="La tarea no existe o no está asignada a tu cuenta." />;
  }

  if (view === 'tarea-detalle' && selectedTask) {
    const project = availableProjects.find((item) => item.id === selectedTask.projectId);
    return (
      <div className="space-y-5">
        <PageHeader eyebrow={project?.course} title={selectedTask.title} description={selectedTask.description} />
        {message ? <FeedbackMessage tone={messageError ? 'error' : 'success'}>{message}</FeedbackMessage> : null}
        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <h2 className="font-semibold text-white">Datos de la tarea</h2>
            <dl className="mt-4 grid gap-4 text-sm">
              <div><dt className="text-slate-400">Responsable</dt><dd className="mt-1 text-white">{currentUser.name}</dd></div>
              <div><dt className="text-slate-400">Fecha límite</dt><dd className="mt-1 text-white">{formatDate(selectedTask.dueDate)}</dd></div>
              <div><dt className="text-slate-400">Estado actual</dt><dd className="mt-1"><StatusBadge status={selectedTask.status} /></dd></div>
            </dl>
            <FormField label="Nuevo estado">
              <select className="form-control" value={nextStatus} onChange={(event) => setNextStatus(event.target.value as TaskStatus)}>
                <option value="pendiente">Pendiente</option><option value="en_progreso">En progreso</option><option value="completada">Completada</option>
              </select>
            </FormField>
            {selectedTask.status === 'atrasada' ? <p className="mt-2 text-xs text-amber-200">La tarea está atrasada; al retomarla pasará a En progreso.</p> : null}
            <Button className="mt-4 w-full" onClick={() => { const result = updateTaskStatus(selectedTask.id, nextStatus); setMessage(result.message); setMessageError(!result.ok); }}>Actualizar tarea</Button>
          </Card>
          <div className="space-y-4">
            <Card>
              <h2 className="font-semibold text-white">Comentarios</h2>
              <div className="mt-4 space-y-3">{selectedTask.comments.map((item) => <div key={item.id} className="rounded-xl bg-white/[0.03] p-3"><p className="text-sm text-slate-200">{item.content}</p><p className="mt-2 text-xs text-slate-400">{formatDateTime(item.createdAt)}</p></div>)}</div>
              <FormField label="Nuevo comentario"><textarea className="form-control mt-4 min-h-24" value={comment} onChange={(event) => setComment(event.target.value)} /></FormField>
              <Button className="mt-3" disabled={!comment.trim()} onClick={() => { addComment(selectedTask.id, comment); setComment(''); setMessage('El comentario se agregó correctamente.'); setMessageError(false); }}>Publicar comentario</Button>
            </Card>
            <Card>
              <h2 className="font-semibold text-white">Evidencias</h2>
              <div className="mt-4 grid gap-3">{selectedTask.evidences.map((evidence) => <EvidenceCard key={evidence.id} evidence={evidence} user={currentUser} />)}</div>
              <FormField label="Adjuntar evidencia simulada" hint="PDF, DOCX, XLSX, PNG, JPG o ZIP. Máximo 5 MB.">
                <input aria-label="Adjuntar evidencia simulada" className="form-control mt-4" type="file" accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.zip" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const result = addEvidence(selectedTask.id, file); setMessage(result.ok ? 'La evidencia se adjuntó correctamente.' : result.message); setMessageError(!result.ok); event.target.value = ''; }} />
              </FormField>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  if (view === 'calendario') {
    const calendarTasks = assignedTasks
      .filter((task) => task.projectId === activeProject.id)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return (
      <div className="space-y-5">
        <PageHeader eyebrow={activeProject.course} title="Calendario" description={`Fechas de ${activeProject.name}. Usa el selector superior para cambiar de proyecto.`} />
        <Card>
          <div className="divide-y divide-white/8">{calendarTasks.map((task) => <div key={task.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-white">{task.title}</p><p className="mt-1 text-sm text-slate-400">{availableProjects.find((project) => project.id === task.projectId)?.course}</p></div><div className="flex items-center gap-3"><StatusBadge status={task.status} /><time className="text-sm text-slate-200">{formatDate(task.dueDate)}</time></div></div>)}</div>
        </Card>
      </div>
    );
  }

  const pageSize = 10;
  const pageItems = userNotifications.slice((notificationPage - 1) * pageSize, notificationPage * pageSize);
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Estudiante" title="Notificaciones" description="Consulta avisos recientes y marca los que ya revisaste." action={<Button variant="secondary" onClick={() => setSettingsOpen(true)}><Settings2 className="mr-2 size-4" />Configurar</Button>} />
      <Card>
        <div className="divide-y divide-white/8">
          {pageItems.map((notification) => <article key={notification.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><h2 className="font-medium text-white">{notification.title}</h2>{!notification.read ? <Badge tone="info">Nueva</Badge> : null}</div><p className="mt-1 text-sm text-slate-300">{notification.body}</p><p className="mt-2 text-xs text-slate-400">{formatDateTime(notification.createdAt)}</p></div>{!notification.read ? <Button variant="ghost" onClick={() => markNotificationRead(notification.id)}>Marcar como leída</Button> : null}</article>)}
        </div>
        <Pagination page={notificationPage} pageSize={pageSize} totalItems={userNotifications.length} onPageChange={setNotificationPage} />
      </Card>
      <Modal open={settingsOpen} title="Configurar notificaciones" description="Elige qué avisos deseas visualizar durante esta demostración." onClose={() => setSettingsOpen(false)}>
        <div className="space-y-3">
          {(['tareas', 'comentarios', 'recordatorios'] as const).map((key) => <label key={key} className="flex min-h-12 items-center justify-between rounded-xl bg-white/[0.03] px-4 text-sm text-slate-200"><span className="capitalize">{key}</span><input type="checkbox" checked={preferences[currentUser.id][key]} onChange={(event) => updateNotificationPreference(key, event.target.checked)} /></label>)}
          <Button className="mt-4 w-full" onClick={() => setSettingsOpen(false)}>Guardar preferencias</Button>
        </div>
      </Modal>
    </div>
  );
}
