import type { CSSProperties } from 'react'

interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  label?: string
  showValue?: boolean
  formatValue?: (v: number) => string
  style?: CSSProperties
}

export default function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  showValue = true,
  formatValue = (v) => String(v),
  style,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', ...style }}>
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {label && <span>{label}</span>}
          {showValue && (
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
              {formatValue(value)}
            </span>
          )}
        </div>
      )}
      <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        {/* Track background */}
        <div
          style={{
            position: 'absolute',
            inset: '0 0 0 0',
            height: 4,
            top: '50%',
            transform: 'translateY(-50%)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-surface-2)',
            pointerEvents: 'none',
          }}
        />
        {/* Track fill */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${pct}%`,
            height: 4,
            top: '50%',
            transform: 'translateY(-50%)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-brand-primary)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: 'relative',
            width: '100%',
            height: 20,
            appearance: 'none',
            background: 'transparent',
            cursor: 'pointer',
            margin: 0,
            padding: 0,
            outline: 'none',
            zIndex: 1,
          }}
        />
      </div>
      <style>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--color-surface-0);
          border: 2px solid var(--color-brand-primary);
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-fast);
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        input[type='range']::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--color-surface-0);
          border: 2px solid var(--color-brand-primary);
          box-shadow: var(--shadow-sm);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
