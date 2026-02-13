import { useRef, useMemo, useState, memo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Heart3D from './Heart3D';

const NeuralPulseField = memo(function NeuralPulseField() {
    const groupRef = useRef<THREE.Group>(null);
    const { mouse } = useThree();
    const [hovered, setHover] = useState(false);

    // Dynamic "AI Cloud" Particle System
    const { particles, linesGeometry } = useMemo(() => {
        const count = 150;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 40;
            const y = (Math.random() - 0.5) * 12;
            const z = (Math.random() - 0.5) * 10;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            sizes[i] = Math.random() < 0.1 ? 0.3 : 0.1;
        }

        const connectionPoints = [];
        for (let i = 0; i < count; i++) {
            const p1 = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            let connectionsFound = 0;
            for (let j = i + 1; j < count; j++) {
                if (connectionsFound > 3) break;

                const p2 = new THREE.Vector3(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
                const dist = p1.distanceTo(p2);

                if (dist < 5) {
                    connectionPoints.push(p1.x, p1.y, p1.z);
                    connectionPoints.push(p2.x, p2.y, p2.z);
                    connectionsFound++;
                }
            }
        }

        const linesGeo = new THREE.BufferGeometry();
        linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(connectionPoints, 3));

        return {
            particles: { positions, sizes },
            linesGeometry: linesGeo
        };
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;

        const targetRotX = mouse.y * 0.15;
        const targetRotY = mouse.x * 0.15;
        const rotationSpeed = hovered ? 0.08 : 0.05;

        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, rotationSpeed);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, rotationSpeed);

        const time = state.clock.getElapsedTime();
        groupRef.current.position.y = Math.sin(time * 0.2) * 0.5;
    });

    // Explicit Resource Management
    useEffect(() => {
        return () => {
            if (linesGeometry) {
                linesGeometry.dispose();
            }
        };
    }, [linesGeometry]);

    return (
        <group>
            <group scale={[0.8, 0.8, 0.8]}>
                <Heart3D />
            </group>

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
                        />
                        <bufferAttribute
                            attach="attributes-size"
                            count={particles.sizes.length}
                            array={particles.sizes}
                            itemSize={1}
                        />
                    </bufferGeometry>
                    <pointsMaterial
                        color="#00f3ff"
                        transparent
                        opacity={0.8}
                        size={0.15}
                        sizeAttenuation={true}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </points>

                <lineSegments geometry={linesGeometry}>
                    <lineBasicMaterial
                        color="#2d8cf0"
                        transparent
                        opacity={0.15}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </lineSegments>

                {[...Array(5)].map((_, i) => (
                    <mesh key={i} position={[
                        Math.sin(i) * 10,
                        Math.cos(i) * 3,
                        Math.sin(i * 2) * 5
                    ]}>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
                    </mesh>
                ))}
            </group>
        </group>
    );
});

export default NeuralPulseField;
