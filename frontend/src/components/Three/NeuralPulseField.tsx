import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function NeuralPulseField() {
    const groupRef = useRef<THREE.Group>(null);
    const { mouse } = useThree();

    // Particle System Data
    const particles = useMemo(() => {
        const count = 400; // Large field
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Spherical distribution
            const r = 5 + Math.random() * 3; // Radius 5-8
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }

        return { positions };
    }, []);

    // Expanding Pulse Waves
    const PulseWaves = () => {
        const waveRef = useRef<THREE.Group>(null);

        useFrame(() => {
            if (waveRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                waveRef.current.children.forEach((mesh: any) => {
                    // Expand
                    mesh.scale.x += 0.005;
                    mesh.scale.y += 0.005;
                    mesh.scale.z += 0.005;

                    // Fade out
                    if (mesh.material) {
                        mesh.material.opacity -= 0.002;
                    }

                    // Reset
                    if (mesh.scale.x > 3) {
                        mesh.scale.set(0.1, 0.1, 0.1);
                        mesh.material.opacity = 0.5;
                    }
                });
            }
        });

        return (
            <group ref={waveRef}>
                {[0, 1, 2].map(i => (
                    <mesh key={i} scale={[0.5 + i * 0.8, 0.5 + i * 0.8, 0.5 + i * 0.8]}>
                        <sphereGeometry args={[4, 32, 32]} />
                        <meshBasicMaterial
                            color="#4fd1ff"
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

    useFrame(() => {
        if (groupRef.current) {
            // Mouse Interaction (Tilt)
            // Soft dampening
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.y * 0.2, 0.05);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.2, 0.05);

            // Auto Rotation
            groupRef.current.rotation.z += 0.001;
        }
    });

    return (
        <group ref={groupRef}>
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
                    size={0.08}
                    color="#4fd1ff"
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                    sizeAttenuation
                />
            </points>

            {/* Connection Lines (Static for performance, effectively simulating neural web) */}
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particles.positions.length / 3}
                        array={particles.positions}
                        itemSize={3}
                        args={[particles.positions, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#3b82f6" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
            </lineSegments>

            <PulseWaves />
        </group>
    );
}
