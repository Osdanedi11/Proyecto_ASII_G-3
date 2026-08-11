import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipboardCheck, Download, FileCheck2, FolderKanban, Star } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { EvidenceCard } from '../components/common/EvidenceCard';
import { FeedbackMessage } from '../components/common/FeedbackMessage';
import { FormField } from '../components/common/FormField';
import { MetricCard } from '../components/common/MetricCard';
import { Modal } from '../components/common/Modal';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/states/EmptyState';
import { LoadingState } from '../components/states/LoadingState';
import { usePageReady } from '../hooks/usePageReady';
import { usePrototypeContext } from '../hooks/usePrototypeContext';
import { usePrototypeStore } from '../modules/auth/auth-store';
import { formatDate, formatDateTime } from '../utils/format';
import { exportProjectReport } from '../utils/report';

export type ProfessorView =
  | 'inicio'
  | 'proyectos'
  | 'proyecto-detalle'
  | 'revisiones'
  | 'revision-detalle'
  | 'evaluaciones'
  | 'reportes';

export function ProfessorPage({ view }: { view: ProfessorView }) {
  const ready = usePageReady(120);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, activeProject, availableProjects } = usePrototypeContext();
  const users = usePrototypeStore((state) => state.users);
  const tasks = usePrototypeStore((state) => state.tasks);
  const deliverables = usePrototypeStore((state) => state.deliverables);
  const evaluations = usePrototypeStore((state) => state.evaluations);
  const setActiveProject = usePrototypeStore((state) => state.setActiveProject);
  const addEvaluation = usePrototypeStore((state) => state.addEvaluation);
  const addComment = usePrototypeStore((state) => state.addComment);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('todos');
  const [tab, setTab] = useState<'resumen' | 'tareas' | 'evidencias' | 'evaluaciones'>('resumen');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [summary, setSummary] = useState('');
  const [confirmEvaluation, setConfirmEvaluation] = useState(false);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);

  const selectedProject = id ? availableProjects.find((project) => project.id === id) ?? null : activeProject;
  const selectedTask = tasks.find((task) => task.id === id && availableProjects.some((project) => project.id === task.projectId)) ?? null;
  const allReviewTasks = useMemo(
    () => tasks.filter((task) => availableProjects.some((project) => project.id === task.projectId) && task.evidences.length > 0),
    [availableProjects, tasks],
  );
  const reviewTasks = useMemo(
    () => allReviewTasks.filter((task) => task.projectId === activeProject?.id),
    [activeProject?.id, allReviewTasks],
  );

  useEffect(() => {
    const projectId = selectedTask?.projectId ?? selectedProject?.id;
    if (projectId && activeProject?.id !== projectId && (view === 'proyecto-detalle' || view === 'revision-detalle')) setActiveProject(projectId);
  }, [activeProject?.id, selectedProject?.id, selectedTask?.projectId, setActiveProject, view]);

  useEffect(() => {
    setScore(0);
    setSummary('');
    setMessage('');
    setMessageError(false);
    setConfirmEvaluation(false);
  }, [activeProject?.id]);

  if (!ready || !currentUser || !activeProject) return <LoadingState />;

  const activeTasks = tasks.filter((task) => task.projectId === activeProject.id);
  const activeDeliverables = deliverables.filter((item) => item.projectId === activeProject.id);
  const activeEvaluations = evaluations.filter((item) => item.projectId === activeProject.id);
  const pendingEvaluations = availableProjects.filter((project) => !evaluations.some((item) => item.projectId === project.id)).length;

  if (view === 'inicio') {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Profesor" title="¿Qué requiere tu atención?" description="Revisa evidencias pendientes y proyectos supervisados." action={<Button onClick={() => navigate('/app/profesor/revisiones')}>Revisar pendientes</Button>} />
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Proyectos" value={`${availableProjects.length}`} trend="Equipos supervisados" accent="cyan" icon={FolderKanban} />
          <MetricCard label="Evidencias" value={`${allReviewTasks.length}`} trend="Con archivos adjuntos" accent="blue" icon={ClipboardCheck} />
          <MetricCard label="Por evaluar" value={`${pendingEvaluations}`} trend="Sin evaluación registrada" accent="warning" icon={Star} />
          <MetricCard label="Próximo cierre" value={formatDate([...availableProjects].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]?.dueDate ?? activeProject.dueDate)} trend="Fecha más cercana" accent="success" icon={FileCheck2} />
        </section>
        <Card>
          <div className="flex items-center justify-between"><h2 className="font-semibold text-white">Proyectos recientes</h2><Button variant="ghost" onClick={() => navigate('/app/profesor/proyectos')}>Ver todos</Button></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">{availableProjects.slice(0, 4).map((project) => <button key={project.id} className="rounded-xl border border-white/8 bg-white/[0.025] p-4 text-left hover:border-cyan-300/25" onClick={() => navigate(`/app/profesor/proyectos/${project.id}`)}><div className="flex items-center justify-between gap-3"><StatusBadge status={project.status} /><span className="numeric text-cyan-200">{project.progress}%</span></div><p className="mt-3 font-medium text-white">{project.name}</p><p className="mt-1 text-sm text-slate-400">{project.course}</p></button>)}</div>
        </Card>
      </div>
    );
  }

  if (view === 'proyectos') {
    const filtered = availableProjects.filter((project) => `${project.name} ${project.course}`.toLowerCase().includes(query.toLowerCase()) && (status === 'todos' || project.status === status));
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Profesor" title="Proyectos supervisados" description="Busca un proyecto y abre su espacio de revisión." />
        <Card><div className="grid gap-3 md:grid-cols-2"><FormField label="Buscar proyecto"><input className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} /></FormField><FormField label="Estado"><select className="form-control" value={status} onChange={(event) => setStatus(event.target.value)}><option value="todos">Todos</option><option value="activo">Activo</option><option value="pausado">Pausado</option><option value="finalizado">Finalizado</option></select></FormField></div></Card>
        <div className="grid gap-4 md:grid-cols-2">{filtered.map((project) => <Card key={project.id}><div className="flex items-center justify-between gap-3"><StatusBadge status={project.status} /><span className="numeric text-lg text-cyan-200">{project.progress}%</span></div><h2 className="mt-4 font-semibold text-white">{project.name}</h2><p className="mt-1 text-sm text-slate-400">{project.course} · {project.memberIds.length} integrantes</p><Button className="mt-5 w-full" variant="secondary" onClick={() => navigate(`/app/profesor/proyectos/${project.id}`)}>Revisar proyecto</Button></Card>)}</div>
      </div>
    );
  }

  if (view === 'proyecto-detalle' && !selectedProject) {
    return <EmptyState icon={FolderKanban} title="Proyecto no encontrado" description="El proyecto no existe o no está asignado a este profesor." />;
  }

  if (view === 'proyecto-detalle' && selectedProject) {
    const projectTasks = tasks.filter((task) => task.projectId === selectedProject.id);
    const projectEvaluations = evaluations.filter((item) => item.projectId === selectedProject.id);
    const projectMembers = users.filter((user) => selectedProject.memberIds.includes(user.id));
    const projectEvidence = projectTasks.flatMap((task) => task.evidences);
    return (
      <div className="space-y-5">
        <PageHeader eyebrow={selectedProject.course} title={selectedProject.name} description={`${selectedProject.progress}% de avance · ${projectMembers.length} integrantes · cierre ${formatDate(selectedProject.dueDate)}`} />
        <div className="flex gap-1 overflow-x-auto border-b border-white/8" role="tablist">{(['resumen', 'tareas', 'evidencias', 'evaluaciones'] as const).map((item) => <button key={item} role="tab" aria-selected={tab === item} className={`min-h-11 whitespace-nowrap border-b-2 px-4 text-sm capitalize ${tab === item ? 'border-cyan-300 text-white' : 'border-transparent text-slate-400'}`} onClick={() => setTab(item)}>{item}</button>)}</div>
        {tab === 'resumen' ? <Card><div className="grid gap-4 sm:grid-cols-3"><div><p className="section-title">Estado</p><div className="mt-2"><StatusBadge status={selectedProject.status} /></div></div><div><p className="section-title">Integrantes</p><p className="mt-2 text-xl text-white">{projectMembers.length}</p></div><div><p className="section-title">Avance</p><p className="numeric mt-2 text-xl text-white">{selectedProject.progress}%</p></div></div></Card> : null}
        {tab === 'tareas' ? <div className="space-y-3">{projectTasks.map((task) => <Card key={task.id} className="flex items-center justify-between gap-4"><div><h2 className="font-medium text-white">{task.title}</h2><p className="mt-1 text-sm text-slate-400">{users.find((user) => user.id === task.assigneeId)?.name}</p></div><StatusBadge status={task.status} /></Card>)}</div> : null}
        {tab === 'evidencias' ? (projectEvidence.length ? <div className="grid gap-3 md:grid-cols-2">{projectEvidence.map((evidence) => <EvidenceCard key={evidence.id} evidence={evidence} user={users.find((user) => user.id === evidence.userId)} />)}</div> : <EmptyState icon={ClipboardCheck} title="No hay evidencias por revisar" description="Los archivos del equipo aparecerán aquí." />) : null}
        {tab === 'evaluaciones' ? <div className="space-y-3">{projectEvaluations.map((item) => <Card key={item.id}><div className="flex items-center justify-between"><strong className="text-white">{item.score}/100</strong><span className="text-xs text-slate-400">{formatDateTime(item.createdAt)}</span></div><p className="mt-3 text-sm text-slate-300">{item.summary}</p></Card>)}</div> : null}
      </div>
    );
  }

  if (view === 'revisiones') {
    return (
      <div className="space-y-5"><PageHeader eyebrow={activeProject.course} title="Revisiones pendientes" description={`Evidencias de ${activeProject.name}. Usa el selector superior para cambiar de proyecto.`} /><div className="space-y-3">{reviewTasks.map((task) => <Card key={task.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><Badge tone="info">{task.evidences.length} evidencia{task.evidences.length === 1 ? '' : 's'}</Badge><h2 className="mt-3 font-semibold text-white">{task.title}</h2><p className="mt-1 text-sm text-slate-400">{users.find((user) => user.id === task.assigneeId)?.name} · {activeProject.course}</p></div><Button onClick={() => navigate(`/app/profesor/revisiones/${task.id}`)}>Abrir revisión</Button></Card>)}</div>{!reviewTasks.length ? <EmptyState icon={ClipboardCheck} title="No hay evidencias por revisar" description="Este proyecto no tiene tareas con evidencia pendiente." /> : null}</div>
    );
  }

  if (view === 'revision-detalle' && !selectedTask) {
    return <EmptyState icon={ClipboardCheck} title="Revisión no encontrada" description="La tarea no existe o no pertenece a un proyecto supervisado." />;
  }

  if (view === 'revision-detalle' && selectedTask) {
    const student = users.find((user) => user.id === selectedTask.assigneeId);
    return (
      <div className="space-y-5"><PageHeader eyebrow="Revisión" title={selectedTask.title} description={`Responsable: ${student?.name ?? 'No disponible'} · ${formatDate(selectedTask.dueDate)}`} />{message ? <FeedbackMessage tone="success">{message}</FeedbackMessage> : null}<section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]"><Card><h2 className="font-semibold text-white">Evidencia</h2><div className="mt-4 grid gap-3">{selectedTask.evidences.map((evidence) => <EvidenceCard key={evidence.id} evidence={evidence} user={student} />)}</div></Card><Card><h2 className="font-semibold text-white">Retroalimentación</h2><FormField label="Comentario para el estudiante"><textarea className="form-control mt-4 min-h-36" value={feedback} onChange={(event) => setFeedback(event.target.value)} /></FormField><Button className="mt-4" disabled={!feedback.trim()} onClick={() => { addComment(selectedTask.id, feedback); setFeedback(''); setMessage('La retroalimentación se registró correctamente.'); }}>Guardar retroalimentación</Button></Card></section></div>
    );
  }

  if (view === 'evaluaciones') {
    return (
      <div className="space-y-5"><PageHeader eyebrow={activeProject.course} title="Evaluar proyecto" description="Registra una calificación y observaciones para el proyecto seleccionado." />{message ? <FeedbackMessage tone={messageError ? 'error' : 'success'}>{message}</FeedbackMessage> : null}<section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]"><Card><h2 className="font-semibold text-white">{activeProject.name}</h2><div className="mt-5 grid gap-4"><FormField label="Calificación (0 a 100)"><input className="form-control" type="number" min={0} max={100} value={score} onChange={(event) => setScore(Number(event.target.value))} /></FormField><FormField label="Observaciones"><textarea className="form-control min-h-32" value={summary} onChange={(event) => setSummary(event.target.value)} /></FormField><Button disabled={score < 0 || score > 100 || !summary.trim()} onClick={() => setConfirmEvaluation(true)}>Guardar evaluación</Button></div></Card><Card><h2 className="font-semibold text-white">Historial de evaluaciones</h2><div className="mt-4 space-y-3">{activeEvaluations.map((item) => <div key={item.id} className="rounded-xl bg-white/[0.03] p-4"><div className="flex justify-between"><strong className="text-white">{item.score}/100</strong><span className="text-xs text-slate-400">{formatDateTime(item.createdAt)}</span></div><p className="mt-2 text-sm text-slate-300">{item.summary}</p></div>)}</div></Card></section><Modal open={confirmEvaluation} title="Confirmar evaluación" description={`Se registrará una calificación de ${score}/100 para ${activeProject.name}.`} onClose={() => setConfirmEvaluation(false)}><div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setConfirmEvaluation(false)}>Cancelar</Button><Button onClick={() => { const result = addEvaluation(score, summary); setConfirmEvaluation(false); setMessage(result.message); setMessageError(!result.ok); if (result.ok) { setScore(0); setSummary(''); } }}>Confirmar y guardar</Button></div></Modal></div>
    );
  }

  return (
    <div className="space-y-5"><PageHeader eyebrow="Profesor" title="Reportes" description="Genera un reporte académico resumido con los datos visibles del proyecto." />{message ? <FeedbackMessage tone="info">{message}</FeedbackMessage> : null}<Card><h2 className="text-lg font-semibold text-white">{activeProject.name}</h2><p className="mt-2 text-sm text-slate-300">El reporte incluirá progreso, tareas, entregables y evaluaciones. Esta descarga es una simulación local para la demostración.</p><dl className="mt-5 grid gap-4 sm:grid-cols-3"><div><dt className="section-title">Tareas</dt><dd className="mt-2 text-xl text-white">{activeTasks.length}</dd></div><div><dt className="section-title">Entregables</dt><dd className="mt-2 text-xl text-white">{activeDeliverables.length}</dd></div><div><dt className="section-title">Evaluaciones</dt><dd className="mt-2 text-xl text-white">{activeEvaluations.length}</dd></div></dl><Button className="mt-6" onClick={() => { void exportProjectReport(activeProject, activeTasks, activeDeliverables, activeEvaluations); setMessage('Se generó el reporte simulado del proyecto.'); }}><Download className="mr-2 size-4" />Generar reporte PDF</Button></Card></div>
  );
}
