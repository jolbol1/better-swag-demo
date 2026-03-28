import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary px-4 py-2.5 text-primary-foreground hover:bg-primary/85',
        outline:
          'border-white/10 bg-white/[0.03] px-4 py-2.5 text-foreground hover:border-white/20 hover:bg-white/[0.06]',
        ghost: 'px-3 py-2 text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
      },
      size: {
        default: '',
        lg: 'px-5 py-3 text-sm',
        sm: 'px-3 py-2 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export function Button({
  asChild = false,
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
