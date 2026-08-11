import { create } from 'zustand';
import { cloneSeedState } from '../../data/mockData';
import type {
  AppNotification,
  AuditLog,
  Deliverable,
  Evaluation,
  NotificationPreferences,
  Project,
  ProjectMembership,
  ProjectSchedule,
  Role,
  Task,
  TaskComment,
  TaskStatus,
  User,
} from '../../types';
import { roleLabel, statusLabel } from '../../utils/format';

type NewTaskInput = {
  projectId: string;
  title: string;
  description: string;
  assigneeIds: string[];
  dueDate: string;
  priority: Task['priority'];
  module: string;
  estimatedHours?: number;
};

type NewProjectInput = {
  name: string;
  course: string;
  description: string;
  memberIds: string[];
  startDate: string;
  dueDate: string;
};

type TaskDetailsInput = Pick<Task, 'title' | 'description' | 'assigneeId' | 'dueDate' | 'priority'>;

type ActionResult = {
  ok: boolean;
  message: string;
};

type StoreState = {
  currentRole: Role | null;
  currentUserId: string | null;
  activeProjectId: string;
  users: User[];
  projects: Project[];
  projectMemberships: ProjectMembership[];
  projectSchedules: ProjectSchedule[];
  tasks: Task[];
  deliverables: Deliverable[];
  evaluations: Evaluation[];
  notifications: AppNotification[];
  notificationPreferences: Record<string, NotificationPreferences>;
  auditLogs: AuditLog[];
  loginAsRole: (role: Role) => void;
  authenticateDemo: (email: string, password: string, role: Role) => ActionResult;
  logout: () => void;
  setActiveProject: (projectId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => ActionResult;
  addComment: (taskId: string, content: string) => void;
  addEvidence: (taskId: string, file: Pick<File, 'name' | 'size' | 'type'>) => ActionResult;
  createTask: (payload: NewTaskInput) => ActionResult;
  updateTaskDetails: (taskId: string, payload: TaskDetailsInput) => ActionResult;
  createProject: (payload: NewProjectInput) => ActionResult;
  addProjectMember: (projectId: string, userId: string) => ActionResult;
  createUser: (payload: Pick<User, 'name' | 'email' | 'role'>) => ActionResult;
  toggleUserStatus: (userId: string) => void;
  updateUserRole: (userId: string, role: Role) => void;
  updateProjectStatus: (projectId: string, status: Project['status']) => void;
  addEvaluation: (score: number, summary: string) => ActionResult;
  updateNotificationPreference: (key: keyof NotificationPreferences, value: boolean) => void;
  resetStore: () => void;
};

export const DEMO_PASSWORD = 'PGPTE-demo-2026';
const defaultProjectId = 'prj-invernadero';
const allowedEvidenceTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'application/zip',
]);
const maxEvidenceSize = 5 * 1024 * 1024;

function getAccessibleProjects(role: Role, userId: string, projects: Project[]) {
  if (role === 'administrador') return projects;
  if (role === 'auditor') return [];
  if (role === 'profesor') return projects.filter((project) => project.professorId === userId);
  if (role === 'lider') {
    return projects.filter((project) => project.leaderId === userId || project.memberIds.includes(userId));
  }
  return projects.filter((project) => project.memberIds.includes(userId));
}

function createAuditEntry(userId: string, module: string, action: string, detail: string, projectId?: string): AuditLog {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId,
    projectId,
    module,
    action,
    detail,
  };
}

function createNotification(userId: string, title: string, body: string, type: AppNotification['type']): AppNotification {
  return {
    id: crypto.randomUUID(),
    userId,
    title,
    body,
    type,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

function refreshProjectProgress(projects: Project[], tasks: Task[], projectId: string) {
  const projectTasks = tasks.filter((task) => task.projectId === projectId);
  const progress = projectTasks.length
    ? Math.round(projectTasks.reduce((total, task) => total + task.progress, 0) / projectTasks.length)
    : 0;

  return projects.map((project) => (project.id === projectId ? { ...project, progress } : project));
}

function isProjectLeader(role: Role | null, userId: string | null, project: Project | undefined) {
  return role === 'lider' && Boolean(userId && project?.leaderId === userId);
}

function isActiveProjectMember(userId: string, project: Project, users: User[]) {
  const user = users.find((entry) => entry.id === userId);
  return Boolean(
    user &&
    user.status === 'activo' &&
    (project.memberIds.includes(userId) || project.leaderId === userId),
  );
}

function taskProgressForStatus(status: TaskStatus, previousStatus: TaskStatus, currentProgress: number) {
  if (status === 'completada') return 100;
  if (status === 'pendiente') return 0;
  if (status === 'en_progreso') {
    return previousStatus === 'completada' ? 50 : Math.min(95, Math.max(currentProgress, 45));
  }
  return Math.min(95, currentProgress);
}

function createInitialState() {
  const seed = cloneSeedState();
  const projects = seed.projects.map((project) => {
    const projectTasks = seed.tasks.filter((task) => task.projectId === project.id);
    const progress = projectTasks.length
      ? Math.round(projectTasks.reduce((total, task) => total + task.progress, 0) / projectTasks.length)
      : 0;
    return { ...project, progress };
  });

  return {
    currentRole: null as Role | null,
    currentUserId: null as string | null,
    activeProjectId: defaultProjectId,
    ...seed,
    projects,
  };
}

export const usePrototypeStore = create<StoreState>((set, get) => ({
  ...createInitialState(),
  loginAsRole: (role) => {
    const user = get().users.find((entry) => entry.role === role && entry.status === 'activo');
    if (!user) return;

    const projects = get().projects;
    const accessibleProjects = getAccessibleProjects(role, user.id, projects);

    set({
      currentRole: role,
      currentUserId: user.id,
      activeProjectId: accessibleProjects[0]?.id ?? defaultProjectId,
    });
  },
  authenticateDemo: (email, password, role) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = get().users.find(
      (entry) => entry.email.toLowerCase() === normalizedEmail && entry.role === role,
    );

    if (!normalizedEmail || !password) {
      return { ok: false, message: 'Completa el correo institucional y la contrasena de demostracion.' };
    }
    if (!user || password !== DEMO_PASSWORD) {
      return { ok: false, message: 'Las credenciales simuladas no coinciden con el rol seleccionado.' };
    }
    if (user.status !== 'activo') {
      return { ok: false, message: 'La cuenta de demostracion se encuentra inactiva.' };
    }

    const accessibleProjects = getAccessibleProjects(role, user.id, get().projects);
    set({
      currentRole: role,
      currentUserId: user.id,
      activeProjectId: accessibleProjects[0]?.id ?? defaultProjectId,
    });
    return { ok: true, message: 'Acceso simulado correcto.' };
  },
  logout: () => {
    set((state) => ({
      ...state,
      currentRole: null,
      currentUserId: null,
    }));
  },
  setActiveProject: (projectId) => {
    const { currentRole, currentUserId, projects } = get();
    if (!currentRole || !currentUserId) return;
    const accessible = getAccessibleProjects(currentRole, currentUserId, projects);
    if (accessible.some((project) => project.id === projectId)) set({ activeProjectId: projectId });
  },
  markNotificationRead: (notificationId) => {
    const { currentUserId, notifications } = get();
    if (!currentUserId || !notifications.some((item) => item.id === notificationId && item.userId === currentUserId)) return;
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      ),
    }));
  },
  updateTaskStatus: (taskId, status) => {
    const { currentRole, currentUserId, tasks, projects, auditLogs, notifications } = get();
    if (!currentUserId || !currentRole) {
      return { ok: false, message: 'Debes iniciar sesión para actualizar una tarea.' };
    }

    const task = tasks.find((item) => item.id === taskId);
    if (!task) return { ok: false, message: 'La tarea seleccionada no existe.' };
    const project = projects.find((item) => item.id === task.projectId);
    const canUpdate =
      (currentRole === 'estudiante' && task.assigneeId === currentUserId) ||
      isProjectLeader(currentRole, currentUserId, project);
    if (!canUpdate) return { ok: false, message: 'Tu rol no puede actualizar esta tarea.' };

    const updatedTasks = tasks.map((item) =>
      item.id === taskId
        ? {
            ...item,
            status,
            progress: taskProgressForStatus(status, item.status, item.progress),
          }
        : item,
    );

    set({
      tasks: updatedTasks,
      projects: refreshProjectProgress(projects, updatedTasks, task.projectId),
      auditLogs: [
        createAuditEntry(currentUserId, 'Tareas', 'Estado actualizado', `${task.title} cambió a ${statusLabel(status)}.`, task.projectId),
        ...auditLogs,
      ],
      notifications: [
        createNotification(task.createdBy, 'Tarea actualizada', `${task.title} cambió a ${statusLabel(status)}.`, 'tarea'),
        ...notifications,
      ],
    });
    return { ok: true, message: 'La tarea se actualizó correctamente.' };
  },
  addComment: (taskId, content) => {
    const { currentRole, currentUserId, tasks, projects, auditLogs, notifications } = get();
    if (!currentUserId || !currentRole || !content.trim()) return;

    const comment: TaskComment = {
      id: crypto.randomUUID(),
      taskId,
      authorId: currentUserId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    const project = projects.find((item) => item.id === task.projectId);
    const canComment =
      (currentRole === 'estudiante' && task.assigneeId === currentUserId) ||
      isProjectLeader(currentRole, currentUserId, project) ||
      (currentRole === 'profesor' && project?.professorId === currentUserId);
    if (!canComment) return;

    set({
      tasks: tasks.map((item) =>
        item.id === taskId ? { ...item, comments: [...item.comments, comment] } : item,
      ),
      auditLogs: [
        createAuditEntry(currentUserId, 'Comentarios', 'Nuevo comentario', `Se comentó la tarea ${task.title}.`, task.projectId),
        ...auditLogs,
      ],
      notifications: [
        createNotification(task.assigneeId, 'Nuevo comentario', `Hay un nuevo comentario en ${task.title}.`, 'comentario'),
        ...notifications,
      ],
    });
  },
  addEvidence: (taskId, file) => {
    const { currentRole, currentUserId, tasks, projects, auditLogs, notifications } = get();
    if (!currentUserId || !currentRole) {
      return { ok: false, message: 'Debes iniciar sesion para adjuntar una evidencia.' };
    }
    const task = tasks.find((item) => item.id === taskId);
    const project = projects.find((item) => item.id === task?.projectId);
    const canAttach =
      Boolean(task) &&
      ((currentRole === 'estudiante' && task?.assigneeId === currentUserId) ||
        isProjectLeader(currentRole, currentUserId, project));
    if (!task || !canAttach) {
      return { ok: false, message: 'Tu rol no puede adjuntar evidencia a esta tarea.' };
    }
    if (!allowedEvidenceTypes.has(file.type)) {
      return { ok: false, message: 'Tipo no permitido. Usa PDF, DOCX, XLSX, PNG, JPG o ZIP.' };
    }
    if (file.size <= 0 || file.size > maxEvidenceSize) {
      return { ok: false, message: 'El archivo debe tener un tamano maximo de 5 MB.' };
    }

    const evidence = {
      id: crypto.randomUUID(),
      taskId,
      userId: currentUserId,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      localReference: `mock://evidencias/${encodeURIComponent(file.name)}`,
    };

    set({
      tasks: tasks.map((item) =>
        item.id === taskId ? { ...item, evidences: [...item.evidences, evidence] } : item,
      ),
      auditLogs: [
        createAuditEntry(currentUserId, 'Evidencias', 'Carga simulada', `Se adjuntó ${file.name} en ${task.title}.`, task.projectId),
        ...auditLogs,
      ],
      notifications: [
        createNotification(
          project?.professorId ?? task.createdBy,
          'Nueva evidencia',
          `${file.name} fue adjuntado a ${task.title}.`,
          'sistema',
        ),
        ...notifications,
      ],
    });
    return { ok: true, message: 'Evidencia simulada adjuntada correctamente.' };
  },
  createTask: (payload) => {
    const { currentRole, currentUserId, tasks, auditLogs, notifications, users, projects } = get();
    if (!currentUserId || !currentRole) {
      return { ok: false, message: 'Debes iniciar sesión para crear una tarea.' };
    }

    const project = projects.find((entry) => entry.id === payload.projectId);
    if (!project || !isProjectLeader(currentRole, currentUserId, project)) {
      return { ok: false, message: 'Solo el líder del proyecto seleccionado puede crear tareas.' };
    }
    if (!payload.title.trim() || !payload.description.trim() || !payload.dueDate) {
      return { ok: false, message: 'Completa el título, la descripción y la fecha límite.' };
    }
    if (payload.dueDate < project.startDate || payload.dueDate > project.dueDate) {
      return { ok: false, message: 'La fecha límite debe estar dentro del cronograma del proyecto.' };
    }

    const assigneeIds = Array.from(new Set(payload.assigneeIds)).filter(Boolean);
    if (!assigneeIds.length) return { ok: false, message: 'Selecciona al menos un responsable.' };
    if (assigneeIds.some((assigneeId) => !isActiveProjectMember(assigneeId, project, users))) {
      return { ok: false, message: 'Todos los responsables deben ser integrantes activos del proyecto.' };
    }

    const newTasks: Task[] = assigneeIds.map((assigneeId) => ({
      id: crypto.randomUUID(),
      projectId: payload.projectId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      assigneeId,
      createdBy: currentUserId,
      status: 'pendiente',
      priority: payload.priority,
      dueDate: payload.dueDate,
      module: payload.module,
      estimatedHours: payload.estimatedHours ?? 4,
      progress: 0,
      comments: [],
      evidences: [],
    }));

    const assignedNames = assigneeIds
      .map((id) => users.find((entry) => entry.id === id)?.name ?? 'Integrante')
      .join(', ');

    set({
      tasks: [...newTasks, ...tasks],
      projects: refreshProjectProgress(projects, [...newTasks, ...tasks], payload.projectId),
      auditLogs: [
        createAuditEntry(
          currentUserId,
          'Tareas',
          'Nueva tarea',
          `Se creó "${payload.title.trim()}" para ${assignedNames} en ${project.course}.`,
          project.id,
        ),
        ...auditLogs,
      ],
      notifications: [
        ...assigneeIds.map((assigneeId) =>
          createNotification(
            assigneeId,
            'Nueva tarea asignada',
            `${payload.title} fue asignada en ${project.course}.`,
            'tarea',
          ),
        ),
        ...notifications,
      ],
    });
    return { ok: true, message: `La tarea se creó en ${project.name} y fue asignada correctamente.` };
  },
  createProject: (payload) => {
    const {
      currentRole,
      currentUserId,
      projects,
      projectMemberships,
      projectSchedules,
      auditLogs,
      notifications,
      users,
    } = get();
    if (!currentUserId || currentRole !== 'lider') {
      return { ok: false, message: 'Tu rol no puede crear proyectos.' };
    }
    if (!payload.name.trim() || !payload.course.trim() || !payload.description.trim()) {
      return { ok: false, message: 'Completa los datos obligatorios del proyecto.' };
    }
    if (!payload.startDate || !payload.dueDate || payload.startDate > payload.dueDate) {
      return { ok: false, message: 'El cronograma del proyecto no es válido.' };
    }
    const validStudents = payload.memberIds.filter((memberId) =>
      users.some((user) => user.id === memberId && user.role === 'estudiante' && user.status === 'activo'),
    );
    if (!validStudents.length || validStudents.length !== new Set(payload.memberIds).size) {
      return { ok: false, message: 'Selecciona únicamente estudiantes activos como integrantes.' };
    }

    const memberIds = Array.from(new Set([currentUserId, ...validStudents]));
    const leaderName = users.find((entry) => entry.id === currentUserId)?.name ?? 'Lider de equipo';
    const professor = users.find((entry) => entry.role === 'profesor' && entry.status === 'activo');
    if (!professor) return { ok: false, message: 'No hay un profesor activo disponible para supervisar el proyecto.' };
    const projectId = crypto.randomUUID();

    const newProject: Project = {
      id: projectId,
      name: payload.name.trim(),
      course: payload.course.trim(),
      description: payload.description.trim(),
      status: 'activo',
      createdAt: new Date().toISOString().slice(0, 10),
      leaderId: currentUserId,
      professorId: professor.id,
      memberIds,
      startDate: payload.startDate,
      dueDate: payload.dueDate,
      progress: 0,
      deliverableCount: 0,
    };
    const newMemberships: ProjectMembership[] = [
      {
        id: crypto.randomUUID(),
        projectId,
        userId: currentUserId,
        projectRole: 'lider_equipo',
        joinedAt: newProject.createdAt,
      },
      {
        id: crypto.randomUUID(),
        projectId,
        userId: professor.id,
        projectRole: 'profesor_supervisor',
        joinedAt: newProject.createdAt,
      },
      ...memberIds
        .filter((memberId) => memberId !== currentUserId)
        .map((memberId) => ({
          id: crypto.randomUUID(),
          projectId,
          userId: memberId,
          projectRole: 'integrante' as const,
          joinedAt: newProject.createdAt,
        })),
    ];
    const schedule: ProjectSchedule = {
      id: crypto.randomUUID(),
      projectId,
      startDate: payload.startDate,
      endDate: payload.dueDate,
    };

    set({
      projects: [newProject, ...projects],
      projectMemberships: [...newMemberships, ...projectMemberships],
      projectSchedules: [schedule, ...projectSchedules],
      activeProjectId: newProject.id,
      auditLogs: [
        createAuditEntry(
          currentUserId,
          'Proyectos',
          'Nuevo proyecto',
          `${leaderName} creó ${payload.name.trim()} y quedó definido como líder del equipo.`,
          projectId,
        ),
        ...auditLogs,
      ],
      notifications: [
        ...memberIds.map((memberId) =>
          createNotification(
            memberId,
            'Nuevo proyecto academico',
            `Fuiste agregado al proyecto ${payload.name} de ${payload.course}.`,
            'sistema',
          ),
        ),
        ...notifications,
      ],
    });
    return { ok: true, message: 'El proyecto y su cronograma se crearon correctamente.' };
  },
  updateTaskDetails: (taskId, payload) => {
    const { currentRole, currentUserId, tasks, projects, auditLogs, notifications } = get();
    const task = tasks.find((item) => item.id === taskId);
    const project = projects.find((item) => item.id === task?.projectId);
    if (!task || !currentUserId || !isProjectLeader(currentRole, currentUserId, project)) {
      return { ok: false, message: 'Tu rol no puede editar esta tarea.' };
    }
    if (!payload.title.trim() || !payload.description.trim() || !payload.assigneeId || !payload.dueDate) {
      return { ok: false, message: 'Completa todos los campos obligatorios.' };
    }
    if (!project || !isActiveProjectMember(payload.assigneeId, project, get().users)) {
      return { ok: false, message: 'El responsable debe ser integrante activo del proyecto.' };
    }
    if (payload.dueDate < project.startDate || payload.dueDate > project.dueDate) {
      return { ok: false, message: 'La fecha límite debe estar dentro del cronograma del proyecto.' };
    }

    set({
      tasks: tasks.map((item) =>
        item.id === taskId
          ? {
              ...item,
              title: payload.title.trim(),
              description: payload.description.trim(),
              assigneeId: payload.assigneeId,
              dueDate: payload.dueDate,
              priority: payload.priority,
            }
          : item,
      ),
      auditLogs: [
        createAuditEntry(currentUserId, 'Tareas', 'Tarea editada', `Se actualizaron los datos de "${payload.title.trim()}".`, task.projectId),
        ...auditLogs,
      ],
      notifications: [
        createNotification(payload.assigneeId, 'Tarea actualizada', `Se actualizaron los datos de ${payload.title.trim()}.`, 'tarea'),
        ...notifications,
      ],
    });
    return { ok: true, message: 'La tarea se actualizó correctamente.' };
  },
  addProjectMember: (projectId, userId) => {
    const { currentRole, currentUserId, users, projects, projectMemberships, auditLogs, notifications } = get();
    const project = projects.find((entry) => entry.id === projectId);
    const user = users.find((entry) => entry.id === userId && entry.status === 'activo' && entry.role === 'estudiante');
    if (!currentUserId || !project || !isProjectLeader(currentRole, currentUserId, project)) {
      return { ok: false, message: 'Tu rol no puede agregar integrantes a este proyecto.' };
    }
    if (!user) return { ok: false, message: 'Selecciona un estudiante activo.' };
    if (project.memberIds.includes(userId)) return { ok: false, message: 'El estudiante ya pertenece al proyecto.' };

    set({
      projects: projects.map((entry) =>
        entry.id === projectId ? { ...entry, memberIds: [...entry.memberIds, userId] } : entry,
      ),
      projectMemberships: [
        {
          id: crypto.randomUUID(),
          projectId,
          userId,
          projectRole: 'integrante',
          joinedAt: new Date().toISOString().slice(0, 10),
        },
        ...projectMemberships,
      ],
      auditLogs: [
        createAuditEntry(currentUserId, 'Proyectos', 'Integrante agregado', `${user.name} fue agregado a ${project.name}.`, project.id),
        ...auditLogs,
      ],
      notifications: [
        createNotification(userId, 'Proyecto asignado', `Fuiste agregado al proyecto ${project.name}.`, 'sistema'),
        ...notifications,
      ],
    });
    return { ok: true, message: 'El integrante se agregó correctamente.' };
  },
  createUser: (payload) => {
    const { currentRole, currentUserId, users, auditLogs } = get();
    if (!currentUserId || currentRole !== 'administrador') {
      return { ok: false, message: 'Tu rol no puede crear usuarios.' };
    }
    const email = payload.email.trim().toLowerCase();
    if (!payload.name.trim() || !email.endsWith('@ctp-san-isidro.demo')) {
      return { ok: false, message: 'Revisa el nombre y usa un correo institucional simulado.' };
    }
    if (users.some((user) => user.email.toLowerCase() === email)) {
      return { ok: false, message: 'Ya existe un usuario con ese correo simulado.' };
    }
    const user: User = {
      id: crypto.randomUUID(),
      name: payload.name.trim(),
      email,
      role: payload.role,
      status: 'activo',
      lastActive: new Date().toISOString(),
    };
    set({
      users: [user, ...users],
      auditLogs: [
        createAuditEntry(currentUserId, 'Usuarios', 'Usuario creado', `${user.name} fue registrado con el rol ${roleLabel(user.role)}.`),
        ...auditLogs,
      ],
    });
    return { ok: true, message: 'El usuario simulado se creó correctamente.' };
  },
  toggleUserStatus: (userId) => {
    const { currentRole, currentUserId, users, auditLogs } = get();
    if (!currentUserId || currentRole !== 'administrador' || userId === currentUserId) return;

    const target = users.find((entry) => entry.id === userId);
    if (!target) return;

    const nextStatus = target.status === 'activo' ? 'inactivo' : 'activo';

    set({
      users: users.map((entry) =>
        entry.id === userId ? { ...entry, status: nextStatus } : entry,
      ),
      auditLogs: [
        createAuditEntry(currentUserId, 'Usuarios', 'Usuario actualizado', `La cuenta de ${target.name} cambió a ${statusLabel(nextStatus)}.`),
        ...auditLogs,
      ],
    });
  },
  updateUserRole: (userId, role) => {
    const { currentRole, currentUserId, users, auditLogs } = get();
    if (!currentUserId || currentRole !== 'administrador' || userId === currentUserId) return;
    const target = users.find((entry) => entry.id === userId);
    if (!target || target.role === role) return;

    set({
      users: users.map((entry) => (entry.id === userId ? { ...entry, role } : entry)),
      auditLogs: [
        createAuditEntry(
          currentUserId,
          'Administracion',
          'Cambio de rol',
          `${target.name} cambió del rol ${roleLabel(target.role)} al rol ${roleLabel(role)}.`,
        ),
        ...auditLogs,
      ],
    });
  },
  updateProjectStatus: (projectId, status) => {
    const { currentRole, currentUserId, projects, auditLogs } = get();
    if (!currentUserId || !currentRole) return;

    const project = projects.find((entry) => entry.id === projectId);
    if (!project) return;
    const canUpdate =
      currentRole === 'administrador' || isProjectLeader(currentRole, currentUserId, project);
    if (!canUpdate) return;

    set({
      projects: projects.map((entry) =>
        entry.id === projectId ? { ...entry, status } : entry,
      ),
      auditLogs: [
        createAuditEntry(currentUserId, 'Proyectos', 'Estado actualizado', `${project.name} cambió a ${statusLabel(status)}.`, project.id),
        ...auditLogs,
      ],
    });
  },
  addEvaluation: (score, summary) => {
    const { currentRole, currentUserId, evaluations, auditLogs, notifications, activeProjectId, projects } = get();
    if (!currentUserId || currentRole !== 'profesor') {
      return { ok: false, message: 'Tu rol no puede registrar evaluaciones.' };
    }
    if (!Number.isFinite(score) || score < 0 || score > 100 || !summary.trim()) {
      return { ok: false, message: 'Ingresa una calificación entre 0 y 100 y las observaciones.' };
    }

    const project = projects.find((entry) => entry.id === activeProjectId);
    if (!project || project.professorId !== currentUserId) {
      return { ok: false, message: 'No puedes evaluar el proyecto seleccionado.' };
    }

    const evaluation: Evaluation = {
      id: crypto.randomUUID(),
      projectId: activeProjectId,
      professorId: currentUserId,
      score,
      summary: summary.trim(),
      createdAt: new Date().toISOString(),
    };

    set({
      evaluations: [evaluation, ...evaluations],
      auditLogs: [
        createAuditEntry(currentUserId, 'Evaluaciones', 'Nueva evaluación', `Se registró evaluación para ${project.name}.`, project.id),
        ...auditLogs,
      ],
      notifications: [
        createNotification(project.leaderId, 'Evaluacion registrada', 'El profesor registro una nueva evaluacion del equipo.', 'evaluacion'),
        ...notifications,
      ],
    });
    return { ok: true, message: 'La evaluación fue registrada.' };
  },
  updateNotificationPreference: (key, value) => {
    const { currentRole, currentUserId, notificationPreferences } = get();
    if (!currentUserId || !currentRole || !['estudiante', 'lider', 'profesor'].includes(currentRole)) return;

    set({
      notificationPreferences: {
        ...notificationPreferences,
        [currentUserId]: {
          ...notificationPreferences[currentUserId],
          [key]: value,
        },
      },
    });
  },
  resetStore: () => {
    set(createInitialState());
  },
}));
