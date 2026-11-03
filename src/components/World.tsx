'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { Children, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

export interface WorldProps {
  stage: number;
  unlocked: number;
  cameraMode: 'FPP' | 'TPP';
  exploring: boolean;
  modalOpen: boolean;
  onInteract: () => void;
  onStageChange: (stage: number) => void;
  onReady?: () => void;
  circuit?: [boolean, boolean, boolean];
  inductionProgress?: number;
}

const CYAN = '#5ce8f1';
const GREEN = '#a3fb9e';
const AMBER = '#ffba65';
const ROOM_GAP = 22;
const TITLES = ['ACCESS VAULT', 'TRIBUNAL', 'INDUCTION BRIDGE', 'VENN BIODOME', 'WAR ROOM', 'FUZZY LAB', 'CRYPTOGRAPHIC CORE'];
const ACCENTS = [CYAN, '#a09dff', AMBER, GREEN, '#e6abff', '#8cf3ca', '#ffa76c'];
const terminalPosition = new THREE.Vector3(2.4, 1.5, -3.4);

function Box({ position, scale, color = '#17262c', glow = false, ...rest }: {
  position: [number, number, number]; scale: [number, number, number]; color?: string; glow?: boolean;
  rotation?: [number, number, number];
}) {
  return <mesh position={position} scale={scale} castShadow receiveShadow {...rest}>
    <boxGeometry /><meshStandardMaterial color={color} roughness={glow ? 0.35 : 0.6} metalness={0.45}
      emissive={glow ? color : '#000000'} emissiveIntensity={glow ? 1.6 : 0} />
  </mesh>;
}

function WorldLabel({ children, position, color = CYAN, small = false }: {
  children: React.ReactNode; position: [number, number, number]; color?: string; small?: boolean;
}) {
  // Native Three sprites avoid a separate React DOM root per label. Drei Html's
  // synchronous nested-root cleanup warns during React 19 StrictMode/unmounts.
  const text = Children.toArray(children).join('');
  const { texture, ratio } = useMemo(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    const fontSize = small ? 24 : 30;
    context.font = `500 ${fontSize}px monospace`;
    canvas.width = Math.ceil(context.measureText(text).width + 40);
    canvas.height = 64;
    context.fillStyle = '#071b21df';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = `${color}60`;
    context.lineWidth = 2;
    context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    context.font = `500 ${fontSize}px monospace`;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 1);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.minFilter = THREE.LinearFilter;
    map.magFilter = THREE.LinearFilter;
    return { texture: map, ratio: canvas.width / canvas.height };
  }, [text, color, small]);
  useEffect(() => () => texture.dispose(), [texture]);
  const height = small ? 0.45 : 0.58;
  return <sprite position={position} scale={[ratio * height, height, 1]}>
    <spriteMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
  </sprite>;
}

function ServerRack({ x, z, side }: {x: number; z: number; side: number}) {
  return <group position={[x, 0, z]} rotation={[0, side * Math.PI / 2, 0]}>
    <Box position={[0, 1.8, 0]} scale={[1.1, 3.6, 0.8]} color="#101f27" />
    <Box position={[0, 1.8, 0.42]} scale={[0.93, 3.3, 0.05]} color="#071217" />
    {Array.from({length: 7}, (_, i) => <group key={i}>
      <Box position={[0, 0.35 + i * 0.46, 0.46]} scale={[0.8, 0.32, 0.06]} color="#1c3036" />
      <Box position={[-0.29, 0.35 + i * 0.46, 0.51]} scale={[0.045, 0.09, 0.025]} color={i % 3 ? CYAN : GREEN} glow />
      <Box position={[0.13, 0.35 + i * 0.46, 0.51]} scale={[0.36, 0.025, 0.025]} color="#3b6975" />
    </group>)}
  </group>;
}

function Gate({ open, color, stage }: {open: boolean; color: string; stage: number}) {
  const left = useRef<THREE.Mesh>(null);
  const right = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({clock}, dt) => {
    if (left.current) left.current.position.x = THREE.MathUtils.damp(left.current.position.x, open ? -3.15 : -1.23, 4, dt);
    if (right.current) right.current.position.x = THREE.MathUtils.damp(right.current.position.x, open ? 3.15 : 1.23, 4, dt);
    if (ring.current) ring.current.rotation.z = clock.elapsedTime * 0.045;
  });
  return <group position={[0, 3.25, -8.7]}>
    <Box position={[-3.6, 0, -0.5]} scale={[1.25, 7, 0.8]} color="#101e26" />
    <Box position={[3.6, 0, -0.5]} scale={[1.25, 7, 0.8]} color="#101e26" />
    <Box position={[0, 3.15, -0.5]} scale={[6.2, 0.7, 0.8]} color="#101e26" />
    <mesh position={[0, 0, 0.05]} rotation={[0, 0, Math.PI / 8]}><torusGeometry args={[3.4, 0.42, 4, 8]} /><meshStandardMaterial color="#34444a" metalness={0.8} roughness={0.34} /></mesh>
    <mesh position={[0, 0, 0.49]} rotation={[0, 0, Math.PI / 8]}><torusGeometry args={[3.3, 0.038, 5, 8]} /><meshBasicMaterial color={color} /></mesh>
    <mesh ref={ring} position={[0, 0, 0.54]}><torusGeometry args={[2.95, 0.035, 5, 64, Math.PI * 1.7]} /><meshBasicMaterial color={open ? GREEN : color} transparent opacity={0.8} /></mesh>
    <mesh ref={left} position={[-1.23, -0.15, 0.2]} castShadow><boxGeometry args={[2.4, 5.7, 0.4]} /><meshStandardMaterial color="#182a33" metalness={0.75} roughness={0.4} /></mesh>
    <mesh ref={right} position={[1.23, -0.15, 0.21]} castShadow><boxGeometry args={[2.4, 5.7, 0.4]} /><meshStandardMaterial color="#21343b" metalness={0.75} roughness={0.4} /></mesh>
    {!open && <group>
      <Box position={[0, -0.1, 0.45]} scale={[0.055, 4.8, 0.035]} color={color} glow />
      <mesh position={[0, 0.2, 0.65]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.7, 0.7, 0.12]} /><meshStandardMaterial color="#153631" emissive={GREEN} emissiveIntensity={0.4} /></mesh>
      <mesh position={[0, 0.2, 0.73]}><ringGeometry args={[0.12, 0.15, 24]} /><meshBasicMaterial color={GREEN} side={THREE.DoubleSide} /></mesh>
    </group>}
    <WorldLabel position={[0, 4.05, 0.2]} color={color}>SECTOR {String(stage).padStart(2, '0')} / {TITLES[stage - 1]}</WorldLabel>
    <WorldLabel position={[0, -2.7, 0.65]} color={open ? GREEN : '#92a5ab'} small>{open ? 'ACCESS GRANTED' : 'KNOWLEDGE IS THE KEY'}</WorldLabel>
  </group>;
}

function Terminal({ color, onInteract, active, exploring }: {color: string; onInteract: () => void; active: boolean; exploring: boolean}) {
  const hologram = useRef<THREE.Group>(null);
  useFrame(({clock}) => { if (hologram.current) hologram.current.rotation.y = clock.elapsedTime * 0.22; });
  return <group position={[terminalPosition.x, 0, terminalPosition.z]} onClick={(e) => {e.stopPropagation(); if (active && !exploring) onInteract();}}>
    <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.85, 1.05, 0.24, 8]} /><meshStandardMaterial color="#2b4248" metalness={0.65} roughness={0.45} /></mesh>
    <mesh position={[0, 0.7, 0]}><cylinderGeometry args={[0.48, 0.65, 1.2, 6]} /><meshStandardMaterial color="#142b33" /></mesh>
    <mesh position={[0, 1.33, 0]}><cylinderGeometry args={[0.75, 0.75, 0.12, 8]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} /></mesh>
    <mesh position={[0, 1.39, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.66, 32]} /><meshBasicMaterial color="#061d24" /></mesh>
    <Float speed={1.6} floatIntensity={0.22} rotationIntensity={0}>
      <group ref={hologram} position={[0, 2.2, 0]}>
        <mesh><octahedronGeometry args={[0.53, 0]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} wireframe transparent opacity={0.8} /></mesh>
        <mesh><octahedronGeometry args={[0.19, 0]} /><meshStandardMaterial color="#dcffff" emissive={color} emissiveIntensity={2} /></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.78, 0.013, 6, 50]} /><meshBasicMaterial color={color} /></mesh>
      </group>
    </Float>
    <mesh position={[0, 2, 0]}><cylinderGeometry args={[0.55, 0.65, 1.2, 24, 1, true]} /><meshBasicMaterial color={color} transparent opacity={0.035} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    {active && <WorldLabel position={[0, 3.05, 0]} color={color} small>KNOWLEDGE TERMINAL</WorldLabel>}
    <pointLight position={[0, 2.5, 0]} color={color} intensity={5} distance={5} />
  </group>;
}

function Circuit({ values }: {values: [boolean, boolean, boolean]}) {
  const result = values[1] && (!values[0] || values[2]);
  return <group position={[-3.2, 0, -3.7]}>
    <Box position={[0, 0.15, 0]} scale={[3.5, 0.3, 2.3]} color="#122931" />
    {values.map((on, i) => <group key={i} position={[-1.1 + i * 1.1, 0, 0]}>
      <Box position={[0, 0.55, 0]} scale={[0.42, 0.7, 0.42]} color="#2a414a" />
      <mesh position={[0, 1.05, 0]}><sphereGeometry args={[0.19, 16, 12]} /><meshStandardMaterial color={on ? CYAN : '#964757'} emissive={on ? CYAN : '#713242'} emissiveIntensity={1.3} /></mesh>
      <Box position={[0, 0.32, -0.63]} scale={[0.04, 0.025, 1.1]} color={on ? CYAN : '#6f3f4c'} glow={on} />
      <WorldLabel position={[0, 1.5, 0]} small color={on ? CYAN : '#a78c98'}>{['P', 'I', 'T'][i]} = {on ? '1' : '0'}</WorldLabel>
    </group>)}
    <Box position={[0, 0.32, -1.14]} scale={[2.3, 0.025, 0.04]} color={result ? GREEN : '#73505a'} glow={result} />
    <WorldLabel position={[0, 2.35, -0.3]} small color={result ? GREEN : '#aab9be'}>A = I(P′ + T) / {result ? 'TRUE' : 'FALSE'}</WorldLabel>
  </group>;
}

function TruthPillars() {
  return <group position={[-3.2, 0, -3.4]}>{[0.8, 1.8, 2.6, 1.3].map((h, i) => <group key={i} position={[(i % 2) * 1.7 - 0.85, 0, Math.floor(i / 2) * 1.7 - 0.85]}>
    <Box position={[0, h / 2, 0]} scale={[0.75, h, 0.75]} color={i === 1 ? '#683e64' : '#4b5f90'} />
    <Box position={[0, h + 0.05, 0]} scale={[0.8, 0.08, 0.8]} color={i === 1 ? '#f58db0' : '#b4b3ff'} glow />
    <WorldLabel position={[0, h + 0.5, 0]} small color="#d2cdff">{['T → T', 'T → F', 'F → T', 'F → F'][i]}</WorldLabel>
  </group>)}</group>;
}

function Domino({ index, progress }: {index: number; progress: number}) {
  const block = useRef<THREE.Group>(null);
  useFrame(({clock}, dt) => {
    const active = progress > 0 && index < progress * 3;
    const angle = active ? -1.18 + Math.sin(clock.elapsedTime * 0.8 + index) * 0.015 : 0;
    if (block.current) block.current.rotation.z = THREE.MathUtils.damp(block.current.rotation.z, angle, 3, dt);
  });
  return <group ref={block} position={[-5.6 + index * 0.5, 0.15, -3.5]}><Box position={[0, 0.65, 0]} scale={[0.18, 1.3, 0.7]} color={AMBER} /><Box position={[0, 1.23, 0]} scale={[0.19, 0.04, 0.73]} color="#ffe8a2" glow /></group>;
}

function VennParticles() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(() => Array.from({length:250}, (_, i) => {
    const group = i < 15 ? 0 : i < 55 ? 1 : i < 90 ? 2 : 3;
    const angle = i * 2.39996;
    const r = 0.2 + ((i * 73) % 101) / 100;
    const center = group === 0 ? [-1.2, 0] : group === 1 ? [1.2, 0] : group === 2 ? [0, 0] : [0, 2.2];
    return {x: center[0] + Math.cos(angle) * r * (group === 2 ? 0.33 : 0.7), z:center[1] + Math.sin(angle) * r * 0.75, y:0.5 + ((i * 31) % 67) / 100, group};
  }), []);
  useEffect(() => {if (mesh.current) positions.forEach((p, i) => mesh.current!.setColorAt(i, new THREE.Color([CYAN, '#bd9af5', GREEN, '#557782'][p.group])));}, [positions]);
  useFrame(({clock}) => {
    if (!mesh.current) return;
    positions.forEach((p, i) => {dummy.position.set(p.x, p.y + Math.sin(clock.elapsedTime * 0.7 + i) * 0.06, p.z); dummy.scale.setScalar(1); dummy.updateMatrix(); mesh.current!.setMatrixAt(i, dummy.matrix);});
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <group position={[-3.4, 0.25, -4.3]}>
    <Box position={[0, -0.1, 1]} scale={[5.3, 0.2, 5.6]} color="#10272c" />
    {[-0.7, 0.7].map((x, i) => <mesh key={x} position={[x, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.45, 0.025, 8, 64]} /><meshBasicMaterial color={i ? '#bd9af5' : CYAN} /></mesh>)}
    <instancedMesh ref={mesh} args={[undefined, undefined, 250]}><icosahedronGeometry args={[0.055, 0]} /><meshStandardMaterial color="white" roughness={0.3} emissive="#163c3b" emissiveIntensity={0.8} /></instancedMesh>
    <WorldLabel position={[0, 2.4, 0]} small color={GREEN}>15 / 35 / 40 · OUTSIDE 160</WorldLabel>
  </group>;
}

function Avatar({ color = '#a3fb9e', active = true }: {color?: string; active?: boolean}) {
  const body = useRef<THREE.Group>(null);
  useFrame(({clock}) => {if (body.current) body.current.position.y = Math.sin(clock.elapsedTime * 2) * 0.018;});
  return <group ref={body}>
    <mesh position={[0, 1.46, 0]} castShadow><sphereGeometry args={[0.18, 12, 12]} /><meshStandardMaterial color="#bec8c8" /></mesh>
    <Box position={[0, 1.04, 0]} scale={[0.46, 0.58, 0.3]} color={active ? '#29474c' : '#44323d'} />
    <Box position={[0, 1.1, 0.16]} scale={[0.26, 0.05, 0.025]} color={color} glow />
    <Box position={[-0.13, 0.39, 0]} scale={[0.17, 0.69, 0.2]} color="#172d35" />
    <Box position={[0.13, 0.39, 0]} scale={[0.17, 0.69, 0.2]} color="#172d35" />
    <Box position={[-0.31, 0.99, 0]} scale={[0.13, 0.56, 0.16]} color="#29474c" rotation={[0, 0, -0.1]} />
    <Box position={[0.31, 0.99, 0]} scale={[0.13, 0.56, 0.16]} color="#29474c" rotation={[0, 0, 0.1]} />
  </group>;
}

function Team() {
  return <group position={[-3.7, 0.2, -4.3]}>
    <Box position={[0, -0.1, 0]} scale={[5.6, 0.2, 4.1]} color="#1c2b35" />
    {Array.from({length:10}, (_, i) => <group key={i} position={[(i % 5 - 2) * 0.95, 0, Math.floor(i / 5) * 1.7 - 0.8]}>
      <Avatar color={i === 1 ? '#f07d94' : i === 0 ? GREEN : '#c9a2ed'} active={i !== 1} />
      {i < 2 && <WorldLabel position={[0, 2.05, 0]} color={i ? '#f07d94' : GREEN} small>{i ? 'BONITA' : 'ANDI'}</WorldLabel>}
    </group>)}
  </group>;
}

function FuzzyTubes() {
  return <group position={[-3.6, 0.25, -4.4]}>
    {[0.6, 0.9, 0.4, 0.1, 0.5].map((value, i) => <group key={i} position={[(i - 2) * 0.9, 0, 0]}>
      <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.3, 0.3, 3, 20, 1, true]} /><meshStandardMaterial color="#b4d6db" transparent opacity={0.13} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      <mesh position={[0, value * 1.5, 0]}><cylinderGeometry args={[0.27, 0.27, value * 3, 16]} /><meshStandardMaterial color={GREEN} emissive={GREEN} emissiveIntensity={0.45} transparent opacity={0.7} /></mesh>
      {[0, 3].map(y => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[0.39, 0.39, 0.14, 12]} /><meshStandardMaterial color="#2a4952" metalness={0.7} roughness={0.3} /></mesh>)}
      <WorldLabel position={[0, 3.5, 0]} small color={GREEN}>{value.toFixed(1)}</WorldLabel>
      <WorldLabel position={[0, -0.02, 0.5]} small>{['A', 'B', 'F', 'O', 'R'][i]}</WorldLabel>
    </group>)}
  </group>;
}

function ModuloCore() {
  const rotor = useRef<THREE.Group>(null);
  useFrame((_, dt) => {if (rotor.current) rotor.current.rotation.z += dt * 0.08;});
  return <group position={[-3.3, 2.4, -3.9]}>
    <group ref={rotor}>
      {[1.5, 1.8, 2.1].map((radius, i) => <mesh key={radius}><torusGeometry args={[radius, i === 1 ? 0.12 : 0.022, 8, 80]} /><meshStandardMaterial color={i === 1 ? '#41515b' : AMBER} emissive={i === 1 ? '#000' : AMBER} emissiveIntensity={1.2} metalness={0.8} roughness={0.5} /></mesh>)}
      {Array.from({length:47}, (_, i) => {const a=i / 47 * Math.PI * 2; return <Box key={i} position={[Math.cos(a) * 1.82, Math.sin(a) * 1.82, 0]} scale={[0.15, 0.32, 0.3]} rotation={[0, 0, a - Math.PI / 2]} color={i % 3 ? '#607078' : AMBER} glow={i % 3 === 0} />;})}
    </group>
    <mesh><icosahedronGeometry args={[0.55, 1]} /><meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.6} wireframe /></mesh>
    <WorldLabel position={[0, 0, 0.6]} color={AMBER}>MOD 141</WorldLabel>
  </group>;
}

function Room({ id, active, unlocked, onInteract, circuit, inductionProgress, exploring }: {
  id: number; active: boolean; unlocked: number; onInteract: () => void; circuit: [boolean, boolean, boolean]; inductionProgress: number; exploring: boolean;
}) {
  const color = ACCENTS[id - 1];
  return <group position={[0, 0, -(id - 1) * ROOM_GAP]}>
    <Box position={[0, -0.25, 0]} scale={[16, 0.5, 19]} color="#112029" />
    <gridHelper args={[16, 16, '#2c4b54', '#1b323b']} position={[0, 0.013, 0]} />
    {[-7.7, 7.7].map(x => <group key={x}>
      <Box position={[x, 0.4, -0.6]} scale={[0.4, 0.8, 17.8]} color="#253c45" />
      <Box position={[x, 0.82, -0.6]} scale={[0.12, 0.055, 17.8]} color={color} glow />
      {[-7.3, -1.4, 5.9].map(z => <group key={z}>
        <Box position={[x, 2.6, z]} scale={[0.4, 5.2, 0.4]} color="#243841" />
        <Box position={[x + (x > 0 ? -0.23 : 0.23), 3, z]} scale={[0.04, 2.5, 0.1]} color={color} glow />
      </group>)}
      <Box position={[x, 5.2, -0.6]} scale={[0.5, 0.28, 18]} color="#243841" />
    </group>)}
    {[-5.4, 5.4].map(x => <Box key={x} position={[x, 0.03, -0.5]} scale={[0.035, 0.02, 15.5]} color={color} glow />)}
    {[-4.5, -1.7, 1.1].map((z, i) => <ServerRack key={z} x={-6.9} z={z} side={1} />)}
    {[0.2, 2.7].map(z => <ServerRack key={z} x={6.9} z={z} side={-1} />)}
    <Box position={[0, 0.05, 4.5]} scale={[3, 0.06, 1.5]} color="#1c333c" />
    {[0, 1, 2].map(i => <Box key={i} position={[0, 0.09, 4.7 - i * 0.34]} scale={[0.7 - i * 0.1, 0.025, 0.04]} color={color} glow />)}
    <Gate open={unlocked > id} color={color} stage={id} />
    {id < 7 && <group>
      <Box position={[0, -0.2, -11]} scale={[6, 0.4, 5]} color="#1c3038" />
      {[-2.8, 2.8].map(x => <Box key={x} position={[x, 0.1, -11]} scale={[0.04, 0.05, 5]} color={color} glow />)}
    </group>}
    <Terminal color={color} onInteract={onInteract} active={active && id <= unlocked} exploring={exploring} />
    {id === 1 && <Circuit values={circuit} />}
    {id === 2 && <TruthPillars />}
    {id === 3 && <group>{Array.from({length:9}, (_, i) => <Domino key={i} index={i} progress={inductionProgress} />)}<WorldLabel position={[-3.6, 2.5, -3.4]} color={AMBER} small>BASIS → HIPOTESIS → INDUKSI</WorldLabel></group>}
    {id === 4 && <VennParticles />}
    {id === 5 && <Team />}
    {id === 6 && <FuzzyTubes />}
    {id === 7 && <ModuloCore />}
    <pointLight position={[0, 4, -5]} color={color} intensity={18} distance={13} />
    <pointLight position={[4, 3, 4]} color="#658aab" intensity={8} distance={10} />
    {active && <Sparkles count={45} scale={[13, 6, 13]} size={1.2} speed={0.18} opacity={0.3} color={color} position={[0, 3, -1]} />}
  </group>;
}

function LookControls() {
  const {camera, gl} = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const previousTouchAction = canvas.style.touchAction;
    canvas.style.touchAction = 'none';
    camera.rotation.reorder('YXZ');
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lockDenied = false;
    let requestingLock = false;
    let disposed = false;
    // Embedded browsers may deny Pointer Lock. Dragging works independently of
    // that API, and a rejected request is handled rather than logged/rethrown.
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.focus({preventScroll:true});
      event.preventDefault();
      if (lockDenied || requestingLock || document.pointerLockElement === canvas || !canvas.requestPointerLock || event.pointerType === 'touch') return;
      requestingLock = true;
      try {
        Promise.resolve(canvas.requestPointerLock()).then(() => {
          requestingLock = false;
          if (disposed && document.pointerLockElement === canvas) document.exitPointerLock();
        }).catch(() => {requestingLock = false; lockDenied = true;});
      } catch {
        requestingLock = false;
        lockDenied = true;
      }
    };
    const move = (event: PointerEvent) => {
      const locked = document.pointerLockElement === canvas;
      if (!locked && !dragging) return;
      const dx = locked ? event.movementX : event.clientX - lastX;
      const dy = locked ? event.movementY : event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      camera.rotation.y -= THREE.MathUtils.clamp(dx, -100, 100) * 0.0025;
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - THREE.MathUtils.clamp(dy, -100, 100) * 0.0025, -1.1, 1.1);
      camera.rotation.z = 0;
    };
    const up = () => {dragging = false;};
    const lockError = () => {requestingLock = false; lockDenied = true;};
    canvas.addEventListener('pointerdown', down);
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', up);
    document.addEventListener('pointerlockerror', lockError);
    window.addEventListener('blur', up);
    return () => {
      disposed = true;
      dragging = false;
      canvas.style.touchAction = previousTouchAction;
      canvas.removeEventListener('pointerdown', down);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      document.removeEventListener('pointerlockerror', lockError);
      window.removeEventListener('blur', up);
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    };
  }, [camera, gl]);
  return null;
}

function Player({stage, unlocked, cameraMode, exploring, modalOpen, onInteract, onStageChange}: WorldProps) {
  const { camera } = useThree();
  const avatar = useRef<THREE.Group>(null);
  const keys = useRef<Set<string>>(new Set());
  const player = useRef(new THREE.Vector3(0, 1.7, 3));
  const trackedStage = useRef(stage);
  const verticalSpeed = useRef(0);
  const [near, setNear] = useState(false);
  const nearRef = useRef(false);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const worldUp = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const modeRef = useRef(cameraMode);
  useEffect(() => {
    if (trackedStage.current !== stage) {
      player.current.set(0, 1.7, -(stage - 1) * ROOM_GAP + 3);
      trackedStage.current = stage;
      nearRef.current = false;
      setNear(false);
      camera.rotation.set(cameraMode === 'TPP' ? -0.25 : -0.05, 0, 0);
    }
  }, [stage, camera, cameraMode]);
  useEffect(() => {
    keys.current.clear();
    if (!exploring || modalOpen) {
      if (document.pointerLockElement) document.exitPointerLock();
    } else {
      camera.rotation.set(cameraMode === 'TPP' ? -0.25 : -0.05, 0, 0);
      camera.position.copy(player.current);
    }
  }, [exploring, modalOpen, camera, cameraMode]);
  useEffect(() => {
    if (modeRef.current !== cameraMode) {camera.rotation.set(cameraMode === 'TPP' ? -0.25 : -0.05, 0, 0); modeRef.current = cameraMode;}
  }, [cameraMode, camera]);
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (!exploring || modalOpen || (event.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName))) return;
      if (['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight'].includes(event.code)) {event.preventDefault(); keys.current.add(event.code);}
      if (event.code === 'KeyE' && !event.repeat && nearRef.current) onInteract();
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.code);
    const clear = () => keys.current.clear();
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', clear);
    document.addEventListener('pointerlockchange', clear);
    return () => {window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', clear); document.removeEventListener('pointerlockchange', clear);};
  }, [exploring, modalOpen, onInteract]);
  useFrame(({clock}, frameDt) => {
    const dt = Math.min(frameDt, 0.04);
    const centerZ = -(stage - 1) * ROOM_GAP;
    if (!exploring) {
      desired.set(12.2, 9.4, centerZ + 12.6);
      camera.position.lerp(desired, 1 - Math.exp(-dt * 2));
      look.set(0, 1.8, centerZ - 2.9);
      camera.lookAt(look);
      if (avatar.current) avatar.current.visible = false;
      return;
    }
    if (modalOpen) return;
    camera.getWorldDirection(forward); forward.y = 0; forward.normalize();
    right.crossVectors(forward, worldUp).normalize();
    desired.set(0, 0, 0);
    if (keys.current.has('KeyW')) desired.add(forward);
    if (keys.current.has('KeyS')) desired.sub(forward);
    if (keys.current.has('KeyD')) desired.add(right);
    if (keys.current.has('KeyA')) desired.sub(right);
    const moving = desired.lengthSq() > 0;
    desired.normalize().multiplyScalar(dt * (keys.current.has('ShiftLeft') || keys.current.has('ShiftRight') ? 6 : 3.3));
    const next = player.current.clone().add(desired);
    next.x = THREE.MathUtils.clamp(next.x, -6.3, 6.3);
    next.z = THREE.MathUtils.clamp(next.z, -(Math.min(unlocked, 7) - 1) * ROOM_GAP - 7.6, 7.2);
    const localZ = ((-next.z + 11 + ROOM_GAP * 10) % ROOM_GAP) - 11;
    if (Math.abs(localZ) > 8 && Math.abs(next.x) > 2.45) next.z = player.current.z;
    const currentRoom = Math.max(1, Math.min(7, Math.floor((-next.z + 11) / ROOM_GAP) + 1));
    if (currentRoom > unlocked) next.z = player.current.z;
    if (keys.current.has('Space') && player.current.y <= 1.701) verticalSpeed.current = 4.8;
    verticalSpeed.current -= 13 * dt;
    next.y = Math.max(1.7, player.current.y + verticalSpeed.current * dt);
    if (next.y === 1.7) verticalSpeed.current = 0;
    player.current.copy(next);
    if (currentRoom !== trackedStage.current && currentRoom <= unlocked) {trackedStage.current = currentRoom; onStageChange(currentRoom);}
    const tx = terminalPosition.x, tz = terminalPosition.z - (currentRoom - 1) * ROOM_GAP;
    const isNear = currentRoom <= unlocked && Math.hypot(player.current.x - tx, player.current.z - tz) < 2.5;
    if (isNear !== nearRef.current) {nearRef.current = isNear; setNear(isNear);}
    if (avatar.current) {
      avatar.current.visible = cameraMode === 'TPP';
      avatar.current.position.set(player.current.x, player.current.y - 1.7, player.current.z);
      avatar.current.rotation.y = Math.atan2(forward.x, forward.z);
    }
    if (cameraMode === 'FPP') {
      camera.position.copy(player.current);
      if (moving && next.y <= 1.71) camera.position.y += Math.sin(clock.elapsedTime * 11) * 0.025;
    } else {
      desired.copy(player.current).addScaledVector(forward, -3.3).addScaledVector(right, 0.6);
      desired.y += 1;
      desired.x = THREE.MathUtils.clamp(desired.x, -6.5, 6.5);
      desired.z = THREE.MathUtils.clamp(desired.z, -(Math.min(unlocked, 7) - 1) * ROOM_GAP - 7.5, 8);
      camera.position.lerp(desired, 1 - Math.exp(-dt * 12));
    }
  });
  return <>
    {exploring && !modalOpen && <LookControls />}
    <group ref={avatar}><Avatar /></group>
    {exploring && !modalOpen && near && <WorldLabel position={[terminalPosition.x, 3.8, terminalPosition.z - (stage - 1) * ROOM_GAP]} color={GREEN} small>[ E ] INSPECT CONCEPT</WorldLabel>}
  </>;
}

function Scene(props: WorldProps) {
  useEffect(() => {props.onReady?.();}, [props.onReady]);
  return <>
    <color attach="background" args={['#071217']} />
    <fog attach="fog" args={['#071217', 24, 66]} />
    <ambientLight color="#91bbc7" intensity={1.6} />
    <hemisphereLight args={['#b4d8e6', '#0a1719', 1.7]} />
    <directionalLight position={[5, 12, 8]} intensity={2.6} color="#b7e8e8" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
    {Array.from({length:7}, (_, i) => i + 1).filter(id => Math.abs(id - props.stage) <= 1).map(id => <Room key={id} id={id} active={id === props.stage} unlocked={props.unlocked} onInteract={props.onInteract} circuit={props.circuit ?? [true, true, true]} inductionProgress={props.inductionProgress ?? 0} exploring={props.exploring} />)}
    <Player {...props} />
  </>;
}

export default function World(props: WorldProps) {
  return <Canvas shadows dpr={[1, 1.5]} camera={{position:[12.2, 9.4, 12.6], fov:46, near:0.1, far:110}}
    gl={{antialias:true, alpha:false, powerPreference:'high-performance'}}
    onCreated={({gl}) => {gl.domElement.id = 'discrete-world-canvas'; gl.domElement.tabIndex = 0;}}
    style={{width:'100%',height:'100%'}} fallback={<div style={{padding:40,color:'#b8d5db'}}>WebGL tidak tersedia. Gunakan Cram Mode 2D untuk seluruh materi dan soal.</div>}>
    <Scene {...props} />
  </Canvas>;
}
