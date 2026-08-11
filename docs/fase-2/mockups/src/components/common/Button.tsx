import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', ...props },
  ref,
) {
  const variants = {
    primary:
      'bg-linear-to-r from-cyan-400 to-blue-500 text-slate-950 hover:opacity-95 shadow-lg shadow-cyan-950/30',
    secondary:
      'border border-white/12 bg-white/6 text-slate-100 hover:border-cyan-300/35 hover:bg-white/10',
    ghost: 'text-slate-200 hover:bg-white/6',
    danger: 'border border-rose-300/25 bg-rose-400/10 text-rose-100 hover:bg-rose-400/18',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-40',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
