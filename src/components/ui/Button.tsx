import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-soft-rose text-rich-brown shadow-glow hover:-translate-y-0.5 hover:brightness-105',
  secondary:
    'border-white/60 bg-white/75 text-cocoa shadow-dreamy hover:-translate-y-0.5 hover:bg-white/90',
}

export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex min-h-11 items-center justify-center rounded-full border px-5 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soft-rose/80 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_STYLES[variant],
        className,
      )}
      {...props}
    />
  )
}
