# NERVE CENTER

**Spatial 3D Holographic Tool Hub** — The foundational shell for an AI-powered field operations platform.

A clean, open, cinematic HUD-style interface built with React + React Three Fiber. Floating translucent panels can be freely dragged in true 3D space. Designed from day one to stay spacious and extensible.

## Design Goals

- Premium cinematic holographic sci-fi aesthetic (dark receding grid, orange/gold edge glows)
- Truly spatial: panels live in 3D, not overlaid 2D windows
- Extremely breathable layout — never feels crowded
- "Apps inside apps" extensibility: easy to add new floating panels, tools, or mini experiences
- First-class drag interactions while retaining smooth OrbitControls
- Production-grade clean code structure

## Current MVP

- Dark atmospheric grid floor with subtle depth + scene fog
- 5 draggable holographic panels with:
  - Translucent glassy material
  - Warm orange/gold emissive edge frames + soft glow layers
  - Inner highlight plane
  - Clean HTML content surface via drei `<Html transform>`
- Full 3D dragging using pointer ray + view-aligned drag plane (natural feel)
- Orbit + zoom camera controls (pan disabled for intentional "cockpit" feel)
- Bloom post-processing
- Very minimal central spatial reference
- HUD overlays: top status bar + reset layout

## Panels (initial layout)

1. **SELF-HEALER / SYSTEM STATUS** — Left upper
2. **AMBIENT FEED / ACTIVITY** — Right upper
3. **KNOWLEDGE / TOOL LIBRARY** — Left lower (farther)
4. **TOOLDOCK / QUICK ACCESS** — Right lower (nearer)
5. **EVENT CONSOLE** — Smaller, bottom centerish

## Project Structure

```
nerve-center/
├── src/
│   ├── components/
│   │   ├── scene/
│   │       ├── NerveCenterScene.tsx   # Main Canvas + lights + panels
│   │       ├── DraggableHoloPanel.tsx # Core holographic + draggable logic
│   │       └── GridBackground.tsx     # Receding infinite grid
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                      # All HUD + panel glass styles
├── package.json
└── ...
```

### Key Files

- **NerveCenterScene.tsx** — The entire 3D shell. Defines panel list, lights, camera, effects, and HUD chrome.
- **DraggableHoloPanel.tsx** — Self-contained draggable panel. Handles:
  - Glass + multiple layered glow meshes
  - Edge frame boxes
  - `<Html>` content surface
  - Custom 3D drag (view-plane projection)
  - Temporarily disables OrbitControls during drag
- **GridBackground.tsx** — Uses drei `<Grid>` tuned for sci-fi depth.

## Running

```bash
npm install
npm run dev
```

Open http://localhost:5173

## How to Test

### Quick start

```bash
# From the project root
cd /home/addic/nerve-center

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Then open **http://localhost:5173** in a modern browser (Chrome, Edge, or Firefox recommended).

### Testing checklist (MVP verification)

1. **Scene loads**
   - You should see a dark background with a receding grid floor.
   - 5 floating translucent holographic panels with orange/gold glowing edges.
   - Very subtle central glowing nucleus.
   - Top HUD bar ("NERVE CENTER") and bottom instructions.

2. **Camera controls work**
   - Click and drag on empty space (not on a panel) → camera orbits around the scene.
   - Scroll wheel / pinch → zoom in and out.
   - Panels should feel like they are floating at different depths.

3. **Panel dragging (most important)**
   - Click and hold directly on any panel (anywhere on the glass surface).
   - Drag the mouse → the panel should move smoothly in 3D space.
   - Release → panel stays where you left it.
   - Repeat with multiple panels to test free arrangement.
   - While dragging one panel, orbit should be temporarily disabled (you can't accidentally rotate the camera).

4. **Spaciousness & layout**
   - Initially panels are spread out with lots of breathing room.
   - Click the **"RESET LAYOUT"** button (top-right) → everything returns to the original clean positions.

5. **Visual quality**
   - Panels have subtle transparency.
   - Orange/gold edge frames glow (especially visible thanks to bloom).
   - HTML content inside panels is crisp and readable.
   - No clipping or z-fighting between panels and grid.

### Common issues & fixes

- **Blank screen or WebGL error**: Your GPU/drivers may not support WebGL 2. Try Chrome. Make sure hardware acceleration is enabled.
- **Dragging feels stuck**: Make sure you clicked directly on a panel, not the grid/background. Try the RESET button.
- **Port already in use**: Run `npm run dev -- --port 5174`.
- **Dependencies issues**: Delete `node_modules` + `package-lock.json` and `npm install` again.

### Production build test

```bash
npm run build
npm run preview
```

This builds the optimized bundle and serves it locally (same as production).

## Interaction

- **Drag** any panel by clicking anywhere on it and moving the mouse
- **Orbit** the view by dragging empty space
- **Zoom** with scroll / trackpad
- **Reset Layout** button returns panels to the original spacious arrangement

## How to Extend

### Add a new floating panel

1. Add a new object to `PANEL_DEFINITIONS` in `NerveCenterScene.tsx`
2. Provide:
   - Unique `id`
   - `title`
   - `initialPosition: [x, y, z]` (spread them out generously)
   - Optional `size: [width, height]`
   - `content: React.ReactNode` — normal React/TSX (Tailwind works)

Example:

```tsx
{
  id: 'NEW-TOOL-06',
  title: 'FIELD MAPPER',
  initialPosition: [-3, 8, -10],
  size: [5.2, 3.8],
  content: <YourRealToolComponent />,
}
```

### Make panels smarter later

- Each panel receives its children as regular React. You can put complex components, state, forms, mini canvases, etc. inside.
- Panel positions are stored locally in component state. To persist layout, lift state or emit `onPositionChange`.

## Tech Stack

- React 19 + TypeScript
- Vite
- React Three Fiber + @react-three/drei
- Three.js
- @react-three/postprocessing (Bloom)
- Tailwind CSS
- Lucide-react, framer-motion, sonner (prepared for future)

## Philosophy

This is the **empty but intelligent foundation**. Prioritize spaciousness and craft. Every new tool or section should feel like it belongs in this environment rather than crowding it.

Build outward, not inward.
