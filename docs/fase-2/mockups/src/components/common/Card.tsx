import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('surface rounded-2xl p-5 md:p-6', className)} {...props} />;
}
