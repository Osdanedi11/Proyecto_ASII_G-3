import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

type PaginationProps = {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalItems, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= pageSize) return null;

  return (
    <nav aria-label="Paginación" className="mt-5 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
      <p className="text-sm text-slate-400">Página {page} de {totalPages}</p>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="mr-1 size-4" /> Anterior
        </Button>
        <Button variant="secondary" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          Siguiente <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </nav>
  );
}
