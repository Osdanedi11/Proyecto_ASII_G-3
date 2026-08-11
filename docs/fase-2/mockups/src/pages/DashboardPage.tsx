import {
  Activity,
  CalendarClock,
  KanbanSquare,
  Layers3,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { ProgressChart } from '../components/charts/ProgressChart';
import { LoadingState } from '../components/states/LoadingState';
import { actorLabels, architectureSummary, permissionLabels } from '../data/sourceOfTruth';
import { usePageReady } from '../hooks/usePageReady';
import { usePrototypeContext } from '../hooks/usePrototypeContext';
import { usePrototypeStore } from '../modules/auth/auth-store';
import { formatDate, relativeDays } from '../utils/format';
import { permissionSummary } from '../utils/permissions';

export function DashboardPage() {
  const isReady = usePageReady();
  const { currentRole, currentUser, activeProject, availableProjects } = usePrototypeContext();
  const tasks = usePrototypeStore((state) => state.tasks);
  const notifications = usePrototypeStore((state) => state.notifications);
  const auditLogs = usePrototypeStore((state) => state.auditLogs);

  if (!isReady || !currentRole || !currentUser || !activeProject) {
    return <LoadingState />;
  }

  const projectTasks = tasks.filter((task) => task.projectId === activeProject.id);
  const pendingTasks = projectTasks.filter((task) => task.status !== 'completada').length;
  const overdueTasks = projectTasks.filter((task) => task.status === 'atrasada').length;
  const unread = notifications.filter((notification) => notification.userId === currentUser.id && !notification.read).length;
  const dueSoon = [...projectTasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);

  const chartData = Array.from(new Set(projectTasks.map((task) => task.module))).map((module) => {
    const moduleTasks = projectTasks.filter((task) => task.module === module);
    const progress = moduleTasks.reduce((acc, task) => acc + task.progress, 0) / moduleTasks.length;

    return {
      label: module,
      progress: Math.round(progress),
    };
  });

  const rolePermissions = permissionSummary(currentRole);

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          label="Trabajo activo"
          value={`${activeProject.progress}%`}
          trend={`${pendingTasks} actividades abiertas en ${actorLabels[currentRole].toLowerCase()}.`}
          accent="cyan"
          icon={Activity}
        />
        <MetricCard
          label="Fechas criticas"
          value={`${overdueTasks}`}
          trend="Entregas que requieren seguimiento inmediato."
          accent="warning"
          icon={CalendarClock}
        />
        <MetricCard
          label="Notificaciones"
          value={`${unread}`}
          trend="Alertas simuladas ligadas a tareas, comentarios y evaluaciones."
          accent="blue"
          icon={Sparkles}
        />
        <MetricCard
          label="Trazabilidad"
          value={`${auditLogs.length}`}
          trend="Eventos registrados para auditoria y seguimiento academico."
          accent="violet"
          icon={ShieldCheck}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-title">Avance del trabajo academico</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Evolucion del proyecto actual por componente</h3>
            </div>
            <Badge tone="info">{activeProject.course}</Badge>
          </div>
          <div className="mt-6">
            <ProgressChart data={chartData} />
          </div>
        </Card>

        <Card>
          <p className="section-title">Proximas entregas</p>
          <div className="mt-5 space-y-3">
            {dueSoon.map((task) => (
              <div key={task.id} className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{task.title}</p>
                  <Badge tone={task.status === 'atrasada' ? 'danger' : 'warning'}>{relativeDays(task.dueDate)}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-300">{task.module}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                  Fecha objetivo - {formatDate(task.dueDate)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-title">Materias y trabajos activos</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Ejemplos de encargos del ciclo actual</h3>
            </div>
            <KanbanSquare className="size-5 text-cyan-200" />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {availableProjects.map((project) => (
              <div key={project.id} className="rounded-[22px] border border-white/10 bg-slate-950/25 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{project.name}</p>
                    <p className="mt-2 text-sm text-slate-300">{project.course}</p>
                  </div>
                  <Badge tone="info">{project.progress}%</Badge>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{project.description}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                  Entrega final - {formatDate(project.dueDate)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
              <div className="flex items-center gap-2">
                <Layers3 className="size-5 text-cyan-200" />
                <p className="section-title">Arquitectura</p>
              </div>
              <p className="mt-3 text-base font-semibold text-white">{architectureSummary.architecture}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                La interfaz representa la capa de presentacion del sistema y organiza los modulos para trabajos
                colaborativos con datos simulados.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
              <p className="section-title">Modulos visibles</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {architectureSummary.modules.map((module) => (
                  <Badge key={module}>{module}</Badge>
                ))}
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                El flujo se mantiene coherente con tareas, cronograma, evaluacion, administracion y auditoria.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="section-title">Permisos activos</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Lo que puede hacer tu rol</h3>
          <div className="mt-5 flex flex-wrap gap-2">
            {rolePermissions.map((permission) => (
              <Badge key={permission} tone="success">
                {permissionLabels[permission as keyof typeof permissionLabels]}
              </Badge>
            ))}
          </div>
          <div className="mt-6 rounded-[22px] border border-white/10 bg-white/6 p-4">
            <p className="section-title">Modo de sesion</p>
            <p className="mt-3 text-base font-semibold text-white">{currentUser.name}</p>
            <p className="mt-2 text-sm text-slate-300">
              Este espacio cambia segun el rol para sostener la matriz general de permisos definida en el documento.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
