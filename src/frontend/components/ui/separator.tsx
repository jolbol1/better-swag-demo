import * as React from 'react';
import { cn } from '../../utils/cn';

export function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<'div'> & {
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'shrink-0 bg-white/10',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...props}
    />
  );
}
