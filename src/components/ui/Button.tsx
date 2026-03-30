import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'solid' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  active?: boolean
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: 28, padding: '0 var(--space-2)', fontSize: 'var(--font-size-xs)', gap: 'var(--space-1)' },
  md: { height: 34, padding: '0 var(--space-3)', fontSize: 'var(--font-size-sm)', gap: 'var(--space-2)' },
  lg: { height: 40, padding: '0 var(--space-4)', fontSize: 'var(--font-size-md)', gap: 'var(--space-2)' },
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  solid: {
    background: 'var(--color-brand-primary)',
    color: 'var(--color-text-on-brand)',
    border: '1px solid transparent',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid transparent',
  },
  outline: {
    background: 'var(--color-surface-0)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-surface-3)',
  },
}

export default function Button({
  variant = 'solid',
  size = 'md',
  active = false,
  style,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        lineHeight: 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast)',
        outline: 'none',
        userSelect: 'none',
        ...(active && variant === 'ghost'
          ? { background: 'var(--color-surface-2)', color: 'var(--color-text-primary)' }
          : {}),
        ...variantStyles[variant],
        ...(active && variant === 'ghost'
          ? { background: 'var(--color-surface-2)', color: 'var(--color-text-primary)' }
          : {}),
        ...sizeStyles[size],
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
