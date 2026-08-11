import { Badge } from './Badge';
import { statusLabel } from '../../utils/format';
import type { ProjectStatus, TaskStatus } from '../../types';

export function StatusBadge({ status }: { status: ProjectStatus | TaskStatus | 'activo' | 'inactivo' }) {
  const tone =
    status === 'completada' || status === 'finalizado' || status === 'activo'
      ? 'success'
      : status === 'atrasada'
        ? 'danger'
        : status === 'en_progreso'
          ? 'info'
          : 'warning';
  return <Badge tone={tone}>{statusLabel(status)}</Badge>;
}
