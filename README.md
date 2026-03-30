# chalk.

*a canvas for your ideas*

---

chalk is a dark-themed collaborative whiteboard app built with React + TypeScript. 
draw freely, drop sticky notes, sketch shapes, and think visually.
all in a minimal, distraction-free canvas.

## features

- **freehand pen** — draw naturally on the canvas
- **shapes** — rectangles, circles, and arrows
- **text tool** — type directly onto the canvas
- **sticky notes** — pastel, slightly rotated, with a handwritten feel and spring animations
- **select + move** — reposition any element
- **undo / redo** — full history with ctrl+z and ctrl+shift+z
- **zoom + pan** — navigate large boards freely
- **dot grid background** — subtle, dark, easy on the eyes
- **snap to grid** — optional alignment toggle
- **local persistence** — boards saved automatically to localStorage

## stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Konva](https://konvajs.org/) / [react-konva](https://konvajs.org/docs/react/) — canvas rendering
- [Zustand](https://zustand-demo.pmnd.rs/) — state management
- [Framer Motion](https://www.framer.com/motion/) — animations
- [React Router](https://reactrouter.com/) — routing

## getting started

```bash
npm install
npm run dev
```

## keyboard shortcuts

| shortcut | action |
|---|---|
| `ctrl + z` | undo |
| `ctrl + shift + z` | redo |
| `delete` | remove selected element |

## design tokens

```css
--background: #111113
--surface:    #1a1a1f
--border:     rgba(255, 255, 255, 0.08)
--accent:     #4f46e5
```

fonts: **DM Sans** (ui) · **Instrument Serif** (logo) · **Caveat** (sticky notes)

## structure

```
src/
├── components/
│   ├── ui/          # Button, IconButton, Tooltip, Panel, Slider, ColorPicker
│   ├── canvas/      # WhiteboardCanvas, ToolBar, TopBar, PropertiesPanel, StickyNote
│   └── splash/      # SplashScreen
├── store/           # Zustand canvas store
├── types/           # TypeScript types
├── hooks/           # useKeyboardShortcuts
└── utils/           # canvas helpers
```
