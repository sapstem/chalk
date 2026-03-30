import { useEffect } from 'react'
import { useCanvasStore } from '../store/canvasStore'

/**
 * Registers global keyboard shortcuts for the board screen.
 * Safe to call once — attaches to `window` and cleans up on unmount.
 *
 * Shortcuts:
 *   Ctrl/Cmd + Z           → undo
 *   Ctrl/Cmd + Shift + Z   → redo
 *   Ctrl/Cmd + Y           → redo (Windows convention)
 *   Delete / Backspace     → remove selected element
 */
export function useKeyboardShortcuts() {
  const { undo, redo, selectedId, removeElement, setSelectedId } = useCanvasStore()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Never intercept while the user is typing in an input or textarea
      const tag = (document.activeElement as HTMLElement | null)?.tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT') return

      const mod = e.ctrlKey || e.metaKey

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }

      if ((mod && e.key === 'z' && e.shiftKey) || (mod && e.key === 'y')) {
        e.preventDefault()
        redo()
        return
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        removeElement(selectedId)
        setSelectedId(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo, selectedId, removeElement, setSelectedId])
}
