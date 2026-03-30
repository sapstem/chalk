import { useState, useRef, useEffect } from 'react'
import { useCanvasStore } from '../../store/canvasStore'
import { clampZoom, roundZoom, zoomPercent } from '../../utils/canvasHelpers'
import IconButton from '../ui/IconButton'
import Button from '../ui/Button'
import Tooltip from '../ui/Tooltip'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const UndoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 6H10.5C12.433 6 14 7.567 14 9.5S12.433 13 10.5 13H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.5 3.5L3 6l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const RedoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13 6H5.5C3.567 6 2 7.567 2 9.5S3.567 13 5.5 13H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.5 3.5L13 6l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ShareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M10 2.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM5 7.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM10 10.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M7 8.8 9 6.2M7 9.2l2 2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
)

const ZoomOutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M4 7h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const ZoomInIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 4v6M4 7h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// ─── Component ────────────────────────────────────────────────────────────────

const TOPBAR_H = 48

export default function TopBar() {
  const { viewport, setViewport, undo, redo, snapToGrid, setSnapToGrid, historyIndex, history } = useCanvasStore()
  const [boardName, setBoardName] = useState('Untitled board')
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1
  const zoomPct = zoomPercent(viewport.scale)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commitName = () => {
    setEditing(false)
    if (!boardName.trim()) setBoardName('Untitled board')
  }

  const adjustZoom = (delta: number) => {
    setViewport({ scale: roundZoom(clampZoom(viewport.scale + delta)) })
  }

  return (
    <div
      style={{
        height: TOPBAR_H,
        background: 'var(--color-surface-0)',
        borderBottom: '1px solid var(--color-surface-2)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-3)',
        gap: 'var(--space-2)',
        flexShrink: 0,
        zIndex: 'var(--z-toolbar)',
        userSelect: 'none',
      }}
    >
      {/* Board name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <input
            ref={inputRef}
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setBoardName(boardName); setEditing(false) } }}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface-1)',
              border: '1px solid var(--color-brand-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 6px',
              outline: 'none',
              width: 220,
            }}
          />
        ) : (
          <Tooltip content="Rename board" placement="bottom">
            <button
              onClick={() => setEditing(true)}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                background: 'transparent',
                border: '1px solid transparent',
                borderRadius: 'var(--radius-sm)',
                padding: '2px 6px',
                cursor: 'text',
                maxWidth: 240,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {boardName}
            </button>
          </Tooltip>
        )}
      </div>

      {/* Undo / Redo */}
      <div style={{ display: 'flex', gap: 2 }}>
        <IconButton icon={<UndoIcon />} label="Undo (⌘Z)" onClick={undo} disabled={!canUndo} tooltipPlacement="bottom" />
        <IconButton icon={<RedoIcon />} label="Redo (⌘⇧Z)" onClick={redo} disabled={!canRedo} tooltipPlacement="bottom" />
      </div>

      <Divider />

      {/* Zoom */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton icon={<ZoomOutIcon />} label="Zoom out" onClick={() => adjustZoom(-0.1)} tooltipPlacement="bottom" size="sm" />
        <Tooltip content="Reset zoom" placement="bottom">
          <button
            onClick={() => setViewport({ scale: 1 })}
            style={{
              minWidth: 52,
              height: 28,
              padding: '0 6px',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              background: 'var(--color-surface-1)',
              border: '1px solid var(--color-surface-2)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            {zoomPct}%
          </button>
        </Tooltip>
        <IconButton icon={<ZoomInIcon />} label="Zoom in" onClick={() => adjustZoom(0.1)} tooltipPlacement="bottom" size="sm" />
      </div>

      <Divider />

      {/* Snap to grid */}
      <Tooltip content={snapToGrid ? 'Snap to grid: on' : 'Snap to grid: off'} placement="bottom">
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          aria-label="Toggle snap to grid"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            border: '1px solid transparent',
            background: snapToGrid ? 'var(--color-brand-primary)' : 'transparent',
            color: snapToGrid ? 'var(--color-text-on-brand)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'background var(--transition-fast), color var(--transition-fast)',
          }}
        >
          <GridIcon />
        </button>
      </Tooltip>

      <Divider />

      {/* Share */}
      <Button variant="solid" size="sm" style={{ gap: 6 }}>
        <ShareIcon />
        Share
      </Button>
    </div>
  )
}

function Divider() {
  return (
    <div style={{ width: 1, height: 20, background: 'var(--color-surface-2)', flexShrink: 0 }} />
  )
}
