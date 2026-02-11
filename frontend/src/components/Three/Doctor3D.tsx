import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, MeshWobbleMaterial } from '@react-three/drei';

function AnimatedDoctor({ color }: { color: string }) {
    const meshRef = useRef<any>(null);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
        }
    });

    return (
        <Box args={[1, 2, 1]} ref={meshRef}>
            <MeshWobbleMaterial
                color={color}
                attach="material"
                factor={0.1}
                speed={1}
            />
        </Box>
    );
}

export default function Doctor3D({ color = "#0ea5e9" }: { color?: string }) {
    return (
        <div className="h-[300px] w-full bg-slate-50 rounded-xl overflow-hidden">
            <Canvas camera={{ position: [0, 0, 4] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Suspense fallback={null}>
                    <AnimatedDoctor color={color} />
                </Suspense>
                <OrbitControls enableZoom={false} />
            </Canvas>
        </div>
    );
}
