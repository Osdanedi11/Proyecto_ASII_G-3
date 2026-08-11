export type Role = 'estudiante' | 'lider' | 'profesor' | 'administrador' | 'auditor';

export type Permission =
  | 'registrarse'
  | 'iniciar_sesion'
  | 'consultar_proyectos'
  | 'crear_proyecto'
  | 'gestionar_integrantes'
  | 'asignar_tareas'
  | 'actualizar_estado_tarea'
  | 'comentar_tareas'
  | 'adjuntar_archivos'
  | 'definir_cronograma'
  | 'visualizar_progreso'
  | 'evaluar_desempeno'
  | 'exportar_reporte'
  | 'gestionar_usuarios'
  | 'modificar_roles'
  | 'gestionar_proyectos_admin'
  | 'consultar_bitacora'
  | 'configurar_notificaciones';

export type ProjectStatus = 'activo' | 'pausado' | 'finalizado' | 'archivado';
export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada' | 'atrasada';
export type TaskPriority = 'alta' | 'media' | 'baja';
export type NotificationType = 'tarea' | 'comentario' | 'recordatorio' | 'evaluacion' | 'sistema';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  team?: string;
  status: 'activo' | 'inactivo';
  lastActive: string;
}

export interface Project {
  id: string;
  name: string;
  course: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  leaderId: string;
  professorId: string;
  memberIds: string[];
  startDate: string;
  dueDate: string;
  progress: number;
  deliverableCount: number;
}

export interface ProjectMembership {
  id: string;
  projectId: string;
  userId: string;
  projectRole: 'integrante' | 'lider_equipo' | 'profesor_supervisor';
  joinedAt: string;
}

export interface Evidence {
  id: string;
  taskId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  localReference: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string;
  createdBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  module: string;
  estimatedHours: number;
  progress: number;
  comments: TaskComment[];
  evidences: Evidence[];
}

export interface Deliverable {
  id: string;
  projectId: string;
  title: string;
  version: string;
  status: 'borrador' | 'entregado' | 'retroalimentado';
  dueDate: string;
  submittedBy: string;
}

export interface Evaluation {
  id: string;
  projectId: string;
  professorId: string;
  score: number;
  summary: string;
  createdAt: string;
}

export interface ProjectSchedule {
  id: string;
  projectId: string;
  startDate: string;
  endDate: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
}

export interface NotificationPreferences {
  tareas: boolean;
  comentarios: boolean;
  recordatorios: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  projectId?: string;
  module: string;
  action: string;
  detail: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  trend: string;
  accent: 'cyan' | 'blue' | 'violet' | 'success' | 'warning';
}
