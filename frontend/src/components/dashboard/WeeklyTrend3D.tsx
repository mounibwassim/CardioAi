import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";

interface WeeklyTrend3DProps {
    data: { day: string; count: number }[];
}

const Bar = ({ position, height, day, count }: { position: [number, number, number], height: number, day: string, count: number }) => {
    const meshRef = useRef<any>(null);

    // Subtle animation
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    // Calculate color based on height (intensity)
    const intensity = Math.min(count / 10, 1); // Normalize 0-10 range
    const color = `hsl(${210 + intensity * 40}, 90%, ${50 + intensity * 20}%)`;

    return (
        <group position={position}>
            {/* The Bar */}
            <mesh ref={meshRef} position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.8, height, 0.8]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.3}
                    metalness={0.6}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Label (Day) */}
            <Text
                position={[0, -0.8, 0.5]}
                fontSize={0.4}
                color="#94a3b8"
                anchorX="center"
                anchorY="middle"
            >
                {day}
            </Text>

            {/* Label (Count) */}
            {count > 0 && (
                <Text
                    position={[0, height + 0.5, 0]}
                    fontSize={0.4}
                    color="#f8fafc"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#0f172a"
                >
                    {count}
                </Text>
            )}
        </group>
    );
};

const WeeklyTrend3D: React.FC<WeeklyTrend3DProps> = ({ data }) => {
    return (
        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl h-[400px] border border-slate-800 relative overflow-hidden group">
            {/* Header Overlay */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-500 rounded-full inline-block"></span>
                    Weekly Assessment Volume
                </h3>
                <p className="text-slate-400 text-sm ml-4">Live 3D Visualization</p>
            </div>

            <Canvas shadows camera={{ position: [0, 6, 12], fov: 45 }}>
                <fog attach="fog" args={['#0f172a', 10, 25]} />

                {/* Lights */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                <spotLight
                    position={[-10, 15, 5]}
                    angle={0.3}
                    penumbra={1}
                    intensity={2}
                    castShadow
                    color="#3b82f6"
                />

                {/* Ground Reflection */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                    <planeGeometry args={[50, 50]} />
                    <meshStandardMaterial
                        color="#0f172a"
                        roughness={0}
                        metalness={0.8}
                    />
                </mesh>

                {/* Helper Grid (Optional, subtle) */}
                <gridHelper args={[20, 20, 0x1e293b, 0x1e293b]} position={[0, -0.49, 0]} />

                {/* Bars Container */}
                <group position={[0, 0, 0]}>
                    {data.map((item, index) => (
                        <Bar
                            key={item.day}
                            day={item.day}
                            count={item.count}
                            position={[(index - 3) * 1.5, 0, 0]} // Center the 7 bars
                            height={Math.max(item.count, 0.2)} // Min height for visibility
                        />
                    ))}
                </group>

                <OrbitControls
                    enableZoom={false}
                    maxPolarAngle={Math.PI / 2 - 0.1}
                    minPolarAngle={Math.PI / 4}
                    autoRotate
                    autoRotateSpeed={0.5}
                />
            </Canvas>
        </div>
    );
};

export default WeeklyTrend3D;
