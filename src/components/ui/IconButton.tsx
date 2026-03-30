import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Tooltip from './Tooltip'
import type { ButtonSize } from './Button'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  label: string
  size?: ButtonSize
  active?: boolean
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right'
}

const sizeMap: Record<ButtonSize, number> = {
  sm: 28,
  md: 32,
  lg: 38,
}

const iconSizeMap: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 20,
}

export default function IconButton({
  icon,
  label,
  size = 'md',
  active = false,
  tooltipPlacement = 'bottom',
  style,
  disabled,
  ...rest
}: IconButtonProps) {
  const dim = sizeMap[size]
  const iconDim = iconSizeMap[size]

  const btn = (
    <button
      aria-label={label}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: 'var(--radius-md)',
        border: '1px solid transparent',
        background: active ? 'var(--color-brand-primary)' : 'transparent',
        color: active ? 'var(--color-text-on-brand)' : 'var(--color-text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition:
          'background var(--transition-fast), color var(--transition-fast)',
        outline: 'none',
        flexShrink: 0,
        fontSize: iconDim,
        lineHeight: 1,
        ...style,
      }}
      {...rest}
    >
      {icon}
    </button>
  )

  return (
    <Tooltip content={label} placement={tooltipPlacement}>
      {btn}
    </Tooltip>
  )
}
