import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export default function Heart3D() {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            // Gentle floating rotation on X axis
            meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;

            // Heartbeat Pulse
            const scale = 1 + Math.sin(state.clock.getElapsedTime() * 10) * 0.02;
            meshRef.current.scale.set(scale, scale, scale);
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
        bevelSegments: 2,
        steps: 2,
        bevelSize: 1,
        bevelThickness: 1
    };

    // Blood Particles
    const Particles = () => {
        const count = 100;
        const mesh = useRef<THREE.InstancedMesh>(null);
        const dummy = new THREE.Object3D();
        const particles = useRef(new Array(count).fill(0).map(() => ({
            position: [Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 10 - 5],
            speed: Math.random() * 0.2 + 0.1
        })));

        useFrame(() => {
            if (!mesh.current) return;
            particles.current.forEach((particle, i) => {
                particle.position[1] += particle.speed;
                if (particle.position[1] > 15) particle.position[1] = -15;
                dummy.position.set(particle.position[0] as number, particle.position[1] as number, particle.position[2] as number);
                dummy.scale.set(0.2, 0.2, 0.2);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
            });
            mesh.current.instanceMatrix.needsUpdate = true;
        });

        return (
            <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
                <sphereGeometry args={[0.5, 10, 10]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
            </instancedMesh>
        );
    };

    return (
        <group scale={0.15} rotation={[Math.PI, 0, 0]}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh
                    ref={meshRef}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                >
                    <extrudeGeometry args={[heartShape, extrudeSettings]} />
                    <meshPhysicalMaterial
                        color="#e11d48"
                        roughness={0.2}
                        metalness={0.1}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                        emissive="#be123c"
                        emissiveIntensity={hovered ? 0.8 : 0.3}
                        transmission={0.2} // Subsurface scattering simulation
                        thickness={2}
                    />
                </mesh>
                <Particles />
            </Float>
        </group>
    );
}
