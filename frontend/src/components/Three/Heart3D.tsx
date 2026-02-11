import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export default function Heart3D() {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            // Gentle floating rotation
            meshRef.current.rotation.y += 0.002;
            meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;

            // Realistic Heartbeat (Two-phase)
            const time = state.clock.getElapsedTime();
            // Lub-Dub rhythm: f(t) = a*sin(t) + b*sin(2t) ... simpler approximation:
            // Pulse: sharp rise, slow decay
            const beat = Math.sin(time * 8);
            const scaleBase = 1;
            const beatIntensity = hovered ? 0.05 : 0.03;
            // Only beat when sin is positive (systole)
            const pulse = beat > 0 ? beat : 0;
            const scale = scaleBase + pulse * beatIntensity;

            meshRef.current.scale.set(scale, scale, scale);

            // Material pulsing (emissive)
            if (meshRef.current.material instanceof THREE.MeshPhysicalMaterial) {
                meshRef.current.material.emissiveIntensity = 0.4 + pulse * 2;
            }
        }
    });

    const x = 0, y = 0;
    const heartShape = new THREE.Shape();
    heartShape.moveTo(x + 5, y + 5);
    heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

    const extrudeSettings = {
        depth: 4,
        bevelEnabled: true,
        bevelSegments: 5, // Smoother
        steps: 4,
        bevelSize: 1.5, // Rounder
        bevelThickness: 1.5
    };

    // Atmoshpere / Aura Particles
    const Atmosphere = () => {
        const count = 50;
        const mesh = useRef<THREE.InstancedMesh>(null);
        const dummy = new THREE.Object3D();
        const particles = useRef(new Array(count).fill(0).map(() => ({
            position: [Math.random() * 30 - 15, Math.random() * 30 - 15, Math.random() * 20 - 10],
            speed: Math.random() * 0.02 + 0.01,
            phase: Math.random() * Math.PI * 2
        })));

        useFrame((state) => {
            if (!mesh.current) return;
            particles.current.forEach((particle, i) => {
                particle.position[1] += Math.sin(state.clock.elapsedTime + particle.phase) * 0.01;
                dummy.position.set(particle.position[0] as number, particle.position[1] as number, particle.position[2] as number);
                const s = 0.5 + Math.sin(state.clock.elapsedTime + particle.phase) * 0.2;
                dummy.scale.set(s, s, s);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
            });
            mesh.current.instanceMatrix.needsUpdate = true;
        });

        return (
            <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
            </instancedMesh>
        );
    };

    return (
        <group scale={0.15} rotation={[Math.PI, 0, 0]}>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                <mesh
                    ref={meshRef}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                >
                    <extrudeGeometry args={[heartShape, extrudeSettings]} />
                    <meshPhysicalMaterial
                        color="#be123c" // Darker, bloodier red
                        roughness={0.3}
                        metalness={0.1}
                        clearcoat={0.8}
                        clearcoatRoughness={0.2}
                        emissive="#ff0000"
                        emissiveIntensity={0.4}
                        transmission={0.1}
                        thickness={3}
                    />
                </mesh>
                <Atmosphere />
            </Float>
        </group>
    );
}
