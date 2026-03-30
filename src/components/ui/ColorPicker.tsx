import type { CSSProperties } from 'react'

export const PRESET_COLORS = [
  // Row 1 — neutrals
  '#ffffff', '#f5f5f4', '#d6d3d1', '#a8a29e',
  '#78716c', '#57534e', '#1c1917', '#000000',
  // Row 2 — reds / oranges
  '#fecaca', '#fca5a5', '#f87171', '#ef4444',
  '#dc2626', '#b91c1c', '#fcd34d', '#f59e0b',
  // Row 3 — greens / teals
  '#6ee7b7', '#34d399', '#10b981', '#059669',
  '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2',
  // Row 4 — blues / purples
  '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb',
  '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed',
  // Row 5 — pinks / brand
  '#f9a8d4', '#f472b6', '#ec4899', '#db2777',
  '#a5b4fc', '#818cf8', '#6366f1', '#5b6af0',
] as const

export type PresetColor = (typeof PRESET_COLORS)[number]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  columns?: number
  swatchSize?: number
  style?: CSSProperties
  showCustom?: boolean
}

export default function ColorPicker({
  value,
  onChange,
  columns = 8,
  swatchSize = 22,
  style,
  showCustom = true,
}: ColorPickerProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', ...style }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, ${swatchSize}px)`,
          gap: 'var(--space-1)',
        }}
      >
        {PRESET_COLORS.map((color) => {
          const isSelected = value.toLowerCase() === color.toLowerCase()
          return (
            <button
              key={color}
              aria-label={color}
              title={color}
              onClick={() => onChange(color)}
              style={{
                width: swatchSize,
                height: swatchSize,
                borderRadius: 'var(--radius-sm)',
                background: color,
                border: isSelected
                  ? '2px solid var(--color-brand-primary)'
                  : color === '#ffffff'
                  ? '1px solid var(--color-surface-3)'
                  : '2px solid transparent',
                cursor: 'pointer',
                padding: 0,
                transition: 'transform var(--transition-fast)',
                transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                outline: isSelected ? '2px solid var(--color-canvas-selection-border)' : 'none',
                outlineOffset: 1,
              }}
            />
          )
        })}
      </div>

      {showCustom && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <label
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              flexShrink: 0,
            }}
          >
            Custom
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <input
              type="color"
              value={value.startsWith('#') ? value : '#000000'}
              onChange={(e) => onChange(e.target.value)}
              style={{
                width: swatchSize,
                height: swatchSize,
                padding: 0,
                border: '1px solid var(--color-surface-3)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: 'none',
              }}
            />
            <input
              type="text"
              value={value}
              onChange={(e) => {
                const v = e.target.value
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v)
              }}
              spellCheck={false}
              style={{
                width: 80,
                height: swatchSize,
                padding: '0 var(--space-2)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-primary)',
                background: 'var(--color-surface-1)',
                border: '1px solid var(--color-surface-3)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
