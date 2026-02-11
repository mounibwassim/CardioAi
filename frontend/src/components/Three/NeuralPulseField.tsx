
import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Heart3D from './Heart3D';

export default function NeuralPulseField() {
    const groupRef = useRef<THREE.Group>(null);
    const { mouse } = useThree();
    const [, setHover] = useState(false);

    // Particle System Data - Organic/Irregular Shape
    const particles = useMemo(() => {
        const count = 600; // Increased count for density
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Perlin-noise-like distribution (using multiple sin/cos layers) to create "clumps" and irregular strands
            const u = Math.random() * Math.PI * 2;
            const v = Math.random() * Math.PI;

            // Base radius varies significantly
            const r = 8 + Math.random() * 6 + Math.sin(u * 5) * 2 + Math.cos(v * 4) * 2;

            // Convert to Cartesian
            let x = r * Math.sin(v) * Math.cos(u);
            let y = r * Math.sin(v) * Math.sin(u);
            let z = r * Math.cos(v);

            // Stretch/Squash for organic feel
            x *= 1.2; // Wider
            y *= 0.8; // Flatter

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        // Generate connections between nearby particles (simulating neural pathways)
        // This is computationally expensive, so we simulate it with a subset relative to index
        // or just use line segments for visual flair without strict topology

        return { positions };
    }, []);

    // Expanding Pulse Waves - Irregular/Organic
    const PulseWaves = () => {
        const waveRef = useRef<THREE.Group>(null);

        useFrame(() => {
            if (waveRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                waveRef.current.children.forEach((mesh: any, i) => {
                    // Non-linear expansion
                    mesh.scale.x += 0.003 + (i * 0.001);
                    mesh.scale.y += 0.003 + (i * 0.001);
                    mesh.scale.z += 0.003 + (i * 0.001);

                    // Rotate slowly
                    mesh.rotation.z += 0.001;
                    mesh.rotation.y += 0.002;

                    // Fade out
                    if (mesh.material) {
                        mesh.material.opacity -= 0.001;
                    }

                    // Reset with random rotation for variety
                    if (mesh.material.opacity <= 0) {
                        mesh.scale.set(0.1, 0.1, 0.1);
                        mesh.material.opacity = 0.4;
                        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                    }
                });
            }
        });

        return (
            <group ref={waveRef}>
                {[0, 1, 2, 3].map(i => (
                    <mesh key={i} scale={[0.5 + i * 0.8, 0.5 + i * 0.8, 0.5 + i * 0.8]}>
                        {/* Icosahedron gives a more tech/poly look than sphere */}
                        <icosahedronGeometry args={[5, 1]} />
                        <meshBasicMaterial
                            color={i % 2 === 0 ? "#4fd1ff" : "#F472B6"} // Blue and Pink hints
                            transparent
                            opacity={0.3}
                            wireframe
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                ))}
            </group>
        );
    }

    useFrame((state) => {
        if (groupRef.current) {
            // Smooth Mouse Follow (Damped)
            const targetRotX = mouse.y * 0.3; // Tilt up/down
            const targetRotY = mouse.x * 0.3; // Pan left/right

            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.02);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.02);

            // Subtle continuous floating breathing
            const time = state.clock.getElapsedTime();
            groupRef.current.position.y = Math.sin(time * 0.5) * 0.2;
            groupRef.current.rotation.z = Math.sin(time * 0.2) * 0.05;
        }
    });

    return (
        <group>
            {/* Center Heart - Integrated */}
            <group scale={[0.8, 0.8, 0.8]}>
                <Heart3D />
            </group>

            {/* Neural Field Surrounding Heart */}
            <group ref={groupRef}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <points>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={particles.positions.length / 3}
                            array={particles.positions}
                            itemSize={3}
                            args={[particles.positions, 3]}
                        />
                    </bufferGeometry>
                    <pointsMaterial
                        size={0.06}
                        color="#60A5FA" // Lighter blue
                        transparent
                        opacity={0.6}
                        blending={THREE.AdditiveBlending}
                        sizeAttenuation
                        depthWrite={false}
                    />
                </points>

                {/* Connecting Lines (Static for performance, effectively simulating neural web) */}
                {/* Visualizing just via Points mainly to keep it performant, lines would require expensive index generation for organic shape. 
                    Instead using a secondary wireframe mesh to simulate "Web" */}
                <mesh>
                    <icosahedronGeometry args={[9, 2]} />
                    <meshBasicMaterial
                        color="#3b82f6"
                        wireframe
                        transparent
                        opacity={0.05}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>

                <PulseWaves />
            </group>
        </group>
    );
}
