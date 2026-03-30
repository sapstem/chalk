import { useCanvasStore } from '../../store/canvasStore'
import type { ToolType } from '../../types'
import IconButton from '../ui/IconButton'
import Tooltip from '../ui/Tooltip'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const SelectIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 2l10 5.5-5 1.5L6.5 14 3 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)

const HandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 7V3.5a1 1 0 0 1 2 0V7m0 0V3a1 1 0 1 1 2 0v4m0 0V4a1 1 0 1 1 2 0v5c0 2.761-2.239 5-5 5S2 11.761 2 9V7a1 1 0 0 1 2 0v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const PenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M12.5 2.5a1.414 1.414 0 0 1 2 2L5.5 13.5 2 14l.5-3.5L12.5 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
)

const RectIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
)

const EllipseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <ellipse cx="8" cy="8" rx="6" ry="4.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
)

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 13L13 3M13 3H8M13 3v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const TextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 4h10M8 4v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5.5 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const StickyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 3h10v7l-3 3H3V3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M10 10v3M10 10h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const EraserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M12 3.5 4.5 11l-2 2h5l5-5L12 3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M2.5 13h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

// ─── Tool config ──────────────────────────────────────────────────────────────

interface ToolConfig {
  tool: ToolType
  label: string
  icon: React.ReactNode
  shortcut: string
}

const TOOLS: ToolConfig[] = [
  { tool: 'select',  label: 'Select (V)',       icon: <SelectIcon />,  shortcut: 'V' },
  { tool: 'hand',    label: 'Hand (H)',          icon: <HandIcon />,    shortcut: 'H' },
  { tool: 'pen',     label: 'Pen (P)',           icon: <PenIcon />,     shortcut: 'P' },
  { tool: 'rect',    label: 'Rectangle (R)',     icon: <RectIcon />,    shortcut: 'R' },
  { tool: 'ellipse', label: 'Ellipse (O)',       icon: <EllipseIcon />, shortcut: 'O' },
  { tool: 'arrow',   label: 'Arrow (A)',         icon: <ArrowIcon />,   shortcut: 'A' },
  { tool: 'text',    label: 'Text (T)',          icon: <TextIcon />,    shortcut: 'T' },
  { tool: 'sticky',  label: 'Sticky note (S)',   icon: <StickyIcon />,  shortcut: 'S' },
  { tool: 'eraser',  label: 'Eraser (E)',        icon: <EraserIcon />,  shortcut: 'E' },
]

const QUICK_COLORS = ['#1c1917', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

// ─── Component ────────────────────────────────────────────────────────────────

export default function ToolBar() {
  const { activeTool, setActiveTool, drawingDefaults, setDrawingDefaults } = useCanvasStore()

  return (
    <div
      style={{
        width: 52,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-2) 0',
        background: 'var(--color-surface-0)',
        borderRight: '1px solid var(--color-surface-2)',
        gap: 'var(--space-1)',
        flexShrink: 0,
        zIndex: 'var(--z-toolbar)',
      }}
    >
      {/* Tool buttons */}
      {TOOLS.map(({ tool, label, icon }) => (
        <IconButton
          key={tool}
          icon={icon}
          label={label}
          active={activeTool === tool}
          onClick={() => setActiveTool(tool)}
          tooltipPlacement="right"
        />
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Divider */}
      <div style={{ width: 28, height: 1, background: 'var(--color-surface-2)' }} />

      {/* Quick color dots */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5,
          padding: 'var(--space-2) 0',
        }}
      >
        {QUICK_COLORS.map((color) => {
          const isActive = drawingDefaults.strokeColor === color
          return (
            <Tooltip key={color} content={color} placement="right">
              <button
                onClick={() => setDrawingDefaults({ strokeColor: color })}
                aria-label={`Set stroke color to ${color}`}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: color,
                  border: isActive
                    ? '2px solid var(--color-brand-primary)'
                    : '2px solid transparent',
                  outline: isActive ? '1px solid var(--color-canvas-selection-border)' : 'none',
                  outlineOffset: 1,
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'transform var(--transition-fast)',
                  transform: isActive ? 'scale(1.2)' : 'scale(1)',
                  flexShrink: 0,
                }}
              />
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
