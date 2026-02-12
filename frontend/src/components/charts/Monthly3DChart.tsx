import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

interface MonthlyData {
    month: string;
    assessments: number;
}

interface Bar3DProps {
    position: [number, number, number];
    height: number;
    color: string;
    label: string;
    value: number;
    maxValue: number;
}

const Bar3D = ({ position, height, color, label, value }: Omit<Bar3DProps, 'maxValue'>) => {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (meshRef.current) {
            // Smooth scaling animation
            const currentScale = meshRef.current.scale.y;
            const target = hovered ? height * 1.15 : height;
            meshRef.current.scale.y += (target - currentScale) * 0.1;
        }
    });

    return (
        <group position={position}>
            {/* Base Platform */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.5, 32]} />
                <meshStandardMaterial
                    color={hovered ? color : '#1e293b'}
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* 3D Bar */}
            <mesh
                ref={meshRef}
                position={[0, 0.5, 0]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <boxGeometry args={[0.8, 1, 0.8]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.6 : 0.3}
                    metalness={0.7}
                    roughness={0.2}
                />
            </mesh>

            {/* Month Label */}
            <Text
                position={[0, -0.3, 0]}
                fontSize={0.18}
                color="#94a3b8"
                anchorX="center"
                anchorY="middle"
            >
                {label}
            </Text>

            {/* Floating Value (on hover) */}
            {hovered && (
                <Text
                    position={[0, height * 0.5 + 0.8, 0]}
                    fontSize={0.25}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000"
                >
                    {value}
                </Text>
            )}
        </group>
    );
};

const Scene = ({ data }: { data: MonthlyData[] }) => {
    const maxValue = Math.max(...data.map(d => d.assessments), 1);

    return (
        <>
            {/* Lighting Setup */}
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
            <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
            <spotLight
                position={[0, 15, 0]}
                angle={0.5}
                intensity={1}
                penumbra={1}
                castShadow
            />

            {/* Floor Grid */}
            <gridHelper args={[20, 20, '#334155', '#1e293b']} position={[0, 0, 0]} />

            {/* Bars */}
            {data.map((item, i) => {
                const normalizedHeight = (item.assessments / maxValue) * 3;
                const xPos = (i - (data.length - 1) / 2) * 1.8;

                return (
                    <Bar3D
                        key={item.month}
                        position={[xPos, 0, 0]}
                        height={normalizedHeight}
                        color="#6366f1"
                        label={item.month}
                        value={item.assessments}
                    />
                );
            })}

            {/* Camera Controls */}
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                maxPolarAngle={Math.PI / 2.2}
                minPolarAngle={Math.PI / 6}
            />

            {/* Post-processing Effects */}
            <EffectComposer>
                <Bloom
                    intensity={0.5}
                    luminanceThreshold={0.4}
                    luminanceSmoothing={0.9}
                />
            </EffectComposer>
        </>
    );
};

interface Monthly3DChartProps {
    data: MonthlyData[];
}

const Monthly3DChart = ({ data }: Monthly3DChartProps) => {
    // BULLETPROOF: Filter and validate data to prevent WebGL crashes
    const safeData = (data || []).filter((d: any) =>
        d &&
        typeof d === 'object' &&
        (d.month || d.name) &&
        typeof (d.assessments || d.value) === 'number'
    ).map((d: any) => ({
        month: String(d.month || d.name || 'N/A').substring(0, 10), // Truncate long labels
        assessments: Number(d.assessments || d.value || 0)
    }));

    if (safeData.length === 0) {
        return (
            <div className="h-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl flex items-center justify-center">
                <p className="text-slate-400 text-sm">No monthly data available</p>
            </div>
        );
    }

    return (
        <div className="h-96 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-xl overflow-hidden relative shadow-2xl border border-slate-700">
            {/* Header */}
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-lg font-bold text-white">Monthly Assessment Trends</h3>
                <p className="text-sm text-slate-400">Last 12 months • 3D Interactive</p>
            </div>

            {/* 3D Canvas */}
            <Canvas
                camera={{ position: [0, 4, 10], fov: 50 }}
                shadows
                gl={{ antialias: true, alpha: false }}
            >
                <color attach="background" args={['#0f172a']} />
                <fog attach="fog" args={['#0f172a', 5, 20]} />
                <Scene data={safeData} />
            </Canvas>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-600">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-indigo-500"></div>
                    <span className="text-xs text-slate-300">Assessments</span>
                </div>
            </div>
        </div>
    );
};

export default Monthly3DChart;
