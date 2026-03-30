import { useCanvasStore } from '../../store/canvasStore'
import type { CanvasElement } from '../../types'
import Panel from '../ui/Panel'
import Slider from '../ui/Slider'
import ColorPicker from '../ui/ColorPicker'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 'var(--font-size-xs)',
        fontWeight: 600,
        color: 'var(--color-text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 'var(--space-2)',
      }}
    >
      {children}
    </p>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--color-surface-2)' }}>
      {children}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PropertiesPanel() {
  const { selectedId, elements, updateElement, drawingDefaults, setDrawingDefaults } =
    useCanvasStore()

  const selected: CanvasElement | undefined = selectedId
    ? elements.find((el) => el.id === selectedId)
    : undefined

  const fillColor   = selected?.fillColor   ?? drawingDefaults.fillColor
  const strokeColor = selected?.strokeColor ?? drawingDefaults.strokeColor
  const strokeWidth = selected?.strokeWidth ?? drawingDefaults.strokeWidth
  const opacity     = selected ? Math.round(selected.opacity * 100) : Math.round(drawingDefaults.opacity * 100)

  const updateFillColor = (color: string) => {
    if (selected) updateElement(selected.id, { fillColor: color })
    else setDrawingDefaults({ fillColor: color })
  }

  const updateStrokeColor = (color: string) => {
    if (selected) updateElement(selected.id, { strokeColor: color })
    else setDrawingDefaults({ strokeColor: color })
  }

  const updateStrokeWidth = (v: number) => {
    if (selected) updateElement(selected.id, { strokeWidth: v })
    else setDrawingDefaults({ strokeWidth: v })
  }

  const updateOpacity = (v: number) => {
    const normalized = v / 100
    if (selected) updateElement(selected.id, { opacity: normalized })
    else setDrawingDefaults({ opacity: normalized })
  }

  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        background: 'var(--color-surface-0)',
        borderLeft: '1px solid var(--color-surface-2)',
        overflowY: 'auto',
        zIndex: 'var(--z-panel)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--space-3)',
          borderBottom: '1px solid var(--color-surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Properties
        </span>
        {selected && (
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              textTransform: 'capitalize',
            }}
          >
            {selected.type}
          </span>
        )}
        {!selected && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
            Defaults
          </span>
        )}
      </div>

      {/* Fill color — hidden for arrow/pen */}
      {(!selected || !['arrow', 'pen'].includes(selected.type)) && (
        <Section>
          <SectionLabel>Fill</SectionLabel>
          <ColorPicker
            value={fillColor}
            onChange={updateFillColor}
            columns={8}
            swatchSize={20}
            showCustom
          />
        </Section>
      )}

      {/* Stroke color */}
      <Section>
        <SectionLabel>Stroke</SectionLabel>
        <ColorPicker
          value={strokeColor}
          onChange={updateStrokeColor}
          columns={8}
          swatchSize={20}
          showCustom
        />
      </Section>

      {/* Stroke width */}
      <Section>
        <Slider
          label="Stroke width"
          value={strokeWidth}
          min={1}
          max={24}
          step={1}
          onChange={updateStrokeWidth}
          formatValue={(v) => `${v}px`}
        />
      </Section>

      {/* Opacity */}
      <Section>
        <Slider
          label="Opacity"
          value={opacity}
          min={0}
          max={100}
          step={1}
          onChange={updateOpacity}
          formatValue={(v) => `${v}%`}
        />
      </Section>

      {/* Selected element extra info */}
      {selected && (
        <Section>
          <SectionLabel>Position</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
            <Panel padding="sm" shadow="sm" radius="sm">
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>X</p>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {Math.round(selected.x)}
              </p>
            </Panel>
            <Panel padding="sm" shadow="sm" radius="sm">
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Y</p>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {Math.round(selected.y)}
              </p>
            </Panel>
          </div>
        </Section>
      )}
    </div>
  )
}
