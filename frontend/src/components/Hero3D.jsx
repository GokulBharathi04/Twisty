import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const WOOD = "#C79A66";
const CARTONS = ["#B98756", "#C1915F", "#AF7E4F", "#BD8B59"];

const Pallet = () => {
  const slats = [-0.78, -0.39, 0, 0.39, 0.78];
  return (
    <group position={[0, -1.12, 0]}>
      {slats.map((x) => (
        <mesh key={`t${x}`} position={[x, 0.17, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.05, 1.9]} />
          <meshStandardMaterial color={WOOD} roughness={0.85} />
        </mesh>
      ))}
      {[-0.8, 0, 0.8].map((z) =>
        [-0.8, 0, 0.8].map((x) => (
          <mesh key={`b${x}${z}`} position={[x, 0.04, z]} castShadow>
            <boxGeometry args={[0.22, 0.2, 0.22]} />
            <meshStandardMaterial color="#B0855A" roughness={0.9} />
          </mesh>
        )),
      )}
      {[-0.8, 0, 0.8].map((z) => (
        <mesh key={`s${z}`} position={[0, -0.08, z]} receiveShadow>
          <boxGeometry args={[1.9, 0.05, 0.28]} />
          <meshStandardMaterial color={WOOD} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
};

const Cartons = () => {
  const boxes = useMemo(() => {
    const list = [];
    for (let l = 0; l < 3; l++)
      for (let i = 0; i < 2; i++)
        for (let j = 0; j < 2; j++) list.push({ p: [i * 0.92 - 0.46, -0.66 + l * 0.66, j * 0.92 - 0.46], c: CARTONS[(i + j + l) % 4], top: l === 2 });
    return list;
  }, []);
  return boxes.map((b, k) => (
    <group key={k} position={b.p}>
      <RoundedBox args={[0.88, 0.62, 0.88]} radius={0.03} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={b.c} roughness={0.75} />
      </RoundedBox>
      {b.top && (
        <mesh position={[0, 0.312, 0]}>
          <boxGeometry args={[0.9, 0.006, 0.16]} />
          <meshStandardMaterial color="#E21F26" roughness={0.4} />
        </mesh>
      )}
    </group>
  ));
};

const Film = () => {
  const band = useRef();
  const roll = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const y = Math.sin(t * 0.6) * 0.75;
    if (band.current) band.current.position.y = y;
    if (roll.current) {
      roll.current.position.set(Math.cos(t * 0.9) * 1.55, y, Math.sin(t * 0.9) * 1.55);
      roll.current.rotation.y = -t * 0.9;
    }
  });
  return (
    <>
      <RoundedBox args={[1.93, 2.05, 1.93]} radius={0.06} smoothness={4} position={[0, -0.02, 0]}>
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.22} roughness={0.05} metalness={0.1} clearcoat={1} clearcoatRoughness={0.05} side={THREE.DoubleSide} />
      </RoundedBox>
      <mesh ref={band}>
        <cylinderGeometry args={[1.42, 1.42, 0.34, 64, 1, true]} />
        <meshPhysicalMaterial color="#e8f1ff" transparent opacity={0.32} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} />
      </mesh>
      <group ref={roll}>
        <mesh castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.5, 32]} />
          <meshPhysicalMaterial color="#f4f8ff" transparent opacity={0.85} roughness={0.15} clearcoat={1} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.56, 16]} />
          <meshStandardMaterial color="#5E6066" />
        </mesh>
      </group>
    </>
  );
};

const Scene = ({ pointer }) => {
  const g = useRef();
  useFrame((_, dt) => {
    if (!g.current) return;
    const p = pointer.current;
    g.current.rotation.y += dt * 0.22;
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, p.y * 0.18, 0.05);
    g.current.rotation.z = THREE.MathUtils.lerp(g.current.rotation.z, -p.x * 0.1, 0.05);
    g.current.position.x = THREE.MathUtils.lerp(g.current.position.x, p.x * 0.25, 0.05);
  });
  return (
    <>
      <group ref={g}>
        <Pallet />
        <Cartons />
        <Film />
      </group>
      <Float speed={1.6} rotationIntensity={1.2} floatIntensity={1.4}>
        <RoundedBox args={[0.42, 0.42, 0.42]} radius={0.05} position={[2.3, 1.2, -0.6]} castShadow>
          <meshStandardMaterial color="#E21F26" roughness={0.35} />
        </RoundedBox>
      </Float>
      <Float speed={1.2} rotationIntensity={1} floatIntensity={1.1}>
        <RoundedBox args={[0.36, 0.36, 0.36]} radius={0.04} position={[-2.3, 0.6, 0.5]} castShadow>
          <meshStandardMaterial color="#5E6066" roughness={0.45} />
        </RoundedBox>
      </Float>
      <Float speed={2} rotationIntensity={1.4} floatIntensity={1.6}>
        <RoundedBox args={[0.3, 0.22, 0.3]} radius={0.03} position={[-1.7, 1.8, -1.2]} castShadow>
          <meshStandardMaterial color="#C1915F" roughness={0.7} />
        </RoundedBox>
      </Float>
    </>
  );
};

export default function Hero3D() {
  const pointer = useRef({ x: 0, y: 0 });
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
  };
  return (
    <div className="h-full w-full" onPointerMove={onMove} onPointerLeave={() => (pointer.current = { x: 0, y: 0 })} data-testid="hero-3d-canvas">
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [4.6, 2.9, 5.6], fov: 36 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 7, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-5, 3, -2]} intensity={0.5} color="#ffd9d9" />
        <Scene pointer={pointer} />
        <ContactShadows position={[0, -1.25, 0]} opacity={0.35} scale={9} blur={2.6} far={3} color="#7d8794" />
        <Environment resolution={128}>
          <Lightformer intensity={2} position={[0, 5, -3]} scale={[10, 3, 1]} />
          <Lightformer intensity={1.2} position={[-5, 1, 2]} scale={[3, 6, 1]} />
          <Lightformer intensity={1.6} color="#ff6b6b" position={[5, 1, 1]} scale={[2, 5, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}
