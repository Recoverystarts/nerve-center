import { Grid } from '@react-three/drei'

export function GridBackground() {
  return (
    <Grid
      position={[0, -4.5, 0]}
      args={[80, 80]}
      cellSize={1.25}
      cellThickness={0.6}
      cellColor="#1e2937"
      sectionSize={6.25}
      sectionThickness={1.1}
      sectionColor="#334155"
      fadeDistance={55}
      fadeStrength={1.6}
      infiniteGrid
    />
  )
}
