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

    return (
        <group scale={0.15} rotation={[Math.PI, 0, 0]}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh
                    ref={meshRef}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                    scale={hovered ? 1.1 : 1}
                >
                    <extrudeGeometry args={[heartShape, extrudeSettings]} />
                    <meshPhysicalMaterial
                        color="#ef4444"
                        roughness={0.2}
                        metalness={0.1}
                        clearcoat={0.8}
                        clearcoatRoughness={0.2}
                    />
                </mesh>
            </Float>
        </group>
    );
}
