export function FeedbackMessage({ tone, children }: { tone: 'success' | 'error' | 'info'; children: string }) {
  const styles = {
    success: 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100',
    error: 'border-rose-300/25 bg-rose-400/10 text-rose-100',
    info: 'border-cyan-300/20 bg-cyan-400/8 text-cyan-50',
  };
  return <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${styles[tone]}`}>{children}</p>;
}
