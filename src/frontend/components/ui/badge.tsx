import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[0.24em] uppercase',
  {
    variants: {
      variant: {
        default: 'border-primary/30 bg-primary/12 text-primary',
        secondary: 'border-white/10 bg-white/[0.03] text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
