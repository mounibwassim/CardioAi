import { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function NeuralPulseField() {
    const count = 400; // Particle count
    const connectionDistance = 3.5; // Max distance for lines

    const mesh = useRef<THREE.Points>(null);
    const linesGeometry = useRef<THREE.BufferGeometry>(null);
    const group = useRef<THREE.Group>(null);

    const { mouse, viewport } = useThree();
    const [hovered, setHover] = useState(false);

    // Initial particle positions
    const [particles, positions] = useMemo(() => {
        const temp = [];
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 25; // Wide spread
            const y = (Math.random() - 0.5) * 15;
            const z = (Math.random() - 0.5) * 10;

            temp.push({
                x, y, z,
                vx: (Math.random() - 0.5) * 0.02,
                vy: (Math.random() - 0.5) * 0.02,
                vz: (Math.random() - 0.5) * 0.02,
                originalX: x,
                originalY: y
            });

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;
        }
        return [temp, pos];
    }, [count]);

    // Animate
    useFrame((state) => {
        if (!mesh.current || !group.current) return;

        // Interaction: Smooth rotation based on mouse
        const targetRotX = (mouse.y * viewport.height) / 100;
        const targetRotY = (mouse.x * viewport.width) / 100;

        group.current.rotation.x += (targetRotX - group.current.rotation.x) * 0.05;
        group.current.rotation.y += (targetRotY - group.current.rotation.y) * 0.05;

        // Pulse Effect
        const time = state.clock.getElapsedTime();
        const pulse = 1 + Math.sin(time * 1.5) * 0.05;
        group.current.scale.set(pulse, pulse, pulse);

        // Particle Movement
        const currentPositions = mesh.current.geometry.attributes.position.array as Float32Array;

        // Line vertices container
        const linePositions: number[] = [];

        particles.forEach((p, i) => {
            // Move particle
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;

            // Boundary bounce/wrap
            if (Math.abs(p.x) > 15) p.vx *= -1;
            if (Math.abs(p.y) > 10) p.vy *= -1;
            if (Math.abs(p.z) > 8) p.vz *= -1;

            // Mouse attraction (subtle)
            if (hovered) {
                p.x += (mouse.x * 10 - p.x) * 0.001;
                p.y += (mouse.y * 10 - p.y) * 0.001;
            }

            // Update buffer
            currentPositions[i * 3] = p.x;
            currentPositions[i * 3 + 1] = p.y;
            currentPositions[i * 3 + 2] = p.z;

            // Check connections for lines (simplistic O(N^2) for small N, fine for 400 particles in local view)
            // Optimization: check only against a subset or use less particles for lines
            // Only connecting close particles to create "Neural" look
            // limiting inner loop to save perf
            for (let j = i + 1; j < count; j++) {
                const dx = particles[j].x - p.x;
                const dy = particles[j].y - p.y;
                const dz = particles[j].z - p.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < connectionDistance) {
                    linePositions.push(p.x, p.y, p.z);
                    linePositions.push(particles[j].x, particles[j].y, particles[j].z);
                }
            }
        });

        mesh.current.geometry.attributes.position.needsUpdate = true;

        // Update Lines
        if (linesGeometry.current) {
            linesGeometry.current.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(linePositions, 3)
            );
        }
    });

    return (
        <group
            ref={group}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            {/* Particles */}
            <points ref={mesh}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                        args={[positions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.15}
                    color="#00c6ff"
                    transparent
                    opacity={0.8}
                    sizeAttenuation={true}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Neural Connections */}
            <lineSegments>
                <bufferGeometry ref={linesGeometry} />
                <lineBasicMaterial
                    color="#4fd1ff"
                    transparent
                    opacity={0.15}
                    blending={THREE.AdditiveBlending}
                />
            </lineSegments>
        </group>
    );
}
