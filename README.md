# Zengine

A Unity-style 2D game engine editor built with **TypeScript**, **React**, **Vite**, and **Tailwind CSS**.

## Structure

```
zengine/
├── editor/                  # React/TSX UI — the visual editor
│   ├── EditorApp.tsx        # Root editor component
│   ├── hooks/               # Custom typed React hooks
│   │   ├── useDropdown.ts
│   │   └── useEditorState.ts
│   └── components/
│       ├── ui/              # Shared primitives (TabBtn, Section, Row, NumInput…)
│       ├── toolbar/         # Toolbar + play controls
│       ├── hierarchy/       # Scene hierarchy panel
│       ├── viewport/        # Scene/Game viewport
│       ├── inspector/       # Inspector panel
│       ├── bottom/          # Project browser + Console
│       └── animation/       # Animation editor modal
│
├── runtime/                 # Pure TypeScript — zero React
│   ├── ecs/                 # Component, GameObject, Scene
│   ├── physics/             # AABB collision, PhysicsWorld
│   ├── renderer/            # Camera2D, Renderer2D (Canvas 2D API)
│   └── GameLoop.ts          # RAF-based game loop
│
├── shared/                  # Shared between editor + runtime
│   ├── types/engine.ts      # Core entity/scene/log types
│   ├── constants/           # Theme palette + seed data
│   └── utils/               # Entity helpers (pure TS)
│
└── src/
    ├── main.tsx             # React entry point
    └── styles.css           # Tailwind + global scrollbar styles
```

## TypeScript Strictness

`tsconfig.json` enables **every strict flag**:
- `strict`, `noImplicitAny`, `strictNullChecks`
- `noUnusedLocals`, `noUnusedParameters`
- `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- `noImplicitOverride`, `noPropertyAccessFromIndexSignature`

Zero JS fallback — if it won't pass `tsc`, it doesn't ship.

## Running

```bash
# Install deps
npm install

# Dev server (hot reload)
npm run dev

# Type-check only (no emit)
npm run typecheck

# Production build
npm run build
```

## Replit

Upload the zip and click **Run** — `.replit` handles `npm run dev` automatically,
with port 5173 mapped to the public URL.
