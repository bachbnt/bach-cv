import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

/**
 * Button scale from the design mockup: 40px for header controls, 48px for calls to action, 10px radius.
 * `brand` is the accent red (Download CV); `default` is ink (Connect); `outline` has the 1.5px ink border.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[10px] border border-transparent text-[15px] font-semibold whitespace-nowrap transition-[filter,background-color,color] outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:brightness-125',
        brand: 'bg-brand text-white hover:brightness-[.92]',
        outline:
          'border-[1.5px] border-foreground bg-transparent text-foreground hover:bg-secondary',
        ghost: 'text-foreground hover:bg-secondary',
        link: 'text-foreground underline underline-offset-4 hover:text-brand',
      },
      size: {
        default: 'h-10 gap-2.5 px-4',
        lg: 'h-12 gap-2.5 px-6 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
