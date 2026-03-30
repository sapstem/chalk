import { create } from 'zustand'
import type { CanvasElement, CanvasState, DrawingDefaults, ToolType, Viewport } from '../types'

interface CanvasActions {
  // Tool
  setActiveTool: (tool: ToolType) => void

  // Selection
  setSelectedId: (id: string | null) => void

  // Viewport
  setViewport: (viewport: Partial<Viewport>) => void

  // Elements (no logic yet — shapes filled in later)
  addElement: (element: CanvasElement) => void
  updateElement: (id: string, changes: Partial<CanvasElement>) => void
  removeElement: (id: string) => void

  // Settings
  setSnapToGrid: (snap: boolean) => void
  setDrawingDefaults: (defaults: Partial<DrawingDefaults>) => void

  // Undo / Redo
  undo: () => void
  redo: () => void
  pushHistory: () => void
}

const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, scale: 1 }

export const useCanvasStore = create<CanvasState & CanvasActions>((set) => ({
  // ─── State ───────────────────────────────────────────────────────────────
  elements: [],
  selectedId: null,
  activeTool: 'select',
  viewport: DEFAULT_VIEWPORT,
  history: [{ elements: [] }],
  historyIndex: 0,
  snapToGrid: false,
  drawingDefaults: {
    fillColor: '#e2e8f0',
    strokeColor: '#1c1917',
    strokeWidth: 2,
    opacity: 1,
  },

  // ─── Tool ────────────────────────────────────────────────────────────────
  setActiveTool: (tool) => set({ activeTool: tool }),

  // ─── Selection ───────────────────────────────────────────────────────────
  setSelectedId: (id) => set({ selectedId: id }),

  // ─── Viewport ────────────────────────────────────────────────────────────
  setViewport: (partial) =>
    set((state) => ({ viewport: { ...state.viewport, ...partial } })),

  // ─── Elements ────────────────────────────────────────────────────────────
  addElement: (element) =>
    set((state) => ({ elements: [...state.elements, element] })),

  updateElement: (id, changes) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? ({ ...el, ...changes } as CanvasElement) : el
      ),
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  // ─── Settings ────────────────────────────────────────────────────────────
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),

  setDrawingDefaults: (partial) =>
    set((state) => ({ drawingDefaults: { ...state.drawingDefaults, ...partial } })),

  // ─── History ─────────────────────────────────────────────────────────────
  pushHistory: () =>
    set((state) => {
      const snapshot = { elements: state.elements }
      const trimmed = state.history.slice(0, state.historyIndex + 1)
      return {
        history: [...trimmed, snapshot],
        historyIndex: trimmed.length,
      }
    }),

  undo: () =>
    set((state) => {
      const index = Math.max(0, state.historyIndex - 1)
      return {
        historyIndex: index,
        elements: state.history[index]?.elements ?? state.elements,
        selectedId: null,
      }
    }),

  redo: () =>
    set((state) => {
      const index = Math.min(state.history.length - 1, state.historyIndex + 1)
      return {
        historyIndex: index,
        elements: state.history[index]?.elements ?? state.elements,
        selectedId: null,
      }
    }),
}))
