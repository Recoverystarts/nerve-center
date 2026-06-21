import React, { useRef, useState, useCallback } from 'react'
import { Html, useCursor } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export interface PanelProps {
  id: string
  title: string
  initialPosition: [number, number, number]
  size?: [number, number] // width, height in world units
  children?: React.ReactNode
  controlsRef: React.RefObject<OrbitControlsImpl>
}

export function DraggableHoloPanel({
  id,
  title,
  initialPosition,
  size = [5.2, 3.4],
  children,
  controlsRef,
}: PanelProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const dragHandleRef = useRef<THREE.Mesh>(null!)

  const [position, setPosition] = useState(() => new THREE.Vector3(...initialPosition))
  const [isDragging, setIsDragging] = useState(false)

  const { camera, gl } = useThree()

  // For natural screen-space dragging at current depth
  const dragStartPoint = useRef(new THREE.Vector3())
  const dragStartPosition = useRef(new THREE.Vector3())
  const dragPlane = useRef(new THREE.Plane())

  useCursor(isDragging, 'grabbing', 'grab')

  // Sync group position
  React.useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(position)
    }
  }, [position])

  // Drag plane setup (plane parallel to view at panel depth)
  const beginDrag = useCallback((event: any) => {
    if (!groupRef.current) return

    // Stop orbit controls while dragging
    if (controlsRef.current) {
      controlsRef.current.enabled = false
    }

    setIsDragging(true)

    // Use the current world position of the panel
    const currentWorldPos = groupRef.current.position.clone()

    // Plane oriented toward camera, passing through panel center
    const camDir = camera.getWorldDirection(new THREE.Vector3())
    dragPlane.current.setFromNormalAndCoplanarPoint(camDir.clone().negate(), currentWorldPos)

    // The point where user clicked on the handle (from r3f event)
    // event.point is already in world space because of the mesh intersection
    dragStartPoint.current.copy(event.point)
    dragStartPosition.current.copy(currentWorldPos)

    // Capture pointer so we keep getting move events even if mouse leaves element
    gl.domElement.setPointerCapture?.(event.nativeEvent?.pointerId)
  }, [camera, controlsRef, gl])

  const updateDrag = useCallback((event: PointerEvent) => {
    if (!isDragging || !groupRef.current) return

    // Cast a ray from current pointer position
    const rect = gl.domElement.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

    const intersectPoint = new THREE.Vector3()
    const didIntersect = raycaster.ray.intersectPlane(dragPlane.current, intersectPoint)

    if (didIntersect) {
      // Compute delta from drag start
      const delta = intersectPoint.clone().sub(dragStartPoint.current)
      const newPos = dragStartPosition.current.clone().add(delta)

      // Apply new position (keep Y free, allow full spatial freedom)
      setPosition(newPos)

      // Immediately update the group for smooth feel
      if (groupRef.current) {
        groupRef.current.position.copy(newPos)
      }
    }
  }, [isDragging, camera, gl])

  const endDrag = useCallback((event: PointerEvent) => {
    if (!isDragging) return

    setIsDragging(false)

    // Re-enable orbit controls
    if (controlsRef.current) {
      controlsRef.current.enabled = true
    }

    try {
      gl.domElement.releasePointerCapture?.(event.pointerId)
    } catch {}

    // Persist final position
    if (groupRef.current) {
      setPosition(groupRef.current.position.clone())
    }
  }, [isDragging, controlsRef, gl])

  // Attach global pointer listeners only while dragging
  React.useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: PointerEvent) => updateDrag(e)
    const handleUp = (e: PointerEvent) => endDrag(e)

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
    }
  }, [isDragging, updateDrag, endDrag])

  const [width, height] = size

  // Premium holographic materials
  const glassMaterial = (
    <meshPhongMaterial
      color="#0a101f"
      transparent
      opacity={0.55}
      shininess={92}
      specular="#222a3a"
      emissive="#02070f"
      emissiveIntensity={0.1}
    />
  )

  // Soft outer glow layer (slightly larger, very transparent warm)
  const glowLayerMaterial = (
    <meshPhongMaterial
      color="#f59e0b"
      transparent
      opacity={0.035}
      emissive="#f59e0b"
      emissiveIntensity={0.9}
      shininess={10}
    />
  )

  return (
    <group ref={groupRef}>
      {/* Soft outer holographic glow (slightly larger) */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[width + 0.65, height + 0.65]} />
        {glowLayerMaterial}
      </mesh>

      {/* Main glass panel */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        {glassMaterial}
      </mesh>

      {/* Sharp edge glow rim - thin frame using 4 boxes */}
      {/* Top */}
      <mesh position={[0, height / 2 + 0.015, 0.03]}>
        <boxGeometry args={[width + 0.12, 0.045, 0.06]} />
        <meshPhongMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.85} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -height / 2 - 0.015, 0.03]}>
        <boxGeometry args={[width + 0.12, 0.045, 0.06]} />
        <meshPhongMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.85} />
      </mesh>
      {/* Left */}
      <mesh position={[-width / 2 - 0.015, 0, 0.03]}>
        <boxGeometry args={[0.045, height + 0.12, 0.06]} />
        <meshPhongMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.85} />
      </mesh>
      {/* Right */}
      <mesh position={[width / 2 + 0.015, 0, 0.03]}>
        <boxGeometry args={[0.045, height + 0.12, 0.06]} />
        <meshPhongMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.85} />
      </mesh>

      {/* Inner subtle holo highlight layer */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width - 0.2, height - 0.2]} />
        <meshPhongMaterial
          color="#fbbf24"
          transparent
          opacity={0.025}
          emissive="#fbbf24"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Invisible drag handle - full panel area (placed slightly in front) */}
      <mesh
        ref={dragHandleRef}
        position={[0, 0, 0.12]}
        onPointerDown={beginDrag}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* HTML Content Layer - the actual panel UI */}
      <Html
        transform
        // distanceFactor controls apparent size scaling with camera distance
        distanceFactor={8.5}
        position={[0, 0, 0.14]}
        style={{
          width: `${width * 105}px`,
          height: `${height * 105}px`,
          pointerEvents: isDragging ? 'none' : 'auto', // prevent interaction conflict
        }}
      >
        <div className="holo-panel" style={{ width: '100%', height: '100%' }}>
          <div className="holo-header">
            <div className="holo-title">
              <span>{title}</span>
            </div>
            <div className="text-[9px] text-white/30 font-mono tracking-widest">DRAG</div>
          </div>

          <div className="holo-body">
            {children}
          </div>

          <div className="holo-footer font-mono">
            {id}
          </div>
        </div>
      </Html>
    </group>
  )
}
