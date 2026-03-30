import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'sm' | 'md' | 'lg'
  radius?: 'sm' | 'md' | 'lg' | 'xl'
  style?: CSSProperties
}

const paddingMap = {
  none: '0',
  sm: 'var(--space-2)',
  md: 'var(--space-3)',
  lg: 'var(--space-4)',
}

const shadowMap = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
}

const radiusMap = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
}

export default function Panel({
  children,
  padding = 'md',
  shadow = 'md',
  radius = 'lg',
  style,
  ...rest
}: PanelProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface-0)',
        borderRadius: radiusMap[radius],
        boxShadow: shadowMap[shadow],
        padding: paddingMap[padding],
        border: '1px solid var(--color-surface-2)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
