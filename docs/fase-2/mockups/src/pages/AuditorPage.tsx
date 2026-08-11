import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, Download, Filter, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { FeedbackMessage } from '../components/common/FeedbackMessage';
import { FormField } from '../components/common/FormField';
import { MetricCard } from '../components/common/MetricCard';
import { PageHeader } from '../components/common/PageHeader';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/states/EmptyState';
import { LoadingState } from '../components/states/LoadingState';
import { usePageReady } from '../hooks/usePageReady';
import { usePrototypeContext } from '../hooks/usePrototypeContext';
import { usePrototypeStore } from '../modules/auth/auth-store';
import { formatDateTime } from '../utils/format';

export type AuditorView = 'resumen' | 'bitacora' | 'evento-detalle' | 'reportes';

export function AuditorPage({ view }: { view: AuditorView }) {
  const ready = usePageReady(120);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = usePrototypeContext();
  const users = usePrototypeStore((state) => state.users);
  const auditLogs = usePrototypeStore((state) => state.auditLogs);
  const [query, setQuery] = useState('');
  const [userId, setUserId] = useState('todos');
  const [module, setModule] = useState('todos');
  const [action, setAction] = useState('todas');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');

  const orderedLogs = useMemo(() => [...auditLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [auditLogs]);
  if (!ready || !currentUser) return <LoadingState />;

  const modules = Array.from(new Set(orderedLogs.map((log) => log.module)));
  const actions = Array.from(new Set(orderedLogs.map((log) => log.action)));
  const riskLogs = orderedLogs.filter((log) => ['Usuarios', 'Administracion', 'Proyectos'].includes(log.module));
  const moduleCounts = modules.map((name) => ({ name, count: orderedLogs.filter((log) => log.module === name).length })).sort((a, b) => b.count - a.count);

  if (view === 'resumen') {
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Auditor" title="¿Qué eventos necesitan revisión?" description="Resumen de actividad reciente y accesos a la trazabilidad completa." action={<Button onClick={() => navigate('/app/auditoria/bitacora')}>Consultar bitácora</Button>} />
        <FeedbackMessage tone="info">Vista de solo lectura: no existen acciones para modificar, eliminar o revertir registros.</FeedbackMessage>
        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Eventos recientes" value={`${orderedLogs.length}`} trend="Registros disponibles" accent="cyan" icon={Activity} />
          <MetricCard label="Administrativos" value={`${riskLogs.length}`} trend="Cambios de usuarios o proyectos" accent="warning" icon={ShieldAlert} />
          <MetricCard label="Módulo principal" value={moduleCounts[0]?.name ?? 'Sin actividad'} trend={`${moduleCounts[0]?.count ?? 0} eventos`} accent="blue" icon={ShieldCheck} />
        </section>
        <Card><h2 className="font-semibold text-white">Eventos administrativos recientes</h2><div className="mt-4 divide-y divide-white/8">{riskLogs.slice(0, 5).map((log) => <button key={log.id} className="flex w-full items-center justify-between gap-4 py-3 text-left" onClick={() => navigate(`/app/auditoria/bitacora/${log.id}`)}><div><p className="text-sm font-medium text-white">{log.action}</p><p className="mt-1 text-sm text-slate-400">{log.detail}</p></div><span className="text-xs text-slate-400">{formatDateTime(log.timestamp)}</span></button>)}</div></Card>
      </div>
    );
  }

  if (view === 'evento-detalle') {
    const selected = orderedLogs.find((log) => log.id === id);
    if (!selected) return <EmptyState icon={ShieldCheck} title="Evento no encontrado" description="El identificador solicitado no existe en la bitácora actual." />;
    const user = users.find((item) => item.id === selected.userId);
    return (
      <div className="space-y-5"><PageHeader eyebrow={`Evento ${selected.id}`} title={selected.action} description="Detalle completo en modo de solo lectura." /><FeedbackMessage tone="info">Este registro no puede modificarse, eliminarse ni revertirse.</FeedbackMessage><Card><dl className="grid gap-5 sm:grid-cols-2"><div><dt className="section-title">Usuario</dt><dd className="mt-2 text-white">{user?.name ?? 'Usuario no disponible'}</dd></div><div><dt className="section-title">Módulo</dt><dd className="mt-2 text-white">{selected.module}</dd></div><div><dt className="section-title">Fecha y hora</dt><dd className="mt-2 text-white">{formatDateTime(selected.timestamp)}</dd></div><div><dt className="section-title">Identificador</dt><dd className="numeric mt-2 text-white">{selected.id}</dd></div><div className="sm:col-span-2"><dt className="section-title">Resumen</dt><dd className="mt-2 leading-7 text-slate-200">{selected.detail}</dd></div></dl></Card></div>
    );
  }

  if (view === 'bitacora') {
    const filtered = orderedLogs.filter((log) => {
      const timestamp = log.timestamp.slice(0, 10);
      return `${log.action} ${log.detail} ${log.id}`.toLowerCase().includes(query.toLowerCase()) &&
        (userId === 'todos' || log.userId === userId) &&
        (module === 'todos' || log.module === module) &&
        (action === 'todas' || log.action === action) &&
        (!dateFrom || timestamp >= dateFrom) &&
        (!dateTo || timestamp <= dateTo);
    });
    const pageSize = 15;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize);
    return (
      <div className="space-y-5">
        <PageHeader eyebrow="Auditoría" title="Bitácora" description="Eventos ordenados del más reciente al más antiguo." />
        <FeedbackMessage tone="info">Vista de solo lectura: puedes buscar, filtrar y consultar detalles.</FeedbackMessage>
        <Card><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"><FormField label="Buscar"><input className="form-control" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></FormField><FormField label="Usuario"><select className="form-control" value={userId} onChange={(event) => { setUserId(event.target.value); setPage(1); }}><option value="todos">Todos</option>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></FormField><FormField label="Módulo"><select className="form-control" value={module} onChange={(event) => { setModule(event.target.value); setPage(1); }}><option value="todos">Todos</option>{modules.map((name) => <option key={name} value={name}>{name}</option>)}</select></FormField><FormField label="Tipo de acción"><select className="form-control" value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }}><option value="todas">Todas</option>{actions.map((name) => <option key={name} value={name}>{name}</option>)}</select></FormField><FormField label="Desde"><input className="form-control" type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} /></FormField><FormField label="Hasta"><input className="form-control" type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} /></FormField></div></Card>
        <Card><div className="divide-y divide-white/8">{items.map((log) => <article key={log.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-semibold text-white">{log.action}</h2><Badge>{log.module}</Badge></div><p className="mt-2 text-sm text-slate-300">{log.detail}</p><p className="mt-2 text-xs text-slate-400">{users.find((user) => user.id === log.userId)?.name} · {formatDateTime(log.timestamp)} · {log.id}</p></div><Button variant="ghost" onClick={() => navigate(`/app/auditoria/bitacora/${log.id}`)}>Ver detalle</Button></article>)}</div>{!items.length ? <EmptyState icon={Filter} title="No se encontraron eventos con estos filtros" description="Modifica uno o más criterios para ampliar la búsqueda." /> : null}<Pagination page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-5"><PageHeader eyebrow="Auditoría" title="Reportes de auditoría" description="Genera un corte simulado de los eventos disponibles." />{message ? <FeedbackMessage tone="success">{message}</FeedbackMessage> : null}<Card><h2 className="text-lg font-semibold text-white">Contenido del reporte</h2><p className="mt-2 text-sm leading-6 text-slate-300">Incluye identificador, usuario, fecha, módulo, acción y resumen de cada evento. La descarga es local y no modifica la bitácora.</p><div className="mt-5 flex flex-wrap gap-2">{moduleCounts.map((item) => <Badge key={item.name}>{item.name}: {item.count}</Badge>)}</div><Button className="mt-6" onClick={() => { const content = JSON.stringify(orderedLogs, null, 2); const blob = new Blob([content], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'pgpte-reporte-auditoria.json'; link.click(); URL.revokeObjectURL(url); setMessage('El reporte simulado de auditoría se generó correctamente.'); }}><Download className="mr-2 size-4" />Generar reporte JSON</Button></Card></div>
  );
}
