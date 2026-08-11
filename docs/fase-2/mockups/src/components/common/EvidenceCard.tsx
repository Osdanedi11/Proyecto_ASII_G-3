import { FileText } from 'lucide-react';
import type { Evidence, User } from '../../types';
import { fileTypeLabel, formatDateTime, formatFileSize } from '../../utils/format';

export function EvidenceCard({ evidence, user }: { evidence: Evidence; user?: User }) {
  return (
    <article className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-4">
      <div className="rounded-lg bg-cyan-400/10 p-2 text-cyan-200"><FileText className="size-5" /></div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{evidence.fileName}</p>
        <p className="mt-1 text-sm text-slate-300">
          {fileTypeLabel(evidence.fileName, evidence.mimeType)} · {formatFileSize(evidence.size)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {formatDateTime(evidence.uploadedAt)}{user ? ` · ${user.name}` : ''}
        </p>
      </div>
    </article>
  );
}
