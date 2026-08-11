export function LoadingState() {
  return (
    <div className="surface flex min-h-[220px] animate-pulse items-center justify-center rounded-2xl">
      <div className="space-y-3 text-center">
        <div className="mx-auto size-12 rounded-full border border-cyan-300/20 bg-cyan-300/10" />
        <p className="section-title">Cargando vista academica</p>
      </div>
    </div>
  );
}
