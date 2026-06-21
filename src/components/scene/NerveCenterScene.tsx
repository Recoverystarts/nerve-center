import React, { useRef, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'

import { GridBackground } from './GridBackground'
import { DraggableHoloPanel } from './DraggableHoloPanel'

interface PanelDefinition {
  id: string
  title: string
  initialPosition: [number, number, number]
  size?: [number, number]
  content: React.ReactNode
}

const PANEL_DEFINITIONS: PanelDefinition[] = [
  {
    id: 'SELF-HEALER-01',
    title: 'SELF-HEALER / SYSTEM STATUS',
    initialPosition: [-12.2, 5.2, -2.2],
    size: [5.9, 3.9],
    content: (
      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-emerald-400">ALL SYSTEMS NOMINAL</span>
          <span className="font-mono text-xs text-emerald-400/70">OK</span>
        </div>
        <div className="space-y-1.5 text-white/70">
          <div className="flex justify-between"><span>Core Modules</span><span className="font-mono">12/12</span></div>
          <div className="flex justify-between"><span>Memory Integrity</span><span className="font-mono">99.8%</span></div>
          <div className="flex justify-between"><span>Latency</span><span className="font-mono">14ms</span></div>
          <div className="flex justify-between"><span>Agents Online</span><span className="font-mono">7</span></div>
        </div>
        <div className="pt-2 border-t border-white/10 text-[11px] text-white/50">
          Last self-repair: 4h 12m ago
        </div>
      </div>
    )
  },
  {
    id: 'AMBIENT-02',
    title: 'AMBIENT FEED / ACTIVITY',
    initialPosition: [12.5, 5.4, 2.8],
    size: [5.5, 3.6],
    content: (
      <div className="space-y-3 text-sm">
        <div className="text-white/80 text-xs tracking-widest">LIVE \u2022 FIELD NET</div>
        <div className="space-y-2">
          <div className="flex gap-3"><span className="text-white/40 font-mono w-12">09:41</span> <span>Unit 04 synced telemetry</span></div>
          <div className="flex gap-3"><span className="text-white/40 font-mono w-12">09:38</span> <span>Knowledge patch applied</span></div>
          <div className="flex gap-3"><span className="text-white/40 font-mono w-12">09:31</span> <span>ToolDock request from Delta</span></div>
          <div className="flex gap-3"><span className="text-white/40 font-mono w-12">09:27</span> <span>New node discovered (Sector 7)</span></div>
        </div>
      </div>
    )
  },
  {
    id: 'KNOWLEDGE-03',
    title: 'KNOWLEDGE / TOOL LIBRARY',
    initialPosition: [-11.8, -2.0, 4.6],
    size: [5.7, 4.4],
    content: (
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="border border-white/10 p-2 rounded">FIELD OPS MANUAL</div>
          <div className="border border-white/10 p-2 rounded">PROTOCOLS V4.8</div>
          <div className="border border-white/10 p-2 rounded">MAPPING ARCHIVE</div>
          <div className="border border-white/10 p-2 rounded">AI PATTERNS</div>
        </div>
        <div className="text-[11px] text-white/50 pt-1">182 entries \u2022 14 recently updated</div>
      </div>
    )
  },
  {
    id: 'TOOLDOCK-04',
    title: 'TOOLDOCK / QUICK ACCESS',
    initialPosition: [11.8, -1.2, -3.5],
    size: [5.1, 3.7],
    content: (
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between py-1 border-b border-white/10">
          <span>Survey Scanner</span> <span className="text-emerald-400 text-xs">READY</span>
        </div>
        <div className="flex items-center justify-between py-1 border-b border-white/10">
          <span>Comms Relay</span> <span className="text-emerald-400 text-xs">READY</span>
        </div>
        <div className="flex items-center justify-between py-1 border-b border-white/10">
          <span>Environmental Probe</span> <span className="text-amber-400 text-xs">DEPLOYED</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span>Mapper Core</span> <span className="text-white/40 text-xs">STANDBY</span>
        </div>
        <div className="pt-2 text-[11px] text-white/40">Drag tools here to pin</div>
      </div>
    )
  },
  {
    id: 'EVENT-05',
    title: 'EVENT CONSOLE',
    initialPosition: [1.5, -4.5, 4.2],
    size: [7.2, 2.2],
    content: (
      <div className="font-mono text-xs space-y-0.5 text-white/70">
        <div>&gt; [21:14:02] Net heartbeat OK</div>
        <div>&gt; [21:14:11] Position sync complete</div>
        <div className="text-amber-400">&gt; [21:14:19] New spatial anchor registered</div>
        <div>&gt; [21:14:31] Idle state</div>
      </div>
    )
  }
]

export default function NerveCenterScene() {
  const controlsRef = useRef<OrbitControlsImpl>(null!)
  const [resetKey, setResetKey] = useState(0)

  const handleResetLayout = useCallback(() => {
    // Force re-mount of panels by changing key
    setResetKey(k => k + 1)
  }, [])

  return (
    <div className="relative w-full h-full bg-[#02050a]">
      <Canvas
        camera={{ position: [1.5, 2.8, 23.5], fov: 35, near: 0.5, far: 200 }}
        style={{ background: '#02050a' }}
        gl={{ 
          alpha: true, 
          antialias: true, 
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
      >
        {/* Atmospheric depth */}
        <fog attach="fog" args={['#02050a', 28, 72]} />

        {/* Lighting \u2014 cinematic warm/cool mix */}
        <ambientLight intensity={0.12} color="#a5b4fc" />
        
        {/* Key warm directional from high front-left (holographic rim light) */}
        <directionalLight 
          position={[-18, 26, -22]} 
          intensity={1.35} 
          color="#fcd34d" 
        />
        
        {/* Fill light from right-rear */}
        <directionalLight 
          position={[26, 9, 14]} 
          intensity={0.55} 
          color="#64748b" 
        />
        
        {/* Soft point accents */}
        <pointLight position={[-22, 4, 8]} intensity={0.7} color="#fb923c" />
        <pointLight position={[15, -6, -18]} intensity={0.45} color="#f59e0b" />

        {/* Receding grid floor */}
        <GridBackground />

        {/* Draggable Holographic Panels \u2014 the core content */}
        {PANEL_DEFINITIONS.map((panel) => (
          <DraggableHoloPanel
            key={`${panel.id}-${resetKey}`}
            id={panel.id}
            title={panel.title}
            initialPosition={panel.initialPosition}
            size={panel.size}
            controlsRef={controlsRef}
          >
            {panel.content}
          </DraggableHoloPanel>
        ))}

        {/* Extremely subtle spatial origin reference (almost invisible) */}
        <group position={[0, 0.4, 0]}>
          <mesh>
            <sphereGeometry args={[0.18]} />
            <meshPhongMaterial 
              color="#0b111f" 
              emissive="#f59e0b" 
              emissiveIntensity={0.06} 
              shininess={40} 
            />
          </mesh>
        </group>

        {/* Post-processing bloom for premium holographic glows */}
        <EffectComposer>
          <Bloom 
            intensity={1.25} 
            luminanceThreshold={0.22} 
            luminanceSmoothing={0.6}
            radius={0.75}
          />
        </EffectComposer>

        {/* Camera Controls \u2014 orbit + zoom. Pan disabled to keep the feel premium and contained. */}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          enableDamping={true}
          dampingFactor={0.115}
          minDistance={6.5}
          maxDistance={46}
          target={[0.6, 1.4, 0]}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI * 0.92}
        />
      </Canvas>

      {/* HUD Overlay \u2014 Top Bar */}
      <div className="hud-top">
        <div>
          <span className="title">NERVE CENTER</span>
          <span className="ml-4 text-[10px] tracking-[4px] text-white/30">FIELD AI \u2022 SPATIAL SHELL v0</span>
        </div>
        <div className="status">
          <div className="status-dot" />
          <span>CONNECTED \u2022 7 AGENTS</span>
        </div>
      </div>

      {/* Floating Controls */}
      <div className="hud-controls">
        <button 
          onClick={handleResetLayout} 
          className="btn-hud"
        >
          RESET LAYOUT
        </button>
      </div>

      {/* Instructions */}
      <div className="hud-instructions">
        DRAG PANELS \u2022 ORBIT VIEW \u2022 SCROLL TO ZOOM
      </div>
    </div>
  )
}
