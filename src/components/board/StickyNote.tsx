import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { StickyColor } from '../../types'

// ─── Pastel palette ───────────────────────────────────────────────────────────

export const STICKY_COLORS: Record<StickyColor, { bg: string; shadow: string; text: string }> = {
  yellow: { bg: '#fef08a', shadow: '#d4a800', text: '#713f12' },
  blue:   { bg: '#bae6fd', shadow: '#0077aa', text: '#0c4a6e' },
  pink:   { bg: '#fbcfe8', shadow: '#be185d', text: '#831843' },
  green:  { bg: '#bbf7d0', shadow: '#15803d', text: '#14532d' },
}

const COLOR_KEYS = Object.keys(STICKY_COLORS) as StickyColor[]

export function randomStickyColor(): StickyColor {
  return COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)]!
}

export function randomRotation(): number {
  return parseFloat((Math.random() * 6 - 3).toFixed(2)) // -3° to +3°
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface StickyNoteProps {
  /** Initial text content */
  initialText?: string
  /** Pastel color variant */
  color?: StickyColor
  /** Rotation in degrees (-3 to +3 recommended) */
  rotation?: number
  /** Width in px */
  width?: number
  /** Height in px */
  height?: number
  /** Called whenever the text changes */
  onTextChange?: (text: string) => void
  /** Called when the note loses focus after editing */
  onCommit?: (text: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StickyNote({
  initialText = '',
  color = 'yellow',
  rotation = 0,
  width = 200,
  height = 200,
  onTextChange,
  onCommit,
}: StickyNoteProps) {
  const [text, setText] = useState(initialText)
  const [editing, setEditing] = useState(false)
  const [hovered, setHovered] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { bg, shadow, text: textColor } = STICKY_COLORS[color]

  // Focus the textarea when editing starts
  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }
  }, [editing])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    onTextChange?.(e.target.value)
  }

  const handleBlur = () => {
    setEditing(false)
    onCommit?.(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      textareaRef.current?.blur()
    }
  }

  return (
    <motion.div
      // ── Pop-in on mount ───────────────────────────────────────────────────
      initial={{ opacity: 0, scale: 0.7, rotate: rotation - 4 }}
      animate={{ opacity: 1, scale: hovered ? 1.02 : 1, rotate: rotation }}
      transition={{
        opacity: { duration: 0.18 },
        scale: hovered
          ? { type: 'spring', stiffness: 320, damping: 22 }
          : { type: 'spring', stiffness: 420, damping: 26 },
        rotate: { type: 'spring', stiffness: 260, damping: 20 },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (!editing) setEditing(true) }}
      style={{
        width,
        height,
        background: bg,
        borderRadius: 3,
        padding: '12px 14px 14px',
        boxShadow: hovered
          ? `2px 6px 18px ${shadow}40, 0 1px 3px ${shadow}30`
          : `1px 3px 10px ${shadow}28, 0 1px 2px ${shadow}20`,
        cursor: editing ? 'text' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        userSelect: editing ? 'text' : 'none',
        // Fold effect in bottom-right corner
        backgroundImage: `
          linear-gradient(135deg, transparent calc(100% - 18px), ${shadow}22 calc(100% - 18px))
        `,
      }}
    >
      {/* Tape strip at top */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 48,
          height: 20,
          background: `${bg}cc`,
          borderRadius: 2,
          boxShadow: `0 1px 3px ${shadow}22`,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Text area */}
      {editing ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'var(--font-handwritten)',
            fontSize: 18,
            fontWeight: 500,
            lineHeight: 1.45,
            color: textColor,
            padding: 0,
            margin: 0,
            cursor: 'text',
            width: '100%',
          }}
        />
      ) : (
        <p
          style={{
            flex: 1,
            fontFamily: 'var(--font-handwritten)',
            fontSize: 18,
            fontWeight: 500,
            lineHeight: 1.45,
            color: text ? textColor : `${textColor}55`,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflow: 'hidden',
          }}
        >
          {text || 'Write something…'}
        </p>
      )}
    </motion.div>
  )
}
