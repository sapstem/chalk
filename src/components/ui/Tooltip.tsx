import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: string
  children: React.ReactElement
  delay?: number
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

const OFFSET = 8

export default function Tooltip({
  content,
  children,
  delay = 500,
  placement = 'top',
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = () => {
    timerRef.current = setTimeout(() => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      let top = 0
      let left = 0
      if (placement === 'top') {
        top = rect.top - OFFSET
        left = rect.left + rect.width / 2
      } else if (placement === 'bottom') {
        top = rect.bottom + OFFSET
        left = rect.left + rect.width / 2
      } else if (placement === 'left') {
        top = rect.top + rect.height / 2
        left = rect.left - OFFSET
      } else {
        top = rect.top + rect.height / 2
        left = rect.right + OFFSET
      }
      setCoords({ top, left })
      setVisible(true)
    }, delay)
  }

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>

  const trigger = {
    ...child,
    props: {
      ...child.props,
      ref: triggerRef,
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        show()
        child.props.onMouseEnter?.(e)
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        hide()
        child.props.onMouseLeave?.(e)
      },
      onFocus: (e: React.FocusEvent<HTMLElement>) => {
        show()
        child.props.onFocus?.(e)
      },
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        hide()
        child.props.onBlur?.(e)
      },
    },
  }

  const transformMap: Record<NonNullable<TooltipProps['placement']>, string> = {
    top: 'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0)',
    left: 'translate(-100%, -50%)',
    right: 'translate(0, -50%)',
  }

  return (
    <>
      {trigger}
      {visible &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: transformMap[placement],
              background: 'var(--color-text-primary)',
              color: 'var(--color-text-inverse)',
              fontSize: 'var(--font-size-xs)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 'var(--z-toast)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  )
}
