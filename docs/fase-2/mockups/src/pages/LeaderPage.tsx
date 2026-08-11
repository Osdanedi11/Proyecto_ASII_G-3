import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, FolderPlus, History, ListTodo, UserPlus, UsersRound } from 'lucide-react';
import { WorkloadChart } from '../components/charts/WorkloadChart';
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
import type { ProjectStatus, Task, TaskPriority } from '../types';
import { formatDate, formatDateTime, priorityLabel, relativeDays } from '../utils/format';

export type LeaderView = 'inicio' | 'proyecto' | 'tareas' | 'equipo' | 'cronograma' | 'historial';

export function LeaderPage({ view }: { view: LeaderView }) {
  const ready = usePageReady(120);
  const navigate = useNavigate();
  const { currentUser, activeProject, availableProjects } = usePrototypeContext();
  const users = usePrototypeStore((state) => state.users);
  const tasks = usePrototypeStore((state) => state.tasks);
  const auditLogs = usePrototypeStore((state) => state.auditLogs);
  const deliverables = usePrototypeStore((state) => state.deliverables);
  const createTask = usePrototypeStore((state) => state.createTask);
  const updateTaskDetails = usePrototypeStore((state) => state.updateTaskDetails);
  const createProject = usePrototypeStore((state) => state.createProject);
  const addProjectMember = usePrototypeStore((state) => state.addProjectMember);
  const updateProjectStatus = usePrototypeStore((state) => state.updateProjectStatus);
  const setActiveProject = usePrototypeStore((state) => state.setActiveProject);
  const [taskModal, setTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [projectModal, setProjectModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);
  const [taskQuery, setTaskQuery] = useState('');
  const [taskStatus, setTaskStatus] = useState('todos');
  const [historyPage, setHistoryPage] = useState(1);
  const [newMemberId, setNewMemberId] = useState('');
  const [pendingStatus, setPendingStatus] = useState<ProjectStatus>('activo');
  const [taskForm, setTaskForm] = useState({
    projectId: '',
    title: '',
    description: '',
    assigneeId: '',
    dueDate: '2026-08-20',
    priority: 'media' as TaskPriority,
  });
  const [projectForm, setProjectForm] = useState({
    name: '',
    course: '',
    description: '',
    startDate: '2026-07-28',
    dueDate: '2026-09-18',
    memberIds: [] as string[],
  });

  const projectTasks = useMemo(
    () => activeProject ? tasks.filter((task) => task.projectId === activeProject.id) : [],
    [activeProject, tasks],
  );
  const leaderProjects = availableProjects.filter((project) => project.leaderId === currentUser?.id);
  const taskProject = leaderProjects.find((project) => project.id === taskForm.projectId) ?? activeProject;
  const taskMembers = taskProject
    ? users.filter((user) => taskProject.memberIds.includes(user.id) || user.id === taskProject.leaderId)
    : [];
  const members = activeProject
    ? users.filter((user) => activeProject.memberIds.includes(user.id) || user.id === activeProject.leaderId)
    : [];
  const students = users.filter((user) => user.role === 'estudiante' && user.status === 'activo');
  const candidates = students.filter((user) => !activeProject?.memberIds.includes(user.id));
  const history = auditLogs.filter(
    (log) =>
      log.projectId === activeProject?.id &&
      ['Tareas', 'Proyectos', 'Comentarios', 'Evidencias', 'Adjuntos', 'Entregables'].includes(log.module),
  );

  useEffect(() => {
    if (!taskProject) return;
    if (!taskMembers.some((member) => member.id === taskForm.assigneeId)) {
      setTaskForm((current) => ({
        ...current,
        assigneeId: taskMembers[0]?.id ?? '',
        dueDate:
          current.dueDate >= taskProject.startDate && current.dueDate <= taskProject.dueDate
            ? current.dueDate
            : taskProject.dueDate,
      }));
    }
  }, [taskMembers, taskForm.assigneeId, taskProject]);
  useEffect(() => setNewMemberId(candidates[0]?.id ?? ''), [activeProject?.id]);

  if (!ready || !currentUser || !activeProject) return <LoadingState />;

  const overdue = projectTasks.filter((task) => task.status === 'atrasada').length;
  const pending = projectTasks.filter((task) => task.status !== 'completada').length;
  const nextTask = [...projectTasks].filter((task) => task.status !== 'completada').sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  const openTaskModal = () => {
    setTaskForm((current) => ({
      ...current,
      projectId: activeProject.id,
      assigneeId: members[0]?.id ?? '',
      dueDate:
        current.dueDate >= activeProject.startDate && current.dueDate <= activeProject.dueDate
          ? current.dueDate
          : activeProject.dueDate,
    }));
    setMessage('');
    setMessageError(false);
    setTaskModal(true);
  };

  const taskDialog = (
    <Modal open={taskModal} title="Crear tarea" description="Asigna una responsabilidad concreta a un integrante del equipo." onClose={() => setTaskModal(false)}>
      <div className="grid gap-4">
        <FormField label="Proyecto">
          <select
            className="form-control"
            value={taskForm.projectId}
            onChange={(event) => setTaskForm({ ...taskForm, projectId: event.target.value, assigneeId: '' })}
          >
            {leaderProjects.map((project) => (
              <option key={project.id} value={project.id}>{project.course} — {project.name}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Título"><input className="form-control" value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} /></FormField>
        <FormField label="Descripción"><textarea className="form-control min-h-24" value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Responsable"><select className="form-control" value={taskForm.assigneeId} onChange={(event) => setTaskForm({ ...taskForm, assigneeId: event.target.value })}>{taskMembers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></FormField>
          <FormField label="Fecha límite"><input className="form-control" type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })} /></FormField>
          <FormField label="Prioridad"><select className="form-control" value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value as TaskPriority })}><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></select></FormField>
        </div>
        <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setTaskModal(false)}>Cancelar</Button><Button disabled={!taskForm.projectId || !taskForm.title.trim() || !taskForm.description.trim() || !taskForm.assigneeId} onClick={() => {
          const result = createTask({
            projectId: taskForm.projectId,
            title: taskForm.title,
            description: taskForm.description,
            assigneeIds: [taskForm.assigneeId],
            dueDate: taskForm.dueDate,
            priority: taskForm.priority,
            module: 'Tareas',
          });
          setMessage(result.message);
          setMessageError(!result.ok);
          if (result.ok) {
            setActiveProject(taskForm.projectId);
            setTaskModal(false);
            setTaskForm((current) => ({ ...current, title: '', description: '' }));
          }
        }}>Guardar tarea</Button></div>
      </div>
    </Modal>
  );

  const editTaskDialog = editingTask ? (
    <Modal open title="Editar tarea" description="Actualiza la responsabilidad, la fecha o la prioridad." onClose={() => setEditingTask(null)}>
      <div className="grid gap-4">
        <FormField label="Título"><input className="form-control" value={editingTask.title} onChange={(event) => setEditingTask({ ...editingTask, title: event.target.value })} /></FormField>
        <FormField label="Descripción"><textarea className="form-control min-h-24" value={editingTask.description} onChange={(event) => setEditingTask({ ...editingTask, description: event.target.value })} /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Responsable"><select className="form-control" value={editingTask.assigneeId} onChange={(event) => setEditingTask({ ...editingTask, assigneeId: event.target.value })}>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></FormField>
          <FormField label="Fecha límite"><input className="form-control" type="date" value={editingTask.dueDate} onChange={(event) => setEditingTask({ ...editingTask, dueDate: event.target.value })} /></FormField>
          <FormField label="Prioridad"><select className="form-control" value={editingTask.priority} onChange={(event) => setEditingTask({ ...editingTask, priority: event.target.value as TaskPriority })}><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></select></FormField>
        </div>
        <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setEditingTask(null)}>Cancelar</Button><Button onClick={() => { const result = updateTaskDetails(editingTask.id, editingTask); if (result.ok) setEditingTask(null); setMessage(result.message); setMessageError(!result.ok); }}>Guardar cambios</Button></div>
      </div>
    </Modal>
  ) : null;

  if (view === 'inicio') {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Líder de equipo" title="¿Cómo está avanzando tu equipo?" description={`Resumen de ${activeProject.name}.`} action={<Button onClick={openTaskModal}>Crear tarea</Button>} />
        {message ? <FeedbackMessage tone={messageError ? 'error' : 'success'}>{message}</FeedbackMessage> : null}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Progreso" value={`${activeProject.progress}%`} trend="Avance general" accent="cyan" icon={ListTodo} />
          <MetricCard label="Pendientes" value={`${pending}`} trend="Tareas abiertas" accent="blue" icon={ListTodo} />
          <MetricCard label="Atrasadas" value={`${overdue}`} trend="Requieren atención" accent="warning" icon={History} />
          <MetricCard label="Equipo" value={`${members.length}`} trend="Integrantes activos" accent="success" icon={UsersRound} />
        </section>
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <h2 className="font-semibold text-white">Proyecto activo</h2>
            <p className="mt-2 text-xl font-semibold text-white">{activeProject.name}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{activeProject.description}</p>
            <div className="mt-4 flex items-center gap-3"><StatusBadge status={activeProject.status} /><span className="text-sm text-slate-400">Cierre {formatDate(activeProject.dueDate)}</span></div>
            <Button variant="secondary" className="mt-5" onClick={() => navigate('/app/lider/proyecto')}>Ver proyecto</Button>
          </Card>
          <Card>
            <p className="section-title">Próxima fecha</p>
            {nextTask ? <><h2 className="mt-2 font-semibold text-white">{nextTask.title}</h2><p className="mt-2 text-sm text-slate-300">{relativeDays(nextTask.dueDate)} · {formatDate(nextTask.dueDate)}</p><Button variant="ghost" className="mt-4" onClick={() => navigate('/app/lider/tareas')}>Abrir tareas</Button></> : <EmptyState icon={CalendarDays} title="Sin fechas próximas" description="Crea una tarea para iniciar el cronograma." />}
          </Card>
        </section>
        {taskDialog}
      </div>
    );
  }

  if (view === 'proyecto') {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow={activeProject.course} title="Proyecto actual" description="Consulta la información general y administra su estado." action={<Button onClick={() => setProjectModal(true)}><FolderPlus className="mr-2 size-4" />Crear proyecto</Button>} />
        {message ? <FeedbackMessage tone={messageError ? 'error' : 'success'}>{message}</FeedbackMessage> : null}
        <Card>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl"><div className="flex gap-2"><StatusBadge status={activeProject.status} /><Badge>{activeProject.progress}% de avance</Badge></div><h2 className="mt-4 text-xl font-semibold text-white">{activeProject.name}</h2><p className="mt-2 text-sm leading-7 text-slate-300">{activeProject.description}</p></div>
            <div className="w-full lg:max-w-xs"><FormField label="Cambiar estado"><select className="form-control" value={pendingStatus} onChange={(event) => { setPendingStatus(event.target.value as ProjectStatus); setStatusModal(true); }}><option value="activo">Activo</option><option value="pausado">Pausado</option><option value="finalizado">Finalizado</option></select></FormField></div>
          </div>
        </Card>
        <Modal open={statusModal} title="Confirmar cambio de estado" description={`¿Deseas cambiar el estado del proyecto a ${pendingStatus}?`} onClose={() => setStatusModal(false)}><div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setStatusModal(false)}>Cancelar</Button><Button onClick={() => { updateProjectStatus(activeProject.id, pendingStatus); setStatusModal(false); setMessage('El estado del proyecto se actualizó correctamente.'); }}>Confirmar</Button></div></Modal>
        <Modal open={projectModal} title="Crear proyecto en equipo" description="Registra los datos esenciales; el cronograma se crea automáticamente." onClose={() => setProjectModal(false)}>
          <div className="grid gap-4">
            <FormField label="Nombre del proyecto"><input className="form-control" value={projectForm.name} onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })} /></FormField>
            <FormField label="Asignatura o especialidad"><input className="form-control" value={projectForm.course} onChange={(event) => setProjectForm({ ...projectForm, course: event.target.value })} /></FormField>
            <FormField label="Descripción y objetivo académico"><textarea className="form-control min-h-24" value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} /></FormField>
            <div className="grid gap-4 sm:grid-cols-2"><FormField label="Fecha de inicio"><input className="form-control" type="date" value={projectForm.startDate} onChange={(event) => setProjectForm({ ...projectForm, startDate: event.target.value })} /></FormField><FormField label="Fecha de cierre"><input className="form-control" type="date" value={projectForm.dueDate} onChange={(event) => setProjectForm({ ...projectForm, dueDate: event.target.value })} /></FormField></div>
            <fieldset><legend className="text-sm font-medium text-slate-200">Integrantes iniciales</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{students.map((student) => <label key={student.id} className="flex min-h-11 items-center justify-between rounded-xl bg-white/[0.03] px-3 text-sm text-slate-200"><span>{student.name}</span><input type="checkbox" checked={projectForm.memberIds.includes(student.id)} onChange={(event) => setProjectForm({ ...projectForm, memberIds: event.target.checked ? [...projectForm.memberIds, student.id] : projectForm.memberIds.filter((value) => value !== student.id) })} /></label>)}</div></fieldset>
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setProjectModal(false)}>Cancelar</Button><Button disabled={!projectForm.name.trim() || !projectForm.course.trim() || !projectForm.description.trim() || !projectForm.memberIds.length} onClick={() => {
              const result = createProject(projectForm);
              setMessage(result.message);
              setMessageError(!result.ok);
              if (result.ok) setProjectModal(false);
            }}>Crear proyecto y cronograma</Button></div>
          </div>
        </Modal>
      </div>
    );
  }

  if (view === 'tareas') {
    const filtered = projectTasks.filter((task) => `${task.title} ${task.description}`.toLowerCase().includes(taskQuery.toLowerCase()) && (taskStatus === 'todos' || task.status === taskStatus));
    return (
      <div className="space-y-5">
        <PageHeader eyebrow={activeProject.course} title="Tareas del equipo" description="Crea, asigna y consulta las responsabilidades del proyecto." action={<Button onClick={openTaskModal}>Crear tarea</Button>} />
        {message ? <FeedbackMessage tone={messageError ? 'error' : 'success'}>{message}</FeedbackMessage> : null}
        <Card><div className="grid gap-3 md:grid-cols-2"><FormField label="Buscar"><input className="form-control" value={taskQuery} onChange={(event) => setTaskQuery(event.target.value)} /></FormField><FormField label="Estado"><select className="form-control" value={taskStatus} onChange={(event) => setTaskStatus(event.target.value)}><option value="todos">Todos</option><option value="pendiente">Pendiente</option><option value="en_progreso">En progreso</option><option value="completada">Completada</option><option value="atrasada">Atrasada</option></select></FormField></div></Card>
        <div className="space-y-3">{filtered.map((task) => <Card key={task.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex gap-2"><StatusBadge status={task.status} /><Badge>{priorityLabel(task.priority)}</Badge></div><h2 className="mt-3 font-semibold text-white">{task.title}</h2><p className="mt-1 text-sm text-slate-400">{users.find((user) => user.id === task.assigneeId)?.name} · {formatDate(task.dueDate)}</p></div><Button variant="ghost" onClick={() => setEditingTask(task)}>Editar</Button></Card>)}</div>
        {!filtered.length ? <EmptyState icon={ListTodo} title="No se encontraron tareas" description="Ajusta los filtros o crea una nueva tarea." /> : null}
        {taskDialog}
        {editTaskDialog}
      </div>
    );
  }

  if (view === 'equipo') {
    const workload = members.map((member) => ({ member: member.name.split(' ')[0], hours: projectTasks.filter((task) => task.assigneeId === member.id && task.status !== 'completada').reduce((sum, task) => sum + task.estimatedHours, 0) }));
    return (
      <div className="space-y-5">
        <PageHeader eyebrow={activeProject.course} title="Equipo" description="Consulta roles, tareas asignadas y carga de trabajo." />
        {message ? <FeedbackMessage tone={messageError ? 'error' : 'success'}>{message}</FeedbackMessage> : null}
        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]"><Card><WorkloadChart data={workload} /></Card><Card><h2 className="font-semibold text-white">Integrantes</h2><div className="mt-4 divide-y divide-white/8">{members.map((member) => <div key={member.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-medium text-white">{member.name}</p><p className="mt-1 text-sm text-slate-400">{member.id === activeProject.leaderId ? 'Líder de equipo' : 'Integrante'} · {projectTasks.filter((task) => task.assigneeId === member.id).length} tareas</p></div><StatusBadge status={member.status} /></div>)}</div>{candidates.length ? <div className="mt-5 flex flex-col gap-3 sm:flex-row"><FormField label="Nuevo integrante"><select className="form-control" value={newMemberId} onChange={(event) => setNewMemberId(event.target.value)}>{candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select></FormField><Button className="self-end" disabled={!newMemberId} onClick={() => { const result = addProjectMember(activeProject.id, newMemberId); setMessage(result.message); setMessageError(!result.ok); }}><UserPlus className="mr-2 size-4" />Agregar</Button></div> : null}</Card></section>
      </div>
    );
  }

  if (view === 'cronograma') {
    const upcoming = [...projectTasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const projectDeliverables = deliverables.filter((item) => item.projectId === activeProject.id);
    return (
      <div className="space-y-5"><PageHeader eyebrow={activeProject.course} title="Cronograma" description="Fechas, entregables y tareas próximas a vencer." /><section className="grid gap-4 sm:grid-cols-2"><Card><p className="section-title">Inicio</p><p className="mt-2 text-xl font-semibold text-white">{formatDate(activeProject.startDate)}</p></Card><Card><p className="section-title">Cierre</p><p className="mt-2 text-xl font-semibold text-white">{formatDate(activeProject.dueDate)}</p></Card></section><Card><h2 className="font-semibold text-white">Próximas fechas</h2><div className="mt-4 divide-y divide-white/8">{upcoming.map((task) => <div key={task.id} className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm font-medium text-white">{task.title}</p><p className="mt-1 text-xs text-slate-400">Tarea · {users.find((user) => user.id === task.assigneeId)?.name}</p></div><time className="text-sm text-slate-200">{formatDate(task.dueDate)}</time></div>)}{projectDeliverables.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm font-medium text-white">{item.title}</p><p className="mt-1 text-xs text-slate-400">Entregable</p></div><time className="text-sm text-slate-200">{formatDate(item.dueDate)}</time></div>)}</div></Card></div>
    );
  }

  const pageSize = 10;
  const historySlice = history.slice((historyPage - 1) * pageSize, historyPage * pageSize);
  return (
    <div className="space-y-5"><PageHeader eyebrow={activeProject.course} title="Historial" description="Cambios recientes del proyecto y sus tareas." /><Card><div className="divide-y divide-white/8">{historySlice.map((item) => <article key={item.id} className="py-4"><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold text-white">{item.action}</h2><Badge>{item.module}</Badge></div><p className="mt-2 text-sm text-slate-300">{item.detail}</p><p className="mt-2 text-xs text-slate-400">{formatDateTime(item.timestamp)} · {item.id}</p></article>)}</div><Pagination page={historyPage} pageSize={pageSize} totalItems={history.length} onPageChange={setHistoryPage} /></Card></div>
  );
}
