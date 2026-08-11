import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-panel max-w-lg rounded-[32px] p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl border border-white/10 bg-white/6">
          <Compass className="size-7 text-cyan-200" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-white">Ruta no encontrada</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          La vista que buscas no esta disponible o no esta permitida para el rol activo.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-semibold text-slate-950"
        >
          Volver al acceso
        </Link>
      </div>
    </div>
  );
}
