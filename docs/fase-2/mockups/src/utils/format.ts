import type { ProjectStatus, Role, TaskPriority, TaskStatus } from '../types';

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-CR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat('es-CR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date));
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('es-CR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function relativeDays(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'vence hoy';
  if (days === 1) return 'vence mañana';
  if (days < 0) return `${Math.abs(days)} días de atraso`;
  return `${days} días restantes`;
}

export function statusLabel(status: TaskStatus | ProjectStatus | 'activo' | 'inactivo') {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    en_progreso: 'En progreso',
    completada: 'Completada',
    atrasada: 'Atrasada',
    activo: 'Activo',
    pausado: 'Pausado',
    finalizado: 'Finalizado',
    archivado: 'Archivado',
    inactivo: 'Inactivo',
  };

  return labels[status] ?? status;
}

export function roleLabel(role: Role) {
  const labels: Record<Role, string> = {
    estudiante: 'Estudiante',
    lider: 'Líder de equipo',
    profesor: 'Profesor',
    administrador: 'Administrador',
    auditor: 'Auditor',
  };
  return labels[role];
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileTypeLabel(fileName: string, mimeType: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const labels: Record<string, string> = {
    pdf: 'Documento PDF',
    docx: 'Documento de Word',
    xlsx: 'Hoja de cálculo de Excel',
    png: 'Imagen PNG',
    jpg: 'Imagen JPEG',
    jpeg: 'Imagen JPEG',
    zip: 'Archivo comprimido ZIP',
  };
  if (extension && labels[extension]) return labels[extension];
  if (mimeType.startsWith('image/')) return 'Imagen';
  return 'Archivo adjunto';
}

export function priorityLabel(priority: TaskPriority) {
  const labels = {
    alta: 'Alta',
    media: 'Media',
    baja: 'Baja',
  };

  return labels[priority];
}

export function percentage(value: number) {
  return `${Math.round(value)}%`;
}
